---
name: react-vite-to-next-migration
description: (heropy) Use when migrating an existing Vite + React (TypeScript) project to Next.js (App Router, v16), including projects that use React Router, TanStack Query, Zustand, or Tailwind CSS. 사용자가 "Next.js로 전환", "Vite에서 Next로 마이그레이션", "App Router로 옮기기"를 언급할 때도 이 스킬을 따른다.
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.2.0
---

# Vite React에서 Next.js App Router로 마이그레이션

Vite + React(TS) 프로젝트를 Next.js(App Router, v16) 프로젝트로 변환하는 스킬.
기존 코드의 동작을 유지하면서 Next.js 구조로 옮기는 것이 목표.

## 필수 실행 체크리스트 (MANDATORY)

**스킬 시작 즉시, 아래 항목을 TodoWrite에 1:1로 등록한 뒤 순서대로 진행한다. 건너뛰기 금지.**

1. 프로젝트 상태 감지 (1단계)
2. 의존성 교체 및 스크립트 변경 (2~3단계)
3. 설정 파일 교체 (4단계)
4. 진입점 변환 (5단계)
5. 라우팅 변환 [React Router 사용 시] (6단계)
6. 환경 변수 변환 [`VITE_*` 존재 시] (7단계)
7. 경로 별칭 및 정적 자산 (8~9단계)
8. 스타일링 설정 [Tailwind 사용 시] (10단계)
9. TanStack Query / Zustand 처리 [해당 패키지 존재 시] (11단계)
10. **정리 및 최종 검증** (12단계)

각 항목은 조건 미충족 시 "skipped"로 완료 처리하되, **조건 판단 근거(파일/패키지 존재 여부)를 명시**한 뒤 넘어간다.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

다음 파일들을 확인하여 마이그레이션 가능 여부와 옮길 대상을 판별한다:

| 확인 대상 | 감지 방법 |
|-----------|-----------|
| Vite 프로젝트 | `vite.config.ts` 또는 `vite.config.js` 존재 |
| TypeScript | `tsconfig.json` 또는 `tsconfig.app.json` 존재 |
| React Compiler | `package.json`의 devDependencies에 `babel-plugin-react-compiler` 존재 |
| React Router | `package.json`의 dependencies에 `react-router` 또는 `react-router-dom` 존재 |
| React Router 산출물 | `react-router-use` 스킬이 만드는 구조: `src/routes/index.tsx`, `src/routes/dynamic.tsx`, `src/routes/layouts/DefaultLayout.tsx`, `src/routes/pages/*.tsx`, `src/routes/loaders/requiresAuth.ts`, `src/components/TheHeader.tsx`(+ `.module.css`), `src/main.tsx`의 `<Router />` |
| 라우터 부속 패키지 | `package.json`에 `react-error-boundary`, `motion` 존재 (react-router-use의 지연 로딩, 애니메이션이 설치) |
| TanStack Query | `package.json`의 dependencies에 `@tanstack/react-query` 존재. `src/queries/client.ts`, `src/queries/*.ts` 존재 |
| Zustand | `package.json`의 dependencies에 `zustand` 존재 |
| Tailwind CSS | `package.json`의 dependencies/devDependencies에 `tailwindcss` 존재 |
| 환경 변수 | `.env*` 파일에 `VITE_` 접두사 변수 존재 |
| 정적 자산 | `public/` 디렉토리 존재 |
| 진입점 | `index.html`, `src/main.tsx` 존재 (`src/App.tsx`는 라우터 도입 프로젝트에는 없을 수 있음) |
| 패키지 매니저 | `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm` |

`vite.config.*`이 없다면 마이그레이션 대상이 아니므로 사용자에게 알리고 중단한다.

### 2단계: 마이그레이션 개요 안내

작업 시작 전 다음을 사용자에게 안내한다:

- App Router(`src/app`) 구조로 변환됨
- React Router 라우트는 App Router의 디렉토리 기반 라우트로 변환됨
- `VITE_` 환경 변수는 `NEXT_PUBLIC_` 접두사로 변경됨
- 브라우저 API/이벤트 훅을 사용하는 컴포넌트는 `'use client'`가 추가됨
- Vite 전용 파일(`index.html`, `vite.config.*`, `src/main.tsx`, `src/vite-env.d.ts`, `dist/`)은 제거됨
- 기존 컴포넌트/스타일/유틸 코드는 최대한 그대로 보존됨

### 3단계: 의존성 변경

Vite 관련 패키지 제거, Next.js 패키지 추가:

