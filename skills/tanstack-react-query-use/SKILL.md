---
name: tanstack-react-query-use
description: (heropy) Use when working with TanStack Query (React Query) in a React or Next.js project — fetching server data with useQuery, configuring staleTime/gcTime/queryKey caching, writing useMutation with optimistic updates, building infinite scroll with useInfiniteQuery, invalidating cache, integrating QueryClientProvider, or using ReactQueryDevtools. Trigger even if the user only says "data fetching", "캐싱", "서버 상태", "낙관적 업데이트" in a React context.
model: haiku
effort: max
metadata:
  author: ParkYoungWoong
  version: 1.0.0
---

# TanStack Query (React Query) 사용 가이드

> 참고 원문: https://www.heropy.dev/p/HZaKIE
> 기준 버전: `@tanstack/react-query` v5 (5.61+)

TanStack Query는 서버 데이터의 **가져오기 · 캐싱 · 동기화**를 담당하는 라이브러리다. 이 스킬은 v5 단일 객체 시그니처(`useQuery({ ... })`)를 전제로 한다.

## 결정 원칙

작업 유형에 따라 훅을 고른다:

| 상황 | 사용할 훅 |
|------|-----------|
| 데이터 조회(GET) | `useQuery` |
| 페이지네이션 / 무한 스크롤 | `useInfiniteQuery` |
| 생성·수정·삭제(POST/PUT/PATCH/DELETE) | `useMutation` |
| Next.js SSR + Suspense 경계 | `useSuspenseQuery` (Next.js 섹션 참조) |

`useState` + `useEffect` + `fetch` 조합으로 서버 데이터를 다루려는 코드를 봤다면, 거의 모든 경우 위 훅 중 하나로 대체하는 것이 맞다.

## 핵심 개념: 캐시와 신선도

TanStack Query는 **`queryKey`별로 응답을 캐시**하고, 캐시 데이터를 **Fresh / Stale** 두 상태로 관리한다.

- **Fresh** — `staleTime` 이내. 같은 `queryKey`로 다시 요청해도 네트워크를 타지 않고 캐시를 반환한다.
- **Stale** — `staleTime` 경과. 캐시는 즉시 반환하지만, 마운트·창 포커스·재연결 시점에 백그라운드 재요청을 시도한다.

`staleTime`의 기본값은 `0`이다. 즉, **명시하지 않으면 모든 데이터가 곧바로 상한다.** 자주 바뀌지 않는 데이터는 반드시 `staleTime`을 지정한다(예: 5분 → `1000 * 60 * 5`).

`gcTime`(기본 5분)은 비활성 캐시가 메모리에 남는 시간이다. `staleTime`보다 크게 두는 것이 일반적이다.

## 설치 및 Provider 구성

### Vite (CSR)

```bash
npm i @tanstack/react-query
npm i -D @tanstack/eslint-plugin-query
```

ESLint Flat Config(`eslint.config.js`)에 권장 규칙을 추가한다. 이 규칙들은 흔한 실수를 사전에 잡아준다.

```js
import tanstackQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  {
    extends: [
      tanstackQuery.configs.recommended
    ]
  }
])
```

권장 규칙의 의미:
- `@tanstack/query/exhaustive-deps` — `queryFn`에서 쓰는 외부 변수는 반드시 `queryKey`에 포함시킨다.
- `@tanstack/query/stable-query-client` — `QueryClient` 인스턴스를 컴포넌트 내부에서 매 렌더마다 새로 만들지 않는다.
- `@tanstack/query/no-rest-destructuring` — 쿼리 반환에서 `...rest` 분해는 변경 감지 최적화를 깬다.

앱 진입점에 `QueryClientProvider`를 단 한 번만 설치한다.

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
    </QueryClientProvider>
  )
}
```

### Next.js (App Router)

Next.js에서 Provider를 새로 세팅해야 한다면 `react-next-scaffold` 스킬의 8단계가 이미 다룬다. 사용 시점의 패턴(서버 렌더링과 Suspense 경계)은 [references/nextjs.md](references/nextjs.md) 참조.

## useQuery — 데이터 조회

### 기본 형태

```tsx
import { useQuery } from '@tanstack/react-query'

type User = { id: string; name: string; age: number }

export function UserList() {
  const { data, isPending, isError, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('https://api.example.com/users')
      if (!res.ok) throw new Error('요청 실패')
      const json = await res.json()
      return json.users
    },
    staleTime: 1000 * 60 * 5 // 5분
  })

  if (isPending) return <div>로딩 중…</div>
  if (isError) return <div>에러: {error.message}</div>
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### queryKey 규칙

`queryKey`는 캐시의 식별자다. 다음 규칙을 지킨다.

1. **배열 형태**로 작성한다. 순서가 다르면 다른 쿼리로 간주한다.
2. **`queryFn` 안에서 쓰는 모든 외부 변수**를 `queryKey`에 포함시킨다.
3. 객체 속성은 키 순서가 달라도 같은 쿼리로 본다(`{a:1,b:2}` === `{b:2,a:1}`).

