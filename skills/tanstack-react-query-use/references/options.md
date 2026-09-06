# useQuery, useInfiniteQuery, useMutation 옵션과 반환 레퍼런스

`@tanstack/react-query` 5.102.8 기준. SKILL.md의 "자주 쓰는 옵션"에서 다루지 않은 항목까지 모두 포함한다. 기본값 칸의 `없음`은 기본값이 정의되지 않았다는 뜻이다.

## 목차

- [useQuery 옵션](#usequery-옵션)
- [useQuery 반환 속성](#usequery-반환-속성)
- [useInfiniteQuery 추가 옵션](#useinfinitequery-추가-옵션)
- [useInfiniteQuery 추가 반환 속성](#useinfinitequery-추가-반환-속성)
- [useMutation 옵션](#usemutation-옵션)
- [useMutation 반환 속성](#usemutation-반환-속성)
- [useQuery 옵션 심화 노트](#usequery-옵션-심화-노트)

## useQuery 옵션

알파벳 순.

| 옵션 | 설명 | 기본값 | 타입 |
|------|------|--------|------|
| `enabled` | 쿼리 자동 실행 여부. `false`면 대기(`pending`) 상태로 시작. | `true` | `boolean \| (query: Query) => boolean` |
| `gcTime` | 비활성 캐시가 메모리에 남는 시간(ms). 서버 환경에서는 `Infinity`. | `5 * 60 * 1000` | `number \| Infinity` |
| `initialData` | 쿼리가 생성되거나 캐시되기 전에 쓸 초기 데이터. | 없음 | `TData \| () => TData` |
| `initialDataUpdatedAt` | 초기 데이터의 마지막 업데이트 시간. | 없음 | `number \| (() => number \| undefined)` |
| `meta` | 쿼리에 부착하는 부가 정보. `QueryCache`의 `onError`에서 접근 가능. | 없음 | `Record<string, unknown>` |
| `networkMode` | 네트워크 모드. | `'online'` | `'online' \| 'always' \| 'offlineFirst'` |
| `notifyOnChangeProps` | 리렌더 트리거 대상 반환 속성 목록. 예: `['data', 'error']`. | 컴포넌트에서 접근한 속성 | `string[] \| 'all' \| (() => string[] \| 'all')` |
| `placeholderData` | 대기 상태에서 임시로 쓸 데이터. 함수에는 이전 값과 이전 쿼리가 전달된다. | 없음 | `TData \| (previousValue, previousQuery) => TData` |
| `queryFn` | 데이터를 가져오는 비동기 함수. 데이터 반환 또는 throw 필수. `skipToken`을 주면 실행하지 않는다. | 없음 | `(context: QueryFunctionContext) => Promise<TData> \| SkipToken` |
| `queryKey` | 고유 식별자(배열). 필수. | 없음 | `readonly unknown[]` |
| `queryKeyHashFn` | 쿼리 키를 해시하는 함수. | 없음 | `(queryKey: QueryKey) => string` |
| `refetchInterval` | 자동 갱신 간격(ms). | `false` | `number \| false \| ((query) => number \| false \| undefined)` |
| `refetchIntervalInBackground` | 백그라운드 자동 갱신 여부. | `false` | `boolean` |
| `refetchOnMount` | 마운트 시 데이터 갱신 여부. `true`면 상한 경우만, `'always'`면 항상. | `true` | `boolean \| 'always' \| ((query) => ...)` |
| `refetchOnReconnect` | 네트워크 재연결 시 갱신 여부. | `true` | `boolean \| 'always' \| ((query) => ...)` |
| `refetchOnWindowFocus` | 창 포커스 시 갱신 여부. | `true` | `boolean \| 'always' \| ((query) => ...)` |
| `retry` | 실패 재시도 횟수. 서버 환경에서는 `0`. | `3` | `boolean \| number \| ((failureCount, error) => boolean)` |
| `retryDelay` | 재시도 간격(ms). 기본값은 재시도할수록 늘어나는 지수 백오프. | `Math.min(1000 * 2 ** 실패횟수, 30000)` | `number \| ((attempt, error) => number)` |
| `retryOnMount` | 마운트 시 재시도 여부. | `true` | `boolean` |
| `select` | 가져온 데이터를 변형해서 반환. | 없음 | `(data: TData) => unknown` |
| `staleTime` | 데이터가 상하는 시간(ms). `'static'`은 절대 상하지 않고 무효화해도 다시 가져오지 않는다. | `0` | `number \| 'static' \| ((query) => number \| 'static')` |
| `structuralSharing` | 변경되지 않은 부분의 참조 재사용으로 불필요한 리렌더 방지. | `true` | `boolean \| ((oldData, newData) => unknown)` |
| `subscribed` | 쿼리 캐시 구독 여부. `false`면 스스로 `queryFn`을 실행하지 않고, 다른 곳에서 갱신된 캐시도 전달받지 않는다. | `true` | `boolean` |
| `throwOnError` | 실패 시 오류를 던질지 여부. | `false` | `boolean \| ((error, query) => boolean)` |

> `queryClient`는 옵션 객체의 속성이 아니라 `useQuery(옵션, 쿼리클라이언트)`의 두 번째 인수다. 옵션에 넣으면 타입 오류가 난다. `<QueryClientProvider>`의 클라이언트 대신 다른 클라이언트를 쓸 때만 지정한다.

## useQuery 반환 속성

알파벳 순.

| 속성 | 설명 | 타입 |
|------|------|------|
| `data` | 성공적으로 가져온 데이터. `initialData`가 없으면 첫 렌더링에서 `undefined`. | `TData \| undefined` |
| `dataUpdatedAt` | 최근 성공 시각(유닉스 타임스탬프). | `number` |
| `error` | 오류 객체. 없으면 `null`. | `null \| TError` |
| `errorUpdateCount` | 전체 오류 횟수. | `number` |
| `errorUpdatedAt` | 최근 오류 시각. | `number` |
| `failureCount` | 실패 횟수. 성공 시 `0`으로 리셋. | `number` |
| `failureReason` | 마지막 실패 사유. 성공 시 `null`로 리셋. | `null \| TError` |
| `fetchStatus` | `'fetching'` / `'paused'` / `'idle'`. | `'fetching' \| 'paused' \| 'idle'` |
| `isEnabled` | 쿼리가 활성 상태인지. 함수로 지정한 `enabled` 옵션의 계산 결과 확인에 쓴다. | `boolean` |
| `isError` | 오류 발생 여부. | `boolean` |
| `isFetched` | 첫 fetch 완료 여부. | `boolean` |
| `isFetchedAfterMount` | 마운트 후 fetch 완료 여부(마운트 전 캐시를 숨길 때 유용). | `boolean` |
| `isFetching` | 현재 fetch 진행 중(초기, 재요청 모두 포함). | `boolean` |
| `isLoading` | 첫 fetch가 진행 중. `isFetching && isPending`과 동치. | `boolean` |
| `isLoadingError` | 첫 fetch 도중 실패했는지. | `boolean` |
| `isPaused` | fetch가 일시 중단됐는지. | `boolean` |
| `isPending` | 캐시도 없고 아직 완료되지 않은 상태. | `boolean` |
| `isPlaceholderData` | 표시 데이터가 placeholder인지. | `boolean` |
| `isRefetchError` | 재요청 도중 실패했는지. | `boolean` |
| `isRefetching` | 백그라운드 재요청 중. `isFetching && !isPending`과 동치. | `boolean` |
| `isStale` | 데이터가 stale인지. `enabled`가 `false`이거나 `staleTime`이 `'static'`이면 항상 `false`. | `boolean` |
| `isSuccess` | 성공 여부. | `boolean` |
| `refetch` | 강제 재요청. `throwOnError: true`일 때만 오류를 던진다. | `(opts?: { throwOnError, cancelRefetch }) => Promise<UseQueryResult>` |
| `status` | `'pending' \| 'error' \| 'success'`. | `'pending' \| 'error' \| 'success'` |

## useInfiniteQuery 추가 옵션

`useQuery`의 모든 옵션을 그대로 받으며, 다음이 추가된다. ESLint 규칙 `infinite-query-property-order`에 맞춰 `queryFn`, `getPreviousPageParam`, `getNextPageParam` 순서로 쓴다.

| 옵션 | 설명 | 기본값 | 타입 |
|------|------|--------|------|
| `initialPageParam` | 첫 페이지의 파라미터. 필수. | 없음 | `TPageParam` |
| `getNextPageParam` | 다음 페이지의 파라미터를 반환. 필수. 없으면 `undefined` 또는 `null` 반환. 반환값이 `hasNextPage`를 결정한다. | 없음 | `(lastPage, allPages, lastPageParam, allPageParams) => TPageParam \| undefined \| null` |
| `getPreviousPageParam` | 이전 페이지 파라미터 반환. 양방향 페이징 시. 지정하지 않으면 `hasPreviousPage`는 항상 `false`. | 없음 | `(firstPage, allPages, firstPageParam, allPageParams) => TPageParam \| undefined \| null` |
| `maxPages` | 저장 및 출력할 최대 페이지 수. `undefined`나 `0`이면 제한 없음. `0`보다 크면 `getNextPageParam`과 `getPreviousPageParam`을 모두 정의해야 한다. | `undefined` | `number` |

## useInfiniteQuery 추가 반환 속성

| 속성 | 설명 | 타입 |
|------|------|------|
| `fetchNextPage` | 다음 페이지 fetch. | `(opts?) => Promise<UseInfiniteQueryResult>` |
| `fetchPreviousPage` | 이전 페이지 fetch. | `(opts?) => Promise<UseInfiniteQueryResult>` |
| `hasNextPage` | 다음 페이지가 있는지. | `boolean` |
| `hasPreviousPage` | 이전 페이지가 있는지. | `boolean` |
| `isFetchNextPageError` | 다음 페이지를 가져오다가 실패했는지. | `boolean` |
| `isFetchPreviousPageError` | 이전 페이지를 가져오다가 실패했는지. | `boolean` |
| `isFetchingNextPage` | 다음 페이지 fetch 중. | `boolean` |
| `isFetchingPreviousPage` | 이전 페이지 fetch 중. | `boolean` |

`data`는 `{ pages: TPage[], pageParams: TPageParam[] }` 형태로 반환된다. 평탄화해서 그리려면 `data.pages.flatMap(page => page.items)` 패턴을 쓴다.

## useMutation 옵션

5.89.0부터 콜백 시그니처가 바뀌었다. `onMutate`의 반환값은 `onMutateResult` 인수로 전달되고(이전 이름은 `context`), 모든 콜백의 마지막 인수로 `{ client, meta, mutationKey }` 형태의 `MutationFunctionContext`가 추가됐다. ESLint 규칙 `mutation-property-order`에 맞춰 `onMutate`, `onError`, `onSettled` 순서로 쓴다.

| 옵션 | 설명 | 기본값 | 타입 |
|------|------|--------|------|
| `gcTime` | 비활성 변이 캐시 보관 시간(ms). 서버 환경에서는 `Infinity`. | `5 * 60 * 1000` | `number \| Infinity` |
| `meta` | 부가 정보. `MutationCache`의 `onError`에서 접근 가능. | 없음 | `Record<string, unknown>` |
| `mutationFn` | 실행할 비동기 변이 함수. 필수. | 없음 | `(variables: TVariables, context: MutationFunctionContext) => Promise<TData>` |
| `mutationKey` | `setMutationDefaults`로 지정한 기본값 상속용 키. | 없음 | `readonly unknown[]` |
| `networkMode` | 네트워크 모드. | `'online'` | `'online' \| 'always' \| 'offlineFirst'` |
| `onError` | 변이 실패 시 호출. | 없음 | `(error, variables, onMutateResult \| undefined, context) => Promise<unknown> \| unknown` |
| `onMutate` | 변이 실행 직전 호출. 반환값이 다른 콜백의 `onMutateResult`로 전달된다. | 없음 | `(variables, context) => Promise<TOnMutateResult> \| TOnMutateResult` |
| `onSettled` | 성공/실패 무관 항상 호출. | 없음 | `(data \| undefined, error \| null, variables, onMutateResult \| undefined, context) => Promise<unknown> \| unknown` |
| `onSuccess` | 변이 성공 시 호출. | 없음 | `(data, variables, onMutateResult, context) => Promise<unknown> \| unknown` |
| `retry` | 실패 재시도 횟수. | `0` | `boolean \| number \| ((failureCount, error) => boolean)` |
| `retryDelay` | 재시도 간격(ms). | `Math.min(1000 * 2 ** 실패횟수, 30000)` | `number \| ((attempt, error) => number)` |
| `scope` | 동시 실행 범위. 같은 `id`의 변이는 직렬 실행. | 없음 | `{ id: string }` |
| `throwOnError` | 실패 시 throw 여부. | `undefined` | `boolean \| ((error) => boolean)` |

> `queryClient`는 옵션 객체의 속성이 아니라 `useMutation(옵션, 쿼리클라이언트)`의 두 번째 인수다. 옵션에 넣으면 타입 오류가 난다.

> `useMutation`의 `retry` 기본값은 `0`이다(`useQuery`는 `3`). 같은 변이를 모르고 여러 번 보내는 사이드 이펙트를 막기 위한 의도적인 차이다.

## useMutation 반환 속성

| 속성 | 설명 | 타입 |
|------|------|------|
| `context` | `onMutate`가 반환한 값. 낙관적 업데이트 되돌리기에 활용. | `undefined \| TOnMutateResult` |
| `data` | 성공 시 받은 데이터. | `undefined \| TData` |
| `error` | 오류 객체. 없으면 `null`. | `null \| TError` |
| `failureCount` | 실패 횟수. 성공하면 `0`으로 재지정. | `number` |
| `failureReason` | 마지막 실패 사유. 성공하거나 새 변이가 시작되면 `null`. | `null \| TError` |
| `isError` | 오류 여부. | `boolean` |
| `isIdle` | 초기 상태 여부. | `boolean` |
| `isPaused` | 일시 중단 여부. | `boolean` |
| `isPending` | 실행 중 여부. | `boolean` |
| `isSuccess` | 성공 여부. | `boolean` |
| `mutate` | 변이 실행. 콜백 패턴. 두 번째 인수 콜백은 반환값이 무시되고 컴포넌트 연결 해제 시 실행되지 않는다. | `(variables, options?: MutateOptions) => void` |
| `mutateAsync` | 변이 실행. Promise 반환(await 가능). | `(variables, options?: MutateOptions) => Promise<TData>` |
| `reset` | 내부 상태 초기화. | `() => void` |
| `status` | 변이의 현재 상태. | `'idle' \| 'pending' \| 'error' \| 'success'` |
| `submittedAt` | 제출 시각(타임스탬프). | `number` |
| `variables` | 마지막 `mutate` 호출의 인자. | `undefined \| TVariables` |

## useQuery 옵션 심화 노트

### select: 큰 응답을 잘라 쓰기

응답 전체가 아닌 일부만 컴포넌트로 흘려보낼 때 쓴다. 캐시는 원본 응답을 유지하므로, 다른 컴포넌트는 같은 캐시에서 다른 모양으로 잘라 쓸 수 있다. `queryOptions`에 `select`를 넣지 않고 호출부에서 덮어쓰면, 같은 캐시를 컴포넌트마다 다르게 잘라 쓸 수 있다.

```tsx
// src/components/UserNames.tsx
import { useQuery } from '@tanstack/react-query'
import { userListOptions } from '@/queries/users'

export default function UserNames() {
  const { data } = useQuery({
    ...userListOptions,
    select: users => users.map(user => user.name) // data는 string[]로 추론된다
  })

  return <p>{data?.join(', ')}</p>
}
```

`queryOptions`로 정의한 옵션을 전개하면 3번째 제네릭 없이도 `select`의 반환 타입이 추론된다.

### placeholderData: 깜빡임 방지

`queryKey`가 자주 바뀌는 화면(검색, 필터, 페이지 이동)에서 새 fetch 동안 `data`가 `undefined`로 떨어지는 것을 막는다. v5에서는 같은 목적의 `keepPreviousData` 헬퍼를 권장한다.

```tsx
// src/components/MovieSearch.tsx (일부)
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { movieListOptions } from '@/queries/movies'

const { data, isPlaceholderData } = useQuery({
  ...movieListOptions(searchText),
  placeholderData: keepPreviousData
})
```

`placeholderData: prev => prev`도 같은 의미다. 데이터가 placeholder인지 분기하려면 `isPlaceholderData` 플래그를 본다.

### staleTime: 'static'

한 번 받으면 바뀌지 않는 데이터(설정값, 코드 테이블)는 `staleTime: 'static'`으로 둔다. 자동 갱신 조건(마운트, 포커스, 재연결)에서 다시 가져오지 않고, `invalidateQueries()`로 무효화해도 다시 가져오지 않는다. `Infinity`는 무효화하면 다시 가져온다는 점이 다르다. `isStale`은 항상 `false`다.

### structuralSharing: 메모리/렌더 최적화

기본값 `true`. 새로 받은 응답을 이전 응답과 깊게 비교해서, 변경되지 않은 객체는 이전 참조를 재사용한다. 결과적으로 변경된 부분만 새 참조가 되어 `React.memo` 같은 최적화가 효과적이다.

`false`로 두는 게 유리한 경우:

- 응답이 매우 큰 중첩 객체라 깊은 비교 자체가 부담일 때
- 응답이 단순해 깊은 비교가 의미 없을 때
- 항상 새 참조여야 하는 외부 상태와 통합할 때

### meta: 전역 에러 핸들링과 짝꿍

`meta`에 임의 정보를 담아두고 `QueryCache`의 `onError`에서 꺼내 쓰면, 쿼리별로 다른 에러 메시지를 전역에서 일관되게 처리할 수 있다. 예제는 [patterns.md](patterns.md)의 "meta로 전역 에러 처리" 절 참조.

### skipToken: 타입이 좁혀지는 조건부 쿼리

`enabled: false`는 쿼리 함수와 별개의 옵션이라, 쿼리 함수 안에서는 변수 타입이 `string | undefined`로 남아 `userId!` 단언이 필요하다. `queryFn: userId ? () => fetchUser(userId) : skipToken`처럼 쓰면 참인 분기 안에서 `string`으로 좁혀진다. 예제는 [patterns.md](patterns.md)의 "의존 쿼리 만들기" 절 참조. `useSuspenseQuery`의 `queryFn`은 `skipToken`을 받지 않는다.

### queryOptions로 옵션 공유

`useQuery`, `queryClient.fetchQuery`, `queryClient.prefetchQuery` 등 여러 곳에서 같은 옵션을 쓰므로, 옵션은 항상 `src/queries/<도메인>.ts`에 `queryOptions()`로 정의한다.

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
```

```tsx
// 사용처 (일부)
useQuery(userListOptions)
queryClient.fetchQuery(userListOptions)
queryClient.prefetchQuery(userListOptions)
queryClient.getQueryData(userListOptions.queryKey) // 제네릭 없이 User[] 추론
```

타입이 한 곳에 묶여서 `queryKey` 오타나 `staleTime` 누락 같은 실수를 줄인다. `fetchQuery`는 훅 옵션을 물려받지 않으므로, `staleTime`이 빠진 옵션을 넘기면 캐시가 아무리 새것이어도 항상 다시 요청한다. `queryOptions`를 넘기면 이 문제가 생기지 않는다.
