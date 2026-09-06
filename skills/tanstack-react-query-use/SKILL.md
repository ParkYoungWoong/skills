---
name: tanstack-react-query-use
description: (heropy) Use when fetching, caching, or mutating server data with TanStack Query (React Query) in a React (Vite) or Next.js App Router project, including useQuery, useMutation, useInfiniteQuery, QueryClientProvider, and ReactQueryDevtools. 사용자가 "data fetching", "캐싱", "서버 상태", "낙관적 업데이트", "무한 스크롤", "react query", "tanstack query"를 React 맥락에서 언급할 때도 이 스킬을 따른다.
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.2.0
---

# TanStack Query 사용 규칙

> 참고: https://www.heropy.dev/p/HZaKIE
> 기준 버전: `@tanstack/react-query` 5.102.8 (변이 콜백 시그니처는 5.89 이상, `environmentManager`는 5.91 이상)

TanStack Query는 서버 데이터의 가져오기, 캐싱, 동기화를 담당하는 라이브러리다.
이 스킬은 v5 단일 객체 시그니처(`useQuery({ ... })`)를 전제로 하며, 쿼리 코드를 작성할 때 따라야 하는 위치, 이름, 패턴, 주의점을 모은다.

## 핵심 원칙 (먼저 읽기)

1. **프로젝트에 `CLAUDE.md`나 `.claude/rules/tanstack-query.md`가 있으면 그 내용이 이 스킬보다 우선한다.** 기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로 만든다.
2. **쿼리 옵션은 `src/queries/<도메인>.ts`에 `queryOptions()`로 정의한다.** 도메인은 복수 명사 소문자 파일명(`users.ts`, `movies.ts`)이다. 이름은 `<도메인 단수><대상>Options`로 짓는다(`userListOptions`, `userDetailOptions(id)`). 무한 쿼리는 같은 파일에 `infiniteQueryOptions()`로 정의한다.
3. **컴포넌트는 옵션을 호출만 한다.** `useQuery(userListOptions)`, `useInfiniteQuery(movieSearchOptions(text))`처럼 쓰고, 컴포넌트 안에 `queryKey`와 `queryFn`을 인라인으로 적지 않는다. 같은 옵션을 `fetchQuery`, `prefetchQuery`, `invalidateQueries`에서도 재사용한다.
4. **`QueryClient`는 `src/queries/client.ts`에서 한 번만 만든다.** `export const queryClient = new QueryClient(...)`로 내보내고, 컴포넌트 안에서 `new QueryClient()`를 호출하지 않는다.
5. **Provider 위치는 고정이다.** Vite 프로젝트는 `src/main.tsx`에서 `<QueryClientProvider>`가 `<Router />`(라우터가 없으면 `<App />`)를 감싼다. Next.js 프로젝트는 `src/providers/query.tsx`의 `QueryProvider`를 루트 레이아웃에서 쓴다. 기존 wrapper(`<StrictMode>`, 다른 Provider)는 유지하고 자기 것만 끼워 넣는다.
6. **상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다.** 다른 폴더의 파일은 `@/` 별칭으로 가져온다. 별칭이 없으면 `react-vite-scaffold`의 경로 별칭 단계를 먼저 적용한다.
7. **컴포넌트는 `export default function Name()`으로 선언한다.** 응답 객체 타입은 `interface`로 여러 줄에 쓰고, 유니온이나 별칭만 `type`을 쓴다. 파일을 만드는 예시는 첫 줄에 `// src/...` 경로 주석을 둔다.
8. **`useState` + `useEffect` + `fetch` 조합으로 서버 데이터를 다루는 코드는 아래 훅 중 하나로 대체한다.**

## 결정 원칙

작업 유형에 따라 훅을 고른다.

| 상황 | 사용할 훅 |
|------|-----------|
| 데이터 조회(GET) | `useQuery` |
| 페이지네이션 / 무한 스크롤 | `useInfiniteQuery` |
| 생성, 수정, 삭제(POST/PUT/PATCH/DELETE) | `useMutation` |
| Next.js 스트리밍 SSR + Suspense 경계 | `useSuspenseQuery` (Next.js 절 참조) |

