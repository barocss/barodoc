# Barodoc 4단계 로드맵 — 실제 구현 계획

**일자:** 2026-03-19  
**근거:** [2026-03-19-four-tier-roadmap-design.md](./2026-03-19-four-tier-roadmap-design.md)

순서: **1 → 2 → 3 → 4**. 각 단계 완료 후 다음 단계로 진행. 릴리즈는 단계마다 changeset + `docs/src/content/changelog/` 항목 ([barodoc-release 스킬](../../.cursor/skills/barodoc-release/SKILL.md) 참고).

---

## 공통

| 항목 | 내용 |
|------|------|
| **검증** | `pnpm build:packages` → `pnpm dev` 또는 `pnpm build && pnpm preview` (theme-docs 아일랜드 검증 시 preview 권장, [DEVELOPMENT.md](../../DEVELOPMENT.md)) |
| **타입체크** | `pnpm --filter docs exec astro sync` 후 `pnpm -r exec tsc --noEmit` |
| **i18n** | 사용자 대면 문서는 `docs/src/content/docs/en/`와 `ko/` 둘 다 갱신(또는 한쪽만 먼저 + 이슈로 ko 백로그) |

---

## Phase 1 — 문서·설정 (코드 변경 최소)

**목표:** 새 사용자가 문서만 보고 `base`, `editLink`, 테마, 검색, GitHub Pages(Quick), a11y/SEO를 따라 할 수 있게 한다.

### Task 1.1 — `base` / GitHub Pages 프로젝트 사이트

| 필드 | 내용 |
|------|------|
| **파일** | `docs/src/content/docs/en/guides/deployment.mdx`, `ko/guides/deployment.mdx` |
| **작업** | `barodoc.config.json`의 `base` 설명 추가. `https://user.github.io/repo-name/` 형태의 **프로젝트 사이트**에서 `base`를 `/repo-name/`로 두는 예시. Quick 모드(`barodoc build`) 출력 경로와 `base` 관계 한 단락. |
| **검증** | 배포 가이드만 읽고 프로젝트 사이트에서 자산 404 없이 로드되는지 수동 확인 절차 명시. |

### Task 1.2 — `editLink` / `lastUpdated`

| 필드 | 내용 |
|------|------|
| **파일** | `en/guides/configuration.mdx`, `ko/guides/configuration.mdx` (또는 전용 `guides/edit-and-meta.mdx` 신설 시 네비에 추가) |
| **작업** | `editLink.baseUrl`, 파일 경로 템플릿(Barodoc이 실제로 쓰는 규칙과 일치하는지 `packages/theme-docs`에서 확인 후 문서화). `lastUpdated: true` 시 Git 기반 표시 여부·제한 사항. 푸터에서 어디에 보이는지 스크린샷 또는 설명 한 줄. |
| **코드 확인** | `packages/core/src/config/schema.ts`의 `editLinkSchema`, theme-docs에서 `editUrl` 생성 로직. |

### Task 1.3 — 테마·커스터마이징 가이드

| 필드 | 내용 |
|------|------|
| **파일** | `en/guides/theming.mdx` 신설(또는 configuration 하위 섹션 확장), `ko` 대응, `docs/barodoc.config.json`의 `navigation`에 페이지 추가 |
| **작업** | `theme.colors.primary`, 다크/라이트(`ThemeToggle` 동작), 코드 블록 하이라이트(테마가 쓰는 방식). Full Custom에서 `@barodoc/theme-docs` 오버라이드·`--bd-*` 변수(`global.css`) 링크. |

### Task 1.4 — 검색 옵션 비교

| 필드 | 내용 |
|------|------|
| **파일** | `en/guides/search-options.mdx` 신설, `ko` 대응, 네비에 추가 |
| **작업** | 기본 Pagefind vs `@barodoc/plugin-search` vs `@barodoc/plugin-docsearch`(있다면) 비교표: 설정 난이도, 비용, 백엔드 필요 여부, 언제 무엇을 쓸지. `docs/barodoc.config.json`의 `plugins` 예시와 링크. |

### Task 1.5 — GitHub Pages “Quick 모드” 경로

| 필드 | 내용 |
|------|------|
| **파일** | `deployment.mdx`에 **Quick mode** 절 추가 |
| **작업** | `barodoc`만 있는 저장소: `pnpm install` 없이 `npx barodoc build` 또는 CI에서 `pnpm add barodoc` 후 `barodoc build .` 예시. `base`와 `permissions`/Pages 설정 다시 강조. (Phase 2에서 워크플로 템플릿이 생기면 “자동 생성” 링크로 연결.) |

### Task 1.6 — a11y·SEO 체크리스트

