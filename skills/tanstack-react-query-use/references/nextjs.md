# Next.js App Router에서의 TanStack Query

CSR에 없는 두 가지 고려사항이 있다.

1. 요청별 QueryClient 격리: 서버에서 단일 인스턴스를 공유하면 사용자 간 캐시가 섞인다.
2. 서버 렌더링 데이터의 재사용: 서버가 받은 데이터를 클라이언트 캐시에 이어 붙여야 첫 화면부터 데이터가 채워지고 추가 fetch를 피한다.

기본 패턴은 서버 컴포넌트에서 미리 가져오기(`prefetchQuery` + `dehydrate` + `<HydrationBoundary>`)다. 라우트마다 미리 가져오기를 쓰기 번거로우면 스트리밍(`ReactQueryStreamedHydration` + `useSuspenseQuery`)을 대안으로 쓴다.

> 아래 "Provider 구성"이 `src/providers/query.tsx`의 정본이다. `react-next-scaffold` 스킬의 8단계도 이 코드를 참조한다. 이미 Provider가 구성된 프로젝트라면 이 절을 건너뛰고 패턴 부분부터 보면 된다.

## 목차

- [Provider 구성](#provider-구성)
- [서버에서 미리 가져오기 (기본 패턴)](#서버에서-미리-가져오기-기본-패턴)
- [미리 가져오기 없이 처리하기 (스트리밍)](#미리-가져오기-없이-처리하기-스트리밍)
- [fetch 캐싱 옵션: Next.js 버전별](#fetch-캐싱-옵션-nextjs-버전별)
- [Suspense 경계 어디에 둘까](#suspense-경계-어디에-둘까)
- [흔한 문제](#흔한-문제)

## Provider 구성

```bash
{pm} add @tanstack/react-query @tanstack/react-query-devtools
{pm} add -D @tanstack/eslint-plugin-query
```

`<QueryClientProvider>`는 내부적으로 컨텍스트를 쓰므로 `'use client'`를 선언한 파일로 분리한다. 쿼리 클라이언트는 서버에서는 요청마다 새로 만들고(요청 사이에 데이터가 섞이지 않도록), 브라우저에서는 하나를 재사용한다(첫 렌더링 도중 컴포넌트가 대기해도 다시 만들어지지 않도록). 판별은 `environmentManager.isServer()`로 한다. `isServer` 상수는 5.91.0에서 폐기됐다.

```tsx
// src/providers/query.tsx
'use client'

import type { ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  environmentManager
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 클라이언트에서 곧바로 다시 요청하지 않도록 기본 신선도를 지정한다
        staleTime: 60 * 1000
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient() // 서버는 요청마다 새로 만든다
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient // 브라우저는 하나를 재사용한다
}

interface QueryProviderProps {
  children: ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

루트 레이아웃에서 `<QueryProvider>`를 쓴다. 기존 `layout.tsx`의 폰트, `metadata`, `className`은 그대로 두고 `<body>` 안의 `{children}`만 감싼다.

```tsx
// src/app/layout.tsx (기존 내용은 유지하고 {children}만 감싼다)
import QueryProvider from '@/providers/query'

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
```

핵심 포인트:

- 컴포넌트 안에서 `new QueryClient()`를 직접 만들지 않는다. 서스펜드 중 React가 컴포넌트를 버리고 다시 렌더할 때 캐시까지 초기화된다.
- `useState`로 감싸지 않는 이유도 같다. 헬퍼 함수(`getQueryClient`)로 모듈 스코프에서 관리한다.
- `<QueryProvider>`는 클라이언트 컴포넌트(`'use client'`)지만, 안에 든 자식은 서버 컴포넌트일 수 있다. 일반적인 App Router 규약대로 쓰면 된다.
- `ReactQueryDevtools`는 `NODE_ENV`가 `development`가 아니면 스스로 `null`을 반환하므로 조건부 렌더링이 필요 없다.

## 서버에서 미리 가져오기 (기본 패턴)

Provider만 구성하면 클라이언트 컴포넌트에서 `useQuery`를 쓸 수 있지만, 데이터를 브라우저에서 가져오기 시작하므로 서버가 내려주는 첫 화면은 비어 있다. 서버 컴포넌트에서 미리 가져오고(Prefetch) 그 결과를 `<HydrationBoundary>`로 클라이언트 캐시에 이어 붙이면 첫 화면부터 데이터를 채워 보낸다.

서버와 클라이언트가 같은 쿼리를 가리켜야 하므로 옵션은 `src/queries/<도메인>.ts`의 `queryOptions`를 공유한다. 쿼리 키나 쿼리 함수가 어긋나면 미리 가져온 데이터를 쓰지 못하고 클라이언트에서 다시 요청한다.

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
  }
})
```

서버 컴포넌트에서는 `new QueryClient()`로 쿼리 클라이언트를 직접 만들고, 데이터를 받은 뒤 `<HydrationBoundary>`로 감싼다. 이 클라이언트는 이 요청의 렌더링에만 쓰고 버리므로 `getQueryClient`를 쓰지 않는다.

```tsx
// src/app/users/page.tsx
import {
  QueryClient,
  dehydrate,
  HydrationBoundary
} from '@tanstack/react-query'
import { userListOptions } from '@/queries/users'
import UserList from '@/components/UserList'

export default async function UsersPage() {
  const queryClient = new QueryClient()

  // 데이터를 다 받은 후에 렌더링한다
  await queryClient.prefetchQuery(userListOptions)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  )
}
```

클라이언트 컴포넌트에서는 같은 옵션으로 `useQuery`를 쓴다. 데이터가 이미 캐시에 들어와 있어서 대기 없이 곧바로 출력된다.

```tsx
// src/components/UserList.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { userListOptions } from '@/queries/users'

export default function UserList() {
  const { data } = useQuery(userListOptions)
  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

- 미리 가져온 데이터가 있어도 `useQuery`의 `data` 타입은 `undefined`를 포함하므로 출력할 때 옵셔널 체이닝(`data?.`)이 필요하다.
- 여기서 `useSuspenseQuery` 대신 `useQuery`를 쓰는 이유: 나중에 미리 가져오기를 지우거나 빠뜨려도 `useQuery`는 클라이언트에서 데이터를 가져오는 정도로 끝난다.
- 서버 액션(Server Action)을 `queryFn`으로 쓰지 않는다. 클라이언트에서 호출한 서버 액션은 병렬이 아닌 직렬로 실행되어 쿼리가 대기 상태에서 멈추거나 아예 실행되지 않을 수 있다. 데이터 조회는 API 경로나 tRPC 같은 방식을 쓰고, 서버 액션은 변이(`useMutation`)에만 쓴다.

## 미리 가져오기 없이 처리하기 (스트리밍)

라우트마다 미리 가져오기를 작성하는 게 번거롭다면 스트리밍으로 처리한다. 이 방식에서만 experimental 패키지를 설치한다.

```bash
{pm} add @tanstack/react-query-next-experimental
```

Provider에서 자식을 `<ReactQueryStreamedHydration>`으로 감싼다. 나머지(`getQueryClient`, devtools)는 위 정본과 같다.

```tsx
// src/providers/query.tsx (스트리밍 버전, 일부)
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

export default function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

이제 서버 컴포넌트에서 미리 가져오지 않아도 클라이언트 컴포넌트의 `useSuspenseQuery`가 서버 렌더링 단계에서 데이터를 가져온다. 컴포넌트와 페이지를 다음과 같이 바꾼다.

```tsx
// src/components/UserList.tsx
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { userListOptions } from '@/queries/users'

export default function UserList() {
  const { data } = useSuspenseQuery(userListOptions)
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

```tsx
// src/app/users/page.tsx
import { Suspense } from 'react'
import UserList from '@/components/UserList'

export default function UsersPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <UserList />
    </Suspense>
  )
}
```

`useSuspenseQuery`의 동작 차이:

- `data`가 항상 정의된다. `isPending` 분기를 쓸 필요가 없다.
- 로딩 상태는 상위 `<Suspense>` 경계의 `fallback`이 처리한다.
- 다음 옵션을 지원하지 않는다: `enabled`, `placeholderData`, `throwOnError`. `queryFn`에 `skipToken`도 쓸 수 없다. 이 중 하나라도 필요하면 `useSuspenseQuery` 대신 일반 `useQuery`를 쓴다.
- 에러는 상위 Error Boundary가 받는다. App Router에서는 같은 경로의 `error.tsx`로 처리한다.
- `useSuspenseQuery`로는 쿼리 취소가 동작하지 않는다(`useSuspenseInfiniteQuery`, `useSuspenseQueries`도 동일).

## fetch 캐싱 옵션: Next.js 버전별

미리 가져올 때는 쿼리 함수의 `fetch`가 서버에서 실행된다.

| 버전 | `fetch` 기본 캐싱 | 권장 옵션 |
|------|-------------------|-----------|
| Next.js 14 이하 | 기본 캐싱(`force-cache`) | TanStack Query가 캐싱을 담당하므로 `{ cache: 'no-store' }`로 비활성화 |
| Next.js 15, 16 | 기본 비캐싱 | 별도 옵션 불필요 |

Next 14에서 위 옵션을 빼먹으면 데이터가 Next 캐시와 TanStack 캐시 두 곳에 갇혀 신선도 제어가 어긋난다.

## Suspense 경계 어디에 둘까

`<Suspense>`는 화면에서 "이 부분이 늦게 그려져도 괜찮은 단위"를 의미한다. 데이터 의존이 큰 컴포넌트 바로 위에 가깝게 둔다.

```tsx
// src/app/page.tsx (한 페이지에서 두 영역이 독립적으로 로드되게)
import { Suspense } from 'react'
import UserHeader from '@/components/UserHeader'
import Feed from '@/components/Feed'

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>헤더 로딩 중...</div>}>
        <UserHeader />
      </Suspense>
      <Suspense fallback={<div>피드 로딩 중...</div>}>
        <Feed />
      </Suspense>
    </>
  )
}
```

이렇게 두면 `UserHeader`의 데이터가 먼저 도착하면 헤더가 먼저 그려지고, `Feed`는 자기 데이터가 올 때까지만 fallback을 유지한다. 페이지 루트에 하나만 두면 둘 중 늦은 쪽에 맞춰 전체가 늦게 그려진다.

## 흔한 문제

- 하이드레이션 미스매치: 서버에서 fetch한 데이터와 클라이언트의 placeholder가 다른 경우. 미리 가져오기 패턴에서는 서버와 클라이언트가 같은 `queryOptions`를 쓰는지 확인하고, 클라이언트 전용 콘텐츠라면 `useEffect` 안에서 처리한다.
- 클라이언트에서 즉시 재요청: `staleTime: 0`(기본값)이면 SSR 후 클라이언트 마운트 직후 다시 fetch한다. Provider의 `defaultOptions`에 `staleTime: 60 * 1000` 정도를 두면 완화된다.
- 요청 간 캐시 누수: `getQueryClient`에서 `environmentManager.isServer()` 분기를 빼먹으면 서버 모듈 캐시에 `QueryClient`가 한 번 만들어지고 모든 요청이 공유한다. 반드시 서버는 새로 만들고 브라우저는 재사용하는 패턴을 지킨다.
- 서버 환경의 기본값 차이: 서버에서는 `gcTime`이 `Infinity`, `retry`가 `0`으로 동작한다. 서버에서 재시도가 필요하면 `retry`를 명시한다.
- 미리 가져온 데이터를 안 쓴다: 서버의 `prefetchQuery`와 클라이언트의 `useQuery`가 다른 옵션 객체(키나 함수가 다름)를 쓰고 있는지 확인한다.
