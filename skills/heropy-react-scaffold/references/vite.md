# Vite (CSR) React 프로젝트 설정

> 참고: https://www.heropy.dev/p/6iFzkB

## 프로젝트 생성

현재 디렉토리에 Vite 프로젝트 생성:

```bash
{pm} create vite@latest .
```

> `{pm}`은 SKILL.md의 패키지 매니저 감지 규칙에 따라 결정된 패키지 매니저로 대체한다. (npm, pnpm, yarn, bun)

대화형 선택지:
- Select a framework: **React**
- Select a variant: **TypeScript + React Compiler**
- Use rolldown-vite (Experimental)?: **No**
- Install with npm and start now? **Yes**

요구사항: Node.js 18+, NPM 8+

## Tailwind CSS 설치

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

## 경로 별칭 구성

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

## ESLint + Prettier 구성

### 패키지 설치

ESLint 관련 패키지는 Vite 프로젝트 생성 시 이미 포함되어 있음.
Prettier 관련 패키지를 추가 설치:

```bash
{pm} install -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss
```

### ESLint 설정

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

### 패키지 역할 참고

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

## TanStack Query - QueryClientProvider 래핑

`src/App.tsx`에서 래핑:

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
