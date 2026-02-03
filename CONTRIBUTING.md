# Contributing to Barodoc

Barodoc에 기여해 주셔서 감사합니다! 이 문서는 기여 방법을 안내합니다.

## 개발 환경 설정

### 요구 사항

- Node.js 20+
- pnpm 9+

### 설치

```bash
git clone https://github.com/barocss/barodoc.git
cd barodoc
pnpm install
```

### 개발 서버 실행

```bash
# CLI 개발 (빌드 없이 TypeScript 직접 실행)
pnpm barodoc serve docs

# docs 사이트 개발
pnpm dev

# 패키지 빌드
pnpm build:packages
```

## 프로젝트 구조

```
barodoc/
├── packages/
│   ├── barodoc/          # CLI
│   ├── core/             # @barodoc/core
│   ├── theme-docs/       # @barodoc/theme-docs
│   ├── plugin-*/         # 플러그인들
│   └── create-barodoc/   # 프로젝트 생성 도구
├── docs/                 # 문서 사이트
└── .cursor/skills/       # AI 어시스턴트용 스킬 문서
```

## 기여 방법

### 버그 리포트

1. [Issues](https://github.com/barocss/barodoc/issues)에서 기존 이슈 확인
2. 새 이슈 생성 시 다음 정보 포함:
   - 재현 단계
   - 예상 동작
   - 실제 동작
   - 환경 정보 (OS, Node.js 버전)

### 기능 제안

1. Issue를 생성하여 기능 제안
2. 구현 방향에 대해 논의
3. 승인 후 Pull Request 생성

### Pull Request

1. Fork 후 feature 브랜치 생성

```bash
git checkout -b feature/my-feature
```

2. 변경사항 커밋

```bash
git commit -m "feat: add new feature"
```

3. 푸시 및 PR 생성

```bash
git push origin feature/my-feature
```

### 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다:

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 포맷팅
- `refactor:` 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드/설정 변경

### npm 배포 (유지보수자)

CI에서 `main` 브랜치 푸시 시 changesets가 버전 PR을 만들거나 npm에 배포합니다. 배포가 실패하는 경우 아래를 확인하세요.

1. **GitHub 시크릿**  
   저장소 설정 → Secrets and variables → Actions에 `NPM_BARODOC_TOKEN`이 있어야 합니다.

2. **npm 토큰**  
   - [npm 액세스 토큰](https://www.npmjs.com/settings/~/tokens)에서 **Automation** 또는 **Publish** 권한이 있는 토큰을 생성합니다.  
   - 토큰이 만료되었거나 폐기된 경우 "Access token expired or revoked"가 나옵니다. 새 토큰을 만들고 GitHub 시크릿을 갱신하세요.

3. **npm 스코프 `@barodoc`**  
   - 스코프 패키지(`@barodoc/core`, `@barodoc/theme-docs` 등)를 배포하려면 [npm 조직 생성](https://www.npmjs.com/org/create)에서 **barodoc** 조직을 만든 뒤, 배포에 사용하는 npm 계정을 해당 조직 멤버로 추가하고 퍼블리시 권한을 부여해야 합니다.  
   - 조직이 없거나 권한이 없으면 `E404 Not Found - PUT https://registry.npmjs.org/@barodoc%2f...`가 발생할 수 있습니다.

4. **비스코프 패키지 (`barodoc`, `create-barodoc`)**  
   - 해당 이름이 이미 다른 사용자에게 사용 중이면 배포할 수 없습니다. 조직 스코프(`@barodoc/barodoc` 등)로 배포하거나, npm에서 해당 이름 소유 여부를 확인하세요.

### 패키지 버전 관리

Changesets를 사용합니다:

```bash
# 변경사항 기록
pnpm changeset

# 버전 업데이트 (CI에서 자동 실행)
pnpm changeset version

# 배포 (CI에서 자동 실행)
pnpm release
```

## 코드 스타일

- TypeScript strict 모드 사용
- Prettier로 포맷팅
- 명확한 변수/함수 이름 사용

## 테스트

```bash
# 패키지 빌드 테스트
pnpm build:packages

# CLI 테스트
pnpm barodoc --help
```

### create-barodoc 동작 확인

`create-barodoc`으로 만든 프로젝트가 CLI(`barodoc serve` / `build`)에서 정상 동작하는지 확인할 때:

1. **저장소 루트에서** (패키지 빌드 후):

   ```bash
   pnpm build:packages
   pnpm create barodoc test-docs
   cd test-docs
   npx barodoc serve
   ```

2. **기대하는 구조** (create-barodoc 출력):
   - `docs/en/introduction.md`, `docs/en/quickstart.md`
   - `public/logo.svg`
   - `barodoc.config.json` (name, logo, navigation, i18n.defaultLocale/locales, topbar)
   - `.gitignore`
   - `src/`, `package.json`, `astro.config.mjs`는 **없음** (제로 설정 모드)

3. **이 저장소의 docs/와의 차이**  
   이 리포지터리의 **docs/** 디렉터리는 **풀 커스텀(Astro) 모드**입니다. `docs/` 안에 `src/content/docs/`, `astro.config.mjs`, `package.json`이 있고 `pnpm dev`로 실행합니다.  
   **create-barodoc**으로 만든 프로젝트는 위 구조처럼 `docs/en/` + `public/` + `barodoc.config.json`만 있고, `npx barodoc serve`로 실행합니다. 두 방식의 콘텐츠 규칙(슬러그, frontmatter)은 동일합니다.

## 문서 작성

- 한국어와 영어 문서 모두 작성
- 코드 예시 포함
- 실제 동작하는 예시 제공

## 질문

질문이 있으면 [Issues](https://github.com/barocss/barodoc/issues)에 질문 태그로 등록해주세요.

## 라이선스

기여하신 코드는 [MIT 라이선스](LICENSE)로 배포됩니다.
