---
"@barodoc/theme-docs": patch
---

fix: MobileNav.astro flatten nested nav (fix Deploy Docs page.split)

MobileNav built groups with group.pages.map(getPageTitle); when pages contained { label, pages } objects, getPageTitle received an object and threw. Use buildNavItems (same as Header.astro) so only string slugs reach getPageTitle. Closes #134
