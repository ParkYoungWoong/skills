# heropy-skills

HEROPY의 Claude Code 스킬 모음입니다.

## 설치

```bash
npx skills add ParkYoungWoong/heropy-skills --skill <스킬_이름>
```

## 스킬 목록

### react-scaffold

React 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

- **Vite (CSR)** 또는 **Next.js (SSR)** 프로젝트 스캐폴딩
- 기존 프로젝트의 누락된 설정 자동 감지 및 보완
- 기본 포함 항목:
  - TypeScript
  - Tailwind CSS
  - TanStack Query + QueryClientProvider
  - ESLint + Prettier (통합 구성)
  - 경로 별칭 (`@/*`)
  - `.vscode/settings.json` (저장 시 자동 포매팅)