```tsx
// 검색어가 바뀔 때마다 자동으로 다시 가져옴
useQuery({
  queryKey: ['movies', searchText],
  queryFn: () => fetch(`/api/movies?q=${searchText}`).then(r => r.json())
})
```

변수를 의도적으로 키에서 제외해야 한다면 그 한 줄만 ESLint를 비활성화한다 (`// eslint-disable-next-line @tanstack/query/exhaustive-deps`). 프로젝트 전역 비활성화는 권장하지 않는다.

### 자주 쓰는 옵션

| 옵션 | 언제 쓰는가 |
|------|-------------|
| `enabled: false` | 다른 데이터가 준비될 때까지 쿼리 실행을 막아야 할 때(예: 검색어가 비어있는 동안) |
| `staleTime` | 자주 바뀌지 않는 데이터에 캐시 수명을 부여할 때 |
| `select: data => ...` | 큰 응답에서 필요한 부분만 잘라 컴포넌트에 전달할 때 |
| `placeholderData: keepPreviousData` | 검색·필터처럼 키가 자주 바뀌어 화면 깜빡임이 보일 때 (v5 권장. `keepPreviousData`는 `@tanstack/react-query`에서 import) |
| `retry: n` | 실패 재시도 횟수(기본 3) |
| `refetchOnWindowFocus: false` | 창 포커스마다 재요청이 부담스러울 때 비활성화 |

전체 옵션·반환 속성 표는 [references/options.md](references/options.md) 참조.

### 상태 플래그 선택 가이드

| 보고 싶은 것 | 쓸 플래그 |
|--------------|-----------|
| 첫 번째 데이터 가져오는 중 (초기 스피너) | `isLoading` (= `isFetching && isPending`) |
| 현재 네트워크 요청이 진행 중 (재요청 포함) | `isFetching` |
| 캐시 데이터가 아예 없음 | `isPending` |
| 화면 데이터가 임시 데이터(placeholder)인지 | `isPlaceholderData` |

`isLoading`은 "첫 로딩"이고 `isFetching`은 "백그라운드 포함 모든 요청"이다. 새로고침 버튼을 누른 동안 스피너를 띄우려면 `isFetching`을 쓴다.

### 명령형으로 캐시 다루기

쿼리 결과를 컴포넌트 바깥(이벤트 핸들러, 다른 훅)에서 다루려면 `useQueryClient`를 쓴다.

```tsx
import { useQueryClient, queryOptions } from '@tanstack/react-query'

// 옵션을 한 번 정의해 재사용
const userListOptions = queryOptions<User[]>({
  queryKey: ['users'],
  queryFn: async () => (await fetch('/api/users')).json(),
  staleTime: 1000 * 60 * 5
})

function SomeComponent() {
  const queryClient = useQueryClient()

  // 캐시 즉시 조회(없으면 undefined)
  const cached = queryClient.getQueryData<User[]>(['users'])

  // staleTime 규칙대로 가져오기(캐시가 신선하면 캐시, 아니면 fetch)
  async function prefetch() {
    await queryClient.fetchQuery(userListOptions)
  }

  // 캐시 무효화 → 백그라운드 재요청 트리거
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }
}
```

자주 쓰는 메소드:

| 메소드 | 의미 |
|--------|------|
| `getQueryData(key)` | 캐시 즉시 조회. 없으면 `undefined`. |
| `ensureQueryData(opts)` | 캐시가 없으면 `fetchQuery`를 자동 호출. |
| `setQueryData(key, updater)` | 캐시 수동 갱신(낙관적 업데이트용). |
| `invalidateQueries({ queryKey })` | 일치 키들을 stale로 표시 → 다음 렌더에서 재요청. |
| `cancelQueries({ queryKey })` | 진행 중 요청을 취소(낙관적 업데이트 전 충돌 방지). |
| `removeQueries({ queryKey })` | 캐시에서 제거. |

`invalidateQueries`의 `queryKey`는 **prefix 매칭**이다. `['users']`로 무효화하면 `['users', 1]`, `['users', { filter: 'active' }]`도 모두 무효화된다.

## useMutation — 데이터 변경

### 기본 형태 + 캐시 갱신

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function AddUserForm() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (newUser: { name: string; age: number }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      if (!res.ok) throw new Error('생성 실패')
      return res.json()
    },
    onSuccess: () => {
      // 성공 후, 관련된 조회 쿼리를 무효화하여 최신 목록을 받게 한다.
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  return (
    <form onSubmit={e => { e.preventDefault(); mutate({ name: 'Neo', age: 22 }) }}>
      <button disabled={isPending}>{isPending ? '추가 중…' : '추가'}</button>
      {isError && <p>{error.message}</p>}
    </form>
  )
}
```

### 핵심 규칙

- **`mutationFn`은 실패 시 throw**해야 한다. resolve된 응답이지만 `!res.ok`인 경우도 직접 throw해야 `onError`/`error`가 동작한다.
- **`mutate(variables)`** 는 fire-and-forget(콜백 패턴), **`mutateAsync(variables)`** 는 await 가능한 Promise를 반환한다. async/await 흐름이 필요할 때만 후자를 쓴다.
- 성공 후 화면을 새로 그리고 싶다면 거의 항상 `onSuccess`에서 `queryClient.invalidateQueries`를 호출한다.

### 콜백 순서와 활용

`useMutation`의 라이프사이클:

```
mutate() 호출
  → onMutate(variables)           // 낙관적 업데이트는 여기서
    → mutationFn 실행
      → 성공 시 onSuccess(data, variables, context)
      → 실패 시 onError(error, variables, context)
  → onSettled(data|error, ...)    // 성공/실패 무관 항상
