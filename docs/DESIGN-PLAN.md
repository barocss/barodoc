# Barodoc 디자인 계획 (Paper)

Paper에서 Barodoc 프로젝트 디자인을 할 때 사용하는 브리프와 계획입니다.  
**Paper에서 작업하려면 먼저 Paper 파일을 연 다음, 이 문서를 참고해 아트보드를 만들면 됩니다.**

---

## 1. 제품 요약

| 항목 | 내용 |
|------|------|
| **이름** | Barodoc |
| **정의** | 문서 사이트 프레임워크 (Astro + MDX) |
| **대상** | 개발자, 기술 문서 작성자, 오픈소스/제품 문서 팀 |
| **특징** | Quick 모드(제로 설정), Full Custom(Astro 풀 컨트롤), i18n, 다크모드, 검색, 플러그인 |

**주요 화면**
- **랜딩**: 히어로 + 기능 카드 6개 (MDX, 다크모드, 검색, i18n, 빠른 빌드, 커스터마이징)
- **탭 네비게이션**: Docs, Help, Blog, API Reference, Changelog, About
- **문서 레이아웃**: 사이드바(그룹/페이지) + 본문 + TOC + 헤더(로고, 탭, GitHub, 테마 토글, 검색)

### 랜딩 페이지 필수 요소 (체크리스트)

| 구역 | 포함 요소 |
|------|-----------|
| **헤더** | 로고, 「Powered by Astro」 배지, Docs / Help / Blog / API Reference / Changelog / About / GitHub, Sign in, Get started |
| **히어로** | 그라데이션 배경, 장식 블록, 헤드라인, 서브카피, Get started free / View documentation CTA |
| **제품 미리보기** | 문서 UI 카드(사이드바 + 본문 + 코드 스니펫) |
| **기능 (Built for)** | 섹션 라벨, 서브헤드, 기능 카드 6개: MDX & React, Search & i18n, Astro under the hood, Dark Mode, Lightning Fast, Customizable |
| **소셜 프루프** | 「Trusted by developers building docs」, 로고 스트립 플레이스홀더 |
| **하단 CTA** | 「Start building in minutes」, 설명, Quickstart / Documentation 링크 |
| **푸터** | 로고, Product(Features, Changelog, GitHub), Documentation(Getting started, Guides, API Reference), Resources(Blog, Help, Community), Legal(Privacy, Terms), 저작권 문구, 소셜 아이콘 |

### 글 보기 페이지 (Doc Page) 필수 요소 (체크리스트)

| 구역 | 포함 요소 |
|------|-----------|
| **헤더** | 로고, 탭(Docs 활성), Help / Blog / API / Changelog, 검색·테마·GitHub 아이콘 |
| **좌측 사이드바** | (1) 상단 검색창(필 스타일, "Search...", ⌘K) + AI/스파클 버튼 (2) 섹션=**아이콘(라인아트 스타일)+볼드 제목**(예: Get started, Guides) (3) 링크=**들여쓰기만**(padding-left), 세로선·배경 없음. 일부 항목 우측 **›** (하위 메뉴) (4) 활성=텍스트 굵게+primary 색만, 비활성=regular #374151 (5) 배경 #f9fafb |
| **본문** | 브레드크럼(Docs › 섹션 › 현재 페이지), H1, 본문 단락, Callout(Tip/Note 등), 코드 블록, H2, Prev/Next 카드, 푸터(Last updated, Edit this page) |
| **우측 TOC** | 「On this page」, H2/H3 링크 목록(현재 항목 primary + 좌측 세로선) |

- **레이아웃**: 전체 너비(풀 width). 사이드바 280px, 본문 max 768px 중앙, TOC 우측 (DocsLayout.astro). 사이드바 계층(접기 그룹) 지원됨.

---

## 2. 디자인 브리프 (Paper용)

Paper에서 새 디자인을 시작할 때 아래 브리프를 그대로 사용하거나, 톤만 조정해 사용하세요.

### 컬러 팔레트
- **Primary**: `#0070f3` (현재 barodoc.config.json 기준, 블루 포인트)
- **Neutral**: 오프화이트, 네어 블랙, 1~2개의 뮤트한 미드톤 (차분한 문서 톤)
- **Accent**: Primary 하나로 포인트; 문서 툴이라 과한 색은 자제

