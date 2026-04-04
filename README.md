# heropy-skills

HEROPY의 스킬 모음입니다.

## react-vite-scaffold

Vite 기반 React(CSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

```bash
npx skills add ParkYoungWoong/heropy-skills --skill react-vite-scaffold
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

## react-next-scaffold

Next.js 기반 React(SSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

```bash
npx skills add ParkYoungWoong/heropy-skills --skill react-next-scaffold
```

- Next.js + React + TypeScript 프로젝트 스캐폴딩
- 기존 프로젝트의 누락된 설정 자동 감지 및 보완
- 기본 포함 항목:
  - Tailwind CSS
  - TanStack Query + QueryProvider (Next.js 스트리밍 지원)
  - ESLint + Prettier (통합 구성)
  - 경로 별칭 (`@/*`)
  - `.vscode/settings.json` (저장 시 자동 포매팅)
