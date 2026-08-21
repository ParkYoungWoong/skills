---
name: pinia-use
description: (heropy) Vue 프로젝트에서 Pinia(피니아)로 전역 상태(스토어)를 설계, 작성할 때 사용한다. 사용자가 "pinia", "피니아", "Vue 전역 상태", "스토어 분리", "스토어 생성", "스토어 만들어 줘", "OO 스토어 생성", "Vue 상태 관리", "defineStore", "storeToRefs", "$patch", "$reset", "vuex 대체"를 언급하거나, Vue 컴포넌트 간 prop drilling을 해소하려 할 때 반드시 이 스킬을 따른다. 옵션 스토어와 셋업 스토어 선택 기준, 구조 분해 반응성 규칙, 인스턴스 멤버 활용, 트리거 입력으로 스토어 파일을 자동 생성하는 절차까지 포함한다.
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.0.0
---

# Pinia 사용 규칙

> 참고: https://www.heropy.dev/p/bdPf3j
> 프로젝트 규칙 참고: https://www.heropy.dev/p/EzuOg2

Pinia는 Vue의 공식 상태 관리 라이브러리다. Vuex의 변이(Mutations)가 사라져 상태 변경이
단순해졌고, Composition API와 TypeScript에 친화적이다. Vuex는 2022년 10월 4.1.0을 끝으로
새 버전이 나오지 않으므로 새 Vue 프로젝트는 Pinia를 쓴다.

이 스킬은 Pinia로 스토어를 작성할 때 따라야 하는 패턴, 관례, 주의점을 모은다.

## 핵심 원칙 (먼저 읽기)

1. **스토어 파일은 `src/stores/<이름>.ts` 한 파일에 정의한다.** 훅 이름은 `use이름Store`,
   스토어 ID는 파일 이름과 같은 소문자로 한다.
2. **기본은 옵션 스토어(`state`, `getters`, `actions`)다.** 한 프로젝트 안에서 옵션 스토어와
   셋업 스토어를 섞지 않는다. 섞이면 스토어를 열 때마다 구조를 다시 파악해야 한다.
   스토어 안에서 `watch`를 쓰거나 컴포저블을 호출해야 할 때만 셋업 스토어를 쓰고,
   그때는 프로젝트 전체를 셋업 스토어로 통일한다.
3. **`state`는 반드시 팩토리 함수로 작성한다.** 인스턴스가 여러 번 생성될 때 상태가
   불필요하게 공유되거나 초기화되는 문제를 막는다.
4. **스토어 인스턴스를 그냥 구조 분해하지 않는다.** 반응성이 끊긴다.
   상태와 게터는 `storeToRefs()`로, 액션은 인스턴스에서 바로 구조 분해한다.
5. **게터는 읽기 전용 계산값이다.** 비동기 요청과 DOM 조작은 액션에서만 한다.
   게터가 다른 게터를 참조할 때는 화살표 함수 대신 일반 함수 + `this`를 쓰고,
   이때 **반환 타입을 반드시 명시한다.**
6. **여러 상태를 한 번에 바꿀 때는 개별 할당 대신 `$patch`를 쓴다.** 개발자 도구에
   항목 하나로 기록되고 `$subscribe` 콜백도 한 번만 실행된다.

## 스토어 파일 자동 생성 (트리거 입력)

사용자가 **"OO 스토어 생성"**, **"OO 스토어 만들어 줘"** 처럼 스토어 이름과 생성 의도를
함께 말하면(예: "count 스토어 생성", "user 스토어 만들어 줘", "장바구니 스토어 생성"),
아래 절차로 **스토어 파일을 직접 만든다**. 코드 설명만 하지 말고 실제로 파일을 생성하라.

### 절차