| 필드 | 내용 |
|------|------|
| **파일** | `en/guides/accessibility-seo.mdx` 신설, `ko` 대응 |
| **작업** | 제목 계층(H1 한 개), 키보드 포커스·skip link(테마에 있는지 확인 후 서술), i18n 시 `hreflang`/대체 URL, sitemap 플러그인, `@barodoc/plugin-og-image` 등 메타/OG. 선택: CI에 `pa11y` 등 한 줄 예시. |

### Phase 1 완료 조건

- 위 6개 영역이 docs에 반영됨.
- `pnpm build`(docs 워크스페이스) 통과, 깨진 내부 링크 없음.

---

## Phase 2 — CLI·스캐폴딩

**목표:** `barodoc check --production`, `barodoc create` 옵션으로 GitHub Pages 워크플로, 생성 템플릿에 권장 설정 주석/값.

### Task 2.1 — `barodoc check --production`

| 필드 | 내용 |
|------|------|
| **파일** | `packages/barodoc/src/commands/check.ts`, `packages/barodoc/src/cli.ts` |
| **작업** | `--production` 플래그 추가. 검사 항목(설계안): `config.site` 설정 여부(프로덕션 URL), `public/favicon` 또는 config `favicon` 존재, **프로젝트 사이트로 배포할 때** `base` 미설정 경고(휴리스틱: `site`에 `github.io` 포함 시 등, 과하면 문서에 “수동 확인”만). 선택: sitemap 플러그인 권장 경고. |
| **출력** | 실패/경고를 구분(`--strict`로 경고를 실패로 승격 가능 여부는 YAGNI 시 생략). |
| **테스트** | `packages/barodoc`에 단위 테스트 또는 스냅샷(임시 디렉터리 + 최소 config). |

### Task 2.2 — 배포 워크플로 템플릿 + `create` 옵션

| 필드 | 내용 |
|------|------|
| **파일** | `packages/barodoc/src/commands/create.ts`, `cli.ts`, 템플릿 예: `packages/barodoc/templates/github-pages-deploy.yml` (또는 문자열 상수) |
| **작업** | `barodoc create <name> --with-github-pages` (플래그명은 짧게 합의): `.github/workflows/deploy.yml` 생성. 내용: checkout, Node 20, **Quick 모드** 기준으로 `npm i -g pnpm` 또는 `pnpm add barodoc` + `barodoc build` 또는 문서에 맞는 한 가지 표준 경로. `permissions`/`deploy-pages`는 [DEVELOPMENT.md](../../DEVELOPMENT.md)의 docs 워크플로와 동일 패턴. **모노레포가 아닌** 단일 Barodoc 프로젝트 전제를 README 주석으로 명시. |
| **검증** | 새로 만든 폴더에서 워크플로 YAML 문법 검증, 선택적으로 dry-run. |

### Task 2.3 — `create` 기본 `barodoc.config.json` 보강

| 필드 | 내용 |
|------|------|
| **파일** | `packages/barodoc/src/commands/create.ts` |
| **작업** | 생성 JSON에 `editLink` / `lastUpdated` **주석은 JSON 불가** → 대신 생성 직후 `README.md` 또는 `docs/en/getting-started.md`에 “권장 설정” 단락 추가. 또는 `plugins` 배열에 `["@barodoc/plugin-sitemap"]` 등 **선택적** 기본값(의존성 없이 동작하는 것만). |
| **주의** | Quick 모드에서 플러그인 패키지가 없으면 깨지지 않게: 주석 전용 문서 파일이 안전. |

### Task 2.4 — 문서 상호 참조

| 필드 | 내용 |
|------|------|
| **파일** | Phase 1 `deployment.mdx` |
| **작업** | `barodoc create --with-github-pages` 안내 추가. |

### Phase 2 완료 조건

- `barodoc check --production`이 설계된 규칙으로 동작.
- `create --with-github-pages`로 워크플로 생성 가능.
- Phase 1 배포 문서와 모순 없음.

---

## Phase 3 — 테마·콘텐츠

**목표:** 읽기 시간·ToC·콜아웃·컴포넌트 갤러리·버저닝 문서. (코드는 “갭만 보강”.)

### Task 3.1 — 읽기 시간

| 필드 | 내용 |
|------|------|
| **현황** | `section/[...slug].astro`, `blog/[...slug].astro`에 `reading-time` 사용 중. |
| **작업** | 문서 라우트 전수 조사: 읽기 시간이 없는 Docs 레이아웃 경로가 있으면 `DocsLayout`에 `readingTime` props 추가. 선택: frontmatter `readingTime: false`로 숨김. |
| **문서** | `configuration` 또는 `theming`에 “읽기 시간 표시” 한 절. |

### Task 3.2 — ToC 현재 섹션