## 핵심 개념: 캐시와 신선도

TanStack Query는 `queryKey`별로 응답을 캐시하고, 캐시 데이터를 Fresh / Stale 두 상태로 관리한다.

- Fresh: `staleTime` 이내. 같은 `queryKey`로 다시 요청해도 네트워크를 타지 않고 캐시를 반환한다.
- Stale: `staleTime` 경과. 캐시는 즉시 반환하지만, 마운트, 창 포커스, 재연결 시점에 백그라운드 재요청을 시도한다.

`staleTime`의 기본값은 `0`이다. 즉, 명시하지 않으면 모든 데이터가 곧바로 상한다. 자주 바뀌지 않는 데이터는 반드시 `staleTime`을 지정한다(예: 5분 -> `1000 * 60 * 5`).

한 번 받으면 바뀌지 않는 데이터는 `staleTime: 'static'`을 쓴다. `'static'`은 절대 상하지 않고 `invalidateQueries()`로 무효화해도 다시 가져오지 않는다. `Infinity`는 자동 갱신은 막지만 무효화하면 다시 가져온다는 점이 다르다.

`gcTime`(기본 5분)은 비활성 캐시가 메모리에 남는 시간이다. `staleTime`보다 크게 두는 것이 일반적이다.

## 설치 및 Provider 구성

> 프로젝트 초기 설정(Tailwind, ESLint, Prettier, 경로 별칭)이 아직 없다면
> Vite 프로젝트는 `react-vite-scaffold`, Next.js 프로젝트는 `react-next-scaffold` 스킬을 먼저 적용한다.

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm`.
> `{pmx}`는 해당 패키지 매니저의 실행 명령으로 대체한다. `npm` -> `npx`, `pnpm` -> `pnpm dlx`, `yarn` -> `yarn dlx`, `bun` -> `bunx`.

### Vite (CSR)

```bash
{pm} add @tanstack/react-query @tanstack/react-query-devtools
{pm} add -D @tanstack/eslint-plugin-query
```

`eslint.config.js`의 기존 `extends` 배열 끝에 `tanstackQuery.configs['flat/recommended']`를 추가한다. 나머지 항목은 그대로 유지한다. (`prettierRecommended`는 `react-vite-scaffold`를 적용했을 때 있는 항목이다.)

```js
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import tanstackQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierRecommended,
      tanstackQuery.configs['flat/recommended']
    ],
    languageOptions: {
      globals: globals.browser
    }
  }
])
```

> `configs.recommended`는 `.eslintrc` 방식 전용이라 Flat Config에 넣으면 ESLint가 실행조차 되지 않는다. `.eslintrc.*` 파일은 ESLint 10부터 지원이 제거됐으므로 항상 `configs['flat/recommended']`를 쓴다.

권장 규칙(`flat/recommended`) 7개의 의미:

- `@tanstack/query/exhaustive-deps`: `queryFn`에서 쓰는 외부 변수는 반드시 `queryKey`에 포함시킨다.
- `@tanstack/query/stable-query-client`: `QueryClient` 인스턴스를 컴포넌트 안에서 매 렌더마다 새로 만들지 않는다.
- `@tanstack/query/no-rest-destructuring`: 쿼리 반환에서 `...rest` 분해는 변경 감지 최적화를 깬다.
- `@tanstack/query/no-unstable-deps`: 쿼리 반환 객체를 훅 의존성 배열에 그대로 넣지 않고 구조 분해한 값을 넣는다.
- `@tanstack/query/infinite-query-property-order`: 타입 추론을 위해 `queryFn`, `getPreviousPageParam`, `getNextPageParam` 순서로 쓴다.
- `@tanstack/query/no-void-query-fn`: 쿼리 함수는 반드시 값을 반환한다.
- `@tanstack/query/mutation-property-order`: 타입 추론을 위해 `onMutate`, `onError`, `onSettled` 순서로 쓴다.

더 엄격하게 검사하려면 `flat/recommended-strict`를 쓴다. `queryKey`와 `queryFn`을 `queryOptions()`로 묶도록 강제하는 `@tanstack/query/prefer-query-options` 규칙이 추가되며, 이 스킬의 핵심 원칙 2와 같은 방향이다.

`QueryClient`는 `src/queries/client.ts`에서 한 번만 만든다.

```ts
// src/queries/client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
```

앱 진입점 `src/main.tsx`에서 `<QueryClientProvider>`를 단 한 번만 설치한다. 기존 wrapper(`<StrictMode>`, 다른 Provider)는 유지하고 자기 것만 끼워 넣는다. `react-router-use`로 라우터를 구성한 프로젝트는 `<Router />`를 감싼다.

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/queries/client'
import Router from '@/routes'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  </StrictMode>
)
```

