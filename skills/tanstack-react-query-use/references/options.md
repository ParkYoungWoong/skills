# useQuery / useInfiniteQuery / useMutation 옵션·반환 레퍼런스

`@tanstack/react-query` v5 기준. SKILL.md의 "자주 쓰는 옵션"에서 다루지 않은 항목까지 모두 포함한다.

## 목차

- [useQuery 옵션](#usequery-옵션)
- [useQuery 반환 속성](#usequery-반환-속성)
- [useInfiniteQuery 추가 옵션](#useinfinitequery-추가-옵션)
- [useInfiniteQuery 추가 반환 속성](#useinfinitequery-추가-반환-속성)
- [useMutation 옵션](#usemutation-옵션)
- [useMutation 반환 속성](#usemutation-반환-속성)
- [useQuery 옵션 심화 노트](#usequery-옵션-심화-노트)

---

## useQuery 옵션

알파벳 순.

| 옵션 | 설명 | 기본값 | 타입 |
|------|------|--------|------|
| `enabled` | 쿼리 자동 실행 여부. `false`면 대기(`pending`) 상태로 시작. | `true` | `boolean \| (query: Query) => boolean` |
| `gcTime` | 비활성 캐시가 메모리에 남는 시간(ms). | `5 * 60 * 1000` | `number \| Infinity` |
| `initialData` | 쿼리가 생성되거나 캐시되기 전에 쓸 초기 데이터. | — | `TData \| () => TData` |
| `initialDataUpdatedAt` | 초기 데이터의 마지막 업데이트 시간. | — | `number \| (() => number \| undefined)` |
| `meta` | 쿼리에 부착하는 부가 정보. `QueryCache`의 `onError`에서 접근 가능. | — | `Record<string, unknown>` |
| `networkMode` | 네트워크 모드. | `'online'` | `'online' \| 'always' \| 'offlineFirst'` |
| `notifyOnChangeProps` | 리렌더 트리거 대상 반환 속성 목록. 예: `['data', 'error']`. | 컴포넌트에서 접근한 속성 | `string[] \| 'all' \| (() => string[] \| 'all')` |
| `placeholderData` | 대기 상태에서 임시로 쓸 데이터. 함수에는 이전 값/쿼리가 전달됨. | — | `TData \| (prev, prevQuery) => TData` |
| `queryClient` | 커스텀 `QueryClient` 인스턴스. | — | `QueryClient` |
| `queryFn` | 데이터를 가져오는 비동기 함수. 데이터 반환 또는 throw 필수. | — | `(ctx: QueryFunctionContext) => Promise<TData>` |
| `queryKey` | 고유 식별자(배열). **필수**. | — | `unknown[]` |
| `queryKeyHashFn` | 쿼리 키를 해시하는 함수. | — | `(queryKey: QueryKey) => string` |
| `refetchInterval` | 자동 갱신 간격(ms). | — | `number \| false \| ((q) => number \| false \| undefined)` |
| `refetchIntervalInBackground` | 백그라운드 자동 갱신 여부. | `false` | `boolean` |
| `refetchOnMount` | 마운트 시 데이터 갱신 여부. `true`=상한 경우만, `'always'`=항상. | `true` | `boolean \| 'always' \| ((q) => ...)` |
| `refetchOnReconnect` | 네트워크 재연결 시 갱신 여부. | `true` | `boolean \| 'always' \| ((q) => ...)` |
| `refetchOnWindowFocus` | 창 포커스 시 갱신 여부. | `true` | `boolean \| 'always' \| ((q) => ...)` |
| `retry` | 실패 재시도 횟수. | `3` | `boolean \| number \| ((failureCount, error) => boolean)` |
| `retryDelay` | 재시도 간격(ms). | — | `number \| ((attempt, error) => number)` |
| `retryOnMount` | 마운트 시 재시도 여부. | `true` | `boolean` |
| `select` | 가져온 데이터를 변형해서 반환. | — | `(data: TData) => unknown` |
| `staleTime` | 데이터가 상하는 시간(ms). | `0` | `number \| ((q) => number)` |
| `structuralSharing` | 변경되지 않은 부분의 참조 재사용으로 불필요한 리렌더 방지. | `true` | `boolean \| ((oldData, newData) => unknown)` |
| `throwOnError` | 실패 시 오류를 던질지 여부. | `undefined` | `boolean \| ((error, query) => boolean)` |

## useQuery 반환 속성

알파벳 순.

| 속성 | 설명 | 타입 |
|------|------|------|
| `data` | 성공적으로 가져온 데이터. | `TData` |
| `dataUpdatedAt` | 최근 성공 시각(유닉스 타임스탬프). | `number` |
| `error` | 오류 객체. 없으면 `null`. | `null \| TError` |
| `errorUpdateCount` | 전체 오류 횟수. | `number` |
| `errorUpdatedAt` | 최근 오류 시각. | `number` |
| `failureCount` | 실패 횟수. 성공 시 `0`으로 리셋. | `number` |
| `failureReason` | 마지막 실패 사유. 성공 시 `null`로 리셋. | `null \| TError` |
| `fetchStatus` | `'fetching'` / `'paused'` / `'idle'`. | `'fetching' \| 'paused' \| 'idle'` |
| `isError` | 오류 발생 여부. | `boolean` |
| `isFetched` | 첫 fetch 완료 여부. | `boolean` |
| `isFetchedAfterMount` | 마운트 후 fetch 완료 여부(마운트 전 캐시를 숨길 때 유용). | `boolean` |
| `isFetching` | 현재 fetch 진행 중(초기·재요청 모두 포함). | `boolean` |
| `isLoading` | 첫 fetch가 진행 중. `isFetching && isPending`와 동치. | `boolean` |
| `isLoadingError` | 첫 fetch 도중 실패했는지. | `boolean` |
| `isPaused` | fetch가 일시 중단됐는지. | `boolean` |
| `isPending` | 캐시도 없고 아직 완료되지 않은 상태. | `boolean` |
| `isPlaceholderData` | 표시 데이터가 placeholder인지. | `boolean` |
| `isRefetchError` | 재요청 도중 실패했는지. | `boolean` |
| `isRefetching` | 백그라운드 재요청 중. `isFetching && !isPending`와 동치. | `boolean` |
| `isStale` | 데이터가 stale인지. | `boolean` |
| `isSuccess` | 성공 여부. | `boolean` |
| `refetch` | 강제 재요청. `throwOnError: true`일 때만 오류를 던짐. | `(opts?: { throwOnError, cancelRefetch }) => Promise<UseQueryResult>` |
| `status` | `'pending' \| 'error' \| 'success'`. | `'pending' \| 'error' \| 'success'` |

---

## useInfiniteQuery 추가 옵션

`useQuery`의 모든 옵션을 그대로 받으며, 다음이 추가된다.

| 옵션 | 설명 | 기본값 | 타입 |
|------|------|--------|------|
| `initialPageParam` | 첫 페이지의 파라미터. **필수**. | — | `TPageParam` |
| `getNextPageParam` | 다음 페이지의 파라미터를 반환. **필수**. 없으면 `undefined \| null` 반환. | — | `(lastPage, allPages, lastPageParam, allPageParams) => TPageParam \| undefined \| null` |
| `getPreviousPageParam` | 이전 페이지 파라미터 반환. 양방향 페이징 시. | — | `(firstPage, allPages, firstPageParam, allPageParams) => TPageParam \| undefined \| null` |
| `maxPages` | 저장할 최대 페이지 수. 메모리 압박 시 유용. | `Infinity` | `number` |

## useInfiniteQuery 추가 반환 속성

| 속성 | 설명 | 타입 |
|------|------|------|
| `fetchNextPage` | 다음 페이지 fetch. | `(opts?) => Promise<UseInfiniteQueryResult>` |
| `fetchPreviousPage` | 이전 페이지 fetch. | `(opts?) => Promise<UseInfiniteQueryResult>` |
| `hasNextPage` | 다음 페이지가 있는지. | `boolean` |
| `hasPreviousPage` | 이전 페이지가 있는지. | `boolean` |
| `isFetchingNextPage` | 다음 페이지 fetch 중. | `boolean` |
| `isFetchingPreviousPage` | 이전 페이지 fetch 중. | `boolean` |

`data`는 `{ pages: TPage[], pageParams: TPageParam[] }` 형태로 반환된다. 평탄화해서 그리려면 `data.pages.flatMap(p => p.items)` 패턴을 쓴다.

---

## useMutation 옵션

| 옵션 | 설명 | 기본값 | 타입 |
|------|------|--------|------|
| `gcTime` | 비활성 캐시 보관 시간. | — | `number \| Infinity` |
| `meta` | 부가 정보. | — | `Record<string, unknown>` |
| `mutationFn` | 실행할 비동기 변이 함수. **필수**. | — | `(variables: TVariables) => Promise<TData>` |
| `mutationKey` | `setMutationDefaults`로 지정한 기본값 상속용 키. | — | `unknown[]` |
| `networkMode` | 네트워크 모드. | `'online'` | `'online' \| 'always' \| 'offlineFirst'` |
| `onError` | 변이 실패 시 호출. | — | `(err, variables, context?) => Promise<unknown> \| unknown` |
| `onMutate` | 변이 실행 직전 호출. 반환값이 다른 콜백의 `context`로 전달됨. | — | `(variables) => Promise<TContext \| void> \| TContext \| void` |
| `onSettled` | 성공/실패 무관 항상 호출. | — | `(data, error, variables, context?) => Promise<unknown> \| unknown` |
| `onSuccess` | 변이 성공 시 호출. | — | `(data, variables, context) => Promise<unknown> \| unknown` |
| `queryClient` | 커스텀 `QueryClient`. | — | `QueryClient` |
| `retry` | 실패 재시도 횟수. | `0` | `boolean \| number \| ((failureCount, error) => boolean)` |
| `retryDelay` | 재시도 간격(ms). | — | `number \| ((attempt, error) => number)` |
| `scope` | 동시 실행 범위. 같은 `id`의 변이는 직렬 실행. | — | `{ id: string }` |
| `throwOnError` | 실패 시 throw 여부. | `undefined` | `boolean \| ((error) => boolean)` |

> `useMutation`의 `retry` 기본값은 `0`이다(`useQuery`는 `3`). 의도적인 차이 — 같은 mutation을 모르고 여러 번 보내는 사이드 이펙트를 방지하기 위함이다.

## useMutation 반환 속성

| 속성 | 설명 | 타입 |
|------|------|------|
| `data` | 성공 시 받은 데이터. | `undefined \| unknown` |
| `error` | 오류 객체. 없으면 `null`. | `null \| TError` |
| `failureCount` | 실패 횟수. | `number` |
| `failureReason` | 마지막 실패 사유. | `null \| TError` |
| `isError` | 오류 여부. | `boolean` |
| `isIdle` | 초기 상태 여부. | `boolean` |
| `isPaused` | 일시 중단 여부. | `boolean` |
| `isPending` | 실행 중 여부. | `boolean` |
| `isSuccess` | 성공 여부. | `boolean` |
| `mutate` | 변이 실행. 콜백 패턴. | `(variables, { onSuccess, onSettled, onError }) => void` |
| `mutateAsync` | 변이 실행. Promise 반환(await 가능). | `(variables, { onSuccess, onSettled, onError }) => Promise<TData>` |
| `reset` | 내부 상태 초기화. | `() => void` |
| `status` | `'idle' \| 'pending' \| 'error' \| 'success'`. | `string` |
| `submittedAt` | 제출 시각(타임스탬프). | `number` |
| `variables` | 마지막 `mutate` 호출의 인자. | `undefined \| TVariables` |

---

## useQuery 옵션 심화 노트

### select — 큰 응답을 잘라 쓰기

응답 전체가 아닌 일부만 컴포넌트로 흘려보낼 때 쓴다. 캐시는 원본 응답을 유지하므로, 다른 컴포넌트는 같은 캐시에서 다른 모양으로 잘라 쓸 수 있다.

```tsx
const { data } = useQuery<User[], Error, string[]>({
  queryKey: ['users'],
  queryFn: fetchUsers,
  select: data => data.map(u => u.name)  // data는 string[] 타입으로 추론
})
```

`useQuery<TQueryFnData, TError, TData>`의 3번째 제네릭이 `select`의 최종 반환 타입이다. `queryFn`을 별도 함수로 분리하면 3번째 제네릭 없이도 추론이 동작한다.

### placeholderData — 깜빡임 방지

`queryKey`가 자주 바뀌는 화면(검색, 필터, 페이지 이동)에서 새 fetch 동안 `data`가 `undefined`로 떨어지는 것을 막는다.

v5에서는 동일 목적의 `keepPreviousData` 헬퍼를 권장한다. 타입이 좀 더 깔끔하고 의도가 명확하다.

```tsx
import { useQuery, keepPreviousData } from '@tanstack/react-query'

useQuery({
  queryKey: ['movies', searchText],
  queryFn,
  placeholderData: keepPreviousData  // 권장
})

// 동일한 의미 — 명시적으로 적고 싶을 때
useQuery({
  queryKey: ['movies', searchText],
  queryFn,
  placeholderData: prev => prev
})
```

데이터가 placeholder인지 분기하려면 `isPlaceholderData` 플래그를 본다.

### structuralSharing — 메모리/렌더 최적화

기본값 `true`. 새로 받은 응답을 이전 응답과 깊게 비교해서, 변경되지 않은 객체는 이전 참조를 재사용한다. 결과적으로 변경된 부분만 새 참조가 되어 `React.memo` 같은 최적화가 효과적이다.

`false`로 두는 게 유리한 경우:
- 응답이 매우 큰 중첩 객체라 깊은 비교 자체가 부담일 때
- 응답이 단순해 깊은 비교가 의미 없을 때
- 항상 새 참조여야 하는 외부 상태와 통합할 때

### meta — 전역 에러 핸들링과 짝꿍

`meta`에 임의 정보를 담아두고 `QueryCache`의 `onError`에서 꺼내 쓰면, 쿼리별로 다른 에러 메시지를 전역에서 일관되게 처리할 수 있다. 예제는 [patterns.md](patterns.md)의 "meta로 전역 에러 처리" 절 참조.

### queryOptions로 옵션 공유

`useQuery`, `queryClient.fetchQuery`, `queryClient.prefetchQuery` 등 여러 곳에서 같은 옵션을 반복하게 되면 `queryOptions()` 헬퍼로 묶어 둔다.

```tsx
import { queryOptions } from '@tanstack/react-query'

export const userListOptions = queryOptions<User[]>({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 5
})

// 사용처
useQuery(userListOptions)
queryClient.fetchQuery(userListOptions)
queryClient.prefetchQuery(userListOptions)
```

타입이 한 곳에 묶여서 `queryKey` 오타나 `staleTime` 누락 같은 실수를 줄인다.
