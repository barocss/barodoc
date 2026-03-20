# Barodoc 4단계 로드맵 설계

**일자:** 2026-03-19  
**근거:** [2026-03-19-competitive-feature-research.md](./2026-03-19-competitive-feature-research.md) §3 우선순위 제안

순서: **1 → 2 → 3 → 4** (순차).

---

## 1. 범위와 결과물

| 단계 | 이름 | 범위(요지) | 완료 시 결과 |
|------|------|------------|--------------|
| **1** | 문서·설정 | base path, Edit/Last updated, 테마 가이드, 검색 옵션 비교, GitHub Pages 배포 경로, a11y·SEO 체크리스트 | 사용자가 설정·배포·접근성·SEO를 문서만 보고 따라 할 수 있음 |
| **2** | CLI·스캐폴딩 | `barodoc check --production`, `barodoc deploy` 또는 워크플로 생성, `barodoc create`에 배포 워크플로·권장 설정 | 새 프로젝트 생성 시 배포 가능한 상태까지 한 번에; 배포 전 프로덕션 체크 가능 |
| **3** | 테마·콘텐츠 | 읽기 시간, ToC 현재 섹션, 콜아웃 표준화, 콘텐츠 컴포넌트 갤러리, 버저닝 Quick 모드 문서 | 문서 사이트가 읽기·네비·컴포넌트·버전 전환까지 한 번에 이해 가능 |
| **4** | 플러그인·확장 | OpenAPI → API 레퍼런스(정리/확장), 피드백 웹훅, Suggest edit, llms.txt/MCP 강화 | API 문서·피드백·편집 제안·AI 발견이 플러그인/가이드로 정리됨 |

---

## 2. 의존 관계와 순서

- **1 → 2 → 3 → 4** 고정.
- 2는 1 문서를 참조; 3·4는 2와 무관. 구현은 단계 완료 후 다음 단계 진행.

---

## 3. 1단계 — 문서·설정 (상세)

| 항목 | 위치·형식 | 내용 요지 |
|------|-----------|-----------|
| base path | 배포 가이드 또는 Configuration | `base` 설정, GitHub Pages 프로젝트 사이트 예시, create 템플릿 주석 |
| Edit / Last updated | Configuration 또는 Guides | `editLink`, `lastUpdated`, GitHub 브랜치/경로 템플릿, 테마 노출 위치 |
| 테마·커스터마이징 | 새 가이드 또는 Configuration 하위 | 토큰, 다크/라이트, 코드 블록 테마, Full Custom 오버라이드 |
| 검색 옵션 비교 | 가이드 한 페이지 | Pagefind vs DocSearch 등, 언제 어떤 걸 쓸지 |
| GitHub Pages 배포 경로 | 배포 가이드 "GitHub Pages" 절 | 저장소 → create → 워크플로 → Pages; 2단계에서 워크플로 자동 추가 시 보강 |
| a11y·SEO 체크리스트 | 가이드 한 페이지 또는 배포/체크리스트 | 제목 계층, 포커스·skip link, hreflang, sitemap, meta/OG, 선택적 CI a11y |

**성공 기준:** 위 항목이 docs에 반영되어, 새 사용자가 문서만 보고 설정·배포·접근성·SEO를 따라 할 수 있음.

---

## 4. 2단계 — CLI·스캐폴딩 (상세)

| 항목 | 내용 요지 |
|------|-----------|
| `barodoc check --production` | `site`, favicon, subpath 시 `base` 등 점검; 실패 시 경고/에러 안내 |
| 배포 워크플로 스캐폴딩 | `barodoc create` 시 옵션으로 `.github/workflows/deploy.yml` 생성 (Node, build, deploy-pages) |
| `barodoc deploy` | 1차는 워크플로만; 원커맨드 deploy는 설계에 "향후"로 명시 |
| `barodoc create` 권장 설정 | editLink/lastUpdated·검색·sitemap 권장 주석 또는 기본값 |

**성공 기준:** create로 (옵션) 배포 워크플로 포함, `check --production`으로 배포 전 점검 가능.

---

## 5. 3단계 — 테마·콘텐츠 (상세)

| 항목 | 내용 요지 |
|------|-----------|
| 읽기 시간 | 단어 수 계산, "X min read" 노출 (frontmatter 또는 레이아웃) |
| ToC 현재 섹션 | 스크롤에 따라 현재 H2/H3 하이라이트 (스크롤 스파이) |
| 콜아웃 표준화 | note/warning/tip/danger 통일, 사용법 문서 |
| 콘텐츠 컴포넌트 갤러리 | docs 전용 페이지: Callout, Card, Steps, Tabs, Code, API 블록 등 예제 |
| 버저닝 Quick 모드 문서 | config 버전/VersionSwitcher, Quick 모드 폴더 구조 예시 |

**성공 기준:** 읽기 시간·ToC 하이라이트·갤러리·버저닝 문서 반영.

---

## 6. 4단계 — 플러그인·확장 (상세)

| 항목 | 내용 요지 |
|------|-----------|
| OpenAPI → API 레퍼런스 | plugin-openapi 현황·갭 정리, 필요 시 확장 |
| 피드백 웹훅 | "Was this helpful?" → 웹훅/analytics (플러그인 또는 테마 슬롯) |
| Suggest edit | Edit 링크를 GitHub/GitLab 편집 URL로, 설정 문서화 |
| llms.txt / MCP | plugin-llms-txt·MCP 가이드 강화 |

**성공 기준:** API 문서·피드백·편집 제안·AI 발견이 플러그인/가이드로 정리됨.

---

## 7. 단계별 성공 기준 요약

| 단계 | 완료 조건 |
|------|-----------|
| 1 | 6개 문서·설정 항목이 docs에 반영됨 |
| 2 | check --production 동작, create 시 (옵션) 배포 워크플로 생성 가능 |
| 3 | 읽기 시간·ToC 하이라이트·갤러리·버저닝 문서 반영됨 |
| 4 | OpenAPI·피드백·Suggest edit·llms.txt 설계 범위 문서/플러그인 정리됨 |

릴리즈는 1→2→3→4 순서로, 단계마다 patch/minor로 진행.