```

`onMutate`가 반환한 값은 `onError`/`onSuccess`/`onSettled`의 `context` 인자로 전달된다 — 낙관적 업데이트의 롤백 데이터를 여기에 담는 것이 표준 패턴이다.

**낙관적 업데이트(Optimistic Update)** 의 완전한 예제와 패턴은 [references/patterns.md](references/patterns.md) 참조.

## useInfiniteQuery — 페이지네이션 / 무한 스크롤

페이지 단위로 데이터를 누적해서 보여줄 때 쓴다. `useQuery`의 모든 옵션을 받고, 추가로 `initialPageParam`과 `getNextPageParam`(필수)을 지정한다.

```tsx
const {
  data,           // { pages: Page[], pageParams: TPageParam[] }
  hasNextPage,
  isFetching,
  fetchNextPage
} = useInfiniteQuery<Page>({
  queryKey: ['movies', queryText],
  queryFn: async ({ pageParam }) => {
    const res = await fetch(`/api/movies?q=${queryText}&page=${pageParam}`)
    return res.json()
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage, allPages) => {
    if (!lastPage.hasMore) return null  // 다음 페이지가 없으면 null/undefined
    return allPages.length + 1
  },
  enabled: Boolean(queryText)
})
```

렌더 시점에 주의할 점:
- `data`는 **단일 배열이 아니라 `{ pages, pageParams }`** 형태다. `data.pages.flatMap(...)`로 평탄화해서 그린다.
- '더 보기' 버튼은 `disabled={!hasNextPage || isFetching}`로 보호한다.

무한 스크롤(IntersectionObserver / `react-intersection-observer`) 패턴은 [references/patterns.md](references/patterns.md) 참조.

## 개발자 도구

개발 중에는 항상 ReactQueryDevtools를 켠다.

```bash
npm i @tanstack/react-query-devtools
```

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  {/* ... */}
  <ReactQueryDevtools />
</QueryClientProvider>
```

화면 우측 하단의 TanStack 로고 버튼으로 열고 닫는다. **무한 스크롤 디버깅 시에는 devtools를 일시적으로 닫는다** — devtools 자체가 페이지 안의 큰 요소라 IntersectionObserver 동작을 방해할 수 있다.

## Next.js App Router에서의 사용

Next.js SSR 환경에서는 추가로 다음을 고려한다:

- **QueryClient는 요청마다 새로 만든다.** 서버에서 단일 인스턴스를 공유하면 다른 사용자의 캐시가 섞인다.
- **서버 렌더링 단계에서 데이터를 미리 받으려면** `useSuspenseQuery`를 `<Suspense>` 안에서 쓴다.
- **Next.js 14 이하**는 `fetch`가 기본 캐싱돼 있어 `cache: 'no-store'`가 필요할 수 있다. **Next.js 15 이상**은 기본 비캐싱이라 옵션이 필요 없다.
- `useSuspenseQuery`는 `enabled`, `placeholderData`, `throwOnError` 옵션을 **지원하지 않는다** — 조건부 fetch가 필요하면 `useQuery`를 쓴다.

Provider 설정·`ReactQueryStreamedHydration`·전체 예제는 [references/nextjs.md](references/nextjs.md) 참조.

## 자주 마주치는 함정

- `queryKey`에 변수를 빠뜨려서 화면이 갱신되지 않는다 → ESLint `exhaustive-deps` 규칙을 켜둔다.
- `staleTime`을 안 줘서 모든 마운트가 새 요청을 친다 → 안정적인 데이터에는 `staleTime`을 명시한다.
- mutation 성공 후 화면이 안 바뀐다 → `onSuccess`에서 `invalidateQueries`를 호출했는지 확인한다.
- `QueryClient`를 컴포넌트 안에서 `new QueryClient()`로 만들고 있다 → 리렌더마다 캐시가 초기화된다. 모듈 스코프(또는 Next.js에서는 `getQueryClient` 헬퍼)에 둔다.
- `data`가 `undefined`라 화면이 깨진다 → `isPending` 또는 `isLoading` 분기를 먼저 검사한 후에 `data`를 쓴다.

## 추가 자료

- [references/options.md](references/options.md) — `useQuery`, `useInfiniteQuery`, `useMutation`의 전체 옵션·반환 속성 표.
- [references/patterns.md](references/patterns.md) — 낙관적 업데이트 전체 예제, 무한 스크롤 구현, `meta`를 통한 전역 에러 처리.
- [references/nextjs.md](references/nextjs.md) — Next.js App Router Provider 구성, `useSuspenseQuery` + `<Suspense>` SSR 패턴.