1. **이름 정규화.** 트리거에서 스토어 이름을 뽑아 카멜케이스로 만든다. 파일명은 그 이름,
   훅 이름은 `use` + PascalCase + `Store`, 스토어 ID는 파일명과 같다.
   - `count` 스토어 생성 -> 파일 `count.ts`, 훅 `useCountStore`, ID `'count'`
   - `user profile` 스토어 -> 파일 `userProfile.ts`, 훅 `useUserProfileStore`, ID `'userProfile'`
   - 한국어 이름이면 영문으로 옮긴다("장바구니" -> `cart`). 모호하면 사용자에게 확인한다.

2. **언어 판별.** 프로젝트 루트(또는 가까운 상위)에 `tsconfig.json`이 있거나 `src` 아래
   `.ts` 파일이 있으면 **TypeScript**, 아니면 **JavaScript**로 본다.

3. **스토어 폴더 탐색.** 다음 순서로 기존 폴더를 찾아 거기에 생성한다:
   `src/stores` -> `src/store` -> `src/state`. 모두 없으면 **`src/stores`를 새로 만든다.**
   (`src`가 없는 비표준 구조면 사용자에게 위치를 확인한다.)

4. **기존 스토어 스타일 확인.** 폴더에 이미 스토어가 있으면 그 파일이 옵션 스토어인지
   셋업 스토어인지 보고 **같은 스타일로 만든다.** 프로젝트에 `.claude/rules/pinia.md`가
   있으면 그 규칙이 우선한다.

5. **충돌 확인.** 같은 이름의 파일이 이미 있으면 덮어쓰지 말고 사용자에게 알린다.

6. **Pinia 등록 확인.** `src/main.ts`에 `createPinia()` 등록이 없으면 함께 추가한다.

7. **템플릿 작성.** 아래 기본 템플릿을 채워 파일을 만든다. 비즈니스 로직은 비워 두고
   상태/게터/액션의 뼈대만 만든다. 생성 후 파일 경로와 훅 이름을 한 줄로 보고한다.

8. **검증.** TypeScript 프로젝트면 `npm run typecheck`(또는 `vue-tsc --build`)를 실행해
   통과를 확인한다.

### 기본 템플릿 (옵션 스토어)

```ts
// src/stores/count.ts
import { defineStore } from 'pinia'

export const useCountStore = defineStore('count', {
  state: () => ({
    count: 0
  }),
  getters: {
    double: state => state.count * 2
  },
  actions: {
    increase(value = 1) {
      this.count += value
    }
  }
})
```

### 기본 템플릿 (셋업 스토어)

프로젝트가 셋업 스토어로 통일돼 있을 때만 쓴다.

```ts
// src/stores/count.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCountStore = defineStore('count', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  function increase(value = 1) {
    count.value += value
  }
  function $reset() {
    count.value = 0
  }

  return { count, double, increase, $reset }
})
```

## 설치 및 구성

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` / `bun.lock` -> `bun`,
> `package-lock.json` 또는 lock 파일 없음 -> `npm`.

```bash
{pm} i pinia
```

> Pinia 4는 ESM 전용 패키지이며 Vue 3.5.11+ 와 TypeScript 5.6+ 를 요구한다.
> 개발자 도구 연동용 `@vue/devtools-api`가 피어 의존성으로 분리됐다. npm은 피어 의존성을
> 자동 설치하지만, pnpm이나 yarn의 엄격한 설정에서는 직접 설치해야 할 수 있다.

Vue 플러그인으로 등록한다.

```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .mount('#app')
```

## 스토어 작성 패턴

`defineStore(스토어_ID, 스토어_정의)`의 반환은 스토어 인스턴스를 얻는 팩토리 함수다.
보통 훅이라 부르고 `use` 접두사 + `Store` 접미사로 짓는다.

### 상태

```ts
import { defineStore } from 'pinia'

