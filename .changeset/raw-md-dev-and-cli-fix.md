---
"@barodoc/plugin-raw-md": patch
"barodoc": patch
---

**@barodoc/plugin-raw-md**
- Fix dev server: serve `.md` URLs by prepending middleware (post hook) so requests are handled before Astro/Vite
- When `collections` is omitted, run for all collections: custom mode = all dirs under `src/content/`, quick mode = docs + blog + changelog + configured sections that exist

**barodoc**
- Quick mode: treat `dir` missing or `"."` as "auto-detect docs dir" to avoid "copy to subdirectory of itself" when running `barodoc serve` or `barodoc build .` from project root