```bash
{pm} remove vite @vitejs/plugin-react @vitejs/plugin-react-swc vite-tsconfig-paths @tailwindcss/vite @rolldown/plugin-babel @babel/core @types/babel__core eslint-plugin-react-refresh react-router react-router-dom react-error-boundary motion
{pm} add next@latest react@latest react-dom@latest
{pm} add -D @types/node
```

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm`.
> `{pmx}`는 해당 패키지 매니저의 실행 명령으로 대체한다. `npm` -> `npx`, `pnpm` -> `pnpm dlx`, `yarn` -> `yarn dlx`, `bun` -> `bunx`.

- 존재하지 않는 패키지는 `remove` 대상에서 제외한다.
- `react-error-boundary`와 `motion`은 `src/routes/dynamic.tsx`와 페이지 전환 애니메이션 외의 코드에서 쓰이지 않을 때만 제거한다.
- `babel-plugin-react-compiler`는 제거하지 않는다. 4단계의 `reactCompiler: true`가 이 패키지를 사용한다.

`package.json`의 `scripts`를 Next.js 기준으로 교체:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  }
}
```

> `next lint`는 Next.js 15.5에서 폐기되고 16에서 제거됐다. 반드시 `eslint`를 직접 호출한다.
> 이미 `next lint`를 쓰던 프로젝트라면 `{pmx} @next/codemod@canary next-lint-to-eslint-cli .`로
> 스크립트와 필요한 의존성을 한 번에 전환할 수 있다.

### 4단계: 설정 파일 교체

다음 파일을 제거한다:

- `vite.config.ts` / `vite.config.js`
- `index.html`
- `src/vite-env.d.ts`
- `dist/` (Vite 빌드 산출물)
- `tsconfig.app.json`, `tsconfig.node.json`

`next.config.ts`를 새로 생성한다. 1단계에서 React Compiler를 감지했으면 `reactCompiler: true`를 두고, 아니면 빈 객체(`{}`)로 둔다. `reactStrictMode`는 App Router에서 기본값이 `true`이므로 적지 않는다.

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true
}

export default nextConfig
```

`tsconfig.json`을 Next.js용으로 갱신한다 (기존 `paths`는 유지). `jsx`는 `react-jsx`, `include`에는 `.next/types`와 `.next/dev/types`를 모두 둔다. 값이 다르면 `next build`가 파일을 고쳐 쓰므로 처음부터 이 값으로 둔다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

> TypeScript v5 이하(`tsc --version`으로 확인)인 경우, `"baseUrl": "."` 을 `paths` 위에 추가한다.

`eslint.config.js`는 Vite 템플릿의 파일을 유지하되 두 가지를 고친다. `eslint-plugin-react-refresh` 임포트와 `reactRefresh.configs.vite` 항목을 제거하고(`layout.tsx`의 `export const metadata`를 오류로 잡는다), `globalIgnores`를 Next.js 산출물 기준으로 바꾼다. `prettierRecommended` 등 그 외 항목은 그대로 둔다.

```js
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['.next', 'next-env.d.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended
    ],
    languageOptions: {
      globals: globals.browser
    }
  }
])
```

> `eslint-config-next`로 교체하지 않는다. Vite 템플릿은 ESLint 10을 쓰는데 `eslint-config-next`는 ESLint 9 전용이라 10에서 규칙 로딩 중 크래시한다.

### 5단계: 진입점 변환 (App Router 구조 생성)

`src/app/layout.tsx`를 생성하고, 기존 `index.html`의 `<head>` 정보(타이틀, lang, 메타)를 옮긴다. 원본에 `src/routes/layouts/DefaultLayout.tsx`(react-router-use 산출물)가 있으면 그 내용이 루트 레이아웃이 된다. `<TheHeader />`는 `<body>` 안에, `<Outlet />` 자리는 `{children}`으로, `<ScrollRestoration />`은 Next.js가 처리하므로 뺀다.

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import TheHeader from '@/components/TheHeader'
import './globals.css'

export const metadata: Metadata = {
  title: 'App',
  description: ''
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <TheHeader />
        {children}
      </body>
    </html>
  )
}
```

기존 `src/index.css`를 `src/app/globals.css`로 이동한다.
Tailwind 사용 프로젝트라면 상단에 다음 지시문이 유지되어야 한다:

```css
@import 'tailwindcss';
```

`src/main.tsx`, `src/App.tsx`, `src/App.css`는 라우팅 변환(6단계) 후 제거한다.

### 6단계: 라우팅 변환 (React Router에서 App Router로)

기존 React Router 라우트 정의(`createBrowserRouter`/`<Routes>`)를 분석한 뒤, 각 경로를 App Router 디렉토리 구조로 매핑한다. 아래 표의 왼쪽은 `react-router-use` 스킬이 만드는 산출물 전부다.

