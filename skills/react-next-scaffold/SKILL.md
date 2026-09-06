---
name: react-next-scaffold
description: (heropy) Use when initializing a new Next.js (App Router, SSR) project or when an existing Next.js project needs missing configuration (ESLint, Prettier, TanStack Query, Tailwind CSS, VSCode settings, path aliases).
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.3.0
---

# Next.js React Project Scaffold

> 참고: https://www.heropy.dev/p/n7JHmI

Next.js 기반 React(SSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완하는 스킬.

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm`.
> `{pmx}`는 해당 패키지 매니저의 실행 명령으로 대체한다. `npm` -> `npx`, `pnpm` -> `pnpm dlx`, `yarn` -> `yarn dlx`, `bun` -> `bunx`.

## 필수 실행 체크리스트 (MANDATORY)

**스킬 시작 즉시, 아래 항목을 TodoWrite에 1:1로 등록한 뒤 순서대로 진행한다. 건너뛰기 금지.**

1. 프로젝트 상태 감지 (1단계)
2. 모드 결정: 스캐폴딩 vs 보완 (2단계)
3. 프로젝트 생성 [스캐폴딩 모드일 때만] (3단계)
4. 경로 별칭 확인 (4단계)
5. ESLint + Prettier 구성 [prettier 패키지 또는 eslint-plugin-prettier 미설치 시] (5단계)
6. .prettierrc 생성 [파일 없을 때] (6단계)
7. .vscode/settings.json 생성 [파일 없을 때] (7단계)
8. TanStack Query 설치 및 통합 [@tanstack/react-query 미설치 시] (8단계)
9. **포맷 실행 및 최종 검증**: 포맷을 한 번 돌린 뒤 1단계 감지 표를 다시 돌며 모든 구성이 충족됐는지 확인, 누락 시 해당 단계 재실행 (9단계)

각 항목은 조건 충족 시 "skipped"로 완료 처리하되, **조건 판단 근거(파일/패키지 존재 여부)를 명시**한 뒤 넘어간다.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

다음 파일들을 확인하여 현재 프로젝트 상태를 판별한다:

| 확인 대상 | 감지 방법 |
|-----------|-----------|
| 빈 디렉토리 여부 | 현재 디렉토리에 파일이 없거나 `package.json`이 없음 |
| Next.js 프로젝트 | `next.config.ts` 또는 `next.config.js` 또는 `next.config.mjs` 존재 |
| TypeScript | `tsconfig.json` 존재 |
| `src/` 디렉토리 | `src/app/` 존재 (없으면 `app/`이 루트에 있음) |
| TanStack Query | `package.json`의 dependencies에 `@tanstack/react-query` 존재 |
| Tailwind CSS | `package.json`의 dependencies/devDependencies에 `tailwindcss` 존재 |
| ESLint 구성 | `eslint.config.mjs` 또는 `eslint.config.js` 존재 |
| Prettier 구성 | `.prettierrc` 존재 |
| VSCode 설정 | `.vscode/settings.json` 존재 |
| 패키지 매니저 | `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm` |

### 2단계: 분기 처리

**빈 디렉토리인 경우 (스캐폴딩 모드):**

1. 프로젝트 생성 명령 실행
2. 아래 설정 전부 자동 적용

**기존 Next.js 프로젝트인 경우 (보완 모드):**

1. 위 감지 기준으로 설치 상태 자동 판별
2. 누락된 설정만 식별하여 자동 생성
3. 이미 존재하는 설정 파일은 건드리지 않음

### 3단계: 프로젝트 생성

요구사항: Node.js 20.9+

> 스킬 설치 명령(`skills add`)으로 스킬을 설치하면 `.agents/`, `skills-lock.json` 등의 파일이 이미 존재할 수 있다. `create-next-app`은 디렉토리에 파일이 있으면 충돌로 판단하고 종료되므로, 스캐폴딩 모드에서는 다음 절차를 따른다:
>
> 1. 현재 디렉토리의 기존 파일/폴더 목록과 내용을 기억해 둔다
> 2. 기존 파일/폴더를 모두 삭제한다
> 3. 아래 생성 명령을 실행한다
> 4. 기억해 둔 파일/폴더 중 생성 결과에 없는 것(`.agents/`, `skills-lock.json` 등)은 그대로 복원한다. 생성 결과에도 같은 이름이 있는 파일(`CLAUDE.md`, `AGENTS.md`, `README.md`, `.gitignore`)은 덮어쓰지 말고, 생성된 내용 뒤에 기존 내용을 이어 붙인다. `AGENTS.md`와 `CLAUDE.md`는 `<!-- BEGIN:nextjs-agent-rules -->` ~ `<!-- END:nextjs-agent-rules -->` 블록 바깥에 기존 내용을 둔다.

현재 디렉토리에 Next.js 프로젝트 생성 (비대화형):

```bash
{pmx} create-next-app@latest . --ts --eslint --react-compiler --tailwind --src-dir --app --import-alias "@/*" --yes
```

`--yes`는 플래그로 지정하지 않은 항목(AGENTS.md 포함 등)을 기본값으로 채워 프롬프트를 띄우지 않는다. 사용자가 직접 대화형으로 실행한다면 다음과 같이 답한다 (v16 기준):

- Would you like to use the recommended Next.js defaults?: **No, customize settings**
- Would you like to use TypeScript?: **Yes**
- Which linter would you like to use?: **ESLint**
- Would you like to use React Compiler?: **Yes**
- Would you like to use Tailwind CSS?: **Yes**
- Would you like your code inside a `src/` directory?: **Yes**
- Would you like to use App Router? (recommended): **Yes**
- Would you like to customize the import alias (`@/*` by default)?: **No**
- Would you like to include AGENTS.md to guide coding agents to write up-to-date Next.js code?: **Yes**

### 4단계: 경로 별칭

`@/*` 경로 별칭은 `create-next-app`이 `tsconfig.json`의 `paths`에 설정한다. `baseUrl`은 필요 없다. 스캐폴딩 모드에서는 별도 구성 불필요.

보완 모드에서 `tsconfig.json`의 `paths`에 `@/*`가 없으면 추가한다. `src/` 디렉토리가 없는 프로젝트는 `./src/*` 대신 `./*`를 쓴다.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5단계: ESLint + Prettier 구성 [조건: prettier 패키지 또는 eslint-plugin-prettier 미설치 시]

```bash
{pm} add -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss
```

`create-next-app`이 생성한 `eslint.config.mjs`(또는 `eslint.config.js`)의 기존 항목(`nextVitals`, `nextTs`, `globalIgnores`)은 그대로 두고, 배열 끝에 `extends`를 가진 설정 객체를 추가해 `prettierRecommended`를 넣는다. 적용 후 전체 파일 형태:

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next의 기본 ignore 목록을 유지한다.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    extends: [prettierRecommended]
  }
])

export default eslintConfig
```

TanStack Query를 쓰는 프로젝트(8단계)는 같은 `extends` 배열에 `tanstackQuery.configs['flat/recommended']`를 추가한다. `prettierRecommended`는 항상 마지막에 둔다:

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import tanstackQuery from '@tanstack/eslint-plugin-query'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    extends: [tanstackQuery.configs['flat/recommended'], prettierRecommended]
  }
])

export default eslintConfig
```

> `tanstackQuery.configs.recommended`는 `.eslintrc` 전용 레거시 형식이라 Flat Config에서는 "Flat config requires plugins to be an object" 오류로 ESLint가 실행되지 않는다. 반드시 `configs['flat/recommended']`를 쓴다.

#### 패키지 역할 참고

| 패키지 | 설명 |
|--------|------|
| `prettier` | Prettier 코어 패키지 |
| `eslint-config-prettier` | ESLint와 Prettier의 충돌 방지 |
| `eslint-plugin-prettier` | Prettier 규칙을 ESLint 규칙으로 통합 |
| `prettier-plugin-tailwindcss` | Tailwind CSS 클래스 자동 정렬 |
| `@tanstack/eslint-plugin-query` | TanStack Query 규칙 (TanStack Query 사용 시) |

### 6단계: .prettierrc [조건: 파일 없을 때]

`.prettierrc` 파일이 없으면 프로젝트 루트에 생성:

```json
{
  "semi": false,
  "singleQuote": true,
  "singleAttributePerLine": true,
  "bracketSameLine": true,
  "endOfLine": "auto",
  "trailingComma": "none",
  "arrowParens": "avoid",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 7단계: .vscode/settings.json [조건: 파일 없을 때]

`.vscode/settings.json` 파일이 없으면 생성:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 8단계: TanStack Query [조건: @tanstack/react-query 미설치 시]

> 참고: https://www.heropy.dev/p/HZaKIE#h2_with_Nextjs

`@tanstack/react-query`가 `package.json`에 없으면:

1. 패키지 설치:
   ```bash
   {pm} add @tanstack/react-query
   {pm} add -D @tanstack/eslint-plugin-query
   ```

2. `eslint.config.mjs`의 `extends` 배열에 `tanstackQuery.configs['flat/recommended']` 추가 (5단계 참조)

3. `src/providers/query.tsx` 생성:

   **이 파일의 정본은 `tanstack-react-query-use` 스킬의
   `references/nextjs.md` "Provider 구성" 절이다.** 같은 플러그인에 함께 설치되므로
   그 문서를 열어 코드를 그대로 옮겨 쓴다. 여기에 사본을 두지 않는 이유는
   두 곳이 갈라지는 것을 막기 위해서다.

   요약하면 이런 구조다.

   - `'use client'` 지시어로 시작한다
   - `makeQueryClient()`에서 `defaultOptions.queries.staleTime`을 지정한다
     (SSR 직후 클라이언트가 즉시 재요청하는 것을 막는다)
   - `getQueryClient()`가 `environmentManager.isServer()`로 판별해 서버에서는 매 요청마다
     새 인스턴스를, 브라우저에서는 모듈 스코프 인스턴스 하나를 재사용한다
     (폐기된 `isServer` 상수는 쓰지 않는다)
   - `export default function QueryProvider`가 `<QueryClientProvider>`로 `children`을 감싼다

   컴포넌트 안에서 `new QueryClient()`를 직접 만들거나 `useState`로 감싸지 않는다.

4. `src/app/layout.tsx`에서 `QueryProvider`로 `children`을 래핑:

   생성된 `layout.tsx`는 그대로 두고 `<body>` 안의 `{children}`만 `<QueryProvider>`로 감싼다.
   폰트, `metadata`, `className`, `LayoutProps` 타입은 유지한다. 적용 후 전체 파일 형태(9단계 포맷 실행 후 기준):

   ```tsx
   // src/app/layout.tsx
   import type { Metadata } from 'next'
   import { Geist, Geist_Mono } from 'next/font/google'
   import QueryProvider from '@/providers/query'
   import './globals.css'

   const geistSans = Geist({
     variable: '--font-geist-sans',
     subsets: ['latin']
   })

   const geistMono = Geist_Mono({
     variable: '--font-geist-mono',
     subsets: ['latin']
   })

   export const metadata: Metadata = {
     title: 'Create Next App',
     description: 'Generated by create next app'
   }

   export default function RootLayout({ children }: LayoutProps<'/'>) {
     return (
       <html
         lang="en"
         className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
         <body className="flex min-h-full flex-col">
           <QueryProvider>{children}</QueryProvider>
         </body>
       </html>
     )
   }
   ```

데이터 사용 패턴은 `tanstack-react-query-use` 스킬을 따른다. 기본 패턴은 서버 컴포넌트에서
`prefetchQuery` + `dehydrate` + `<HydrationBoundary>`로 미리 가져오고 클라이언트 컴포넌트에서
`useQuery`로 읽는 방식이다. 미리 가져오기 없이 스트리밍으로 처리하는 대안
(`@tanstack/react-query-next-experimental`의 `ReactQueryStreamedHydration`)은 그 스킬의
`references/nextjs.md`에서 필요할 때만 적용하며, 이 스킬은 해당 패키지를 설치하지 않는다.

### 9단계: 포맷 실행 및 최종 검증 (MANDATORY)

먼저 포맷을 한 번 실행한다. `create-next-app`이 생성한 파일(`postcss.config.mjs`, `layout.tsx`, `next.config.ts` 등)은
세미콜론과 큰따옴표를 쓰므로, 그대로 두면 lint가 `prettier/prettier` 오류로 실패한다:

```bash
{pmx} prettier --write .
```

그다음 1단계의 감지 표를 **다시 한 번 스캔**하여 아래 항목을 확인한다:

- [ ] Next.js 프로젝트 파일(`next.config.*`, `src/app/layout.tsx` 등) 정상 생성됨
- [ ] `@/*` 경로 별칭이 `tsconfig.json`의 `paths`에 존재
- [ ] `tailwindcss` 설치됨 (create-next-app에서 선택한 경우)
- [ ] `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `prettier-plugin-tailwindcss` 설치됨
- [ ] `eslint.config.*`의 `extends`에 `prettierRecommended` 포함됨 (TanStack Query 사용 시 `tanstackQuery.configs['flat/recommended']`도 포함)
- [ ] `.prettierrc` 존재
- [ ] `.vscode/settings.json` 존재
- [ ] TanStack Query 사용 시: `src/providers/query.tsx` 존재 + `src/app/layout.tsx`가 `QueryProvider`로 `children` 래핑 + 기존 폰트/`metadata`/`className` 유지
- [ ] 스캐폴딩 모드였던 경우: 삭제 전에 기억해 둔 `.agents/`, `skills-lock.json` 등이 복원됨 (동명 파일은 기존 내용이 병합됨)
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과 (TypeScript 검사 포함)

**누락 항목이 있으면 해당 단계로 돌아가 즉시 보완한다.** 검증 통과 전에는 작업 종료 금지.

## 주의사항

- 프로젝트에 `CLAUDE.md`나 `.claude/rules/next.md`가 있으면 그 내용이 이 스킬보다 우선한다. 기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로 만든다.
- 상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다. 다른 폴더의 파일은 `@/` 별칭으로 가져온다.
- 이미 존재하는 설정 파일은 덮어쓰지 않는다
- 기존 프로젝트 보완 모드에서는 질문 없이 자동으로 진행한다
- 빈 디렉토리(스캐폴딩 모드)에서는 `npm`을 사용한다
- Biome 등 ESLint가 아닌 린터를 고른 프로젝트(`eslint.config.*` 없음)는 이 스킬의 범위 밖이다. ESLint 프로젝트만 다룬다

## 함께 보는 스킬

| 필요한 것 | 스킬 |
|---|---|
| 서버 데이터 fetching / 캐싱 (useQuery, prefetch + HydrationBoundary) | `tanstack-react-query-use` |
| 전역 상태 (스토어) | `zustand-use` |
| 기존 Vite React 프로젝트를 Next.js로 옮기기 | `react-vite-to-next-migration` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
