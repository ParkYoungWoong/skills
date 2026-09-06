# 자주 쓰는 패턴

SKILL.md에 골격만 적은 패턴들의 완전한 예제와 트레이드오프. 파일 위치와 이름은 SKILL.md의 핵심 원칙(옵션은 `src/queries/<도메인>.ts`, 컴포넌트는 호출만)을 따른다. 아래 예제의 `userListOptions`, `movieSearchOptions`는 SKILL.md에서 정의한 것이다.

## 목차

- [낙관적 업데이트(Optimistic Update)](#낙관적-업데이트optimistic-update)
- [무한 스크롤: IntersectionObserver](#무한-스크롤-intersectionobserver)
- [무한 스크롤: react-intersection-observer](#무한-스크롤-react-intersection-observer)
- [meta로 전역 에러 처리](#meta로-전역-에러-처리)
- [queryFn 안에서 throw로 에러 흘리기](#queryfn-안에서-throw로-에러-흘리기)
- [의존 쿼리 만들기: enabled와 skipToken](#의존-쿼리-만들기-enabled와-skiptoken)

## 낙관적 업데이트(Optimistic Update)

낙관적 업데이트는 서버 응답을 기다리지 않고 UI를 먼저 갱신해 체감 속도를 끌어올린다. 요청이 실패하면 이전 상태로 되돌려야 하므로 항상 한 세트로 구현한다.

표준 4단계:

1. `onMutate`에서 진행 중인 관련 쿼리를 `cancelQueries`로 취소(레이스 컨디션 방지).
2. 현재 캐시를 `getQueryData`로 백업.
3. `setQueryData`로 캐시를 낙관적으로 갱신.
4. 백업본을 반환 -> `onError`의 세 번째 인수 `onMutateResult`로 받아 롤백.

```tsx
// src/components/AddUser.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userListOptions, type User } from '@/queries/users'

export default function AddUser() {
  const queryClient = useQueryClient()

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (newUser: Omit<User, 'id'>) => {
      const res = await fetch('https://api.heropy.dev/v0/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      if (!res.ok) throw new Error('변이 실패')
      return res.json()
    },

    onMutate: async newUser => {
      // 1) 진행 중인 'users' 쿼리 취소
      await queryClient.cancelQueries({ queryKey: userListOptions.queryKey })

      // 2) 백업
      const previousUsers = queryClient.getQueryData(userListOptions.queryKey)

      // 3) 낙관적 갱신
      if (previousUsers) {
        queryClient.setQueryData(userListOptions.queryKey, [
          ...previousUsers,
          { ...newUser, id: crypto.randomUUID() }
        ])
      }

      // 4) 다른 콜백의 onMutateResult로 전달
      return { previousUsers }
    },

    onError: (_error, _newUser, onMutateResult) => {
      // 롤백
      if (onMutateResult?.previousUsers) {
        queryClient.setQueryData(
          userListOptions.queryKey,
          onMutateResult.previousUsers
        )
      }
    },

    onSettled: () => {
      // 성공/실패 모두, 서버 상태와 다시 동기화
      queryClient.invalidateQueries({ queryKey: userListOptions.queryKey })
    },

    retry: 3,
    retryDelay: 500
  })

  return (
    <button
      onClick={() => mutate({ name: 'Neo', age: 22 })}
      disabled={isPending}>
      {isPending ? '추가 중...' : '추가'}
      {error && <span>{error.message}</span>}
    </button>
  )
}
```

`onMutateResult`는 5.89.0부터의 이름이다(이전 이름 `context`). 마지막 인수로 오는 `context`는 `{ client, meta, mutationKey }`이므로 혼동하지 않는다.

### 어떤 mutation에 적용해야 하나

- 적용한다: 좋아요, 토글, 즐겨찾기, 단순 추가/삭제처럼 실패 가능성이 낮고 사용자 체감이 중요한 경우.
- 신중하게: 결제, 정산처럼 잘못된 낙관적 표시가 사용자에게 혼란을 주는 경우. 서버 응답 후에만 갱신하는 게 안전하다.

### onSuccess와 onSettled, 어디서 invalidate를 호출할까

- `onSuccess`: 성공 시에만 서버와 재동기화하고 싶을 때.
- `onSettled`: 성공, 실패 모두 무효화하고 싶을 때(낙관적 업데이트의 표준).

낙관적 업데이트를 한 경우, 실패 시에도 `invalidateQueries`를 한 번 더 돌려서 "롤백한 캐시가 진짜 서버 상태와 같은지" 확정하는 게 안전하다. 그래서 `onSettled` 사용을 권장한다.

## 무한 스크롤: IntersectionObserver

SKILL.md의 `movieSearchOptions`(`infiniteQueryOptions`)를 둔 뒤, 감지용 sentinel 요소를 만들어 화면 진입 시 `fetchNextPage`를 호출한다.

```tsx
// src/components/MovieList.tsx
import { Fragment, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { movieSearchOptions } from '@/queries/movies'

interface MovieListProps {
  queryText: string
}

export default function MovieList({ queryText }: MovieListProps) {
  const observerEl = useRef<HTMLDivElement | null>(null)

  const { data, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery(
    movieSearchOptions(queryText)
  )

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
      {isFetching && <div>로딩 중...</div>}
      <div
        ref={observerEl}
        style={{ display: isFetching ? 'none' : 'block', height: '20px' }}
      />
    </>
  )
}
```

핵심 포인트:

- sentinel 요소(`<div ref={observerEl}>`)의 높이가 `0`이면 트리거가 잘 안 된다. 최소 몇 픽셀은 둔다.
- `isFetching` 중에는 sentinel을 `display: none`으로 숨겨서 중복 호출을 막는다.
- ReactQueryDevtools가 켜져 있으면 페이지 하단을 가려 sentinel을 차단할 수 있다. 무한 스크롤 디버깅 중에는 devtools를 닫는다.

## 무한 스크롤: react-intersection-observer

위 패턴을 라이브러리로 줄이려면:

```bash
{pm} add react-intersection-observer
```

```tsx
// src/components/MovieList.tsx
import { Fragment, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { movieSearchOptions } from '@/queries/movies'

interface MovieListProps {
  queryText: string
}

export default function MovieList({ queryText }: MovieListProps) {
  const { ref, inView } = useInView()

  const { data, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery(
    movieSearchOptions(queryText)
  )

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <>
      {data?.pages.map((page, i) => (
        <Fragment key={i}>
          {page.Search?.map(movie => (
            <div key={movie.imdbID}>{movie.Title}</div>
          ))}
        </Fragment>
      ))}
      {isFetching && <div>로딩 중...</div>}
      <div
        ref={ref}
        style={{ display: isFetching ? 'none' : 'block', height: '20px' }}
      />
    </>
  )
}
```

`useRef` + `useEffect` + `IntersectionObserver` 보일러플레이트가 사라진다는 게 유일한 차이다. 의존성을 추가하기 싫다면 첫 번째 방식으로 충분하다.

## meta로 전역 에러 처리

쿼리마다 토스트 메시지를 다르게 띄우고 싶지만, 토스트 호출은 한 곳에서 일괄 관리하고 싶을 때 쓴다. `meta`에 메시지를 담아두고 `QueryCache`의 `onError`에서 꺼낸다. `QueryClient`를 만드는 곳은 `src/queries/client.ts` 하나뿐이다.

```ts
// src/queries/client.ts
import { QueryClient, QueryCache } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error, query) => {
      const message = query.meta?.errorMessage
      // 실제 프로젝트에서는 토스트 라이브러리 호출로 바꾼다
      if (typeof message === 'string') console.error(message)
    }
  })
})
```

```ts
// src/queries/movies.ts (일부)
export const movieListOptions = (searchText: string) =>
  queryOptions({
    queryKey: ['movies', searchText],
    queryFn: async (): Promise<Movie[]> => {
      const res = await fetch(`/api/movies?q=${searchText}`)
      return res.json()
    },
    meta: { errorMessage: '영화를 검색할 수 없어요!' }
  })
```

`MutationCache`에도 `onError`가 있어 변이 쪽도 같은 패턴이 가능하다.

> 타입 안정성을 더하려면 `declare module '@tanstack/react-query'`로 `Register` 인터페이스의 `queryMeta`를 확장해 `meta`의 타입을 좁힐 수 있다.

## queryFn 안에서 throw로 에러 흘리기

`fetch`는 4xx/5xx에도 reject되지 않고 resolve된 응답을 돌려준다. TanStack Query에 에러로 전달하려면 직접 throw해야 한다.

```ts
// src/queries/delay.ts
import { queryOptions } from '@tanstack/react-query'

export interface DelayResponse {
  message: string
  time: string
}

export const delayOptions = queryOptions({
  queryKey: ['delay'],
  queryFn: async (): Promise<DelayResponse> => {
    const res = await fetch('https://api.heropy.dev/v0/delay?t=1000')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (!data.time) throw new Error('비정상 응답')
    return data
  },
  retry: 1
})
```

기본적으로 `useQuery`는 실패 시 3회 재시도한다. 빠르게 실패시키고 싶으면 `retry: 1` 또는 `retry: false`를 명시한다. mutation은 기본 `0`이라 별도 지정이 필요 없다.

`Error` 객체의 타입을 좁히려면 `queryOptions<TQueryFnData, MyApiError>(...)` 식으로 2번째 제네릭에 커스텀 에러 타입을 지정한다.

## 의존 쿼리 만들기: enabled와 skipToken

다른 쿼리나 입력이 준비되어야 fetch가 의미 있는 경우에 쓴다. `enabled`는 쿼리 함수와 별개의 옵션이라 함수 안에서 변수 타입이 좁혀지지 않으므로 `authorId!` 단언이 필요하다.

```ts
// src/queries/posts.ts (enabled 버전, 일부)
export const postListOptions = (authorId?: string) =>
  queryOptions({
    queryKey: ['posts', authorId],
    queryFn: () => fetchPosts(authorId!), // 단언(!)이 없으면 타입 오류
    enabled: Boolean(authorId)
  })
```

`skipToken`은 조건문의 참인 분기 안에서 쿼리 함수를 쓰므로 단언 없이 `string`으로 좁혀진다. 실행하지 않는 동작 자체는 `enabled: false`와 같다. 이 형태를 기본으로 쓴다.

```ts
// src/queries/posts.ts
import { queryOptions, skipToken } from '@tanstack/react-query'

export interface Post {
  id: string
  title: string
}

export const postListOptions = (authorId?: string) =>
  queryOptions({
    // 배열 자리의 undefined는 null로 직렬화된다
    queryKey: ['posts', authorId],
    queryFn: authorId
      ? async (): Promise<Post[]> => {
          const res = await fetch(
            `https://api.heropy.dev/v0/posts?author=${authorId}`
          )
          return res.json()
        }
      : skipToken
  })
```

```tsx
// src/components/UserPosts.tsx
import { useQuery } from '@tanstack/react-query'
import { userDetailOptions } from '@/queries/users'
import { postListOptions } from '@/queries/posts'

interface UserPostsProps {
  userId: string
}

export default function UserPosts({ userId }: UserPostsProps) {
  const { data: user } = useQuery(userDetailOptions(userId))
  // user가 준비되기 전에는 skipToken이라 요청하지 않는다
  const { data: posts, isLoading } = useQuery(postListOptions(user?.id))

  if (isLoading) return <div>로딩 중...</div>
  return (
    <ul>
      {posts?.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

`enabled: false`이거나 `skipToken`인 동안 `isPending: true`로 시작하므로, 화면 분기에서 "아직 안 받음"과 "받는 중"을 구별하려면 `isPending` 대신 `isLoading`을 쓰고, 현재 활성 여부는 `isEnabled`로 확인한다. `useSuspenseQuery`의 `queryFn`은 `skipToken`을 받지 않는다.
