# Asset content viewer (HTML/PDF/PPTX/LaTeX 등) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** docs(및 섹션) 폴더에 MD/MDX와 함께 HTML, PDF, PPTX, LaTeX, ODT, CSV 등 여러 포맷을 두고, 같은 DocsLayout 안에 포맷별 뷰어(또는 다운로드)로 서빙한다.

**Architecture:** 접근 A — theme-docs에서만 처리. getStaticPaths()에서 getCollection() 결과에 더해 content 디렉터리를 파일시스템 스캔해 asset 확장자(.html, .pdf, .pptx, .tex, .odt, .ods, .odp, .docx, .xlsx, .ipynb, .csv, .rst, .epub) 파일을 수집하고, 같은 [section]/[...slug] 경로로 asset 전용 페이지를 추가. 각 요청이 collection 항목인지 asset 항목인지 props로 구분하고, asset이면 확장자별 뷰어(iframe/PDF.js/PptxViewJS/LaTeX.js/ViewerJS/RST→HTML/EPUB.js 등) 또는 다운로드 링크를 렌더. asset 파일은 빌드 시 dist/_content/<section>/<path> 로 복사하고, dev에서는 해당 경로를 서빙하는 미들웨어 사용.

**Tech Stack:** Astro (getStaticPaths, Vite), Node fs/path, PDF.js 또는 native embed, PptxViewJS, LaTeX.js, ViewerJS(WebODF), nbviewer.js, EPUB.js 등(선택). @barodoc/theme-docs.

**뷰어별 설계 요약:**
- **Tex:** (1) **빌드 타임 변환**: `build:start` 훅에서 LaTeX.js CLI로 각 .tex를 HTML로 변환해 `.astro/tex-generated/`에 저장. getStaticPaths에서 해당 HTML이 있으면 페이지에 인라인으로 넣어 표시(babel/amsmath/geometry 등 패키지 사용 가능). (2) 없으면 브라우저에서 LaTeX.js WebComponent 사용(패키지 없이 기본 article만).
- **CSV:** iframe 사용 금지. 본문에 인라인 `<table>` 또는 SheetJS 등 테이블/시트 뷰로 직접 렌더.
- **RST:** 주 뷰는 RST→HTML 렌더 결과. 소스+다운로드만으로는 부족.
- **IPYNB:** 실행 뷰 필수. 셀 코드 + 저장된 출력(텍스트/HTML/이미지)을 함께 표시.

**Design reference:** `.cursor/plans/html_pdf_pptx_content_design_0d1213c8.plan.md` (또는 동일 설계 문서)

---

## Task 1: Asset 확장자 상수 및 스캔 유틸

**Files:**
- Create: `packages/theme-docs/src/lib/assetExtensions.ts`
- Create: `packages/theme-docs/src/lib/scanAssets.ts`

**Step 1: Define allowed extensions and MIME/viewer type map**

Create `packages/theme-docs/src/lib/assetExtensions.ts`:

```ts
export const ASSET_EXTENSIONS = [
  ".html", ".pdf", ".pptx", ".tex",
  ".odt", ".ods", ".odp", ".docx", ".xlsx",
  ".ipynb", ".csv", ".rst", ".epub",
] as const;

export type AssetExtension = typeof ASSET_EXTENSIONS[number];

export type ViewerType =
  | "iframe"      // .html
  | "pdf"         // .pdf
  | "pptx"        // .pptx
  | "latex"       // .tex
  | "viewerjs"    // .odt, .ods, .odp
  | "docx"        // .docx (viewer or download)
  | "xlsx"        // .xlsx (viewer or download)
  | "ipynb"       // .ipynb
  | "csv"         // .csv table
  | "rst"         // .rst (e.g. restructured / rst2html)
  | "epub"        // .epub (EPUB.js)
  | "download"    // fallback only
  ;

const EXT_TO_VIEWER: Record<string, ViewerType> = {
  ".html": "iframe",
  ".pdf": "pdf",
  ".pptx": "pptx",
  ".tex": "latex",
  ".odt": "viewerjs", ".ods": "viewerjs", ".odp": "viewerjs",
  ".docx": "docx", ".xlsx": "xlsx",
  ".ipynb": "ipynb",
  ".csv": "csv",
  ".rst": "rst",
  ".epub": "epub",
};

export function getViewerType(ext: string): ViewerType {
  return EXT_TO_VIEWER[ext.toLowerCase()] ?? "download";
}

export function isAssetExtension(ext: string): boolean {
  return ASSET_EXTENSIONS.includes(ext.toLowerCase() as AssetExtension);
}
```

