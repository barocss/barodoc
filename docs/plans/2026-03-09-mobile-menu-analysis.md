# 모바일 메뉴만 안 나오는 이유 — 분석

## 결론

**다른 컴포넌트는 “보이거나” 단일 아일랜드로 동작하는데, 모바일 메뉴만 안 되는 이유는 두 가지가 겹치기 때문입니다.**

1. **모바일 메뉴만 “두 개의 아일랜드”가 같이 동작해야 함**  
   - DocHeader(버튼 클릭 → 이벤트 발송) + MobileNavSheet(이벤트 수신 → 시트 열기)  
   - 둘 중 하나라도 하이드레이션 실패하면 “메뉴가 안 열림”으로 보임.

2. **MobileNavSheet 아일랜드는 SSR HTML이 비어 있음**  
   - 빌드 결과에서 DocHeader/SidebarWrapper는 island 안에 **풀 SSR HTML**이 들어 있음.  
   - MobileNavSheet는 `open=false` 상태라 시트 내용이 없어서 **island 내부가 비어 있음** (`<astro-island ...></astro-island>`).  
   - 그래서 이 아일랜드는 **완전히 클라이언트 로드에만 의존**함. 스크립트가 실패하면 아무 것도 안 나옴.

## 비교

| 구분 | DocHeader | SidebarWrapper | SearchDialog | **MobileNavSheet** |
|------|-----------|----------------|--------------|--------------------|
| 사용처 | Header.astro | Sidebar.astro | BaseLayout.astro | Header.astro |
| SSR 내용 | ✅ 전체 헤더 HTML | ✅ 전체 사이드바 네비 | (다이얼로그라 보통 비어 있음) | ❌ **비어 있음** (시트가 닫혀 있어서) |
| 동작에 필요한 아일랜드 | 1개 (자기 자신) | 1개 | 1개 | **2개** (DocHeader + 자신) |
| 스크립트 실패 시 | 헤더는 보이지만 클릭 불가 | 사이드바는 보이지만 접기 등 불가 | 검색 열기 불가 | **메뉴 버튼 눌러도 아무 반응 없음** |

## 왜 “이것만” 그렇게 보이냐

- **헤더/사이드바**: SSR로 이미 HTML이 찍혀 있어서 **화면에는 잘 나옴**.  
  dev에서 아일랜드 스크립트가 실패해도 “디자인은 되는데, 메뉴만 안 열린다”처럼 느껴질 수 있음.
- **모바일 메뉴**:  
  - 열리는 동작은 **DocHeader(클릭) → MobileNavSheet(리스너)** 연동에 전부 의존하고,  
  - MobileNavSheet 쪽은 SSR이 비어 있어서 **스크립트만 믿고 가는 유일한 UI**에 가깝다.  
  → 그래서 dev에서 `@fs` 로드 실패가 나면 “다른 건 되는데, 메뉴만 안 된다”로 보이는 것.

## 기술적 원인 (dev)

- Astro가 theme-docs의 React 아일랜드를 **소스 경로**로 동적 import함 (`@fs/.../packages/theme-docs/src/...`).
- docs 앱의 Vite dev 서버 기본 설정만으로는 이 경로를 허용하지 않아, **모든 theme-docs 아일랜드**가 “Failed to fetch dynamically imported module”로 실패할 수 있음.
- 그중에서 **사용자가 실제로 “눌러보는” 게 메뉴 버튼**이고, 그 동작만 **두 아일랜드 + 빈 SSR**에 의존하니까 **“이것만 안 된다”**로 인식되는 것.

---

## 왜 풀 커스텀 모드(docs)에서 server.fs.allow 가 필요할까?

**요약: “풀 커스텀 모드” 때문이 아니라, docs가 같은 모노레포의 theme-docs를 `workspace:*` 로 쓸 때 생기는 부작용이다.**

1. **docs는 `@barodoc/theme-docs`를 workspace로 씀**  
   - `docs/package.json`: `"@barodoc/theme-docs": "workspace:*"`  
   - pnpm이 `docs/node_modules/@barodoc/theme-docs` → `../../packages/theme-docs` **심볼릭 링크**로 둠.