### 타이포그래피
- **디스플레이**: 한두 단계만 굵고 큰 사이즈로 제목 위계
- **본문/라벨**: 가독성 우선, 16px 이상 본문, 작은 텍스트는 12px 이하 지양
- **스타일**: 스위스 에디토리얼 느낌 — 디스플레이와 라벨 대비로 위계 만들기

### 간격 리듬
- **섹션**: 64px~96px
- **그룹**: 24px~32px
- **요소**: 8px~16px

### 톤
- **목표**: “정보가 잘 읽히는, 신뢰감 있는 문서 프레임워크”
- **스타일**: 미니멀, 여백 활용, 그리드에 얽매이지 않는 비대칭/스케일 대비 허용
- **금지**: 2010년대 후반 스타일의 과한 그라데이션·그림자, 지나치게 “앱 같은” 색조합

---

## 3. 제안 아트보드 (Paper)

| 순서 | 아트보드 | 크기 | 내용 |
|------|----------|------|------|
| 1 | **Landing – Hero** | 1440×900 | 로고, 한 줄 타이틀, 짧은 서브카피, CTA(Get Started / Docs), 탭 네비(선택) |
| 2 | **Landing – Features** | 1440×900 | 6개 기능 카드 (MDX, 다크모드, 검색, i18n, 성능, 커스터마이징) – 그리드 또는 비대칭 |
| 3 | **Docs Layout** | 1440×900 | 헤더(로고, 탭, GitHub, 테마, 검색) + 좌측 사이드바 + 본문 + 우측 TOC |
| 4 | **Doc Page – Component** | 1440×900 | Callout / Code block / Steps 등 컴포넌트가 들어간 본문 한 페이지 (선택) |
| 5 | **Components Gallery** | 900×fit | Callout(4종), Card/CardGroup, Tabs, Steps, Code/CodeGroup, API(Endpoint·Params·Response), Badge, Table, **Accordion**, **Expandable**, **FileTree**, **Comparison**, **Frame**, **Columns**, **Mermaid**, **Toast** |
| 6 | **Doc Page — Style** | 1440×1000 | 틸 primary(#0d9488), 헤더(중앙 검색), 사이드바(#f9fafb·티얼 강조), 본문(슬래시 브레드크럼·그린 Tip·다크 코드), TOC |
| 7 | **Mobile – Header + Nav** | 375×812 | 모바일 헤더, 햄버거, 시트/드로어 네비 |

---

## 4. Paper 워크플로우 제안

1. **아트보드 생성**: 위 표 순서대로 `create_artboard`로 1440×900(데스크톱), 375×812(모바일) 생성.
2. **한 번에 한 영역씩**: 히어로 → 기능 카드 한 줄 → 다음 줄 식으로 `write_html`을 작은 단위로 반복.
3. **2~3 수정 후 리뷰**: 스페이싱, 타이포, 대비, 정렬, 클리핑, 반복 패턴을 체크하고 `get_screenshot`으로 확인.
4. **마무리**: `finish_working_on_nodes` 호출.

---

## 5. 현재 구현 참고 (코드베이스)

- **랜딩**: `packages/theme-docs/src/pages/index.astro` — features 배열, 헤더, CTA
- **테마 primary**: `docs/barodoc.config.json` → `theme.colors.primary: "#0070f3"`
- **헤더/사이드바**: `Header.astro`, `Sidebar.astro`, `DocsLayout.astro` — 풀 너비 레이아웃, 사이드바 280px, 계층 네비(`navigation.pages`에 `{ label, pages }` 지원)
- **전역 스타일**: `packages/theme-docs/src/styles/global.css` (CSS 변수: `--bd-*`)

Paper에서 디자인한 결과는 나중에 이 구조와 `--bd-*` 변수에 맞춰 코드로 옮기면 됩니다.

---

## 6. 다음 단계

1. **Paper에서 파일 열기**  
   Cursor/Paper에서 새 문서 또는 기존 문서를 연다.
2. **이 문서를 브리프로 사용**  
   섹션 2(디자인 브리프)를 복사해 Paper 채팅에 붙여 넣고, “이 브리프로 Barodoc 랜딩 히어로부터 시작해줘”처럼 요청한다.
3. **아트보드부터 순서대로**  
   섹션 3의 아트보드 순서대로 한 화면씩 디자인하고, 섹션 4 워크플로우대로 리뷰하며 수정한다.

이 파일은 `docs/DESIGN-PLAN.md`에 있으므로, Paper와 코드베이스 양쪽에서 함께 참고할 수 있습니다.