| 필드 | 내용 |
|------|------|
| **현황** | `TableOfContents.astro`에 IntersectionObserver 기반 `.active` 이미 존재. |
| **작업** | 엣지 케이스(짧은 문서, 첫 헤딩) QA. 필요 시 `rootMargin`/`threshold` 조정. 문서에 “On this page 동작” 설명. |

### Task 3.3 — 콜아웃 표준화

| 필드 | 내용 |
|------|------|
| **파일** | `en/guides/callouts.mdx`(또는 components 문서 확장), `ko` |
| **작업** | `Callout` / `DocCallout` 지원 타입(note, warning, tip, danger 등) 목록과 MDX 예제. 디자인 토큰과 일치하는 이름 사용. |

### Task 3.4 — 콘텐츠 컴포넌트 갤러리

| 필드 | 내용 |
|------|------|
| **파일** | `docs/src/content/docs/en/components-gallery.mdx`(또는 기존 `components-test.mdx` 정리·이름 변경) |
| **작업** | Callout, Card, Steps, Tabs, Code/CodeGroup, API 블록 등 **한 페이지에** 예제 + 짧은 “언제 쓰나”. `barodoc.config.json` `navigation`에 추가. `ko` 번역 페이지. |

### Task 3.5 — 버저닝 Quick 모드 문서

| 필드 | 내용 |
|------|------|
| **파일** | `en/guides/versioning.mdx` 신설, `ko` |
| **작업** | `config.versions` + `VersionSwitcher` 설정 예시, 폴더 구조(`docs/v1/`, `docs/v2/` 등 실제 코드와 일치하도록 core/theme-docs 확인). |

### Phase 3 완료 조건

- 읽기 시간·ToC·콜아웃·갤러리·버저닝이 문서 또는 코드로 요구사항 충족.
- 공식 docs 사이트에서 갤러리 페이지 렌더 확인.

---

## Phase 4 — 플러그인·확장

**목표:** 문서·가벼운 코드로 “정리됨” 상태. 큰 신규 플러그인은 범위를 쪼갠다.

### Task 4.1 — OpenAPI / API 레퍼런스

| 필드 | 내용 |
|------|------|
| **파일** | `packages/plugin-openapi/README.md`, `docs` 가이드 절(예: `guides/openapi.mdx`) |
| **작업** | 옵션, `barodoc.config.json` 예시, 한계(버전 드롭다운, try-it 유무). 갭 목록을 README “Roadmap”에 bullet. |

### Task 4.2 — 피드백 웹훅

| 필드 | 내용 |
|------|------|
| **작업** | **최소:** 설계 이슈 또는 `docs/plans/`에 스펙만. **구현 시:** `packages/plugin-feedback`(신규) 또는 theme-docs 슬롯 + `fetch` POST. Phase 4에서 “문서 + 스켈레톤 플러그인”까지면 설계 충족으로 볼 수 있음. |

### Task 4.3 — Suggest edit

| 필드 | 내용 |
|------|------|
| **작업** | Task 1.2와 연계해 `editLink`가 곧 Suggest edit URL임을 명시. GitLab `/-/edit/` 패턴이 필요하면 schema/문서에 예시 추가. |

### Task 4.4 — llms.txt / MCP

| 필드 | 내용 |
|------|------|
| **파일** | `packages/plugin-llms-txt/README.md` 또는 docs 가이드 |
| **작업** | 생성 경로, `robots.txt`와 관계, MCP 연동이 있다면 링크·한 줄 설명. |

### Phase 4 완료 조건

- OpenAPI·llms.txt는 README/가이드로 재현 가능.
- 피드백은 문서화 또는 스켈레톤 패키지 + changeset 정책 합의.

---

## 권장 일정(병렬 가능 단위)

| 주차(가이드) | 집중 |
|--------------|------|
| 1 | Phase 1 전부 (문서 위주, 병렬: en/ko) |
| 2 | Phase 2.1–2.2 (CLI 핵심) + 2.3–2.4 |
| 3 | Phase 3 (테마 갭 + 갤러리 + 가이드) |
| 4 | Phase 4 (문서 우선, 피드백 플러그인은 범위에 따라 분리) |

---

## 한 줄 요약

1. **문서 6축**으로 배포·설정·SEO·검색·테마를 채운 뒤,  
2. **`check --production` + `create --with-github-pages`**로 CLI 가치를 올리고,  
3. **테마·갤러리·버저닝 문서**로 읽기 경험을 설명하고,  
4. **플러그인 README/가이드**로 확장 지점을 고정한다.

*구현 중 설계와 충돌하면 본 문서와 `2026-03-19-four-tier-roadmap-design.md`를 먼저 갱신한 뒤 코드를 맞춘다.*
