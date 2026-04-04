---
name: react-scaffold
description: Use when initializing a new React project or when an existing React project needs missing configuration (ESLint, Prettier, TanStack Query, Tailwind CSS, VSCode, Cursor, Antigravity settings, path aliases). Supports Vite (CSR) and Next.js (SSR).
license: MIT
metadata:
  author: ParkYoungWoong
  version: 1.1.4
---

# React Project Scaffold

React 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완하는 스킬.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

다음 파일들을 확인하여 현재 프로젝트 상태를 판별한다:

| 확인 대상 | 감지 방법 |
|-----------|-----------|
| 빈 디렉토리 여부 | 현재 디렉토리에 파일이 없거나 `package.json`이 없음 |
| Vite 프로젝트 | `vite.config.ts` 또는 `vite.config.js` 존재 |
| Next.js 프로젝트 | `next.config.ts` 또는 `next.config.js` 또는 `next.config.mjs` 존재 |
| TypeScript | `tsconfig.json` 또는 `tsconfig.app.json` 존재 |
| TanStack Query | `package.json`의 dependencies에 `@tanstack/react-query` 존재 |
| Tailwind CSS | `package.json`의 dependencies/devDependencies에 `tailwindcss` 존재 |
| ESLint 구성 | `eslint.config.js` 또는 `eslint.config.mjs` 존재 |
| Prettier 구성 | `.prettierrc` 존재 |
| VSCode 설정 | `.vscode/settings.json` 존재 |
| 패키지 매니저 | `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb`/`bun.lock` → bun, `package-lock.json` 또는 없음 → npm |

### 2단계: 분기 처리

**빈 디렉토리인 경우 (스캐폴딩 모드):**

1. 사용자에게 프로젝트 타입 질문: **Vite(CSR)** vs **Next.js(SSR)**
2. 해당 reference 파일을 읽고 프로젝트 생성 명령 실행
3. 아래 공통 설정 전부 자동 적용

**기존 프로젝트인 경우 (보완 모드):**

1. 위 감지 기준으로 프레임워크와 설치 상태 자동 판별
2. 누락된 설정만 식별하여 자동 생성
3. 이미 존재하는 설정 파일은 건드리지 않음

### 3단계: 프레임워크별 설정 적용

- **Vite 프로젝트**: `references/vite.md` 파일을 읽고 지침을 따른다
- **Next.js 프로젝트**: `references/nextjs.md` 파일을 읽고 지침을 따른다

### 4단계: 공통 설정 적용

프레임워크에 관계없이 다음 설정이 누락되었으면 자동 생성한다.

#### .prettierrc

`.prettierrc` 파일이 없으면 프로젝트 루트에 생성:

```json
{
  "semi": false,
  "singleQuote": true,
  "singleAttributePerLine": true,
  "bracketSameLine": true,
  "endOfLine": "lf",
  "trailingComma": "none",
  "arrowParens": "avoid",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### .vscode/settings.json

`.vscode/settings.json` 파일이 없으면 생성:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

#### TanStack Query

`@tanstack/react-query`가 `package.json`에 없으면:

1. 패키지 설치 (`{pm}`은 감지된 패키지 매니저로 대체):
   ```bash
   {pm} install @tanstack/react-query
   {pm} install -D @tanstack/eslint-plugin-query
   ```

2. ESLint Flat Config(`eslint.config.js`)에 TanStack Query 플러그인 추가:
   ```js
   import tanstackQuery from '@tanstack/eslint-plugin-query'

   // extends 배열에 추가:
   tanstackQuery.configs.recommended
   ```

3. QueryClientProvider 래핑:

   **Vite 프로젝트** - `src/App.tsx`에서 래핑:
   ```tsx
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

   const queryClient = new QueryClient()

   export default function App() {
     return (
       <QueryClientProvider client={queryClient}>
         {/* 기존 컴포넌트 */}
       </QueryClientProvider>
     )
   }
   ```

   **Next.js 프로젝트** - `@tanstack/react-query-next-experimental` 추가 설치 후 `src/providers/query.tsx`와 `layout.tsx` 구성. 상세 코드는 `references/nextjs.md`의 "TanStack Query 구성" 섹션을 참조.

## 주의사항

- 이미 존재하는 설정 파일은 덮어쓰지 않는다
- 스캐폴딩 모드에서만 사용자에게 프로젝트 타입을 질문한다
- 기존 프로젝트 보완 모드에서는 질문 없이 자동으로 진행한다
- 패키지 매니저는 기존 프로젝트의 lock 파일로 판별한다:
  - `pnpm-lock.yaml` → `pnpm`
  - `yarn.lock` → `yarn`
  - `bun.lockb` 또는 `bun.lock` → `bun`
  - `package-lock.json` 또는 lock 파일 없음 → `npm`
- 빈 디렉토리(스캐폴딩 모드)에서는 `npm`을 사용한다
