# Next.js (App Router)에서의 TanStack Query

CSR에 없는 두 가지 고려사항이 있다.

1. **요청별 QueryClient 격리** — 서버에서 단일 인스턴스를 공유하면 사용자 간 캐시가 섞인다.
2. **SSR/Streaming 통합** — 서버 렌더링 단계에서 받은 데이터를 클라이언트에서 그대로 재수화(hydrate)해야 추가 fetch를 피할 수 있다.

`@tanstack/react-query-next-experimental`이 이 두 가지를 처리한다.

> 아래 "Provider 구성"이 `src/providers/query.tsx`의 **정본**이다. `react-next-scaffold` 스킬의 8단계도 이 코드를 참조한다. 이미 Provider가 구성된 프로젝트라면 이 절을 건너뛰고 패턴 부분부터 보면 된다.

---

## Provider 구성

```bash
{pm} i @tanstack/react-query @tanstack/react-query-next-experimental
{pm} i -D @tanstack/eslint-plugin-query
```

```tsx
// src/providers/query.tsx
'use client'

import {
  QueryClient,
  QueryClientProvider,
  isServer
} from '@tanstack/react-query'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 클라이언트의 즉시 재요청을 방지하기 위한 SSR 기본 staleTime
        staleTime: 60 * 1000
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // 서버: 매 요청마다 새 인스턴스
    return makeQueryClient()
  }
  // 브라우저: 한 번만 만들고 재사용
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
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

```tsx
// src/app/layout.tsx
import { QueryProvider } from '@/providers/query'

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
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
- 컴포넌트 안에서 `new QueryClient()`를 직접 만들지 않는다 — 서스펜드 중 React가 컴포넌트를 버리고 다시 렌더할 때 캐시까지 초기화된다.
- `useState`로 감싸지 않는 이유도 같다. 헬퍼 함수(`getQueryClient`)로 모듈 스코프에서 관리한다.
- `<QueryProvider>`는 클라이언트 컴포넌트(`'use client'`)지만, 안에 든 자식은 서버 컴포넌트일 수 있다. 일반적인 App Router 규약대로 쓰면 된다.

---

## useSuspenseQuery로 SSR 데이터 받기

```tsx
// src/components/DelayedData.tsx
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

type ResponseValue = { message: string; time: string }

export default function DelayedData() {
  const { data } = useSuspenseQuery<ResponseValue>({
    queryKey: ['delay'],
    queryFn: async () => {
      const res = await fetch('https://api.example.com/delay?t=1000', {
        // Next 14 이하: cache: 'no-store' 가 필요할 수 있음
        // Next 15 이상: 기본이 no-store
      })
      return res.json()
    },
    staleTime: 1000 * 10
  })

  // data는 항상 정의됨 (Suspense가 pending을 처리)
  return <div>{data.time}</div>
}
```

```tsx
// src/app/page.tsx
import { Suspense } from 'react'
import DelayedData from '@/components/DelayedData'

export default function Page() {
  return (
    <Suspense fallback={<div>loading…</div>}>
      <DelayedData />
    </Suspense>
  )
}
```

`useSuspenseQuery`의 동작 차이:

- `data`가 **항상 정의된다.** `isPending` 분기를 쓸 필요가 없다.
- 로딩 상태는 **상위 `<Suspense>` 경계의 `fallback`** 이 처리한다.
- 다음 옵션을 **지원하지 않는다**: `enabled`, `placeholderData`, `throwOnError`. 이 중 하나라도 필요하면 `useSuspenseQuery` 대신 일반 `useQuery`를 쓴다.
- 에러는 **상위 Error Boundary**가 받는다. App Router에서는 같은 경로의 `error.tsx`로 처리한다.
- `useSuspenseQuery`로는 **쿼리 취소가 동작하지 않는다.** (`useSuspenseInfiniteQuery`, `useSuspenseQueries`도 동일.)

---

## fetch 캐싱 옵션 — Next 14 vs 15

| 버전 | `fetch` 기본 캐싱 | 권장 옵션 |
|------|-------------------|-----------|
| Next.js 14 이하 | 기본 캐싱(`force-cache`) | TanStack Query가 캐싱을 담당하므로 `{ cache: 'no-store' }`로 비활성화 |
| Next.js 15 이상 | 기본 비캐싱 | 별도 옵션 불필요 |

Next 14에서 위 옵션을 빼먹으면 데이터가 Next 캐시와 TanStack 캐시 두 곳에 갇혀 신선도 제어가 어긋난다.

---

## Suspense 경계 어디에 둘까

`<Suspense>`는 화면에서 "이 부분이 늦게 그려져도 괜찮은 단위"를 의미한다. 데이터 의존이 큰 컴포넌트 바로 위에 가깝게 둔다.

```tsx
// 한 페이지에서 두 영역이 독립적으로 로드되게
export default function Page() {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader />
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </>
  )
}
```

이렇게 두면 `UserHeader`의 데이터가 먼저 도착하면 헤더가 먼저 그려지고, `Feed`는 자기 데이터가 올 때까지만 fallback을 유지한다. 페이지 루트에 하나만 두면 둘 중 늦은 쪽에 맞춰 전체가 늦게 그려진다.

---

## 흔한 문제

- **하이드레이션 미스매치** — 서버에서 fetch한 데이터와 클라이언트의 placeholder가 다른 경우. `useSuspenseQuery`로 통일하거나, 클라이언트 전용 콘텐츠라면 `useEffect` 안에서 처리한다.
- **클라이언트에서 즉시 재요청** — `staleTime: 0`(기본값)이면 SSR 후 클라이언트 마운트 직후 다시 fetch한다. Provider에 `staleTime: 60 * 1000` 정도를 기본값으로 두면 완화된다.
- **요청 간 캐시 누수** — `getQueryClient`에서 `isServer` 분기를 빼먹으면 서버 모듈 캐시에 `QueryClient`가 한 번 만들어지고 모든 요청이 공유한다. 반드시 `isServer ? new QueryClient() : (browserQueryClient ??= new QueryClient())` 패턴을 지킨다.
