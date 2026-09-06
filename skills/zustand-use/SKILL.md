---
name: zustand-use
description: (heropy) Use when designing or writing global state (stores) with Zustand in a React project. 사용자가 "zustand", "주스탠드", "전역 상태", "스토어 생성", "스토어 만들어 줘", "OO 스토어 생성", "상태 관리 라이브러리", "create 함수", "combine", "persist/immer/devtools 미들웨어", "새로고침해도 상태 유지"를 언급하거나 React 컴포넌트 간 prop drilling을 해소하려 할 때도 이 스킬을 따른다.
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 2.1.0
---

# Zustand 사용 규칙

> 참고: https://www.heropy.dev/p/n74Tgc
> Persist 옵션 참고: https://www.heropy.dev/s/70

Zustand는 작고 빠른 React 상태 관리 라이브러리다. `create` 함수 하나로 상태(State)와
액션(Action)을 함께 정의하고, Provider 없이 동작하며, 선택자(Selector)로 필요한 상태만
구독해 불필요한 리렌더링을 피한다.

이 스킬은 Zustand로 스토어를 작성할 때 따라야 하는 패턴, 관례, 주의점을 모은다.

## 핵심 원칙 (먼저 읽기)

1. **프로젝트에 `CLAUDE.md`나 `.claude/rules/zustand.md`가 있으면 그 내용이 이 스킬보다
   우선한다.** 기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로
   만든다.
2. **스토어 하나는 스토어 폴더 안의 `<이름>.ts` 파일 하나에 정의한다.** 스토어 폴더는
   기존 프로젝트의 `src/stores` -> `src/store` -> `src/state` 순으로 찾고, 없으면
   `src/stores`를 만든다. 훅 이름은 `use이름Store`다. 관심사별로 스토어 파일을 나눈다.
   (예: `count.ts`, `user.ts`, `cart.ts`)
3. **TypeScript에서는 항상 `combine` 미들웨어로 스토어를 만든다.** 상태 타입을 직접 작성하지
   않고 초기 상태에서 추론시킨다. 추론되지 않는 초깃값(`null`, 빈 배열)만 `satisfies`와
   `as`로 명시한다.
4. **상태는 `combine`의 첫 번째 인수에, 액션은 두 번째 인수가 반환하는 객체의 최상위 함수로
   정의한다.**
5. **컴포넌트에서는 훅 호출 한 번에 상태(또는 액션) 하나만 선택한다.** 값이 여러 개 필요하면
   훅을 그 수만큼 호출한다. 선택한 값이 바뀔 때만 컴포넌트가 리렌더링된다.
6. **상태 변경은 `set` 콜백으로 현재 상태를 기준으로 한다.** `set`은 전달한 객체를 기존
   상태에 병합한다.
7. **스토어에는 사용자가 요청한 상태와 액션만 정의하고, 설명도 요청한 범위로 한정한다.**
   미들웨어는 요청한 기능에 필요한 것만 적용한다.
   (새로고침 후에도 유지 -> `persist`, 깊은 중첩 객체 변경 -> `immer`,
   특정 상태 변경 감지 -> `subscribeWithSelector`, 상태 변화 추적 -> `devtools`)
8. **상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다.** 다른 폴더의 파일은 `@/` 별칭으로
   가져온다. 컴포넌트에서 스토어는 `@/stores/<이름>`으로 가져온다.

## 스토어 파일 자동 생성 (트리거 입력)

사용자가 **"OO 스토어 생성"**, **"OO 스토어 만들어 줘"** 처럼 스토어 이름과 생성 의도를
함께 말하면(예: "count 스토어 생성", "user 스토어 만들어 줘", "장바구니 스토어 생성"),
아래 절차로 스토어 파일을 직접 만든다. 코드 설명만 하지 말고 실제로 파일을 생성하라.

### 절차

1. **규칙 확인.** 프로젝트에 `CLAUDE.md`나 `.claude/rules/zustand.md`가 있으면 그 내용이
   이 스킬보다 우선한다. 기존 스토어가 있으면 파일 위치, 이름, 선언 형식을 확인하고 같은
   스타일로 만든다.