라우터가 없는 프로젝트는 `<Router />` 자리에 기존 `<App />`을 그대로 둔다.

```tsx
// src/main.tsx (라우터가 없는 경우)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/queries/client'
import App from './App'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
```

### Next.js (App Router)

Provider 정본은 [references/nextjs.md](references/nextjs.md)의 `src/providers/query.tsx`다. `react-next-scaffold` 스킬의 8단계도 같은 파일을 참조한다. 서버 컴포넌트에서 미리 가져오기(기본 패턴)와 스트리밍(대안)도 같은 문서에서 다룬다.

## useQuery: 데이터 조회

### 기본 형태

쿼리 옵션 파일과 컴포넌트를 나눠서 만든다.

```ts
// src/queries/users.ts
import { queryOptions } from '@tanstack/react-query'

export interface User {
  id: string
  name: string
  age: number
}

export const userListOptions = queryOptions({
  queryKey: ['users'],
  queryFn: async (): Promise<User[]> => {
    const res = await fetch('https://api.heropy.dev/v0/users')
    if (!res.ok) throw new Error('요청 실패')
    const { users } = await res.json()
    return users
  },
  staleTime: 1000 * 60 * 5 // 5분
})

export const userDetailOptions = (id: string) =>
  queryOptions({
    queryKey: ['users', id],
    queryFn: async (): Promise<User> => {
      const res = await fetch(`https://api.heropy.dev/v0/users/${id}`)
      if (!res.ok) throw new Error('요청 실패')
      return res.json()
    }
  })
```

```tsx
// src/components/UserList.tsx
import { useQuery } from '@tanstack/react-query'
import { userListOptions } from '@/queries/users'

