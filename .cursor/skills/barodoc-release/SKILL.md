---
name: barodoc-release
description: Barodoc changeset and release workflow. Use when adding a changeset, updating the changelog, preparing a release, or merging the "Version packages" PR. Prefer this skill whenever the user mentions changeset, release, version bump, changelog, or publishing barodoc packages to npm. Agents must use GitHub CLI (gh) for issue, PR, merge, and release-PR monitoring.
---

# Barodoc Changeset & Release

This skill covers how to add changesets, keep the docs changelog in sync, and complete a release. Linked packages (core, theme-docs, barodoc CLI, plugins) are versioned together.

## GitHub CLI (`gh`) — **required for agents**

Automated runs (issue → branch → PR → merge → monitor **chore: release packages** → merge) **must** use **`gh`**. Do not substitute the GitHub web UI for these steps unless a human explicitly opts out.

- **Issue:** `gh issue create`
- **PR:** `gh pr create`, `gh pr view`, `gh pr merge`
- **Monitor:** `gh pr list`, `gh pr checks` (poll until the Version PR exists and is green)
- **Prereq:** `gh auth status` succeeds in the environment running the agent.

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

Use when **shipping code** that touches **published packages** (`packages/*`, `barodoc` CLI, plugins). **Run every GitHub step with `gh`** (see above).

| # | Step | What to do |
|---|------|------------|
| 1 | **Issue** | `gh issue create --title "..." --body "..."`. Put `Fixes #N` in the feature PR body (`gh pr create --body` or edit) so the issue closes on merge. |
| 2 | **Changeset** | Add `.changeset/<name>.md` listing each **touched** package and bump type (`patch` unless feature/breaking). |
| 3 | **Site changelog** | Add `docs/src/content/changelog/vX.Y.Z.mdx` using the **next patch** version (see `packages/theme-docs/package.json`). |
| 4 | **Branch & commit** | Feature branch; **one PR** should include code + changeset + changelog together. |
| 5 | **Open & merge PR** | `git push -u origin <branch>` → `gh pr create --base main --head <branch> --title "..." --body "Fixes #N\n\n..."` → wait for checks (`gh pr checks <N>` or poll) → `gh pr merge <N> --merge` (use squash only if repo policy allows; default here is `--merge`). |
| 6 | **Monitor Version PR** | After merge to `main`, **poll** until the release PR exists: e.g. every 10–15s run `gh pr list --state open --search "chore: release packages" --json number,title,url`. Optionally `gh run watch` on the latest **Release** workflow on `main` while waiting. |
| 7 | **Merge release PR** | `gh pr merge <number> --merge` — bumps versions, updates package `CHANGELOG.md` files, **publishes to npm** (`.github/workflows/release.yml`). Confirm with `gh pr view <number> --json state` after merge. |

### When **not** to use changeset / release PR

- **Skill-only**, **plans**, or **docs** that do not ship with a versioned package.
- **Repo/tooling** changes that do not affect `@barodoc/*` or `barodoc` publish artifacts.

Still use **`gh`** for issue + PR + merge to `main`; only **skip** `.changeset/`, `vX.Y.Z.mdx`, and step 6–7 (no Version PR / npm).

### `gh` commands (reference)

```bash
# Auth (must work before anything else)
gh auth status

# Feature PR
gh pr create --base main --head <branch> --title "..." --body $'Summary\n\nFixes #N'
gh pr checks <PR_NUMBER>   # wait until pass
gh pr merge <PR_NUMBER> --merge

# Find and merge Version packages PR (poll until listed)
gh pr list --state open --search "chore: release packages" --json number,title,url
gh pr merge <N> --merge

# Optional: watch the Release workflow on main after pushing
gh run list --workflow=release.yml --limit 1
gh run watch <RUN_ID>
```
