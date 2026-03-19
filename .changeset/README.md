# Changesets

## Version bump: prefer patch

- **Use `patch`** for bug fixes, docs-only changes, and small improvements. Avoid unnecessary major/minor bumps.
- Use **`minor`** only for new backward-compatible features that warrant a minor release.
- Use **`major`** only for breaking changes.

Example: when adding a changeset, set the affected packages to `patch`:

```md
---
"@barodoc/theme-docs": patch
---

fix: description of the change
```

## Docs changelog (required when adding a changeset)

When you add a changeset, **also add a changelog entry** so the [docs site Changelog](https://barodoc.barocss.com/changelog/) stays in sync:

1. **File:** `docs/src/content/changelog/vX.Y.Z.mdx`
2. **Version:** Use the **next** patch version (e.g. if linked packages are at `10.0.1`, the next release will be `10.0.2` → create `v10.0.2.mdx`). Check `packages/theme-docs/package.json` or `packages/core/package.json` for current version.
3. **Frontmatter and body:**

```md
---
version: "10.0.2"
date: 2026-03-19
title: "Short title for the release"
---

### Fixes

- Description matching your changeset.
```

Commit the new `docs/src/content/changelog/vX.Y.Z.mdx` file **in the same PR** as the changeset. That way each release is both versioned and documented on the site.