**Step 2: Implement filesystem scan for asset files**

Create `packages/theme-docs/src/lib/scanAssets.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { ASSET_EXTENSIONS, isAssetExtension } from "./assetExtensions.js";

export interface AssetEntry {
  slug: string;       // path without extension, e.g. "en/guide"
  relPath: string;   // path with extension, e.g. "en/guide.pdf"
  ext: string;
  sectionSlug: string;
}

export function scanSectionAssets(
  sectionDir: string,
  sectionSlug: string,
  baseDir: string = sectionDir
): AssetEntry[] {
  if (!fs.existsSync(sectionDir)) return [];
  const entries: AssetEntry[] = [];
  const stack: string[] = [""];
  while (stack.length) {
    const rel = stack.pop()!;
    const full = path.join(sectionDir, rel);
    if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const names = fs.readdirSync(full);
      for (const name of names) {
        if (name.startsWith(".")) continue;
        stack.push(rel ? `${rel}/${name}` : name);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(rel).toLowerCase();
      if (isAssetExtension(ext)) {
        const slug = rel.slice(0, -ext.length).replace(/\\/g, "/");
        entries.push({ slug, relPath: rel.replace(/\\/g, "/"), ext, sectionSlug });
      }
    }
  }
  return entries;
}

export function getContentSectionsBasePath(): string {
  const root = process.cwd();
  return path.join(root, "src", "content");
}
```

**Step 3: Verify TypeScript compiles**

Run: `cd packages/theme-docs && pnpm exec tsc --noEmit`
Expected: no errors.

**Step 4: Commit**

```bash
git add packages/theme-docs/src/lib/assetExtensions.ts packages/theme-docs/src/lib/scanAssets.ts
git commit -m "feat(theme-docs): add asset extensions and section scan util"
```

---

## Task 2: getStaticPaths에 asset 경로 병합

