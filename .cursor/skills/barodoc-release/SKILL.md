---
name: barodoc-release
description: Barodoc changeset and release workflow. Use when adding a changeset, updating the changelog, preparing a release, or merging the "Version packages" PR. Prefer this skill whenever the user mentions changeset, release, version bump, changelog, or publishing barodoc packages to npm.
---

# Barodoc Changeset & Release

This skill covers how to add changesets, keep the docs changelog in sync, and complete a release. Linked packages (core, theme-docs, barodoc CLI, plugins) are versioned together.

## Version bump: prefer patch

- Use **patch** for bug fixes, docs-only changes, and small improvements.
- Use **minor** only for new backward-compatible features.
- Use **major** only for breaking changes.

When in doubt, choose patch to avoid unnecessary major/minor bumps.

---

## Adding a changeset

1. **Create a changeset file** under `.changeset/` (e.g. `fix-something.md`):

```md
---
"@barodoc/theme-docs": patch
"@barodoc/core": patch
---

fix: short description of the change
```

List each package you changed. For linked packages (see `.changeset/config.json`), they version together; still list the ones you touched. Prefer `patch` unless it's a new feature (minor) or breaking change (major).

2. **Add a docs changelog entry** in the same PR so the [site Changelog](https://barodoc.barocss.com/changelog/) stays in sync:

   - **File:** `docs/src/content/changelog/vX.Y.Z.mdx`
   - **Version:** Use the **next** patch version (e.g. if current is `10.0.4`, use `10.0.5`). Check `packages/theme-docs/package.json` or `packages/core/package.json` for the current version.
   - **Frontmatter and body:**

```md
---
version: "10.0.5"
date: 2026-03-19
title: "Short title for the release"
---

### Fixes

- Description matching your changeset.
```

Commit both the changeset file and the new `docs/src/content/changelog/vX.Y.Z.mdx` in the **same PR**. That way each release is versioned and documented on the site after merge.

---

## Releasing (after merge to main)

1. Push changes (including changeset and changelog) to `main`.
2. The release workflow creates a **"Version packages"** PR that bumps versions and updates CHANGELOGs.
3. **Merge that PR** to publish the linked packages to npm.
4. The docs site is deployed on every push to `main` (GitHub Actions → GitHub Pages), so the new changelog page is live after the version PR is merged.

---

## New plugin or new package

- Add the package to the **linked** array in `.changeset/config.json` if it should version with the rest.
- Add a changeset (e.g. `feat: add @barodoc/plugin-xyz`) — prefer `patch` unless it's a new feature (`minor`).
- Add `docs/src/content/changelog/vX.Y.Z.mdx` as above.
- Merge to `main`; merge the resulting "Version packages" PR to publish.

---

## Quick reference

| Step | Action |
|------|--------|
| Add changeset | Create `.changeset/<name>.md` with package(s) and summary; prefer **patch** |
| Changelog | Create `docs/src/content/changelog/vX.Y.Z.mdx` with next patch version, date, title, body |
| Same PR | Commit changeset + changelog file together |
| Publish | Merge to `main` → merge "Version packages" PR |
| Current version | Check `packages/theme-docs/package.json` or `packages/core/package.json` |

Details: **.changeset/README.md** and **DEVELOPMENT.md** in the repo.

---

## End-to-end checklist (issue → changeset → PR → npm)

Use this when **shipping code** that touches **published packages** (`packages/*`, `barodoc` CLI, plugins). Agents can run the same flow with **GitHub CLI** (`gh`).

| # | Step | What to do |
|---|------|------------|
| 1 | **Issue** | Create a tracking issue: `gh issue create --title "..." --body "..."`. Reference it in the feature PR body with `Fixes #N` so it closes on merge. |
| 2 | **Changeset** | Add `.changeset/<name>.md` listing each **touched** package and bump type (`patch` unless feature/breaking). |
| 3 | **Site changelog** | Add `docs/src/content/changelog/vX.Y.Z.mdx` using the **next patch** version (see `packages/theme-docs/package.json`). |
| 4 | **Branch & commit** | Feature branch; **one commit or PR** should include code + changeset + changelog together. |
| 5 | **Open & merge PR** | `gh pr create` → `gh pr merge` into `main` (after CI is green). |
| 6 | **Wait for Version PR** | The **Release** workflow (`changesets/action`) opens a PR titled **`chore: release packages`** (branch often `changeset-release/main`). Poll until it appears: `gh pr list --state open --search "chore: release packages"`. |
| 7 | **Merge release PR** | `gh pr merge <number> --merge` — this bumps versions, updates package `CHANGELOG.md` files, and **publishes to npm** (per `.github/workflows/release.yml`). |

### When **not** to use changeset / release PR

- **Skill-only**, **plans**, or **docs** that do not ship with a versioned package.
- **Repo/tooling** changes that do not affect `@barodoc/*` or `barodoc` publish artifacts.

In those cases: issue + PR to `main` is enough; **no** `.changeset/` and **no** `vX.Y.Z.mdx` unless the docs site itself should announce something on `/changelog`.

### Optional `gh` snippets

```bash
# List open release PRs
gh pr list --state open --search "chore: release packages"

# Merge release PR (replace N)
gh pr merge N --merge
```