export default function UserList() {
  const { data, isPending, isError, error } = useQuery(userListOptions)

  if (isPending) return <div>로딩 중...</div>
  if (isError) return <div>에러: {error.message}</div>
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

`queryOptions()`로 정의하면 반환된 `queryKey`에 데이터 타입과 오류 타입이 함께 각인되어, `queryClient.getQueryData(userListOptions.queryKey)`처럼 제네릭 없이 호출해도 타입이 추론된다.

### queryKey 규칙

`queryKey`는 캐시의 식별자다. 다음 규칙을 지킨다.

1. `[도메인, 식별자, 파라미터]` 순의 배열로 쓴다. 순서가 다르면 다른 쿼리로 간주한다.
2. `queryFn` 안에서 쓰는 모든 외부 변수를 `queryKey`에 포함시킨다.
3. 객체 속성은 키 순서가 달라도 같은 쿼리로 본다(`{ a: 1, b: 2 }`와 `{ b: 2, a: 1 }`). 값이 `undefined`인 속성은 아예 빠진다.
4. 배열 아이템 자리의 `undefined`는 `null`로 직렬화된다. `['delay', undefined]`와 `['delay', null]`은 같은 쿼리다.

```ts
// src/queries/movies.ts
import { queryOptions } from '@tanstack/react-query'

export interface Movie {
  imdbID: string
  Title: string
  Year: string
  Poster: string
}

// 검색어가 바뀔 때마다 다른 쿼리가 되어 자동으로 다시 가져온다
export const movieListOptions = (searchText: string) =>
  queryOptions({
    queryKey: ['movies', searchText],
    queryFn: async (): Promise<Movie[]> => {
      const res = await fetch(`/api/movies?q=${searchText}`)
      return res.json()
    }
  })
```

변수를 의도적으로 키에서 제외해야 한다면 그 한 줄만 ESLint를 비활성화한다(`// eslint-disable-next-line @tanstack/query/exhaustive-deps`). 프로젝트 전역 비활성화는 하지 않는다.

### 자주 쓰는 옵션

| 옵션 | 언제 쓰는가 |
|------|-------------|
| `enabled: false` | 다른 데이터가 준비될 때까지 쿼리 실행을 막아야 할 때(예: 검색어가 비어 있는 동안). 타입 좁히기까지 원하면 `skipToken` |
| `staleTime` | 자주 바뀌지 않는 데이터에 캐시 수명을 부여할 때. 절대 바뀌지 않으면 `'static'` |
| `select: data => ...` | 큰 응답에서 필요한 부분만 잘라 컴포넌트에 전달할 때 |
| `placeholderData: keepPreviousData` | 검색, 필터처럼 키가 자주 바뀌어 화면 깜빡임이 보일 때(`keepPreviousData`는 `@tanstack/react-query`에서 import) |
| `retry: n` | 실패 재시도 횟수(기본 3) |
| `refetchOnWindowFocus: false` | 창 포커스마다 재요청이 부담스러울 때 비활성화 |

전체 옵션과 반환 속성 표는 [references/options.md](references/options.md) 참조.

### 상태 플래그 선택 가이드

| 보고 싶은 것 | 쓸 플래그 |
|--------------|-----------|
| 첫 번째 데이터 가져오는 중(초기 스피너) | `isLoading` (= `isFetching && isPending`) |
| 현재 네트워크 요청이 진행 중(재요청 포함) | `isFetching` |
| 캐시 데이터가 아예 없음 | `isPending` |
| 화면 데이터가 임시 데이터(placeholder)인지 | `isPlaceholderData` |
| `enabled`로 막은 쿼리가 지금 활성인지 | `isEnabled` |

`isLoading`은 "첫 로딩"이고 `isFetching`은 "백그라운드 포함 모든 요청"이다. 새로고침 버튼을 누른 동안 스피너를 띄우려면 `isFetching`을 쓴다. `enabled`를 쓰는 쿼리는 `isPending` 대신 `isLoading`으로 분기한다.

### 명령형으로 캐시 다루기

쿼리 결과를 컴포넌트 바깥(이벤트 핸들러, 다른 훅)에서 다루려면 `useQueryClient`를 쓴다. 옵션 파일의 `queryOptions`를 그대로 넘긴다.

```tsx
// src/components/UserTools.tsx
import { useQueryClient } from '@tanstack/react-query'
import { userListOptions } from '@/queries/users'

export default function UserTools() {
  const queryClient = useQueryClient()

  // 캐시 즉시 조회(없으면 undefined). queryOptions의 queryKey라 타입이 추론된다
  const cached = queryClient.getQueryData(userListOptions.queryKey)

  // staleTime 규칙대로 가져오기(캐시가 신선하면 캐시, 아니면 fetch)
  async function prefetch() {
    await queryClient.fetchQuery(userListOptions)
  }

  // 캐시 무효화 -> 백그라운드 재요청 트리거
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: userListOptions.queryKey })
  }

  return (
    <div>
      <button onClick={prefetch}>미리 가져오기</button>
      <button onClick={invalidate}>무효화</button>
      <span>{cached?.length ?? 0}명</span>
    </div>
  )
}
```

자주 쓰는 메소드:

| 메소드 | 의미 |
|--------|------|
| `getQueryData(key)` | 캐시 즉시 조회. 없으면 `undefined`. 상해도 새로 가져오지 않는다. |
| `fetchQuery(opts)` | `staleTime` 기준으로 가져온다. 훅 옵션을 물려받지 않으므로 `staleTime`이 빠지면 기본값 `0`이 적용되어 항상 다시 요청한다. `queryOptions`를 넘기면 해결된다. |
| `ensureQueryData(opts)` | 캐시가 없을 때만 `fetchQuery`를 호출한다. 캐시가 상했을 때 백그라운드 갱신까지 원하면 `revalidateIfStale: true`를 함께 준다. |
| `setQueryData(key, updater)` | 캐시 수동 갱신(낙관적 업데이트용). |
| `invalidateQueries({ queryKey })` | 일치 키들을 stale로 표시 -> 다음 렌더에서 재요청. |
| `cancelQueries({ queryKey })` | 진행 중 요청을 취소(낙관적 업데이트 전 충돌 방지). |
| `removeQueries({ queryKey })` | 캐시에서 제거. |

`invalidateQueries`의 `queryKey`는 prefix 매칭이다. `['users']`로 무효화하면 `['users', 1]`, `['users', { filter: 'active' }]`도 모두 무효화된다.

## useMutation: 데이터 변경

### 기본 형태 + 캐시 갱신

```tsx
// src/components/AddUser.tsx
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userListOptions, type User } from '@/queries/users'

export default function AddUser() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (newUser: Omit<User, 'id'>) => {
      const res = await fetch('https://api.heropy.dev/v0/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      if (!res.ok) throw new Error('생성 실패')
      return res.json()
    },
    onSuccess: () => {
      // 성공 후 관련 조회 쿼리를 무효화해 최신 목록을 받는다
      queryClient.invalidateQueries({ queryKey: userListOptions.queryKey })
    }
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutate({ name: 'Neo', age: 22 })
  }

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={isPending}>{isPending ? '추가 중...' : '추가'}</button>
      {isError && <p>{error.message}</p>}
    </form>
  )
}
```

### 핵심 규칙

- `mutationFn`은 실패 시 throw해야 한다. resolve된 응답이지만 `!res.ok`인 경우도 직접 throw해야 `onError`/`error`가 동작한다.
- `mutate(variables)`는 fire-and-forget(콜백 패턴), `mutateAsync(variables)`는 await 가능한 Promise를 반환한다. async/await 흐름이 필요할 때만 후자를 쓴다.
- 성공 후 화면을 새로 그리고 싶다면 거의 항상 `onSuccess`에서 `queryClient.invalidateQueries`를 호출한다.
- `mutate`의 두 번째 인수로 넘기는 `onSuccess`, `onError`, `onSettled`는 옵션 콜백과 다르게 동작한다. 반환값이 무시되어 Promise를 기다리지 않고, 컴포넌트가 연결 해제되면 실행되지 않으며, `mutate`를 연달아 호출하면 마지막 호출의 콜백만 실행된다. 캐시 갱신처럼 반드시 실행돼야 하는 로직은 옵션 콜백에 둔다.

### 콜백 순서와 인수

`useMutation`의 라이프사이클(5.89 이상):

```
mutate() 호출
  -> onMutate(variables, context)                       // 낙관적 업데이트는 여기서
    -> mutationFn(variables, context) 실행
      -> 성공 시 onSuccess(data, variables, onMutateResult, context)
      -> 실패 시 onError(error, variables, onMutateResult, context)
  -> onSettled(data, error, variables, onMutateResult, context)  // 성공/실패 무관 항상
```

`onMutate`가 반환한 값은 `onError`/`onSuccess`/`onSettled`의 `onMutateResult` 인수로 전달된다(5.89 이전 이름은 `context`). 낙관적 업데이트의 롤백 데이터를 여기에 담는 것이 표준 패턴이다. 모든 콜백의 마지막 인수 `context`는 `{ client, meta, mutationKey }` 형태의 `MutationFunctionContext`다.

낙관적 업데이트(Optimistic Update)의 완전한 예제와 패턴은 [references/patterns.md](references/patterns.md) 참조.

## useInfiniteQuery: 페이지네이션 / 무한 스크롤

페이지 단위로 데이터를 누적해서 보여줄 때 쓴다. `useQuery`의 모든 옵션을 받고, 추가로 `initialPageParam`과 `getNextPageParam`(필수)을 지정한다. 옵션은 `infiniteQueryOptions()`로 정의한다.

```ts
// src/queries/movies.ts (일부)
import { infiniteQueryOptions } from '@tanstack/react-query'

export interface MoviePage {
  Search: Movie[]
  totalResults: string
  Response: 'True' | 'False'
}

// KEY는 발급받은 OMDb API 키로 바꾼다
export const movieSearchOptions = (queryText: string) =>
  infiniteQueryOptions({
    queryKey: ['movies', 'search', queryText],
    queryFn: async ({ pageParam }): Promise<MoviePage> => {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=KEY&s=${queryText}&page=${pageParam}`
      )
      return res.json()
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const maxPage = Math.ceil(
        Number.parseInt(allPages[0].totalResults, 10) / 10
      )
      if (lastPage.Response === 'True' && allPages.length < maxPage) {
        return allPages.length + 1
      }
      return null // 다음 페이지가 없으면 null 또는 undefined
    },
    enabled: Boolean(queryText),
    staleTime: 1000 * 60 * 60
  })