| React Router (react-router-use 산출물) | App Router |
|---|---|
| `path: '/'` -> `<Home />` | `src/app/page.tsx` |
| `path: '/about'` -> `<About />` | `src/app/about/page.tsx` |
| `path: '/movies/:movieId'` -> `<MovieDetails />` | `src/app/movies/[movieId]/page.tsx` |
| `path: '*'` -> `<NotFound />` | `src/app/not-found.tsx` |
| `src/routes/layouts/DefaultLayout.tsx` (TheHeader + Outlet + ScrollRestoration) | `src/app/layout.tsx` (5단계에서 처리) |
| 추가 레이아웃 `src/routes/layouts/<이름>Layout.tsx` | 해당 경로의 `src/app/<경로>/layout.tsx` |
| `src/routes/dynamic.tsx` (`dynamic` 헬퍼, `react-error-boundary`) | 삭제. 코드 분할은 `page.tsx` 단위로 자동. 로딩/에러 UI가 필요하면 같은 폴더에 `loading.tsx`, `error.tsx` |
| `src/routes/loaders/requiresAuth.ts` + `loader: requiresAuth` | 삭제. 보호 페이지는 아래 "보호 페이지" 규칙으로 변환 |
| `src/components/TheHeader.tsx`의 `<NavLink>` | `next/link`의 `<Link>` + `usePathname()` 비교. 파일 상단 `'use client'`. `TheHeader.module.css`는 그대로 |
| 페이지 전환 애니메이션 (`motion`, `useOutlet`, `AnimatePresence`) | 제거. 필요하면 `src/app/template.tsx`로 다시 구현 |
| `src/routes/index.tsx`, `src/main.tsx`의 `<Router />` | 삭제 (진입점은 `layout.tsx`) |

각 페이지 컴포넌트는 다음 규칙으로 옮긴다:

- 기존 컴포넌트 본문은 최대한 그대로 유지
- React Router API 사용 지점은 다음과 같이 치환:
  - `useNavigate()` -> `useRouter()` (`next/navigation`)
  - `useParams()` -> 서버 페이지는 `params` prop (`await params`), 클라이언트 페이지(`'use client'`)는 `next/navigation`의 `useParams()` 그대로
  - `useSearchParams()` -> 서버 페이지는 `searchParams` prop (`await searchParams`), 클라이언트 페이지는 `next/navigation`의 `useSearchParams()` (읽기 전용, 변경은 `router.push()`). 클라이언트 페이지에서 쓰면 정적 빌드가 `missing-suspense-with-csr-bailout` 오류로 실패하므로, 훅을 쓰는 부분을 별도 컴포넌트로 빼고 `page.tsx`에서 `<Suspense>`로 감싼다 (아래 예시)
  - `useLocation().pathname` -> `usePathname()` (`next/navigation`)
  - `useLoaderData()` -> 서버 페이지에서 직접 `await`로 데이터를 가져온다
  - `<Link to="...">` -> `<Link href="...">` (`next/link`)
  - `<NavLink>` -> `<Link>` + `usePathname()` 비교
  - `<Navigate to="..." replace />` -> 서버 페이지는 `redirect()` (`next/navigation`), 클라이언트 페이지는 `useEffect` 안에서 `router.replace()`
  - `<Outlet />` -> `{children}`, `<ScrollRestoration />`과 `useOutlet()` -> 제거
- 위 훅 중 하나라도 사용하거나, `useState`/`useEffect`/이벤트 핸들러/브라우저 API를 사용하는 페이지는 파일 최상단에 `'use client'`를 추가한다.
- 그렇지 않은 정적 페이지는 서버 컴포넌트(기본값)로 둔다.

헤더 변환 예시:

```tsx
// src/components/TheHeader.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigations = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' }
]

export default function TheHeader() {
  const pathname = usePathname()
  return (
    <header>
      <nav>
        {navigations.map(nav => (
          <Link
            key={nav.href}
            href={nav.href}
            className={pathname === nav.href ? 'active' : ''}>
            {nav.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

동적 세그먼트 페이지 변환 예시 (서버 페이지, 훅을 쓰지 않는 경우):

```tsx
// src/app/movies/[movieId]/page.tsx
interface MovieDetailsProps {
  params: Promise<{ movieId: string }>
}

export default async function MovieDetails({ params }: MovieDetailsProps) {
  const { movieId } = await params
  return <h1>Movie: {movieId}</h1>
}
```

같은 페이지가 `useState` 등 훅을 쓰면 `async`로 만들 수 없으므로 클라이언트 페이지로 두고 `useParams()`를 쓴다:

```tsx
// src/app/movies/[movieId]/page.tsx
'use client'

