/**
 * Parse "X.Y.Z" or "vX.Y.Z" and return [major, minor, patch] for comparison.
 */
export function parseVersion(v: string): [number, number, number] {
  const parts = v.replace(/^v/, "").split(".").map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * Compare two version strings. Returns a number for use with Array.sort:
 * positive if b is newer than a, negative if a is newer, 0 if equal.
 */
export function compareVersion(a: string, b: string): number {
  const [aMaj, aMin, aPatch] = parseVersion(a);
  const [bMaj, bMin, bPatch] = parseVersion(b);
  if (aMaj !== bMaj) return bMaj - aMaj;
  if (aMin !== bMin) return bMin - aMin;
  return bPatch - aPatch;
}