```

```tsx
// src/components/MovieList.tsx (일부)
const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteQuery(
  movieSearchOptions(queryText)
)
```

렌더 시점에 주의할 점:

- `data`는 단일 배열이 아니라 `{ pages, pageParams }` 형태다. `data.pages.flatMap(...)`로 평탄화해서 그린다.
- '더 보기' 버튼은 `disabled={!hasNextPage || isFetching}`로 보호한다.

무한 스크롤(IntersectionObserver / `react-intersection-observer`) 전체 예제는 [references/patterns.md](references/patterns.md) 참조.

## 개발자 도구

개발 중에는 항상 ReactQueryDevtools를 켠다. 설치 단계에서 `@tanstack/react-query-devtools`를 함께 설치했다.

```tsx
// src/main.tsx (Provider 안에 추가)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>
)
```

화면 우측 하단의 TanStack 로고 버튼으로 열고 닫는다. 패키지가 `NODE_ENV`가 `development`가 아니면 스스로 `null`을 반환하므로, 프로덕션 제외를 위한 조건부 렌더링은 필요 없다. 무한 스크롤 디버깅 시에는 devtools를 일시적으로 닫는다. devtools 자체가 페이지 안의 큰 요소라 IntersectionObserver 동작을 방해할 수 있다.

## Next.js App Router에서의 사용

Next.js SSR 환경에서는 추가로 다음을 고려한다. 전체 코드는 [references/nextjs.md](references/nextjs.md)에 있다.

- `QueryClient`는 서버에서 요청마다 새로 만들고 브라우저에서는 하나를 재사용한다. 판별은 `environmentManager.isServer()`로 한다(`isServer` 상수는 5.91에서 폐기).
- 기본 패턴은 서버 컴포넌트에서 `prefetchQuery` + `dehydrate` + `<HydrationBoundary>`로 미리 가져오고, 클라이언트 컴포넌트에서 같은 `queryOptions`로 `useQuery`를 쓰는 것이다. 서버와 클라이언트가 같은 옵션 객체를 가리켜야 미리 가져온 데이터를 재사용한다.
- 라우트마다 미리 가져오기를 쓰기 번거로우면 `ReactQueryStreamedHydration` + `useSuspenseQuery` 스트리밍 방식을 대안으로 쓴다. 이때만 `@tanstack/react-query-next-experimental`을 설치한다.
- 서버 액션(Server Action)을 `queryFn`으로 쓰지 않는다. 클라이언트에서 호출한 서버 액션은 직렬로 실행되어 쿼리가 대기 상태에서 멈출 수 있다. 서버 액션은 `useMutation`에만 쓴다.
- Next.js 14 이하는 `fetch`가 기본 캐싱되어 `cache: 'no-store'`가 필요하다. Next.js 15와 16은 기본 비캐싱이라 옵션이 필요 없다.
- `useSuspenseQuery`는 `enabled`, `placeholderData`, `throwOnError` 옵션을 지원하지 않는다. 조건부 fetch가 필요하면 `useQuery`를 쓴다.

## 기능 가이드

| 필요한 것 | 문서 |
|---|---|
| `useQuery`, `useInfiniteQuery`, `useMutation`의 전체 옵션과 반환 속성 표 | [references/options.md](references/options.md) |
| 낙관적 업데이트 전체 예제, 무한 스크롤 구현, `meta`를 통한 전역 에러 처리, `skipToken` 의존 쿼리 | [references/patterns.md](references/patterns.md) |
| Next.js App Router Provider 구성, 서버 미리 가져오기, 스트리밍 SSR 패턴 | [references/nextjs.md](references/nextjs.md) |

## 자주 마주치는 함정

- `queryKey`에 변수를 빠뜨려서 화면이 갱신되지 않는다 -> ESLint `exhaustive-deps` 규칙을 켜 둔다.
- `staleTime`을 안 줘서 모든 마운트가 새 요청을 친다 -> 안정적인 데이터에는 `staleTime`을 명시한다.
- mutation 성공 후 화면이 안 바뀐다 -> `onSuccess`에서 `invalidateQueries`를 호출했는지 확인한다.
- `QueryClient`를 컴포넌트 안에서 `new QueryClient()`로 만들고 있다 -> 리렌더마다 캐시가 초기화된다. `src/queries/client.ts`(Next.js는 `getQueryClient` 헬퍼)에 둔다.
- `data`가 `undefined`라 화면이 깨진다 -> `isPending` 또는 `isLoading` 분기를 먼저 검사한 후에 `data`를 쓴다.
- `useQuery({ ..., queryClient })`가 타입 오류를 낸다 -> `queryClient`는 옵션이 아니라 `useQuery(옵션, 쿼리클라이언트)`의 두 번째 인수다. Provider의 클라이언트 대신 다른 클라이언트를 쓸 때만 지정한다.
- `queryFn` 안에서 `userId!` 단언을 쓰고 있다 -> `queryFn: userId ? () => fetchUser(userId) : skipToken`으로 바꾸면 분기 안에서 타입이 좁혀진다.

## 작성 체크리스트 (MANDATORY)

쿼리/뮤테이션 코드를 작성하거나 수정한 뒤, 종료 전에 아래를 확인한다.

- [ ] 쿼리 옵션이 `src/queries/<도메인>.ts`에 `queryOptions()`/`infiniteQueryOptions()`로 정의되어 있고, 이름이 `<도메인 단수><대상>Options` 형식이다
- [ ] 컴포넌트에 `queryKey`/`queryFn` 인라인 정의가 없고 옵션을 호출만 한다
- [ ] `queryFn`이 참조하는 외부 변수가 전부 `queryKey`에 들어 있다
- [ ] `queryKey`가 `[도메인, 식별자, 파라미터]` 순의 배열이다
- [ ] 안정적인 데이터에는 `staleTime`을 명시했다(기본 0이면 매 마운트마다 재요청)
- [ ] `useMutation` 성공 후 `invalidateQueries` 또는 `setQueryData`로 캐시를 갱신한다
- [ ] 변이 콜백의 세 번째 인수 이름을 `onMutateResult`로 썼다(`context`는 마지막 인수)
- [ ] `QueryClient`가 `src/queries/client.ts`(Next.js는 `src/providers/query.tsx`의 `getQueryClient`)에만 있고 컴포넌트 안에 `new QueryClient()`가 없다
- [ ] Provider가 Vite는 `src/main.tsx`, Next.js는 루트 레이아웃에 한 번만 있고 기존 wrapper가 보존됐다
- [ ] `data`를 쓰기 전에 `isPending`(또는 `isLoading`) 분기를 먼저 처리한다
- [ ] `@tanstack/eslint-plugin-query`의 `flat/recommended`가 ESLint 설정의 `extends`에 들어 있다
- [ ] 다른 폴더의 파일은 `@/` 별칭으로 가져왔다
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과 (TypeScript 검사 포함)

## 함께 보는 스킬

| 필요한 것 | 스킬 |
|---|---|
| 프로젝트 기반 설정 (Tailwind, 경로 별칭, ESLint + Prettier) | `react-vite-scaffold` |
| 라우팅 (React Router Data Mode) | `react-router-use` |
| 클라이언트 전역 상태 (UI 상태, 폼 임시값, 인증 정보) | `zustand-use` |
| Next.js 프로젝트 기반 설정과 Provider 등록 | `react-next-scaffold` |
| Vite 프로젝트를 Next.js로 옮길 때 | `react-vite-to-next-migration` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
