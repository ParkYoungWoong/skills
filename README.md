# heropy-skills

[HEROPY](https://heropy.dev)의 스킬 모음입니다.

```bash
npx skills add ParkYoungWoong/skills  
```

**설치 예시:**

```bash
◇  Select skills to install
│  react-next-scaffold, react-vite-scaffold, ...
│
◇  Installation scope
│  Project
│
◇  Installation method
│  Symlink
│
◇  Proceed with installation?
│  Yes
```

상황에 맞게 스킬이 자동으로 감지되거나 다음과 같이 스킬을 직접 호출할 수 있습니다.

**Claude Code 스킬 호출 예시:**

```plaintext
❯ /react-next-scaffold
```

## 스킬 목록

### [react-vite-scaffold](./skills/react-vite-scaffold/SKILL.md)

Vite 기반 React(CSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

```bash
npx skills add ParkYoungWoong/skills --skill react-vite-scaffold
```

- Vite + React + TypeScript 프로젝트 스캐폴딩
- 기존 프로젝트의 누락된 설정 자동 감지 및 보완
- 기본 포함 항목:
  - Tailwind CSS
  - TanStack Query + QueryClientProvider
  - React Router (라우터 구성 + 페이지 생성)
  - Zustand (스토어 예시 생성)
  - ESLint + Prettier (통합 구성)
  - 경로 별칭 (`@/*`)
  - `.vscode/settings.json` (저장 시 자동 포매팅)

### [react-next-scaffold](./skills/react-next-scaffold/SKILL.md)

Next.js 기반 React(SSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

```bash
npx skills add ParkYoungWoong/skills --skill react-next-scaffold
```

- Next.js + React + TypeScript 프로젝트 스캐폴딩
- 기존 프로젝트의 누락된 설정 자동 감지 및 보완
- 기본 포함 항목:
  - Tailwind CSS
  - TanStack Query + QueryProvider (Next.js 스트리밍 지원)
  - ESLint + Prettier (통합 구성)
  - 경로 별칭 (`@/*`)
  - `.vscode/settings.json` (저장 시 자동 포매팅)

### [skill-commit](./skills/skill-commit/SKILL.md)

커밋할 때 변경사항을 분석하여 적절한 커밋 메시지를 작성하고, 수정된 스킬의 버전을 자동으로 업데이트합니다.

```bash
npx skills add ParkYoungWoong/skills --skill skill-commit
```

- 변경사항 분석 후 한국어 커밋 메시지 자동 생성
- SKILL.md 수정 시 Semantic Versioning 기반 버전 자동 업데이트
- 스킬 추가/수정/삭제 시 README.md 스킬 목록 자동 갱신

### [lighthouse](./skills/lighthouse/SKILL.md)

Google Lighthouse를 로컬에서 실행하여 웹 페이지의 성능, 접근성, SEO 등을 분석하고 개선점을 제안합니다.

```bash
npx skills add ParkYoungWoong/skills --skill lighthouse
```

- LHCI CLI 자동 실행 (`@lhci/cli`, 헤드리스 Chrome)
- 4개 카테고리 종합 분석 (Performance, Accessibility, Best Practices, SEO)
- 카테고리별 구체적 개선점 제안
- 프로젝트 프레임워크 자동 감지 (Next.js, Vite, Nuxt, Angular 등)
- 사용자 확인 후 코드 수정 지원