**Files:**
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro` (getStaticPaths, Props, 분기)

**Step 1: Import scan and extension util**

At top of `packages/theme-docs/src/pages/section/[...slug].astro`, add:

```ts
import { scanSectionAssets, getContentSectionsBasePath } from "../../lib/scanAssets.js";
import { getViewerType } from "../../lib/assetExtensions.js";
```

**Step 2: In getStaticPaths, after the existing for(doc of docs) loop, add asset scan and push paths**

After the block that does `paths.push({ params: { section, slug: innerPath }, props: { doc, ... } })` for each doc, add:

```ts
const basePath = getContentSectionsBasePath();
const sectionContentDir = path.join(basePath, section.slug);
const assetEntries = scanSectionAssets(sectionContentDir, section.slug);
const existingInnerPaths = new Set(
  docs.map((d) => {
    const docId = d.slug ?? d.id;
    const parts = docId.split("/");
    const hasLocale = locales.includes(parts[0]);
    return hasLocale ? (parts[0] === defaultLocale ? parts.slice(1).join("/") : docId) : docId;
  })
);
for (const asset of assetEntries) {
  const slugParts = asset.slug.split("/");
  const hasLocale = locales.includes(slugParts[0]);
  const locale = hasLocale ? slugParts[0] : defaultLocale;
  const innerPath = hasLocale
    ? (slugParts[0] === defaultLocale ? slugParts.slice(1).join("/") : asset.slug)
    : asset.slug;
  if (existingInnerPaths.has(innerPath)) continue;
  paths.push({
    params: { section: section.slug, slug: innerPath || undefined },
    props: {
      assetEntry: {
        slug: asset.slug,
        relPath: asset.relPath,
        ext: asset.ext,
        viewerType: getViewerType(asset.ext),
        sectionSlug: section.slug,
      },
      doc: null,
      locale,
      cleanSlug: innerPath,
      sectionSlug: section.slug,
      sectionNav: section.navigation,
    },
  });
}
```

Add `import path from "node:path";` at top.

**Step 3: Extend Props and add branch for assetEntry**

- In the Props interface, add `assetEntry?: { slug: string; relPath: string; ext: string; viewerType: ViewerType; sectionSlug: string } | null`.
- After `const { doc, locale, ... } = Astro.props`, add: `const isAsset = !!assetEntry;`
- When `isAsset` is true, skip `render(doc)` and the existing Content block; instead render a placeholder (e.g. `<p>Asset: {assetEntry.slug}</p>`) inside DocsLayout so the route works. (Full viewer components come in later tasks.)

**Step 4: Run build to verify paths generate**

Run: `cd packages/barodoc && pnpm build:packages && pnpm --filter docs build 2>&1 | tail -30`
Expected: build completes; possible warnings. No crash in getStaticPaths.

**Step 5: Commit**

```bash
git add packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): merge asset paths into section getStaticPaths"
```

---

## Task 3: Asset 파일 서빙 URL 및 빌드 시 복사

**Files:**
- Modify: `packages/theme-docs/src/theme.ts` (Vite plugin: dev middleware for /_content/, build copy)
- Or create: `packages/theme-docs/src/plugins/assetCopy.ts` (Vite plugin that copies src/content/**/*.{asset extensions} to dist/_content)

**Step 1: Add Vite plugin to copy asset files to output**

In `packages/theme-docs/src/theme.ts`, inside `updateConfig({ vite: { plugins: [ ... ] } })`, add a custom plugin that in `writeBundle` (or `closeBundle`) copies from `path.join(process.cwd(), 'src', 'content', section)` for each section into `path.join(config.build.outDir, '_content', section)` for each asset extension file. Use the same ASSET_EXTENSIONS list and fs walk. Alternatively use `vite-plugin-static-copy` if available in the repo.

**Step 2: Dev server: serve /_content/* from src/content**

In the same theme, in `astro:config:setup`, add a Vite plugin with `configureServer` that registers a middleware: when `req.url` starts with `/_content/`, strip prefix, resolve to `path.join(process.cwd(), 'src', 'content', ...)` and stream the file (or return 404). This allows dev to serve e.g. `/_content/docs/en/guide.pdf`.

**Step 3: Verify dev serves a test file**

Put a file `docs/src/content/docs/en/test.pdf` (or any small asset), run `pnpm dev`, open `http://localhost:4321/_content/docs/en/test.pdf`. Expected: file downloads or displays.

**Step 4: Commit**

```bash
git add packages/theme-docs/src/theme.ts
git commit -m "feat(theme-docs): serve and copy asset files at /_content/"
```

---

## Task 4: Asset 페이지에서 공통 레이아웃 + 제목

**Files:**
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: When isAsset, compute title and asset URL**

e.g. `const assetUrl = \`/_content/${sectionSlug}/${assetEntry.relPath}\`;` and title from slug (e.g. last path segment, humanized).

**Step 2: Render DocsLayout with title and placeholder content for asset**

Use same DocsLayout props (title, sectionSlug, etc.), no headings/readingTime. Inside layout, render a wrapper div and an empty placeholder for the viewer (e.g. `<div id="asset-viewer" data-url={assetUrl} data-type={assetEntry.viewerType} />` or per-type component in next tasks).

**Step 3: Verify**

Build and open a URL that corresponds to an asset path (e.g. add a test.pdf and add slug to nav). Page should show layout and title.

**Step 4: Commit**

```bash
git add packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): asset page with DocsLayout and asset URL"
```

---

## Task 5: PDF 뷰어

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetPdf.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro` (use AssetPdf when viewerType === 'pdf')

**Step 1: Add AssetPdf.astro**

Takes `url: string`. Renders `<iframe src={url} />` or embed with type application/pdf. No external lib required for basic support.

**Step 2: In section page, when viewerType === 'pdf', render AssetPdf with assetUrl**

**Step 3: Test with a sample PDF in docs**

**Step 4: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetPdf.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): PDF asset viewer"
```

