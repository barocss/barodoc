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

### 패키지 버전 관리

Changesets를 사용합니다:

```bash
# 변경사항 기록
pnpm changeset

# 버전 업데이트 (CI에서 자동 실행)
pnpm version

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

## 문서 작성

- 한국어와 영어 문서 모두 작성
- 코드 예시 포함
- 실제 동작하는 예시 제공

## 질문

질문이 있으면 [Issues](https://github.com/barocss/barodoc/issues)에 질문 태그로 등록해주세요.

## 라이선스

기여하신 코드는 [MIT 라이선스](LICENSE)로 배포됩니다.
