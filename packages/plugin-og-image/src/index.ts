import { definePlugin } from "@barodoc/core";
import type { AstroIntegration } from "astro";
import satori from "satori";
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const GOOGLE_FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";

async function fetchGoogleFont(weight: 400 | 700 = 400): Promise<ArrayBuffer> {
  const cssRes = await fetch(GOOGLE_FONT_CSS, {
    headers: { "User-Agent": "node" },
  });
  const css = await cssRes.text();
  const blocks = css.split("@font-face");
  for (const block of blocks) {
    const wMatch = block.match(/font-weight:\s*(\d+)/);
    if (!wMatch || parseInt(wMatch[1]) !== weight) continue;
    const urlMatch = block.match(/src:\s*url\(([^)]+)\)/);
    if (urlMatch?.[1]) {
      const fontRes = await fetch(urlMatch[1]);
      return fontRes.arrayBuffer();
    }
  }
  throw new Error(`Could not extract font URL for weight ${weight}`);
}

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
      "build:done": async (buildContext, context) => {
        const { config } = context;
        const outDir = join(buildContext.outDir, "og");
        if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

        const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }> = [];

        if (options.fontPath) {
          try {
            const fontData = readFileSync(options.fontPath).buffer as ArrayBuffer;
            fonts.push({ name: "Custom", data: fontData, weight: 400 as const, style: "normal" as const });
          } catch {
            console.warn("[og-image] Could not load custom font, fetching Inter from Google Fonts");
          }
        }

        if (fonts.length === 0) {
          try {
            const [regular, bold] = await Promise.all([
              fetchGoogleFont(400),
              fetchGoogleFont(700),
            ]);
            fonts.push(
              { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
              { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
            );
          } catch (err) {
            console.warn("[og-image] Could not fetch default font, skipping OG image generation:", err);
            return;
          }
        }

        let count = 0;
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
              count++;
            } catch (err) {
              console.warn(`[og-image] Failed to generate image for ${page}:`, err);
            }
          }
        }

        console.log(`[og-image] Generated ${count} OG images in og/`);
      },
    },
  };
});
