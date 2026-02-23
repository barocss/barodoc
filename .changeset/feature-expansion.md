---
"@barodoc/core": minor
"@barodoc/theme-docs": minor
---

Add 12 new features across 4 phases

**Phase 1: Quick Wins**
- Image zoom/lightbox with medium-zoom (auto-applied to all prose images)
- Video embed component (YouTube, Vimeo, Loom auto-detect)
- Math/KaTeX support via remark-math + rehype-katex ($inline$ and $$block$$)
- Reading time display on docs pages
- Keyboard shortcuts (Cmd/Ctrl+K search, arrow keys navigation, ? help modal)

**Phase 2: Content Types**
- Blog system with content collection, card grid index, and dedicated BlogLayout
- Changelog page with timeline UI and version badge grouping

**Phase 3: Plugins**
- @barodoc/plugin-docsearch: Algolia DocSearch integration
- @barodoc/plugin-rss: RSS feed generation from blog/changelog collections
- @barodoc/plugin-pwa: PWA manifest and service worker for offline support
- Page contributors component using git log with Gravatar avatars

**Phase 4: Major Features**
- Doc versioning with folder-based version management and VersionSwitcher dropdown
- @barodoc/plugin-openapi: OpenAPI spec auto-generation into MDX pages
- API Playground component for interactive API testing with form builder
