# Astro v6 업그레이드 시 고려사항

현재 Barodoc은 **Astro 5.18.0**(최신 5.x)을 사용 중이다. **Astro 6**은 6.0.0-beta.20까지 나온 상태이며, 정식 출시 후 업그레이드 시 수정·검토할 점과 얻을 수 있는 이점을 정리한다.

---

## 1. Astro 6에서 꼭 할 일 (Breaking / 필수 변경)

### 1.1 Node 22.12+

- Astro 6은 Node 18/20을 지원하지 않고 **Node 22.12.0 이상**만 지원한다.
- **조치:** `package.json`의 `engines.node`를 `">=22.12.0"`으로 변경, CI·배포 환경을 Node 22로 맞추기.

### 1.2 Vite 7

- Astro 6은 **Vite 7**을 사용한다.
- **영향:** `@barodoc/theme-docs`에서 Vite 플러그인(`createAssetContentDevPlugin`의 `configureServer`, `ViteDevServer` 타입)을 사용하므로, [Vite 7 마이그레이션 가이드](https://vite.dev/guide/migration)를 보고 플러그인 API 변경 여부를 확인해야 한다.
- **조치:** theme-docs의 `vite` devDependency를 `^7.0.0`으로 올리고, 타입·훅 시그니처가 호환되는지 확인.

### 1.3 Zod 4

- Astro 6은 내부적으로 **Zod 4**를 사용하며, `content.config.ts` 등에서 쓰는 Zod 스키마는 Zod 4 문법으로 맞춰야 한다.
- **영향:**
  - **@barodoc/core**  
    - `packages/core/src/config/schema.ts`에서 `import { z } from "zod"`로 직접 Zod 3를 사용 중.  
    - Barodoc은 자체 설정 스키마(barodoc.config.json)만 검증하므로, Astro와 Zod 버전을 맞출지 여부를 결정해야 한다.  
    - 선택지: (A) core를 Zod 4로 올리고 스키마를 [Zod 4 변경사항](https://zod.dev/v4/changelog)에 맞게 수정, (B) 계속 Zod 3 유지(이 경우 Astro 6이 내부적으로 쓰는 Zod 4와 이중 의존성).
  - **생성/문서 코드**  
    - `packages/barodoc/src/runtime/project.ts`에서 생성하는 `content.config.ts`에 `defineCollection, z` from `astro:content` 사용.
    - `docs/src/content/config.ts`에서 `defineCollection, z` from `astro:content` 사용.
- **조치 (Astro 6 권장):**
  - content 관련 스키마에서는 `import { z } from "astro/zod"` 사용하도록 변경 (Astro 6에서 `z` from `astro:content` deprecated).
  - Zod 4 변경사항 반영: 예) `z.string().email()` → `z.email()`, `message` → `error`, `.default()` + transform 시 출력 타입에 맞는 default 등. 필요 시 [zod v3→v4 codemod](https://github.com/nicoespeon/zod-v3-to-v4) 검토.

### 1.4 Shiki v4

- Astro 6은 **Shiki 4.0**을 사용한다.
- **영향:** `packages/theme-docs/src/theme.ts`에서 `markdown.shikiConfig`로 `themes`, `transformers`(createTrimEmptyLinesTransformer, createLineNumbersTransformer)를 넘기고 있음.
- **조치:** [Shiki v4 마이그레이션](https://shiki.style/blog/v4)을 보고 transformer/테마 API 변경이 있으면 theme-docs의 마크다운 설정을 수정.

### 1.5 astro:content / astro/zod

- Astro 6에서는 `astro:schema` 및 `astro:content`에서의 `z` export가 deprecated → **`astro/zod`** 사용 권장.
- **영향:**  
  - `getCollection`, `render`, `defineCollection` from `astro:content` 사용처: theme-docs 페이지들, plugin-rss, docs content.config.ts, barodoc 생성 템플릿.
- **조치:**  
  - `defineCollection`은 계속 `astro:content`에서 import.  
  - `z`는 `import { z } from "astro/zod"`로 변경 (content.config.ts 및 barodoc이 생성하는 content.config.ts 템플릿).

### 1.6 Content Layer / Legacy 제거

- Astro 6은 legacy content collections 호환을 제거한다. 모든 컬렉션이 Astro 5에서 도입된 Content Layer API를 써야 한다.
- **영향:** Barodoc은 이미 Astro 5 기반으로 `getCollection`/`render`/`defineCollection`을 사용하므로, 레거시 패턴을 쓰고 있지 않다면 큰 변경 없을 가능성이 높다.
- **조치:** v6 업그레이드 후 content 관련 빌드/타입 에러가 나면, [Astro v5 업그레이드 가이드의 Content Layer 섹션](https://v6.docs.astro.build/en/guides/upgrade-to/v5/#legacy-v20-content-collections-api)과 v6의 `legacy.collectionsBackwardsCompat` 플래그 설명을 참고해 마이그레이션.

### 1.7 getStaticPaths() 내 Astro 사용

- Astro 6에서는 `getStaticPaths()` 안에서 `Astro.site` / `Astro.generator` 사용이 deprecated.
- **영향:** `packages/theme-docs/src/pages/[...page].astro`, `section/[...slug].astro`, `blog/[...slug].astro` 등에서 `getStaticPaths`를 쓰지만, 현재 코드에서 `Astro.site`/`Astro.generator`를 쓰는 부분은 없음.
- **조치:** 없음. 만약 나중에 추가된다면 `Astro.site()` 대신 `import.meta.env.SITE` 사용.

---

## 2. 우리가 쓰지 않는 부분 (변경 불필요)

- **Adapter API:** NodeApp, loadManifest, loadApp, createExports — Barodoc은 어댑터를 제공하지 않음.
- **import.meta.env.ASSETS_PREFIX** — 사용처 없음.
- **astro:transitions 내부 export** — 사용처 없음.
- **session driver** — 사용처 없음.

---

## 3. Astro 6에서 더 편해지거나 활용할 수 있는 점

- **Live Content Collections (정식)**  
  - 런타임 데이터를 쓰면서도 빌드 타임 검증을 유지할 수 있음.  
  - 향후 “원격 소스/동적 콘텐츠”를 더 깔끔하게 다루고 싶을 때 활용 가능.

- **CSP (Content Security Policy) 일급 지원**  
  - 인라인 스크립트/스타일에 대한 nonce 자동 주입 등.  
  - 보안 강화가 필요할 때 설정만으로 활용 가능.

- **Vite Environment API**  
  - dev와 production이 같은 런타임/엔진을 쓰도록 정리됨.  
  - 통합/어댑터 작성 시 문서만 참고하면 되고, Barodoc이 직접 구현한 부분은 Vite 7 플러그인 호환만 맞추면 됨.

---

## 4. 권장 순서 (Astro 6 정식 출시 후)

1. **Node 22** 요구사항 반영 (engines, CI, 배포).
2. **Vite 7** 전환: theme-docs의 Vite 플러그인과 타입을 Vite 7에 맞게 수정.
3. **Zod:** core는 필요 시 Zod 4로 올리거나 유지; content 쪽은 `astro/zod` 사용으로 통일.
4. **Shiki v4:** theme-docs의 `shikiConfig`/transformer 호환 확인.
5. **astro:content / astro/zod:** `z` import를 `astro/zod`로 변경 (content.config.ts 및 barodoc 생성 템플릿).
6. 전체 빌드·타입체크·docs 빌드로 회귀 확인.

---

## 5. 요약

| 항목           | 수정 필요 | 비고 |
|----------------|-----------|------|
| Node 22.12+    | 예        | engines, CI, 배포 |
| Vite 7         | 예        | theme-docs 플러그인·타입 |
| Zod 4 / astro/zod | 예    | core 스키마 또는 content만 astro/zod |
| Shiki v4       | 확인      | theme-docs shikiConfig/transformers |
| astro:content → z from astro/zod | 예 | config 및 생성 템플릿 |
| getStaticPaths Astro 사용 | 아니오 | 현재 미사용 |
| Adapter/NodeApp 등 | 아니오 | 미사용 |

**지금 당장 Astro 6으로 올릴 필요는 없다.** Astro 5.18이 최신 5.x이고, 6은 아직 beta이므로, 6이 정식 출시되고 공식 마이그레이션 가이드가 안정화된 뒤 위 순서대로 점검·업그레이드하는 것을 권장한다.