---

## Task 6: HTML iframe 뷰어

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetHtml.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: AssetHtml.astro with iframe src={url}**

**Step 2: Branch for viewerType === 'iframe'**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetHtml.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): HTML asset iframe viewer"
```

---

## Task 7: PPTX 뷰어 (PptxViewJS)

**Files:**
- Modify: `packages/theme-docs/package.json` (optional: add dependency or use CDN)
- Create: `packages/theme-docs/src/components/asset/AssetPptx.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: AssetPptx.astro**

Load PptxViewJS from CDN (e.g. script tag), mount viewer on a div, load URL. See PptxViewJS docs for API.

**Step 2: When viewerType === 'pptx', render AssetPptx**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetPptx.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): PPTX asset viewer (PptxViewJS)"
```

---

## Task 8: LaTeX 뷰어 (LaTeX.js)

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetTex.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: AssetTex.astro**

Fetch .tex file, run LaTeX.js in browser to produce HTML, inject into container.

**주의 (Tex 스크립트 오류):** LaTeX.js는 브라우저에서 `require is not defined`, 모듈 해석 오류, API 불일치 등으로 스크립트 오류가 자주 난다. 권장:
- **우선:** LaTeX.js 공식 [WebComponent / CDN 방식](https://latex.js.org/usage.html) 사용 (npm 번들 대신 CDN 스크립트로 로드).
- **대안:** 수학 수식만 있다면 KaTeX로 .tex에서 수식 블록만 추출해 렌더링.
- **대안:** 빌드 타임에 Node에서 LaTeX.js 또는 `pdflatex`로 HTML/PDF 생성 후 그 결과물을 서빙 (브라우저 실행 회피).

**Step 2: Branch for viewerType === 'latex'**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetTex.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): LaTeX asset viewer (LaTeX.js)"
```

---

## Task 9: CSV 테이블 렌더

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetCsv.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: AssetCsv.astro**

- **iframe 사용 금지.** CSV를 별도 페이지/iframe으로 넣으면 레이아웃·스크롤·스타일이 문서와 어긋나서 이상해 보임.
- **같은 페이지 안에 뷰로 포함:** assetUrl에서 CSV를 fetch → 파싱 후 **인라인 `<table>`** 또는 **SheetJS 등 스프레드시트 UI**로 문서 본문 영역에 직접 렌더. (선택: 정렬/검색 등이 필요하면 SheetJS, 단순 표면 `<table>`.)

**Step 2: Branch for viewerType === 'csv'**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetCsv.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): CSV asset table viewer"
```

---

## Task 10: Download-only fallback

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetDownload.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: AssetDownload.astro**

Shows title and a link `<a href={assetUrl} download>Download</a>`. (Used only when viewerType is `"download"` — unknown extension or explicit fallback.)

**Step 2: When viewerType === 'download' only, render AssetDownload**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetDownload.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): download-only asset fallback"
```

---

## Task 11: ODT/ODS/ODP (ViewerJS)

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetViewerJs.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: Load ViewerJS (WebODF) from CDN, embed viewer with asset URL**

**Step 2: When viewerType === 'viewerjs', render AssetViewerJs**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetViewerJs.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): ODT/ODS/ODP viewer (ViewerJS)"
```

---

## Task 12: Jupyter Notebook (nbviewer.js)

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetIpynb.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: 실행 뷰로 렌더 (코드 + 출력)**

- **소스만 보여주면 안 됨.** 노트북에 저장된 **실행 결과(출력)**를 함께 보여줘야 함. 즉, 셀별로 코드 블록 + 해당 셀의 saved output(텍스트, HTML, 이미지 등)을 문서 안에 그대로 표시.
- Fetch .ipynb JSON → nbviewer.js 또는 직접 구현으로 각 셀을 “코드 + 출력” 형태로 렌더. 출력이 있는 셀은 반드시 출력 영역을 본문에 포함.

**Step 2: Branch for viewerType === 'ipynb'**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetIpynb.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): Jupyter Notebook asset viewer"
```