import { useParams } from 'next/navigation'

export default function MovieDetails() {
  const { movieId } = useParams<{ movieId: string }>()
  return <h1>Movie: {movieId}</h1>
}
```

쿼리스트링을 읽는 페이지 변환 예시 (`useSearchParams()`는 `<Suspense>` 안에서만 정적 빌드가 통과한다):

```tsx
// src/app/signin/page.tsx
'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  function signIn() {
    localStorage.setItem('accessToken', 'token')
    router.replace(redirectTo)
  }

  return <button onClick={signIn}>로그인</button>
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
```

보호 페이지 규칙: `requiresAuth` 로더는 `localStorage`의 `accessToken`을 읽는데, 서버 컴포넌트는 `localStorage`를 읽을 수 없다. 기존 동작(브라우저 저장 토큰)을 유지하는 기본 변환은 클라이언트 페이지에서 확인하는 방식이다. 토큰을 쿠키로 옮긴 프로젝트만 서버 컴포넌트에서 `cookies()`로 확인하고 `redirect()`한다. 여러 경로를 한 번에 보호하려면 `src/proxy.ts`를 쓴다.

```tsx
// src/app/private/page.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Private() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      router.replace(`/signin?redirectTo=${pathname}`)
    }
  }, [router, pathname])

  return <h1>비공개 페이지</h1>
}
```

작업이 끝나면 `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/routes/` 폴더 전체(`index.tsx`, `dynamic.tsx`, `layouts/`, `loaders/`)를 제거한다. `src/routes/pages/*.tsx`의 본문은 `src/app/**/page.tsx`로 옮겨지므로 보존된다.

### 7단계: 환경 변수 변환

`.env`, `.env.local`, `.env.development`, `.env.production` 등 모든 `.env*` 파일에서:

- `VITE_FOO=bar` -> `NEXT_PUBLIC_FOO=bar`

소스 코드 전반에서:

- `import.meta.env.VITE_FOO` -> `process.env.NEXT_PUBLIC_FOO`
- `import.meta.env.MODE` -> `process.env.NODE_ENV`
- `import.meta.env.DEV` -> `process.env.NODE_ENV !== 'production'`
- `import.meta.env.PROD` -> `process.env.NODE_ENV === 'production'`
- `import.meta.env.BASE_URL` -> 사용처 검토 후 제거 또는 `next.config.ts`의 `basePath`로 대체

### 8단계: 정적 자산 처리

- `public/` 디렉토리는 그대로 사용 가능. 별도 이동 불필요.
- 단, Vite에서 `/vite.svg` 같이 루트 절대경로로 참조했던 기본 자산이 더 이상 필요 없다면 제거한다.
- 소스 코드 내부에서 `import logo from './assets/logo.svg'` 같은 임포트 형태는 그대로 동작하지만, `public/` 자산을 `next/image`로 사용하는 형태(`<Image src="/logo.svg" ... />`)도 안내한다.

### 9단계: 경로 별칭

`tsconfig.json`의 `paths`(`@/*`)는 4단계에서 유지했으므로 Next.js가 그대로 인식한다. `vite.config.ts`의 `resolve.alias`는 파일과 함께 사라진다. 이후 새로 만드는 파일도 다른 폴더의 모듈은 `@/`로 가져온다.

### 10단계: Tailwind CSS (사용 중인 경우)

기존 `@tailwindcss/vite` 플러그인은 3단계에서 이미 제거되었다. Next.js에서는 PostCSS 기반 설정으로 전환한다.

```bash
{pm} add -D tailwindcss @tailwindcss/postcss postcss
```

프로젝트 루트에 `postcss.config.mjs` 생성:

```js
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

`src/app/globals.css` 상단의 `@import 'tailwindcss';`는 그대로 유지된다.

### 11단계: TanStack Query / Zustand (사용 중인 경우)

**TanStack Query**

Vite 프로젝트의 전역 `src/queries/client.ts`와 `main.tsx`의 `<QueryClientProvider>`는 Next.js에서 쓸 수 없다. 서버에서는 요청마다 새 `QueryClient`가 필요하기 때문이다.

1. `src/providers/query.tsx`를 만든다. 정본은 `tanstack-react-query-use` 스킬의 `references/nextjs.md`다. 고정값: `export default function QueryProvider`, 서버 판별은 `environmentManager.isServer()`.
2. `src/app/layout.tsx`의 `<body>` 안쪽을 `<QueryProvider>`로 감싼다 (`<TheHeader />`와 `{children}` 모두 안에 둔다).
3. `src/queries/client.ts`는 삭제한다. `src/queries/<도메인>.ts`의 `queryOptions` 정의는 그대로 둔다.
4. `useQuery`를 호출하는 컴포넌트 파일 상단에 `'use client'`를 보장한다. 서버에서 미리 가져오기(`prefetchQuery` + `<HydrationBoundary>`)는 같은 정본의 패턴을 따른다.

**Zustand**

기존 store 파일은 그대로 사용 가능하다. 단, store를 사용하는 컴포넌트는 클라이언트 컴포넌트여야 하므로 해당 파일 상단에 `'use client'`를 보장한다.

### 12단계: 정리 및 검증

다음 작업을 수행한다:

1. `.gitignore`에 `.next/`, `next-env.d.ts`, `*.tsbuildinfo`를 추가한다 (없는 경우). `dist` 항목은 지워도 된다.
2. Prettier가 구성된 프로젝트라면 옮긴 파일을 포맷한다:
   ```bash
   {pmx} prettier --write src
   ```
3. 빌드와 린트 검증:
   ```bash
   {pm} run build
   {pm} run lint
   ```
4. 빌드 에러가 있을 경우, 에러 메시지에 따라 다음을 우선 점검:
   - 서버 컴포넌트에서 브라우저 전용 API 사용 -> 해당 컴포넌트에 `'use client'` 추가
   - `import.meta.env` 잔존 -> 7단계 규칙으로 치환
   - React Router API 잔존 -> 6단계 규칙으로 치환
   - lint가 `.next` 산출물을 검사 -> 4단계 `globalIgnores` 확인

**최종 검증 (MANDATORY)**

1단계의 감지 표를 **다시 한 번 스캔**하여 아래를 모두 확인한다. 하나라도 실패하면
해당 단계로 돌아가 즉시 보완한다. 검증 통과 전에는 작업 종료 금지.

- [ ] `grep -rn "import.meta.env" src/` 결과가 없다
- [ ] `grep -rn "from 'react-router" src/` 결과가 없다
- [ ] `grep -rn "VITE_" src/ .env*` 결과가 없다 (모두 `NEXT_PUBLIC_`으로 전환됨)
- [ ] `vite.config.*`, `index.html`, `src/main.tsx`, `src/routes/`, `dist/`가 제거됐다
- [ ] `package.json`에 `vite`, `@vitejs/plugin-react*`, `@rolldown/plugin-babel`, `eslint-plugin-react-refresh`, `react-router*`가 없다
- [ ] `next.config.ts`의 `reactCompiler` 유무가 1단계의 React Compiler 감지 결과와 같다
- [ ] 브라우저 전용 API(`window`, `document`, `localStorage`)를 쓰는 컴포넌트 파일 상단에
      `'use client'`가 있다
- [ ] 기존 `public/` 자산 경로가 그대로 동작한다
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과 (TypeScript 검사 포함)

## 주의사항

- 프로젝트에 `CLAUDE.md`나 `.claude/rules/next.md`가 있으면 그 내용이 이 스킬보다 우선한다. 기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로 만든다.
- 상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다. 다른 폴더의 파일은 `@/` 별칭으로 가져온다.
- 라우팅 구조와 페이지별 클라이언트/서버 컴포넌트 결정은 자동으로 판별하되, 모호한 경우 안전을 위해 `'use client'`를 추가한다.
- 기존 컴포넌트 코드는 라우팅/환경변수/임포트 경로 외에는 수정하지 않는다.
- 이 스킬이 소비하는 원본 라우터 구조는 `react-router-use` 스킬이 만드는 구조다(1단계 표의 "React Router 산출물"). 원본 프로젝트의 라우팅이 그 형태가 아니면 6단계 매핑을 상황에 맞게 조정한다.
- 마이그레이션 후 추가 설정(ESLint + Prettier, VSCode, Tailwind 통합 등)이 필요하다면 `react-next-scaffold` 스킬을 이어서 실행한다.

## 함께 보는 스킬

| 필요한 것 | 스킬 |
|---|---|
| 원본 Vite 프로젝트의 기반 설정 (Tailwind, 경로 별칭, ESLint + Prettier) | `react-vite-scaffold` |
| 원본 라우팅 구조 (이 스킬이 변환하는 `src/routes` 산출물) | `react-router-use` |
| 서버 데이터 fetching / 캐싱, Next.js Provider 정본 | `tanstack-react-query-use` |
| 전역 상태 (스토어) | `zustand-use` |
| 마이그레이션 후 Next.js 기반 설정 (ESLint + Prettier, VSCode) | `react-next-scaffold` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
