# Tex Pre-render Dev Autobuild — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dev 환경에서 .tex pre-render가 자동으로 동작하도록 한다. (1) `pnpm dev` 시작 시 1회 전체 빌드, (2) .tex 저장 시 해당 파일만 재빌드. 설계: `docs/plans/2025-03-06-tex-dev-autobuild-design.md`.

**Architecture:** Astro `astro:config:setup`에서 `buildAllTexToHtml` 1회 실행 + `BARODOC_PROJECT_ROOT` 설정. Vite 플러그인은 초기 빌드 없이 watcher만 등록해 .tex 변경 시 `buildOneTexToHtml` 호출. 실패/스킵 시 logger로 명시적 메시지 출력.

**Tech Stack:** Astro integration hooks, Vite plugin (apply: "serve", configureServer, server.watcher), Node fs/path, LaTeX.js CLI, existing texPreRender.ts.

**Prerequisite:** `feature/asset-content-viewer`가 main에 머지된 상태. `packages/theme-docs/src/lib/texPreRender.ts`, theme.ts(asset 플러그인·tex 훅), section 페이지(texPreRenderedUrl·iframe) 존재.

---

## Task 1: texPreRender.ts — 실패 시 로깅 및 early exit

**Files:**
- Modify: `packages/theme-docs/src/lib/texPreRender.ts`

**Step 1: buildAllTexToHtml — content 없음 시 로그 후 return**

`buildAllTexToHtml` 함수 상단에서 `contentBasePath` 존재 여부 확인. 없으면 logger.warn 한 번 호출 후 return.

```ts
if (!fs.existsSync(contentBasePath)) {
  logger?.warn?.(`Tex pre-render: content dir not found: ${contentBasePath}`);
  return;
}
```

**Step 2: buildAllTexToHtml — .tex 목록 수집 후 0개면 로그 후 return**

기존처럼 section 순회하되, 먼저 `.tex` 항목만 모아서 배열로 만든 뒤, 길이 0이면 `logger?.info?.("Tex pre-render: no .tex assets found.")` 호출 후 return.

**Step 3: buildAllTexToHtml — LaTeX.js CLI 1회 resolve, 없으면 로그 후 return**

`resolveLatexJsBin(cwd)`를 한 번만 호출. null이면 `logger?.warn?.("Tex pre-render: LaTeX.js CLI not found. .tex pages will use the browser viewer.")` 호출 후 return. 그 다음 기존 for 루프에서 `buildOneTexToHtml`만 호출 (bin은 각 호출 내부에서 다시 resolve하지 않고, 현재 buildOneTexToHtml이 내부에서 resolve하므로 그대로 두되, 상단 early exit으로 전체 스킵만 추가).

**Step 4: buildOneTexToHtml — latexJsBin null일 때 로그**

`resolveLatexJsBin(cwd)`가 null이면 `logger?.warn?.(`LaTeX.js not found, skipping ${relPath}`)` 호출 후 return.

**Step 5: Run and commit**

- Run: `pnpm --filter @barodoc/theme-docs exec tsc --noEmit` (또는 monorepo typecheck).
- Commit: `git add packages/theme-docs/src/lib/texPreRender.ts && git commit -m "fix(theme-docs): tex pre-render failure logging and early exit"`

---

## Task 2: theme.ts — config:setup에서 1회 pre-render 및 BARODOC_PROJECT_ROOT

**Files:**
- Modify: `packages/theme-docs/src/theme.ts`

**Step 1: contentDirForPlugins / projectRoot 계산 직후 BARODOC_PROJECT_ROOT 설정**

`astro:config:setup` 내부에서 `contentDirForPlugins`와 `projectRoot = path.dirname(path.dirname(contentDirForPlugins))` 계산한 직후 다음 한 줄 추가:

```ts
process.env.BARODOC_PROJECT_ROOT = projectRoot;
```

**Step 2: config:setup에서 buildAllTexToHtml 1회 호출**

`process.env.BARODOC_PROJECT_ROOT` 설정 직후, `updateConfig` 호출 전에:

- `fs.existsSync(contentDirForPlugins)`이 true이면: `logger.info("Tex pre-render: building .tex → HTML...")` 후 `buildAllTexToHtml(contentDirForPlugins, projectRoot, { info: (m) => logger.info(m), warn: (m) => logger.warn(m) })` 호출. try/catch로 감싸고 catch 시 `logger.warn(\`Tex pre-render failed: ${e}\`)`.
- else: `logger.warn(\`Tex pre-render skipped: content dir not found (${contentDirForPlugins})\`)`.

**Step 3: build:start 훅**

tex pre-render는 config:setup에서만 수행하므로 `build:start` 훅 내부는 비워 두거나 주석으로 "Tex pre-render already runs in astro:config:setup" 유지.

**Step 4: createTexPreRenderDevPlugin — 초기 빌드 제거, watcher만**

`createTexPreRenderDevPlugin`의 `configureServer` 안에서 `buildAllTexToHtml` 호출을 제거. watcher 등록만 유지. watcher 콜백에서 `buildOneTexToHtml(..., devLogger)` 호출 시 logger 인자로 `devLogger` 전달. `devLogger`는 `{ info: (m) => console.log("[barodoc] " + m), warn: (m) => console.warn("[barodoc] " + m) }` (또는 `server.config?.logger`가 있으면 해당 logger 사용).

**Step 5: Run and commit**

- Run: `pnpm --filter @barodoc/theme-docs exec tsc --noEmit`.
- Commit: `git add packages/theme-docs/src/theme.ts && git commit -m "feat(theme-docs): tex pre-render in config:setup, watcher-only in dev plugin"`

---

## Task 3: dev:fresh 스크립트

**Files:**
- Modify: `package.json` (monorepo root)

**Step 1: scripts에 dev:fresh 추가**

`"dev"` 또는 `"dev:docs"` 근처에 다음 추가:

```json
"dev:fresh": "pnpm --filter @barodoc/theme-docs build && pnpm dev"
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add dev:fresh to build theme-docs then run dev"
```

---

## Task 4: DEVELOPMENT.md — Asset pre-render 안내 한 줄

**Files:**
- Modify: `DEVELOPMENT.md`

**Step 1: §1 Testing with the docs site — Commands 표 또는 Prerequisites 아래에 한 줄 추가**

예: "Asset 뷰어(.tex 등)는 dev 시작 시·파일 저장 시 자동 pre-render됩니다. theme-docs를 수정한 뒤 반영하려면 `pnpm dev:fresh`를 사용하거나 theme-docs 빌드 후 `pnpm dev`를 실행하세요."

**Step 2: Commit**

```bash
git add DEVELOPMENT.md
git commit -m "docs: mention tex pre-render and dev:fresh in DEVELOPMENT.md"
```

---

## Verification (after all tasks)

1. **Dev 1회 빌드:** `pnpm dev` 실행 시 터미널에 `Tex pre-render: building .tex → HTML...` 및 `Pre-rendered .tex: en/sample-tex.tex` 등 출력되는지 확인.
2. **저장 시 재빌드:** `docs/src/content/docs/en/sample-tex.tex` 일부 수정 후 저장. 터미널에 `[barodoc] Pre-rendered .tex: en/sample-tex.tex` (또는 유사) 출력되는지 확인. 브라우저에서 해당 문서 페이지 새로고침 시 iframe 내용 갱신되는지 확인.
3. **dev:fresh:** `pnpm dev:fresh` 실행 시 theme-docs 빌드 후 dev 서버가 뜨는지 확인.

---

**Plan complete and saved to `docs/plans/2025-03-06-tex-dev-autobuild-plan.md`.**

실행 방식 선택:

1. **Subagent-Driven (이 세션)** — 작업별로 새 subagent를 호출하고, 작업 사이에 리뷰하며 빠르게 반복합니다.
2. **Parallel Session (별도)** — 새 세션에서 executing-plans로 열고, 체크포인트 단위로 일괄 실행합니다.

어떤 방식으로 진행할까요?
