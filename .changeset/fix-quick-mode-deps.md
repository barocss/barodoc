---
"barodoc": patch
---

Fix missing dependencies in quick mode temporary project

Add @astrojs/mdx, @astrojs/react, @tailwindcss/vite, @tailwindcss/typography, and tailwindcss to the generated .barodoc/package.json so that `barodoc serve` and `barodoc build` work in zero-config mode.
