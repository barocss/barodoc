# Tex Pre-render: Dev 자동 빌드 설계

**목표:** 개발 환경에서도 .tex pre-render가 자동으로 동작한다.  
(1) `pnpm dev` 시작 시 1회 전체 빌드, (2) .tex 파일 저장 시 해당 파일만 재빌드.

**접근:** Astro `astro:config:setup`에서 1회 실행 + Vite 플러그인 watcher로 변경 시 재빌드.

---

## 1. 트리거

### 1.1 Dev 시작 시 (1회)

- **훅:** Astro 통합의 `astro:config:setup` 내부에서 실행.
- **동작:** `contentDir`(프로젝트 루트 기준 `src/content`)가 존재하면 `buildAllTexToHtml(contentDir, projectRoot, logger)` 1회 호출.
- **이유:** config 로딩 시점에 실행하면 기존 "Setting up Barodoc docs theme..." 로그와 같은 스트림에서 "Tex pre-render: building .tex → HTML..." 등이 출력되어, dev에서 빌드 여부를 바로 확인 가능.

### 1.2 파일 저장 시 (재빌드)

- **위치:** Vite 플러그인 `configureServer`에서 `server.watcher` 사용.
- **대상:** `contentDir` 하위 `.tex` 파일만. `change` / `add` 이벤트 모두 처리.
- **동작:** 이벤트 시 해당 경로에서 `sectionSlug`와 `relPath`를 파싱해 `buildOneTexToHtml(contentDir, projectRoot, sectionSlug, relPath, logger)` 1회 호출.
- **로그:** 재빌드 시에도 동일 logger로 "Pre-rendered .tex: …" 또는 "Could not pre-render …" 출력 (가능하면 Vite/Node 콘솔에 노출).

### 1.3 Production 빌드 시

- **훅:** `build:start`에서 1회 실행하거나, config:setup이 빌드 시에도 호출되므로 config:setup 한 곳에서만 실행해 중복 제거 가능.
- **결과:** `.astro/tex-generated/`에 HTML 생성 후, `closeBundle` 등에서 `dist/_tex-generated/`로 복사.

---

## 2. 실행 맥락 (경로·cwd·프로젝트 루트)

### 2.1 프로젝트 루트

- **정의:** Astro 앱 루트 = `astroConfig.root`(config 파일이 있는 디렉터리).
- **사용:** pre-render 출력 경로 = `{projectRoot}/.astro/tex-generated/{section}/{relPath}.html`. 페이지에서 읽을 때도 동일 경로 사용.
- **일치 보장:** `astro:config:setup`에서 `process.env.BARODOC_PROJECT_ROOT = projectRoot` 설정. `getTexPreRenderCwd()`는 이 env를 사용하고, 없으면 `process.cwd()`. 따라서 `pnpm dev`를 모노레포 루트에서 실행해도 앱 루트(docs) 기준으로 쓰기/읽기 일치.

### 2.2 content 경로

- **계산:** `contentDir = path.join(projectRoot, "src", "content")`.
- **스캔:** `buildAllTexToHtml(contentDir, projectRoot, …)`가 `contentDir` 직하 디렉터리를 section으로 보고, 그 안에서 `.tex`만 스캔(기존 `scanSectionAssets` 유지).

### 2.3 Vite watcher

- **contentDir:** config:setup에서 사용하는 것과 동일한 `contentDir`를 플러그인 생성 시 인자로 전달.
- **projectRoot:** 플러그인 내부에서 `path.dirname(path.dirname(contentDir))`로 계산해 `buildOneTexToHtml(..., projectRoot, ...)`에 전달.

### 2.4 LaTeX.js CLI 경로

- **resolve:** `texPreRender.ts`의 `resolveLatexJsBin(cwd)`에서 `cwd` = projectRoot. 검색 경로: projectRoot, theme-docs 패키지 루트, `node_modules/@barodoc/theme-docs` 등(기존과 동일).
- **실행:** `execSync(node "${bin}" "${srcPath}" -o "${outFile}" ...)` 의 `cwd`도 projectRoot.

---

## 3. 실패 처리 및 로깅

### 3.1 content 디렉터리 없음

- **조건:** `!fs.existsSync(contentDir)`.
- **동작:** pre-render 호출하지 않음. logger로 1회: `Tex pre-render skipped: content dir not found ({contentDir})`.

### 3.2 .tex 파일이 없음

- **조건:** 스캔 결과 `.tex` 항목 0개.
- **동작:** 변환 없이 종료. logger: `Tex pre-render: no .tex assets found.`

### 3.3 LaTeX.js CLI 없음

- **조건:** `resolveLatexJsBin(projectRoot)`가 `null`.
- **동작:** `buildAllTexToHtml`에서 파일별 변환 호출하지 않음. logger: `Tex pre-render: LaTeX.js CLI not found. .tex pages will use the browser viewer.`
- **사용자 영향:** pre-render된 HTML 없음. 기존처럼 브라우저 LaTeX.js 뷰어(또는 fallback)만 사용.

### 3.4 파일별 변환 실패

- **조건:** 특정 `.tex`에 대해 `execSync`(LaTeX.js CLI) 실패(문법 오류, 미지원 패키지 등).
- **동작:** 해당 파일만 스킵. logger: `Could not pre-render {relPath}: {error}`. 나머지 `.tex`는 계속 변환.

### 3.5 로거 전달

- **config:setup:** Astro 훅의 `logger`를 그대로 전달 → `logger.info` / `logger.warn` 사용.
- **Vite 플러그인(watcher):** 가능하면 `server.config.logger` 사용, 없으면 `console.log`/`console.warn`에 `[barodoc] …` 접두어.

---

## 4. 개발 경험

### 4.1 theme-docs 빌드와 코드 반영

- **상황:** docs 앱이 `@barodoc/theme-docs`를 dist(`./dist/theme.js`)에서 로드.
- **결과:** theme 코드(tex pre-render, watcher) 수정 후 theme-docs를 빌드하지 않으면 dev에서 새 동작이 반영되지 않음.
- **권장:** theme-docs 수정 후 `pnpm --filter @barodoc/theme-docs build` 1회 실행 후 `pnpm dev`. 루트에 `"dev:fresh": "pnpm --filter @barodoc/theme-docs build && pnpm dev"` 스크립트 제공 → “테마까지 반영해서 dev” 할 때 사용.

### 4.2 pre-render 결과 확인

- **시작 시:** 터미널에 `Tex pre-render: building .tex → HTML...` 및 `Pre-rendered .tex: …` 로그로 1회 빌드 여부 확인.
- **저장 시:** .tex 저장 후 동일 로그로 재빌드 여부 확인. 브라우저에서 해당 문서 페이지 새로고침 시 iframe에 갱신된 HTML 표시.

### 4.3 문서화

- **DEVELOPMENT.md**(또는 해당 가이드): “Asset 뷰어(.tex 등)는 dev 시작 시·파일 저장 시 자동 pre-render됨. theme-docs를 수정했다면 `pnpm dev:fresh` 또는 theme-docs 빌드 후 dev 실행” 한 줄 추가.
