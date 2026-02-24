import { describe, it, expect } from "vitest";
import { generateAccentScale, getGrayScale, generateThemeCSS } from "./colors.js";

describe("generateAccentScale", () => {
  it("generates a scale with all 11 steps", () => {
    const scale = generateAccentScale("#0070f3");
    const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
    for (const step of steps) {
      expect(scale[step]).toBeDefined();
      expect(scale[step]).toMatch(/^oklch\(/);
    }
  });

  it("produces different hues for different colors", () => {
    const blue = generateAccentScale("#0070f3");
    const red = generateAccentScale("#ff0000");
    expect(blue["500"]).not.toBe(red["500"]);
  });

  it("lighter steps have higher lightness values", () => {
    const scale = generateAccentScale("#0070f3");
    const l50 = parseFloat(scale["50"].match(/oklch\(([\d.]+)/)?.[1] ?? "0");
    const l950 = parseFloat(scale["950"].match(/oklch\(([\d.]+)/)?.[1] ?? "0");
    expect(l50).toBeGreaterThan(l950);
  });
});

describe("getGrayScale", () => {
  it("returns a scale for known presets", () => {
    const zinc = getGrayScale("zinc");
    expect(zinc).not.toBeNull();
    expect(zinc!["500"]).toBe("#71717a");
  });

  it("returns null for unknown presets", () => {
    expect(getGrayScale("nonexistent")).toBeNull();
  });

  it("supports all built-in presets", () => {
    for (const preset of ["zinc", "slate", "neutral", "stone", "gray"]) {
      expect(getGrayScale(preset)).not.toBeNull();
    }
  });
});

describe("generateThemeCSS", () => {
  it("returns empty string when no theme colors", () => {
    expect(generateThemeCSS({})).toBe("");
  });

  it("generates :root block for accent color", () => {
    const css = generateThemeCSS({ accent: "#0070f3" });
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary-500:");
  });

  it("generates :root block for gray preset", () => {
    const css = generateThemeCSS({ gray: "slate" });
    expect(css).toContain(":root {");
    expect(css).toContain("--bd-gray-500:");
  });

  it("generates .dark block for dark accent override", () => {
    const css = generateThemeCSS({ dark: { accent: "#ff6600" } });
    expect(css).toContain(".dark {");
    expect(css).toContain("--color-primary-500:");
  });

  it("combines accent and gray in one output", () => {
    const css = generateThemeCSS({ accent: "#0070f3", gray: "zinc" });
    expect(css).toContain("--color-primary-");
    expect(css).toContain("--bd-gray-");
  });
});