export const useCountStore = defineStore('count', {
  state: () => ({
    count: 1,
    history: [] as number[]
  })
})
```

`state`는 **꼭 팩토리 함수**여야 한다. TypeScript에서 빈 배열이나 `null` 초깃값은
`as` 단언으로 타입을 명시한다.

### 게터

```ts
export const useCountStore = defineStore('count', {
  state: () => ({ count: 1 }),
  getters: {
    double: state => state.count * 2,
    isNegative: state => state.count < 0,
    // 다른 게터를 참조할 때는 일반 함수 + this + 반환 타입 명시
    negativeDouble(): number {
      return this.double * -1
    }
  }
})
```

화살표 함수에서는 `this`로 다른 게터에 접근할 수 없다. 첫 매개변수로 상태 객체만 받는다.

### 액션

`this`로 상태, 게터, 다른 액션에 접근한다. 비동기도 가능하다.

```ts
export const useCountStore = defineStore('count', {
  // ...
  actions: {
    increase(value = 1) {
      this.$patch(state => {
        state.count += value
        state.history.push(state.count)
      })
    },
    async fetchCount() {
      const res = await fetch('https://api.heropy.dev/v0/count')
      this.count = await res.json()
    }
  }
})
```

## 컴포넌트에서 사용하기

### 인스턴스로 바로 접근 (기본)

```vue
<script setup lang="ts">
import { useCountStore } from '@/stores/count'

const countStore = useCountStore()
</script>

<template>
  <button @click="countStore.increase">증가!</button>
  <h2>Count: {{ countStore.count }}</h2>
  <h2>Double: {{ countStore.double }}</h2>
</template>
```

### 절대 하면 안 되는 패턴

```vue
<script setup lang="ts">
const countStore = useCountStore()
const { count } = countStore // 반응성이 사라진다!
</script>
```

스토어 인스턴스는 반응형 객체라 그냥 구조 분해하면 그 시점의 값으로 고정된다.
이후 상태가 바뀌어도 화면이 갱신되지 않는다.

### 구조 분해가 필요하면 `storeToRefs`

상태와 게터는 `storeToRefs()`로 감싸 반응형 참조(Ref)로 변환한다.
액션은 반응성과 무관하므로 인스턴스에서 바로 구조 분해한다.

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCountStore } from '@/stores/count'

const countStore = useCountStore()
const { count, double } = storeToRefs(countStore)
const { increase, decrease } = countStore
</script>

<template>
  <button @click="increase">증가!</button>
  <h2>Count: {{ count }}</h2>
  <h2>Double: {{ double }}</h2>
</template>
```

## 인스턴스 멤버

| 멤버 | 용도 |
|---|---|
| `$id` | 스토어 ID 문자열 |
| `$state` | 게터·액션을 뺀 상태 객체. 반응형이라 직접 수정도 가능 |
| `$patch` | 여러 상태를 단일 작업으로 변경 |
| `$subscribe` | 상태 변경 구독 |
| `$onAction` | 액션 호출 구독 |
| `$reset` | 상태를 초깃값으로 되돌림 (**옵션 스토어 전용**) |
| `$dispose` | 이펙트 스코프 정지 + 구독 해제 + 레지스트리에서 제거 |

### `$patch`

객체 방식은 간단한 변경에 편리하다. 기존 값을 참조하거나 참조형의 일부만 바꾸려면
추가 비용이 든다.

```ts
store.$patch({ count: 100, history: [...store.history, 100] })
```

함수 방식은 콜백 매개변수로 상태 객체를 받아 세부 상태를 자유롭게 바꾼다.

```ts
store.$patch(state => {
  state.count += 1
  state.history.push(state.count)
})
```

### `$subscribe`

상태가 바뀔 때마다 콜백이 실행된다. 로컬 스토리지 저장이나 외부 동기화에 쓴다.

```ts
const unsubscribe = countStore.$subscribe(
  (mutation, state) => {
    mutation.type // 'direct' | 'patch object' | 'patch function'
    mutation.storeId
  },
  { detached: true, flush: 'sync' }
)

unsubscribe()
```

- 컴포넌트에서 호출하면 언마운트 시 자동 해제된다. `detached: true`면 유지된다.
- `deep`은 기본값이 `true`다.
- **`mutation.events`는 개발 모드 전용이다.** 프로덕션 빌드에서는 `undefined`이고
  변경 방식에 따라 모양도 달라지므로 실제 로직에서 쓰면 안 된다.

