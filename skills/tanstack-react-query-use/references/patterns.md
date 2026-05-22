# 자주 쓰는 패턴

SKILL.md에 골격만 적은 패턴들의 완전한 예제와 트레이드오프.

## 목차

- [낙관적 업데이트(Optimistic Update)](#낙관적-업데이트optimistic-update)
- [무한 스크롤 — IntersectionObserver](#무한-스크롤--intersectionobserver)
- [무한 스크롤 — react-intersection-observer](#무한-스크롤--react-intersection-observer)
- [meta로 전역 에러 처리](#meta로-전역-에러-처리)
- [queryFn 안에서 throw로 에러 흘리기](#queryfn-안에서-throw로-에러-흘리기)
- [enabled로 의존 쿼리 만들기](#enabled로-의존-쿼리-만들기)

---

## 낙관적 업데이트(Optimistic Update)

낙관적 업데이트는 서버 응답을 기다리지 않고 UI를 먼저 갱신해 체감 속도를 끌어올린다. **요청이 실패하면 이전 상태로 되돌려야** 하므로 항상 한 세트로 구현한다.

표준 4단계:

1. `onMutate`에서 진행 중인 관련 쿼리를 `cancelQueries`로 취소(레이스 컨디션 방지).
2. 현재 캐시를 `getQueryData`로 백업.
3. `setQueryData`로 캐시를 낙관적으로 갱신.
4. 백업본을 `context`로 반환 → `onError`에서 받아 롤백.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

type User = { id?: string; name: string; age: number }
type Users = User[]

export function AddUser() {
  const queryClient = useQueryClient()

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (newUser: User) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      if (!res.ok) throw new Error('변이 실패')
      return res.json()
    },

    onMutate: async newUser => {
      // 1) 진행 중인 'users' 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['users'] })

      // 2) 백업
      const previousUsers = queryClient.getQueryData<Users>(['users'])

      // 3) 낙관적 갱신
      if (previousUsers) {
        queryClient.setQueryData<Users>(['users'], [...previousUsers, newUser])
      }

      // 4) 다른 콜백으로 백업 전달
      return { previousUsers }
    },

    onError: (_err, _newUser, context) => {
      // 롤백
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers)
      }
    },

    onSettled: () => {
      // 성공/실패 모두, 서버 상태와 다시 동기화
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },

    retry: 3,
    retryDelay: 500
  })

  return (
    <button onClick={() => mutate({ name: 'Neo', age: 22 })} disabled={isPending}>
      {isPending ? '추가 중…' : '추가'}
      {error && <span>{error.message}</span>}
    </button>
  )
}
```

### 어떤 mutation에 적용해야 하나

- **적용한다** — 좋아요, 토글, 즐겨찾기, 단순 추가/삭제처럼 실패 가능성이 낮고 사용자 체감이 중요한 경우.
- **신중하게** — 결제, 정산처럼 잘못된 낙관적 표시가 사용자에게 혼란을 주는 경우. 서버 응답 후에만 갱신하는 게 안전하다.

### onSuccess와 onSettled, 어디서 invalidate를 호출할까

- **`onSuccess`**: 성공 시에만 서버와 재동기화하고 싶을 때.
- **`onSettled`**: 성공·실패 모두 무효화하고 싶을 때(낙관적 업데이트의 표준).

낙관적 업데이트를 한 경우, 실패 시에도 `invalidateQueries`를 한 번 더 돌려서 "롤백한 캐시가 진짜 서버 상태와 같은지" 확정하는 게 안전하다. 그래서 `onSettled` 사용을 권장한다.

---

## 무한 스크롤 — IntersectionObserver

먼저 SKILL.md의 `useInfiniteQuery` 기본 형태를 둔 뒤, 감지용 sentinel 요소를 만들어 화면 진입 시 `fetchNextPage`를 호출한다.

```tsx
import { Fragment, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

interface Page {
  Search: Movie[]
  totalResults: string
  Response: 'True' | 'False'
}
interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

export function MovieList({ queryText }: { queryText: string }) {
  const observerEl = useRef<HTMLDivElement | null>(null)

  const { data, isFetching, hasNextPage, fetchNextPage } =
    useInfiniteQuery<Page>({
      queryKey: ['movies', queryText],
      queryFn: async ({ pageParam }) => {
        const res = await fetch(`https://omdbapi.com/?apikey=KEY&s=${queryText}&page=${pageParam}`)
        return res.json()
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        const maxPage = Math.ceil(Number.parseInt(pages[0].totalResults, 10) / 10)
        if (lastPage.Response === 'True' && pages.length < maxPage) {
          return pages.length + 1
        }
        return null
      },
      enabled: Boolean(queryText),
      staleTime: 1000 * 60 * 60
    })

  useEffect(() => {
    const el = observerEl.current
    if (!el) return

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, fetchNextPage])

  return (
    <>
      {data?.pages.map((page, i) => (
        <Fragment key={i}>
          {page.Search?.map(movie => (
            <div key={movie.imdbID}>{movie.Title}</div>
          ))}
        </Fragment>
      ))}
      {isFetching && <div>로딩 중…</div>}
      <div
        ref={observerEl}
        style={{ display: isFetching ? 'none' : 'block', height: '20px' }}
      />
    </>
  )
}
```

핵심 포인트:
- sentinel 요소(`<div ref={observerEl}>`)의 높이가 `0`이면 트리거가 잘 안 된다 — 최소 몇 픽셀은 둔다.
- `isFetching` 중에는 sentinel을 `display: none`으로 숨겨서 중복 호출을 막는다.
- ReactQueryDevtools가 켜져 있으면 페이지 하단을 가려 sentinel을 차단할 수 있다. 무한 스크롤 디버깅 중에는 devtools를 닫는다.

## 무한 스크롤 — react-intersection-observer

위 패턴을 라이브러리로 줄이려면:

```bash
npm i react-intersection-observer
```

```tsx
import { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

export function MovieList({ queryText }: { queryText: string }) {
  const { ref, inView } = useInView()

  const { data, isFetching, hasNextPage, fetchNextPage } =
    useInfiniteQuery<Page>({
      /* …동일… */
    })

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <>
      {/* …목록 렌더… */}
      {isFetching && <div>로딩 중…</div>}
      <div
        ref={ref}
        style={{ display: isFetching ? 'none' : 'block', height: '20px' }}
      />
    </>
  )
}
```

`useRef` + `useEffect` + `IntersectionObserver` 보일러플레이트가 사라진다는 게 유일한 차이다. 의존성을 추가하기 싫다면 첫 번째 방식으로 충분하다.

---

## meta로 전역 에러 처리

쿼리마다 토스트 메시지를 다르게 띄우고 싶지만, 토스트 호출은 한 곳에서 일괄 관리하고 싶을 때 쓴다. `meta`에 메시지를 담아두고 `QueryCache`의 `onError`에서 꺼낸다.

```tsx
// src/main.tsx (Provider 설정 부분)
import {
  QueryClient,
  QueryClientProvider,
  QueryCache
} from '@tanstack/react-query'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error, query) => {
      const msg = (query.meta as { errorMessage?: string } | undefined)?.errorMessage
      if (msg) toast.error(msg)  // 토스트 라이브러리는 자유롭게
    }
  })
})
```

```tsx
// 쿼리 호출부
useQuery<Movie[]>({
  queryKey: ['movies', searchText],
  queryFn,
  meta: { errorMessage: '영화를 검색할 수 없어요!' }
})
```

`MutationCache`에도 `onError`가 있어 변이 쪽도 같은 패턴이 가능하다.

> 타입 안정성을 더하려면 `declare module '@tanstack/react-query'`로 `meta`의 타입을 좁힐 수 있다. v5의 `Register` 인터페이스 확장 패턴 참조.

---

## queryFn 안에서 throw로 에러 흘리기

`fetch`는 4xx/5xx에도 reject되지 않고 resolve된 응답을 돌려준다. **TanStack Query에 에러로 전달하려면 직접 throw**해야 한다.

```tsx
useQuery({
  queryKey: ['delay'],
  queryFn: async () => {
    const res = await fetch('https://api.example.com/users')
    if (!res.ok) throw new Error('HTTP ' + res.status)

    const data = await res.json()
    if (!data.users) throw new Error('비정상 응답')
    return data
  },
  retry: 1
})
```

기본적으로 `useQuery`는 실패 시 3회 재시도한다. 빠르게 실패시키고 싶으면 `retry: 1` 또는 `retry: false`를 명시한다. mutation은 기본 `0`이라 별도 지정이 필요 없다.

`Error` 객체의 타입을 좁히려면 `useQuery<TQueryFnData, MyApiError>(...)` 식으로 2번째 제네릭에 커스텀 에러 타입을 박는다.

---

## enabled로 의존 쿼리 만들기

다른 쿼리/입력이 준비되어야 fetch가 의미 있는 경우에 쓴다.

```tsx
function UserProfile({ userId }: { userId?: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    enabled: Boolean(userId)  // userId가 들어오기 전엔 호출 안 함
  })

  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetch(`/api/posts?author=${user?.id}`).then(r => r.json()),
    enabled: Boolean(user?.id)  // 사용자 정보 먼저 받은 뒤에만 호출
  })

  return /* … */
}
```

`enabled: false`인 동안 `isPending: true`로 시작하므로, 화면 분기에서 "아직 안 받음"과 "받는 중"을 구별하고 싶다면 `isFetching`을 함께 본다.
