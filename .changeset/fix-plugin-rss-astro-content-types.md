---
"@barodoc/plugin-rss": patch
---

fix: add ambient type declaration for `astro:content` and type getCollection in feed

Resolves TS2307 (Cannot find module 'astro:content') when type-checking plugin-rss. The virtual module is declared in `src/astro-env.d.ts`; feed.ts now passes explicit generics to getCollection for blog/changelog entry data.