### `$onAction`

```ts
const unsubscribe = countStore.$onAction(payload => {
  payload.name // 액션 이름
  payload.args // 호출 인수
  payload.after // return / resolve 후 실행할 함수 등록
  payload.onError // throw / reject 시 실행할 함수 등록
}, true) // 두 번째 인수는 객체가 아니라 불리언
```

### `$reset`

**옵션 스토어에서만 제공된다.** 셋업 스토어에서 호출하면 에러가 난다.
옵션 스토어는 `state` 자체가 초기 상태를 만드는 팩토리 함수라 Pinia가 다시 호출하면
되지만, 셋업 스토어에는 상태만 만드는 함수가 없어 Pinia가 초기화 방법을 추측하지 않는다.

셋업 스토어에서는 초기화 함수를 직접 만들어 반환한다. 이름을 `$reset`으로 지으면
쓰는 쪽에서는 옵션 스토어와 똑같이 호출할 수 있다.

```ts
export const useCountStore = defineStore('count', () => {
  const count = ref(1)
  const history = ref<number[]>([])

  function $reset() {
    count.value = 1
    history.value = []
  }

  return { count, history, $reset }
})
```

개별 상태만 초기화해야 하면 별도 액션을 작성한다.

### `$dispose`

스토어의 이펙트 스코프를 정지하고 모든 구독을 해제한 뒤 레지스트리에서 제거한다.

```ts
countStore.$dispose()
```

- 폐기 후 다시 쓰려면 훅을 다시 호출해 **새 인스턴스**를 얻어야 한다.
  폐기한 인스턴스를 그대로 재사용하면 옵션 스토어의 게터가 에러를 낸다.
- **`$dispose`는 상태까지 지우지 않는다.** 훅을 다시 호출하면 인스턴스는 새로 만들어지지만
  상태는 폐기 직전 값을 이어받는다. 상태까지 비우려면
  `delete pinia.state.value[store.$id]`로 직접 삭제한다.

## 작성 체크리스트 (MANDATORY)

새 스토어 또는 컴포넌트 사용 코드를 작성한 뒤, 종료 전에 확인한다.

- [ ] 파일 위치는 `src/stores/<이름>.ts`, 훅 이름은 `use이름Store`, ID는 파일명과 동일
- [ ] `state`가 팩토리 함수다
- [ ] 프로젝트 안의 다른 스토어와 같은 스타일(옵션/셋업)이다
- [ ] 게터에 비동기 요청이나 부수 효과가 없다
- [ ] 다른 게터를 참조하는 게터는 일반 함수 + `this` + 반환 타입 명시
- [ ] 컴포넌트에서 스토어 인스턴스를 그냥 구조 분해하지 않았다
- [ ] 구조 분해했다면 상태·게터는 `storeToRefs`, 액션은 인스턴스에서 직접
- [ ] 여러 상태를 함께 바꿀 때 `$patch`를 썼다
- [ ] 셋업 스토어라면 `$reset`을 직접 정의했다
- [ ] `mutation.events`를 실제 로직에서 쓰지 않았다
- [ ] `src/main.ts`에 `createPinia()`가 등록돼 있다
- [ ] `typecheck`와 `lint`가 통과한다

## 함께 보는 스킬

- 프로젝트 기반 설정(Tailwind, 경로 별칭, ESLint + Prettier)이 없으면
  `vue-vite-scaffold`를 먼저 적용한다
- 라우팅은 `vue-router-use`를 따른다. 내비게이션 가드에서 스토어를 쓸 때는
  Pinia가 등록된 뒤에 라우터를 등록해야 한다
- 컴포넌트 API(Props, Emits, `provide`/`inject`)는
  `vue-vite-scaffold`의 `references/components.md`를 참고한다.
  **`provide`/`inject`로 전역 상태를 흉내 내지 않는다.** 여러 화면이 공유하는 상태는 Pinia로 관리한다
