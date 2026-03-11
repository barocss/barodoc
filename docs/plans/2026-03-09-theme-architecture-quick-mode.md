# Theme 아키텍처 (B안): Quick mode 관점 검토

## 배경

- 권장안 B: **페이지는 프로젝트에 두고, 테마는 레이아웃/컴포넌트만 제공** (Docusaurus/VitePress/Fumadocs와 동일한 모델).
- Full custom에서는 이렇게 하면 진입점이 `docs/src/pages/`로만 나가서 `/@fs/` 404 원인이 사라짐.
- 이 문서는 **Quick mode**에서도 B안이 타당한지 정리한다.

---

## Quick mode 현재 동작

- **임시 프로젝트**: `createProject()`가 `root/.barodoc/`에 임시 Astro 프로젝트 생성.
- **생성되는 것**: `package.json`, `barodoc.config.json`, `tsconfig.json`, `src/content/`(docs/blog/changelog/pages/sections 복사), `content.config.ts`, `public`/`overrides` 심링크, **`node_modules` → CLI의 node_modules 심링크**.
- **없는 것**: **`src/pages/`** 없음. `astro.config.mjs`도 없음 (Astro는 `dev({ root: projectDir, configFile: false, integrations: [barodoc(), docsTheme()] })` 로 호출).
- **라우트**: 테마의 `injectRoute`만으로 등록. 즉 **페이지 진입점 전부가 테마 패키지** (`@barodoc/theme-docs/pages/*.astro`). 임시 프로젝트에는 페이지 파일이 하나도 없음.

→ Quick mode도 지금은 “테마가 페이지 소유” 모델이라, full custom과 동일한 아키텍처.

---

## B안을 Quick mode에 적용했을 때

- **변경점**: 임시 프로젝트에도 **페이지 진입점을 두고**, 테마는 `injectRoute` 없이 **레이아웃/컴포넌트만** 제공.

### 1. “프로젝트에 페이지”의 의미

- Quick mode에서 “프로젝트” = **임시 프로젝트** (`.barodoc/`).
- B안이 타당하려면, 이 임시 프로젝트에 **`src/pages/`** 가 있어야 함.
- 즉, **CLI가 임시 프로젝트를 만들 때 `src/pages/` 아래 페이지 파일을 생성**하면 됨.

### 2. 누가 페이지 파일을 만드는가

- **Full custom**: 사용자 또는 `barodoc create`가 `src/pages/`에 페이지 파일 생성. 테마는 레이아웃/컴포넌트만 import.
- **Quick mode**: **`createProject()`가** `.barodoc/src/pages/`에 페이지 파일을 **자동 생성**.
- 예: `index.astro`, `[section]/[...slug].astro`, `blog/index.astro`, `blog/[...slug].astro`, `changelog/index.astro`, `[...page].astro` 등을 CLI가 쓰기.

→ 두 모드 모두 “페이지 파일은 (실제 또는 임시) **프로젝트** 쪽에만 있고, 테마는 페이지를 주입하지 않음”으로 통일 가능.

### 3. 페이지 로직 위치

- 현재: `getStaticPaths`, `getCollection`, 렌더 로직이 **테마 패키지**의 `pages/*.astro` 안에 있음.
- B안 적용 시 선택지:
  - **(1) 생성 파일에 로직 포함**: CLI가 생성하는 `.barodoc/src/pages/*.astro`에 getStaticPaths/getCollection/렌더를 그대로 넣고, 테마는 레이아웃 컴포넌트만 import. 단점: 로직이 “CLI 템플릿”과 “full custom용 스캐폴드” 두 곳에 있어 동기화 필요.
  - **(2) 테마는 “페이지용 레이아웃”만 제공**: 테마는 예를 들어 `DocSectionPage.astro(section, slug, content)` 같은 **데이터를 받아서 그리기만 하는** 컴포넌트를 export. 생성된 페이지 파일은 “getStaticPaths + getCollection 한 뒤 `<DocSectionPage ... />` 호출”만 함. 로직은 생성 파일에만 있고, 테마는 순수 UI. 그러면 full custom에서도 같은 `DocSectionPage`를 쓰는 얇은 페이지 파일을 두면 됨.

(2)가 더 깔끔: 테마는 “페이지 레이아웃 컴포넌트”만 제공하고, **어디서 getStaticPaths/getCollection을 할지는 프로젝트(또는 생성된 페이지) 책임**으로 두면, Quick/Full 동일한 테마 API를 쓸 수 있음.

### 4. Quick mode에서의 이점

- **진입점이 항상 프로젝트 루트 아래**: `.barodoc/src/pages/`는 임시 프로젝트 내부이므로, Vite가 resolve 해도 `/@fs/.../packages/theme-docs/...` 같은 요청이 나가지 않음. 즉 **Quick mode에서도 `/@fs/` 404 가능성 제거**.
- **동작 방식이 Full custom와 같음**: “페이지는 프로젝트, 테마는 컴포넌트”로 통일되면, 한 번 B안을 구현해 두면 두 모드 모두 같은 패턴으로 유지보수 가능.

### 5. 구현 부담

- **CLI**: `createProject()`에서 `.barodoc/src/pages/` 생성 로직 추가. 페이지별로 “얇은” .astro 템플릿을 두고, 각각 `@barodoc/theme-docs/...` 레이아웃/컴포넌트만 import.
- **테마**: `injectRoute` 제거; 대신 “페이지용 레이아웃” 컴포넌트들 export (예: DocSectionPage, BlogIndexPage, ChangelogPage, CatchAllPage 등). 기존 `pages/*.astro`의 getStaticPaths/getCollection 로직은 (1) CLI 생성 템플릿으로 옮기거나 (2) 테마의 “페이지 레이아웃”이 필요한 데이터만 props로 받고, 데이터 로딩은 호출측(생성된 페이지 또는 full custom 페이지)에서 하도록 나누면 됨.

---

## 결론 (Quick mode 관점)

- **B안은 Quick mode 관점에서도 타당하다.**
- Quick mode의 “프로젝트”는 이미 CLI가 생성하는 임시 프로젝트이므로, 여기에 **생성 단계에서 `src/pages/`를 추가**하면 “페이지는 (임시) 프로젝트에 있다”가 성립한다.
- 테마는 `injectRoute`를 제거하고 레이아웃/페이지용 컴포넌트만 제공하면, Full custom와 동일한 아키텍처를 유지하면서 Quick mode에서도 `/@fs/` 이슈를 제거할 수 있다.
- 대신 **CLI가 페이지 템플릿을 생성하는 책임**이 생기고, 테마는 “페이지 진입 .astro”가 아니라 “페이지용 레이아웃 컴포넌트”로 역할이 바뀐다. 이는 Docusaurus/VitePress/Fumadocs의 “테마 = 컴포넌트” 모델과 맞다.
