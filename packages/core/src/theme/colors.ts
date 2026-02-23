const GRAY_PRESETS: Record<string, Record<string, string>> = {
  zinc: {
    "50": "#fafafa",  "100": "#f4f4f5", "200": "#e4e4e7",
    "300": "#d4d4d8", "400": "#a1a1aa", "500": "#71717a",
    "600": "#52525b", "700": "#3f3f46", "800": "#27272a",
    "900": "#18181b", "950": "#09090b",
  },
  slate: {
    "50": "#f8fafc",  "100": "#f1f5f9", "200": "#e2e8f0",
    "300": "#cbd5e1", "400": "#94a3b8", "500": "#64748b",
    "600": "#475569", "700": "#334155", "800": "#1e293b",
    "900": "#0f172a", "950": "#020617",
  },
  neutral: {
    "50": "#fafafa",  "100": "#f5f5f5", "200": "#e5e5e5",
    "300": "#d4d4d4", "400": "#a3a3a3", "500": "#737373",
    "600": "#525252", "700": "#404040", "800": "#262626",
    "900": "#171717", "950": "#0a0a0a",
  },
  stone: {
    "50": "#fafaf9",  "100": "#f5f5f4", "200": "#e7e5e4",
    "300": "#d6d3d1", "400": "#a8a29e", "500": "#78716c",
    "600": "#57534e", "700": "#44403c", "800": "#292524",
    "900": "#1c1917", "950": "#0c0a09",
  },
  gray: {
    "50": "#f9fafb",  "100": "#f3f4f6", "200": "#e5e7eb",
    "300": "#d1d5db", "400": "#9ca3af", "500": "#6b7280",
    "600": "#4b5563", "700": "#374151", "800": "#1f2937",
    "900": "#111827", "950": "#030712",
  },
};

const SCALE_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

function hexToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToOklchHue(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ].map(hexToLinear);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  let hue = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return Math.round(hue * 10) / 10;
}

const ACCENT_L: Record<string, number> = {
  "50": 0.97, "100": 0.94, "200": 0.88, "300": 0.78, "400": 0.68,
  "500": 0.58, "600": 0.50, "700": 0.42, "800": 0.35, "900": 0.28, "950": 0.20,
};

const ACCENT_C: Record<string, number> = {
  "50": 0.02, "100": 0.04, "200": 0.08, "300": 0.12, "400": 0.16,
  "500": 0.18, "600": 0.18, "700": 0.16, "800": 0.12, "900": 0.08, "950": 0.04,
};

export function generateAccentScale(hex: string): Record<string, string> {
  const h = hexToOklchHue(hex);
  const scale: Record<string, string> = {};
  for (const step of SCALE_STEPS) {
    scale[step] = `oklch(${ACCENT_L[step]} ${ACCENT_C[step]} ${h})`;
  }
  return scale;
}

export function getGrayScale(preset: string): Record<string, string> | null {
  return GRAY_PRESETS[preset] ?? null;
}

/**
 * Generate CSS overrides from theme.colors config.
 * Outputs gray scale variables (--bd-gray-*) and/or accent overrides (--color-primary-*).
 * Semantic tokens don't need to change — they already reference --bd-gray-* via var().
 */
export function generateThemeCSS(themeColors: {
  accent?: string;
  gray?: string;
  light?: { accent?: string };
  dark?: { accent?: string };
}): string {
  const rootLines: string[] = [];
  const darkLines: string[] = [];

  if (themeColors.gray) {
    const grayScale = getGrayScale(themeColors.gray);
    if (grayScale) {
      for (const step of SCALE_STEPS) {
        rootLines.push(`  --bd-gray-${step}: ${grayScale[step]};`);
      }
    }
  }

  if (themeColors.accent) {
    const scale = generateAccentScale(themeColors.accent);
    for (const step of SCALE_STEPS) {
      rootLines.push(`  --color-primary-${step}: ${scale[step]};`);
    }
  }

  if (themeColors.dark?.accent) {
    const darkScale = generateAccentScale(themeColors.dark.accent);
    for (const step of SCALE_STEPS) {
      darkLines.push(`  --color-primary-${step}: ${darkScale[step]};`);
    }
  }

  if (rootLines.length === 0 && darkLines.length === 0) return "";

  let css = "";
  if (rootLines.length > 0) css += `:root {\n${rootLines.join("\n")}\n}\n`;
  if (darkLines.length > 0) css += `.dark {\n${darkLines.join("\n")}\n}\n`;
  return css;
}
