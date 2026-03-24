---
"@barodoc/core": patch
"@barodoc/theme-docs": patch
"barodoc": patch
---

feat(theme-docs): reader UX — skip link, TOC h4 + scroll spy, doc badges, changelog & feedback links

- Skip-to-main, `main-content` targets; TOC includes h2–h4 with scroll-based active state.
- Frontmatter: `since`, `deprecated`, `experimental`, `changelogUrl`; config `changelogUrl` and `feedback.issueUrl`.
- Section link copy on headings; i18n for new UI strings; docs site dogfoods `changelogUrl`.