---

## Task 13: DOCX / XLSX (viewer or download)

**Files:**
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: For viewerType 'docx' and 'xlsx', use AssetDownload for now (or integrate document-viewer-ts / SheetJS if desired)**

So docx and xlsx render as download link. Optional: add AssetDocx.astro later using a viewer lib.

**Step 2: Commit**

```bash
git add packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): DOCX/XLSX as download for now"
```

---

## Task 14: RST viewer

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetRst.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: RST → HTML and show as primary view**

- **주 뷰는 반드시 렌더된 HTML.** 소스코드와 다운로드 링크만 제공하는 방식은 부족함. 사용자가 RST 문서를 “문서처럼” 읽을 수 있어야 함.
- Fetch `assetUrl` → JS RST 파서(`restructured` 등)로 RST → HTML 변환 → DocsLayout 스타일이 적용된 본문 컨테이너에 **HTML 결과물을 주 내용으로** 삽입. 필요 시 상단/하단에 “소스 보기” 토글·다운로드 링크를 부가로 제공.

**Step 2: When viewerType === 'rst', render AssetRst with assetUrl**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetRst.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): RST asset viewer"
```

---

## Task 15: EPUB (EPUB.js)

**Files:**
- Create: `packages/theme-docs/src/components/asset/AssetEpub.astro`
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro`

**Step 1: Load EPUB.js, render epub at assetUrl in container**

**Step 2: When viewerType === 'epub', render AssetEpub with assetUrl**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/components/asset/AssetEpub.astro packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "feat(theme-docs): EPUB asset viewer"
```

---

## Task 16: 네비게이션에 asset slug 반영

**Files:**
- Modify: `packages/theme-docs/src/pages/section/[...slug].astro` (getAllPages / sectionNav)
- Design: either merge scanned asset slugs into a combined "allPages" for prev/next and sidebar, or leave nav as config-only (user adds asset slugs to config.navigation.pages). Prefer config-only for 1.0: user adds "guide" to pages if they have guide.pdf.

**Step 1: Document that asset slugs must be added to barodoc.config.json navigation.pages to appear in sidebar**

Add a short comment or README note. No code change if nav is config-only.

**Step 2: (Optional) Merge scanned asset slugs into allPages for prev/next**

So prev/next links include asset pages. Requires passing scanned asset list into the page or recomputing.

**Step 3: Commit**

```bash
git add packages/theme-docs/src/pages/section/[...slug].astro
git commit -m "docs(theme-docs): nav note for asset slugs; optional prev/next for assets"
```

---

## Task 17: 설정 가능 확장자 (optional)

**Files:**
- Modify: `packages/core` or theme to read barodoc.config.assetExtensions (optional array). If absent, use default ASSET_EXTENSIONS.

**Step 1: Add config schema for assetExtensions (optional)**

**Step 2: In scanAssets, accept override list from config (injected via virtual or passed from theme)**

**Step 3: Commit**

```bash
git add packages/theme-docs/src/lib/scanAssets.ts packages/theme-docs/src/lib/assetExtensions.ts
git commit -m "feat(theme-docs): configurable asset extensions"
```

---

## Task 18: 문서 및 테스트

**Files:**
- Modify: `DEVELOPMENT.md` or docs (add "Asset content" section: supported extensions, where to put files, nav)
- Add sample asset files in docs (e.g. `docs/src/content/docs/en/sample.pdf`) for manual test

**Step 1: Add DEVELOPMENT.md section**

Describe: put .pdf, .html, etc. in docs (or section) folder; add slug to navigation.pages to show in sidebar; build and dev serve at /_content/.

**Step 2: Add one sample asset and verify build + dev**

**Step 3: Commit**

```bash
git add DEVELOPMENT.md docs/src/content/docs/en/sample.pdf
git commit -m "docs: asset content viewer usage and sample"
```

---

## Execution handoff

Plan complete and saved to `docs/plans/2026-02-27-asset-content-viewer.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Parallel Session (separate)** — Open a new session with executing-plans, batch execution with checkpoints.

Which approach?
