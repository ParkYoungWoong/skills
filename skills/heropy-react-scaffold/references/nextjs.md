# Next.js (SSR) React 프로젝트 설정

> 참고: https://www.heropy.dev/p/n7JHmI

## 프로젝트 생성

현재 디렉토리에 Next.js 프로젝트 생성:

```bash
{pmx} create-next-app@latest .
```

> `{pm}`은 SKILL.md의 패키지 매니저 감지 규칙에 따라 결정된 패키지 매니저로 대체한다. (npm, pnpm, yarn, bun)
> `{pmx}`는 해당 패키지 매니저의 실행 명령어로 대체한다. (npx, pnpm dlx, yarn dlx, bunx)

대화형 선택지 (v16 기준):
- Would you like to use the recommended Next.js defaults?: **No, customize settings**
- Would you like to use TypeScript?: **Yes**
- Which linter would you like to use?: **ESLint**
- Would you like to use React Compiler?: **Yes**
- Would you like to use Tailwind CSS?: **Yes**
- Would you like your code inside a `src/` directory?: **Yes**
- Would you like to use App Router? (recommended): **Yes**
- Would you like to customize the import alias (`@/*` by default)?: **No**

## 경로 별칭

`@/*` 경로 별칭은 `create-next-app`에서 기본 설정된다. 별도 구성 불필요.

## ESLint + Prettier 구성

### 패키지 설치

```bash
{pm} install -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss
```

### ESLint 설정

`eslint.config.js` (또는 `eslint.config.mjs`)에 Prettier 통합 추가:

```js
import prettierRecommended from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  {
    extends: [prettierRecommended]
  }
])

export default eslintConfig
```

TanStack Query가 포함된 경우, 같은 `extends` 배열에 추가:

```js
import prettierRecommended from 'eslint-config-prettier'
import tanstackQuery from '@tanstack/eslint-plugin-query'

const eslintConfig = defineConfig([
  {
    extends: [
      prettierRecommended,
      tanstackQuery.configs.recommended
    ]
  }
])

export default eslintConfig
```

### 패키지 역할 참고

| 패키지 | 설명 |
|--------|------|
| `prettier` | Prettier 코어 패키지 |
| `eslint-config-prettier` | ESLint와 Prettier의 충돌 방지 |
| `eslint-plugin-prettier` | Prettier 규칙을 ESLint 규칙으로 통합 |
| `prettier-plugin-tailwindcss` | Tailwind CSS 클래스 자동 정렬 |
| `@tanstack/eslint-plugin-query` | TanStack Query 규칙 (TanStack Query 사용 시) |

## TanStack Query 구성

> 참고: https://www.heropy.dev/p/HZaKIE#h2_with_Nextjs

Next.js에서는 `@tanstack/react-query-next-experimental` 패키지를 추가로 설치해야 한다.

### 패키지 설치

```bash
{pm} install @tanstack/react-query @tanstack/react-query-next-experimental
{pm} install -D @tanstack/eslint-plugin-query
```

### 1. QueryProvider 생성

`src/providers/query.tsx`:

```tsx
'use client'
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 클라이언트의 즉시 다시 요청에 대응하도록, 기본 캐싱 시간(min)을 지정
        staleTime: 60 * 1000
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  )
}
```

### 2. layout.tsx에서 래핑

`src/app/layout.tsx`에서 `QueryProvider`로 `children`을 래핑:

```tsx
import { QueryProvider } from '@/providers/query'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
```