2. **아일랜드 청크 URL이 “실제 경로”로 잡힘**  
   - Astro/Vite가 아일랜드용 동적 import를 만들 때, 모듈 해석 결과가 **심볼릭 링크를 따라간 실제 경로**가 됨.  
   - 그래서 브라우저가 요청하는 URL이  
     `/@fs/.../barocss/barodoc/packages/theme-docs/src/components/...`  
     처럼 **docs/ 밖**인 `packages/theme-docs/` 를 가리킴.

3. **Vite 기본값은 “프로젝트 루트 밖” 서빙 금지**  
   - Vite dev 서버는 보안상 `server.fs.allow` 기본값이 **프로젝트 루트(docs/)** 만 허용.  
   - 위 URL은 `packages/theme-docs/` 이므로 **docs/ 밖**이라 기본 설정으로는 **요청을 막음** → “Failed to fetch dynamically imported module”.

4. **일반 npm 패키지면 안 생기는 일**  
   - `workspace:*` 가 아니라 npm에 올라간 패키지를 쓰면,  
     `node_modules/@barodoc/theme-docs` 가 **실제 디렉터리**이고 그 경로가 **docs/ 안**에 있음.  
   - 그럼 아일랜드 URL도 `docs/node_modules/...` 로 잡혀서 **fs.allow 없이** 서빙됨.  
   - 즉, **같은 풀 커스텀 모드라도 “모노레포 workspace 링크”일 때만** 이 문제가 생김.

**정리**: 풀 커스텀 모드 자체가 fs.allow를 요구하는 게 아니라, **모노레포에서 theme-docs를 workspace로 써서 심볼릭 링크가 있고, 그 실제 경로가 프로젝트 루트 밖이라서** Vite dev에서만 이슈가 생긴다. (`/@fs/` 는 **dev 전용** 개념이라, 빌드 결과물에는 없음.)

## dev에서 메뉴가 안 열리는 이유 (2026-03-09 검증)

- **원인**: Astro dev 서버가 모든 HTTP 요청을 먼저 처리하고 `next()`를 호출하지 않아, `/@fs/...` 요청이 Vite 쪽으로 가지 못하고 404로 끝남. `server.fs.allow`를 넣어도 요청이 Vite에 도달하지 않으므로 효과 없음.
- **결론**: 로컬만 `/@fs/` 개념을 쓰는 구조가 애매하므로, **로컬에서 동작 확인할 때는 dev 대신 build + preview를 쓰는 쪽을 권장**한다.

---

## 로컬 테스트: build + preview 권장

**권장 워크플로**: 모노레포 docs에서 “실제로 나가는 결과물”을 보고 싶을 때는 **빌드 후 프리뷰**로 확인.

```bash
pnpm build:packages && pnpm build && pnpm preview
```

- `http://localhost:4321/docs/introduction` 등에서 모바일 뷰로 햄버거 메뉴가 열리면 정상.
- 빌드 결과는 `/_astro/*.js` 번들로 로드되므로 `/@fs/` 와 무관하게 동작함.

**dev (`pnpm dev`)**:  
- 콘텐츠/레이아웃 수정 시 화면 확인용으로 쓰면 되고, **모바일 메뉴(햄버거) 동작만** workspace 구조 때문에 dev에서 실패할 수 있음.  
- 그 외 헤더·사이드바·검색 등은 SSR HTML이 있어서 dev에서도 보임.

---

## (참고) 장기 대안 — dev에서도 메뉴 열리게 하려면

- theme-docs에서 클라이언트 청크를 빌드해 export하고, 테마가 그 경로를 참조하도록 하면 dev에서도 `@fs` 없이 동작 가능.
- 또는 Astro 쪽에서 dev 시 `/@fs/` 요청을 next()로 넘기도록 수정되면, `server.fs.allow`만으로도 dev에서 동작할 수 있음.  
- 당장은 **로컬 테스트 = build + preview**로 두고, 필요할 때 위 방향을 검토하면 됨.

---

## 요약

| 목적 | 방법 |
|------|------|
| **로컬에서 전체 동작(메뉴 포함) 확인** | `pnpm build:packages && pnpm build && pnpm preview` |
| **빠른 콘텐츠/레이아웃 확인** | `pnpm dev` (모바일 메뉴만 dev에서 안 열릴 수 있음) |
| **배포 결과물** | 빌드 산출물 기준이므로 preview와 동일하게 동작 |