2. **이름 정규화.** 트리거에서 스토어 이름을 뽑아 카멜케이스로 만든다. 파일명은 그 이름,
   훅 이름은 `use` + PascalCase + `Store`.
   - `count` 스토어 생성 -> 파일 `count.ts`, 훅 `useCountStore`
   - `user profile` 스토어 -> 파일 `userProfile.ts`, 훅 `useUserProfileStore`
   - 한국어 이름이면 영문으로 옮긴다("장바구니" -> `cart`). 모호하면 사용자에게 확인한다.

3. **언어 판별.** 프로젝트 루트(또는 가까운 상위)에 `tsconfig.json`이 있거나 `src` 아래
   `.ts`/`.tsx` 파일이 있으면 TypeScript, 아니면 JavaScript로 본다.
   TypeScript면 확장자 `.ts`, 아니면 `.js`.

4. **폴더 결정.** 다음 순서로 기존 폴더를 찾아 거기에 생성한다:
   `src/stores` -> `src/store` -> `src/state`. 모두 없으면 `src/stores`를 새로 만든다.
   (`src`가 없는 비표준 구조면 사용자에게 위치를 확인한다.)
   같은 이름의 파일이 이미 있으면 덮어쓰지 말고 사용자에게 알린다.

5. **내용 작성.** 아래 기본 템플릿을 채워 파일을 만든다. 사용자가 상태와 액션을 말했으면
   그대로 반영하고, 말하지 않았으면 스토어 이름에서 유추한 최소한의 상태와 액션으로
   뼈대만 만든다. 비즈니스 로직은 비워 둔다. 생성 후 파일 경로와 훅 이름을 한 줄로 보고한다.

6. **검증.** `{pm} run lint`와 `{pm} run build`(TypeScript 검사 포함)를 실행해 통과를
   확인한다.

### 기본 템플릿 (TypeScript)

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export const useCountStore = create(
  combine(
    {
      count: 0
    },
    set => ({
      increase: () => set(state => ({ count: state.count + 1 }))
    })
  )
)
```

### 기본 템플릿 (JavaScript)

추론할 타입이 없으므로 `combine` 없이 `create`만 쓴다.

```js
// src/stores/count.js
import { create } from 'zustand'

export const useCountStore = create(set => ({
  count: 0,
  increase: () => set(state => ({ count: state.count + 1 }))
}))
```

## 설치

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm`.
> `{pmx}`는 해당 패키지 매니저의 실행 명령으로 대체한다. `npm` -> `npx`, `pnpm` -> `pnpm dlx`, `yarn` -> `yarn dlx`, `bun` -> `bunx`.

```bash
{pm} add zustand
```

Zustand v5는 React 18 이상, TypeScript 4.5 이상이 필요하다.

`immer` 미들웨어를 쓸 때만 피어 의존성을 함께 설치한다.

```bash
{pm} add immer
```

## 스토어 작성 패턴

### 기본형

`combine(초기상태, (set, get) => 액션객체)` 형태다. 첫 번째 인수의 속성이 상태,
두 번째 인수가 반환하는 함수가 액션이다. 상태 타입은 초기 상태에서 추론된다.

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export const useCountStore = create(
  combine(
    {
      count: 1
    },
    set => ({
      increase: () => set(state => ({ count: state.count + 1 })),
      decrease: () => set(state => ({ count: state.count - 1 }))
    })
  )
)
```

- `set(부분상태)`는 전달한 객체를 기존 상태에 병합한다.
- 현재 상태를 기준으로 바꿀 때는 콜백 `set(state => ({ ... }))`을 쓴다.
- `get()`은 액션 안에서 현재 상태를 읽을 때 쓴다. 단순 갱신은 `set` 콜백이 더 간결하다.

### 추론되지 않는 타입 명시 (`satisfies` + `as`)

초깃값이 `null`이거나 빈 배열이면 타입이 `null`, `never[]`로 좁게 추론되어 이후 값을
할당할 수 없다. `satisfies`로 초깃값이 타입에 맞는지 검사하고 `as`로 상태 타입을 넓힌다.
빈 배열은 `[] as 타입[]`로 명시한다.

```ts
// src/stores/user.ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

type User = {
  email: string
  displayName: string
} | null

const initialState = {
  user: null satisfies User as User,
  favorites: [] as string[],
  isLoggedIn: false
}

