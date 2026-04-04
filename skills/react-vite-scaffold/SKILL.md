---
name: react-vite-scaffold
description: Use when initializing a new Vite + React (CSR) project or when an existing Vite React project needs missing configuration (ESLint, Prettier, TanStack Query, React Router, Zustand, Tailwind CSS, VSCode, Cursor, Antigravity settings, path aliases).
license: MIT
metadata:
  author: ParkYoungWoong
  version: 1.0.0
---

# Vite React Project Scaffold

> 참고: https://www.heropy.dev/p/6iFzkB

Vite 기반 React(CSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완하는 스킬.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

다음 파일들을 확인하여 현재 프로젝트 상태를 판별한다:

| 확인 대상 | 감지 방법 |
|-----------|-----------|
| 빈 디렉토리 여부 | 현재 디렉토리에 파일이 없거나 `package.json`이 없음 |
| Vite 프로젝트 | `vite.config.ts` 또는 `vite.config.js` 존재 |
| TypeScript | `tsconfig.json` 또는 `tsconfig.app.json` 존재 |
| TanStack Query | `package.json`의 dependencies에 `@tanstack/react-query` 존재 |
| React Router | `package.json`의 dependencies에 `react-router` 존재 |
| Zustand | `package.json`의 dependencies에 `zustand` 존재 |
| Tailwind CSS | `package.json`의 dependencies/devDependencies에 `tailwindcss` 존재 |
| ESLint 구성 | `eslint.config.js` 또는 `eslint.config.mjs` 존재 |
| Prettier 구성 | `.prettierrc` 존재 |
| VSCode 설정 | `.vscode/settings.json` 존재 |
| 패키지 매니저 | `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb`/`bun.lock` → bun, `package-lock.json` 또는 없음 → npm |

### 2단계: 분기 처리

**빈 디렉토리인 경우 (스캐폴딩 모드):**

1. 프로젝트 생성 명령 실행
2. 아래 설정 전부 자동 적용

**기존 Vite 프로젝트인 경우 (보완 모드):**

1. 위 감지 기준으로 설치 상태 자동 판별
2. 누락된 설정만 식별하여 자동 생성
3. 이미 존재하는 설정 파일은 건드리지 않음

### 3단계: 프로젝트 생성

현재 디렉토리에 Vite 프로젝트 생성:

```bash
{pm} create vite@latest .
```

> `{pm}`은 패키지 매니저 감지 규칙에 따라 결정된 패키지 매니저로 대체한다. (npm, pnpm, yarn, bun)

대화형 선택지:
- Select a framework: **React**
- Select a variant: **TypeScript + React Compiler**
- Use rolldown-vite (Experimental)?: **No**
- Install with npm and start now? **Yes**

요구사항: Node.js 18+, NPM 8+

### 4단계: Tailwind CSS 설치

```bash
{pm} install -D tailwindcss @tailwindcss/vite
```

`vite.config.ts`에 Tailwind 플러그인 추가:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  }
})
```

`src/index.css` 파일 상단에 추가:

```css
@import 'tailwindcss';
```

### 5단계: 경로 별칭 구성

`vite.config.ts`의 `resolve.alias` 설정 (위 코드에 포함됨):

```ts
resolve: {
  alias: [
    { find: '@', replacement: '/src' }
  ]
}
```

`tsconfig.app.json`에 경로 별칭 추가:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 6단계: ESLint + Prettier 구성

ESLint 관련 패키지는 Vite 프로젝트 생성 시 이미 포함되어 있음.
Prettier 관련 패키지를 추가 설치:

```bash
{pm} install -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss
```

`eslint.config.js`에 Prettier 통합 추가:

```js
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  {
    extends: [
      prettierRecommended
    ]
  }
])
```

TanStack Query가 포함된 경우, 같은 `extends` 배열에 추가:

```js
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import tanstackQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  {
    extends: [
      prettierRecommended,
      tanstackQuery.configs.recommended
    ]
  }
])
```

#### 패키지 역할 참고

| 패키지 | 설명 |
|--------|------|
| `eslint` | ESLint 코어 패키지 (Vite에 포함) |
| `prettier` | Prettier 코어 패키지 |
| `eslint-plugin-react` | React 문법 분석 및 검사 (Vite에 포함) |
| `eslint-config-prettier` | ESLint와 Prettier의 충돌 방지 |
| `eslint-plugin-prettier` | Prettier 규칙을 ESLint 규칙으로 통합 |
| `eslint-plugin-react-hooks` | React Hooks 규칙 강제 (Vite에 포함) |
| `eslint-plugin-react-refresh` | React Refresh 규칙 (Vite에 포함) |
| `prettier-plugin-tailwindcss` | Tailwind CSS 클래스 자동 정렬 |
| `@tanstack/eslint-plugin-query` | TanStack Query 규칙 (TanStack Query 사용 시) |

### 7단계: .prettierrc

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

### 8단계: .vscode/settings.json

`.vscode/settings.json` 파일이 없으면 생성:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 9단계: TanStack Query

`@tanstack/react-query`가 `package.json`에 없으면:

1. 패키지 설치:
   ```bash
   {pm} install @tanstack/react-query
   {pm} install -D @tanstack/eslint-plugin-query
   ```

2. ESLint Flat Config(`eslint.config.js`)에 TanStack Query 플러그인 추가 (6단계 참조)

3. `src/App.tsx`에서 QueryClientProvider 래핑:
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

### 10단계: React Router

> 참고: https://www.heropy.dev/p/9tesDt

`react-router`가 `package.json`에 없으면:

1. 패키지 설치:
   ```bash
   {pm} install react-router
   ```

2. `src/routes/index.tsx` 생성:
   ```tsx
   import { createBrowserRouter, RouterProvider } from 'react-router'
   import Home from './pages/Home'
   import About from './pages/About'

   const router = createBrowserRouter([
     {
       path: '/',
       element: <Home />
     },
     {
       path: '/about',
       element: <About />
     }
   ])

   export default function Router() {
     return <RouterProvider router={router} />
   }
   ```

3. `src/routes/pages/Home.tsx` 생성:
   ```tsx
   export default function Home() {
     return <h1>Home</h1>
   }
   ```

4. `src/routes/pages/About.tsx` 생성:
   ```tsx
   export default function About() {
     return <h1>About</h1>
   }
   ```

5. `src/main.tsx`에서 `Router`를 사용하도록 수정:
   ```tsx
   import { createRoot } from 'react-dom/client'
   import Router from './routes'

   createRoot(document.getElementById('root')!).render(<Router />)
   ```

### 11단계: Zustand

> 참고: https://www.heropy.dev/p/n74Tgc

`zustand`가 `package.json`에 없으면:

1. 패키지 설치:
   ```bash
   {pm} install zustand
   ```

2. `src/store/example.ts` 생성:
   ```ts
   import { create } from 'zustand'

   interface ExampleStore {
     count: number
     increase: () => void
     decrease: () => void
   }

   export const useExampleStore = create<ExampleStore>(set => ({
     count: 0,
     increase: () => set(state => ({ count: state.count + 1 })),
     decrease: () => set(state => ({ count: state.count - 1 }))
   }))
   ```

## 주의사항

- 이미 존재하는 설정 파일은 덮어쓰지 않는다
- 기존 프로젝트 보완 모드에서는 질문 없이 자동으로 진행한다
- 패키지 매니저는 기존 프로젝트의 lock 파일로 판별한다:
  - `pnpm-lock.yaml` → `pnpm`
  - `yarn.lock` → `yarn`
  - `bun.lockb` 또는 `bun.lock` → `bun`
  - `package-lock.json` 또는 lock 파일 없음 → `npm`
- 빈 디렉토리(스캐폴딩 모드)에서는 `npm`을 사용한다
