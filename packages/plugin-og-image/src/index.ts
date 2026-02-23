import { definePlugin } from "@barodoc/core";
import type { AstroIntegration } from "astro";
import satori from "satori";
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface OgImagePluginOptions {
  /** Font file path (TTF/OTF) for rendering text. Falls back to a system default. */
  fontPath?: string;
  /** Background color. Default: "#ffffff" */
  background?: string;
  /** Text color. Default: "#0f172a" */
  textColor?: string;
  /** Accent color for the site name. Default: "#0070f3" */
  accentColor?: string;
  /** Image width. Default: 1200 */
  width?: number;
  /** Image height. Default: 630 */
  height?: number;
}

function createOgSvg(options: {
  title: string;
  description: string;
  siteName: string;
  width: number;
  height: number;
  background: string;
  textColor: string;
  accentColor: string;
}) {
  return {
    type: "div" as const,
    props: {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        padding: "60px 80px",
        width: `${options.width}px`,
        height: `${options.height}px`,
        backgroundColor: options.background,
      },
      children: [
        {
          type: "div" as const,
          props: {
            style: { fontSize: "24px", color: options.accentColor, marginBottom: "16px" },
            children: options.siteName,
          },
        },
        {
          type: "div" as const,
          props: {
            style: {
              fontSize: "48px",
              fontWeight: 700,
              color: options.textColor,
              lineHeight: 1.2,
              marginBottom: "20px",
            },
            children: options.title,
          },
        },
        {
          type: "div" as const,
          props: {
            style: { fontSize: "24px", color: "#64748b", lineHeight: 1.4 },
            children: options.description,
          },
        },
      ],
    },
  };
}

export default definePlugin<OgImagePluginOptions>((options = {}) => {
  const width = options.width ?? 1200;
  const height = options.height ?? 630;
  const background = options.background ?? "#ffffff";
  const textColor = options.textColor ?? "#0f172a";
  const accentColor = options.accentColor ?? "#0070f3";

  return {
    name: "@barodoc/plugin-og-image",

    hooks: {
      "build:done": async (context) => {
        const config = context.config;
        const outDir = join(process.cwd(), "dist", "og");
        if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

        let fontData: ArrayBuffer | undefined;
        if (options.fontPath) {
          try {
            fontData = readFileSync(options.fontPath).buffer as ArrayBuffer;
          } catch {}
        }

        const fonts = fontData
          ? [{ name: "Custom", data: fontData, weight: 400 as const, style: "normal" as const }]
          : [];

        for (const group of config.navigation) {
          for (const page of group.pages) {
            const slug = page.replace(/\//g, "-");
            const title = page
              .split("/")
              .pop()!
              .split("-")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

            const tree = createOgSvg({
              title,
              description: "",
              siteName: config.name,
              width,
              height,
              background,
              textColor,
              accentColor,
            });

            try {
              const svg = await satori(tree as any, { width, height, fonts });
              const png = await sharp(Buffer.from(svg)).png().toBuffer();
              writeFileSync(join(outDir, `${slug}.png`), png);
            } catch (err) {
              console.warn(`[og-image] Failed to generate image for ${page}:`, err);
            }
          }
        }

        console.log(`[og-image] Generated OG images in dist/og/`);
      },
    },
  };
});