export const useUserStore = create(
  combine(initialState, set => ({
    signIn: (user: User) => set({ user, isLoggedIn: true }),
    signOut: () => set({ user: null, isLoggedIn: false }),
    addFavorite: (id: string) =>
      set(state => ({ favorites: [...state.favorites, id] }))
  }))
)
```

### 상태 초기화 (`initialState` + `resetState`)

초기 상태를 변수로 분리하고 `resetState` 액션으로 되돌린다. `set(initialState)`는
병합이므로 액션은 그대로 남는다.

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const initialState = {
  count: 1,
  double: 2,
  min: 0,
  max: 99
}

export const useCountStore = create(
  combine(initialState, set => ({
    increase: () => set(state => ({ count: state.count + 1 })),
    decrease: () => set(state => ({ count: state.count - 1 })),
    resetState: (keys?: Array<keyof typeof initialState>) => {
      // 전체 초기화
      if (!keys) {
        set(initialState)
        return
      }
      // 일부 상태만 초기화
      keys.forEach(key => {
        set({ [key]: initialState[key] })
      })
    }
  }))
)
```

컴포넌트에서 호출하는 부분만 보여 주는 조각이다.

```tsx
const resetState = useCountStore(state => state.resetState)

<button onClick={() => resetState()}>Reset All</button>
<button onClick={() => resetState(['double', 'min'])}>Reset Double, Min</button>
```

### 액션 안에서 다른 액션 호출 (함수 호이스팅)

`combine`에서 `get()`은 상태만 반환하도록 추론되므로 `get().다른액션()`은 타입 에러가
난다. 액션을 함수 선언으로 뽑아 서로 호출하고, 반환 객체에 담는다.

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const initialState = {
  count: 1,
  double: 2
}

export const useCountStore = create(
  combine(initialState, set => {
    function increase() {
      set(state => ({ count: state.count + 1 }))
      increaseDouble()
    }
    function increaseDouble() {
      set(state => ({ double: state.count * 2 }))
    }
    return { increase, increaseDouble }
  })
)
```

### 비동기 액션

별도 미들웨어 없이 `async` 함수로 작성한다. 요청 전후로 로딩 상태를 함께 갱신한다.

```ts
// src/stores/user.ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

type User = {
  email: string
  displayName: string
} | null

export const useUserStore = create(
  combine(
    {
      user: null satisfies User as User,
      isLoading: false
    },
    set => ({
      fetchUser: async (id: string) => {
        set({ isLoading: true })
        const res = await fetch(`/api/users/${id}`)
        const user: User = await res.json()
        set({ user, isLoading: false })
      }
    })
  )
)
```

## 컴포넌트에서 사용하기

훅 호출 한 번에 하나씩 선택한다. 액션도 같은 방식으로 선택한다. 함수 참조는 바뀌지
않으므로 액션 선택은 리렌더링을 일으키지 않는다. 스토어는 `@/stores/<이름>` 별칭으로
가져온다.

```tsx
// src/components/Counter.tsx
import { useCountStore } from '@/stores/count'

export default function Counter() {
  const count = useCountStore(state => state.count)
  const increase = useCountStore(state => state.increase)
  const decrease = useCountStore(state => state.decrease)
  return (
    <>
      <h2>{count}</h2>
      <button onClick={increase}>+1</button>
      <button onClick={decrease}>-1</button>
    </>
  )
}
```

파생 값은 선택자 안에서 계산한다. 선택자가 원시 값을 반환하면 값이 같을 때
리렌더링되지 않는다. 컴포넌트 안의 호출 부분만 보여 주는 조각이다.

```tsx
const double = useCountStore(state => state.count * 2)
const isMax = useCountStore(state => state.count >= state.max)
```

### 컴포넌트 외부에서 사용

스토어 훅은 정적 메서드를 가진다. 이벤트 핸들러, 라우터 로더, 유틸 함수 등 컴포넌트 밖에서
쓴다. 호출 예시 조각이다.

```ts
useCountStore.getState().count // 현재 상태 읽기 (구독하지 않음)
useCountStore.getState().increase() // 액션 호출
useCountStore.setState({ count: 0 }) // 상태 변경 (병합)

