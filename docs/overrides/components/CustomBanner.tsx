/**
 * Example custom component override.
 * Place .tsx/.astro files in overrides/components/ and they become
 * available as <CustomBanner /> (or whatever the filename) in MDX.
 *
 * Import in MDX:
 *   import CustomBanner from "@overrides/components/CustomBanner";
 */
export default function CustomBanner({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "1rem 1.5rem",
        borderRadius: "0.5rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        fontWeight: 600,
      }}
    >
      {text}
    </div>
  );
}