const unsubscribe = useCountStore.subscribe((state, prevState) => {
  // 모든 상태 변경마다 실행
})
unsubscribe()
```

## 미들웨어

미들웨어는 `create`에 전달하는 콜백을 감싸 기능을 확장한다. 여러 개를 함께 쓸 때는
`combine`을 가장 안쪽에, `devtools`를 가장 바깥에 둔다. 아래는 합성 순서만 보여 주는
형태 조각이다.

```ts
import { create } from 'zustand'
import {
  combine,
  subscribeWithSelector,
  persist,
  devtools
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useCountStore = create(
  devtools(
    persist(
      subscribeWithSelector(immer(combine(초기상태, 액션))),
      { name: '스토리지_키' }
    )
  )
)
```

| 미들웨어 | 용도 | import 경로 |
|---|---|---|
| `combine` | 상태 타입 추론. TypeScript에서 항상 사용 | `zustand/middleware` |
| `immer` | 중첩 객체를 직접 대입으로 변경 | `zustand/middleware/immer` |
| `subscribeWithSelector` | 특정 상태 변경만 구독 | `zustand/middleware` |
| `persist` | 스토리지에 상태 저장 | `zustand/middleware` |
| `devtools` | Redux DevTools 확장으로 상태 변화 추적 | `zustand/middleware` |

### `immer`: 중첩 객체 변경

`user.relations[0].emails[0].domain`처럼 깊은 속성을 바꿀 때 스프레드 복사 없이 직접
대입한다. `set` 콜백은 병합할 객체를 반환하지 않아도 된다.

```ts
// src/stores/user.ts
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type User = {
  email: string
  displayName: string
} | null

const initialState = {
  user: null satisfies User as User
}

export const useUserStore = create(
  immer(
    combine(initialState, set => ({
      setDisplayName: (name: string) =>
        set(state => {
          if (state.user) {
            state.user.displayName = name
          }
        })
    }))
  )
)
```

### `subscribeWithSelector`: 특정 상태 변경 구독

`subscribe(선택자, 리스너, 옵션?)` 형태로 특정 상태가 바뀔 때만 리스너를 실행한다.
다른 상태를 함께 갱신하거나 부수 효과를 실행하는 데 쓴다. 세 번째 인수는
`{ equalityFn, fireImmediately }` 옵션이다. `fireImmediately: true`면 구독 시작 시
현재 값으로 리스너를 한 번 실행하므로 초기 동기화에 쓴다.

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine, subscribeWithSelector } from 'zustand/middleware'

const initialState = {
  count: 1,
  double: 2
}

export const useCountStore = create(
  subscribeWithSelector(
    combine(initialState, set => ({
      increase: () => set(state => ({ count: state.count + 1 })),
      decrease: () => set(state => ({ count: state.count - 1 }))
    }))
  )
)

// 모듈 최상위에서 구독 (앱 시작 시 1회)
useCountStore.subscribe(
  state => state.count, // 선택자
  count => {
    // 리스너
    useCountStore.setState({ double: count * 2 })
  },
  { fireImmediately: true } // 구독 시작 시 현재 값으로 1회 실행
)
```

컴포넌트 안에서만 구독할 때는 `useEffect`에서 시작하고 언마운트 시 해제한다.
컴포넌트 안의 호출 부분만 보여 주는 조각이다.

```tsx
useEffect(() => {
  const unsubscribe = useCountStore.subscribe(
    state => state.count,
    count => setDouble(count * 2)
  )
  return unsubscribe
}, [])
```

### `persist`: 스토리지에 상태 저장

페이지를 새로고침하거나 다시 방문해도 상태를 유지한다. `name`은 필수이며 스토리지 키로
쓰이므로 프로젝트 안에서 유일해야 한다. 기본 스토리지는 `localStorage`다.
JSON으로 직렬화되는 상태만 저장되고, 액션은 코드에서 다시 정의되므로 저장 대상이 아니다.

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

export const useCountStore = create(
  persist(
    combine(
      {
        count: 0
      },
      set => ({
        increase: () => set(state => ({ count: state.count + 1 }))
      })
    ),
    {
      name: 'count' // 스토리지 키 (필수, 유일)
    }
  )
)
```

#### 옵션

| 옵션 | 기본값 | 용도 |
|---|---|---|
| `name` | (필수) | 스토리지에 저장될 키 |
| `storage` | `localStorage` | 세션 스토리지, IndexedDB 등 다른 스토리지 사용 |
| `partialize` | 전체 상태 | 저장할 상태만 골라 반환 |
| `onRehydrateStorage` | 없음 | 하이드레이션 전후에 실행할 콜백 |
| `skipHydration` | `false` | 초기 하이드레이션을 건너뛰고 수동으로 실행 |
| `version` | `0` | 저장 구조가 바뀌면 올려서 이전 버전 데이터를 무시 |
| `migrate` | 없음 | 버전이 다를 때 이전 데이터를 새 구조로 변환 |
| `merge` | 얕은 병합 | 스토리지 상태를 현재 상태와 병합하는 방식 지정 |

하이드레이션(Hydration)은 스토리지에 저장된 상태를 현재 상태와 병합하는 과정이다.
아래 옵션 예제는 위 `count` 스토어의 옵션 객체 부분만 보여 주는 조각이다.

#### `storage`

`createJSONStorage` 헬퍼에 스토리지를 반환하는 함수를 전달한다. 직접 만든 스토리지는
`getItem`, `setItem`, `removeItem`을 가진 객체(`StateStorage` 인터페이스)면 된다.

```ts
import { createJSONStorage } from 'zustand/middleware'

// persist 옵션
{
  name: 'count',
  storage: createJSONStorage(() => sessionStorage) // 세션 스토리지 사용
}
```

#### `partialize`

저장할 상태만 포함하는 객체를 반환한다. 임시 UI 상태나 민감한 값을 저장에서 제외할 때 쓴다.

```ts
// persist 옵션
{
  name: 'count',
  partialize: state => ({
    count: state.count // count만 저장
  })
}
```

#### `onRehydrateStorage`

바깥 함수는 하이드레이션 직전에 현재 상태를 받아 실행되고, 반환한 함수는 하이드레이션이
끝난 뒤(또는 실패했을 때) 병합된 상태와 에러를 받아 실행된다.

```ts
// persist 옵션
{
  name: 'count',
  onRehydrateStorage: () => {
    return (state, error) => {
      if (error) {
        console.error('하이드레이션 실패', error)
        return
      }
      console.log('스토리지 상태와 병합 완료', state)
    }
  }
}
```

#### `skipHydration`

초기 하이드레이션을 건너뛴다. 원하는 시점에 `persist.rehydrate()`를 호출해 수동으로
실행한다. 서버 렌더링(SSR)에서 서버와 클라이언트의 첫 렌더 결과를 맞출 때 쓴다.

```ts
// persist 옵션
{
  name: 'count',
  skipHydration: true
}
```

```tsx
// src/components/RehydrateButton.tsx
import { useCountStore } from '@/stores/count'

export default function RehydrateButton() {
  return (
    <button onClick={() => useCountStore.persist.rehydrate()}>Rehydrate</button>
  )
}
```

#### `version` + `migrate`

저장 구조가 크게 바뀌면 `version`을 올린다. 버전이 다른 스토리지 데이터는 무시된다.
이전 데이터를 살려야 하면 `migrate`에서 새 구조로 변환해 반환한다. `migrate`는
하이드레이션 시 스토리지의 버전이 현재 `version`과 다를 때 실행된다.

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

interface StateV0 {
  count: number
  double: number
}
interface StateV1 {
  amount: number
  multiplier: number
}

export const useCountStore = create(
  persist(
    combine(
      {
        amount: 0,
        multiplier: 0
      },
      set => ({
        increase: () => set(state => ({ amount: state.amount + 1 }))
      })
    ),
    {
      name: 'count',
      version: 1, // 기본값 0
      migrate: (persistedState, version) => {
        if (version === 0) {
          const oldState = persistedState as StateV0
          const newState: StateV1 = {
            amount: oldState.count,
            multiplier: oldState.double
          }
          return newState
        }
        return persistedState as StateV1
      }
    }
  )
)
```

#### `merge`

기본은 얕은 병합이다. 중첩 객체 상태를 깊게 병합해야 하면 Lodash의 `merge`를 쓴다.
`migrate`와 함께 지정하면 `migrate`의 반환값을 `persistedState`로 받아 그다음에 실행된다.
Lodash `merge`는 첫 번째 인수를 제자리에서 변조하므로 빈 객체를 첫 번째 인수로 준다.
`currentState`를 직접 변조하면 같은 참조가 반환되어 `persist.rehydrate()`나 비동기
스토리지에서 구독자(컴포넌트)에 변경이 알려지지 않는다.

```bash
{pm} add lodash-es
{pm} add -D @types/lodash-es
```

```ts
import { merge } from 'lodash-es'

// persist 옵션
{
  name: 'count',
  merge: (persistedState, currentState) =>
    merge({}, currentState, persistedState) // 새 객체에 깊은 병합 (currentState를 직접 변조하지 않음)
}
```

#### `persist` API

스토어 훅의 `persist` 속성으로 하이드레이션을 제어한다.

| 메서드 | 용도 |
|---|---|
| `persist.rehydrate()` | 스토리지 상태를 다시 병합 |
| `persist.hasHydrated()` | 하이드레이션 완료 여부 |
| `persist.onHydrate(listener)` | 하이드레이션 시작 시 실행할 리스너 등록, 해제 함수 반환 |
| `persist.onFinishHydration(listener)` | 하이드레이션 완료 시 실행할 리스너 등록, 해제 함수 반환 |
| `persist.getOptions()` | 현재 persist 옵션 읽기 |
| `persist.setOptions(options)` | persist 옵션 일부 변경 (예: `name`, `storage`) |
| `persist.clearStorage()` | 스토리지에서 저장된 상태 삭제 |

### `devtools`: 상태 변화 추적

크롬 확장 [Redux DevTools](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)로
상태 변화를 추적한다. 가장 바깥에 둔다.

```ts
// src/stores/count.ts
import { create } from 'zustand'
import { combine, persist, devtools } from 'zustand/middleware'

export const useCountStore = create(
  devtools(
    persist(
      combine(
        {
          count: 0
        },
        set => ({
          increase: () => set(state => ({ count: state.count + 1 }))
        })
      ),
      { name: 'count' }
    )
  )
)
```

## 작성 체크리스트 (MANDATORY)

새 스토어 또는 컴포넌트 사용 코드를 작성한 뒤, 종료 전에 확인한다.

- [ ] `CLAUDE.md`, `.claude/rules/zustand.md`, 기존 스토어 스타일을 확인하고 따랐다
- [ ] 파일 위치는 규칙으로 정한 스토어 폴더 안의 `<이름>.ts`, 훅 이름은 `use이름Store`
- [ ] 컴포넌트에서 스토어를 `@/stores/<이름>` 별칭으로 가져왔다
- [ ] TypeScript 스토어는 `combine`으로 만들었고 상태 타입을 직접 작성하지 않았다
- [ ] `null`이나 빈 배열 초깃값은 `satisfies`와 `as`로 타입을 명시했다
- [ ] 액션은 `combine` 두 번째 인수가 반환하는 객체의 최상위 함수다
- [ ] 컴포넌트에서 훅 호출 한 번에 상태(액션) 하나만 선택했다
- [ ] 상태 갱신은 `set` 콜백으로 현재 상태를 기준으로 했다
- [ ] 액션 간 호출은 함수 선언(호이스팅)으로 처리했다
- [ ] 사용자가 요청한 상태, 액션, 미들웨어만 포함했다
- [ ] 미들웨어 순서는 `devtools(persist(subscribeWithSelector(immer(combine(...)))))`
- [ ] `persist`의 `name`은 프로젝트 안에서 유일하다
- [ ] `persist`로 일부 상태만 저장한다면 `partialize`를 썼다
- [ ] `persist`의 저장 구조를 바꿨다면 `version`을 올리고 필요하면 `migrate`를 작성했다
- [ ] `persist`의 `merge`를 지정했다면 `currentState`를 직접 변조하지 않았다
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과 (TypeScript 검사 포함)

## 함께 보는 스킬

서버 데이터(캐싱, 재검증, 무효화)는 `tanstack-react-query-use`의 영역이다. Zustand는
클라이언트 전역 상태(UI 상태, 폼 임시값, 인증 정보 등)를 담당한다. Next.js에서 스토어를 쓰는
컴포넌트는 클라이언트 컴포넌트(`'use client'`)여야 하며, 스토어 파일 자체는 그대로 쓴다.

| 필요한 것 | 스킬 |
|---|---|
| 프로젝트 기반 설정 (Tailwind, 경로 별칭, ESLint + Prettier) | `react-vite-scaffold` |
| 라우팅 (React Router Data Mode) | `react-router-use` |
| 서버 데이터 fetching / 캐싱 | `tanstack-react-query-use` |
| Next.js 프로젝트 기반 설정 | `react-next-scaffold` |
| Vite React 프로젝트를 Next.js로 전환 | `react-vite-to-next-migration` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
