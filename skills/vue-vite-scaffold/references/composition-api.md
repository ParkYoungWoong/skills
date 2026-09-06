# Vue Composition API 핵심 패턴

> 원본: https://www.heropy.dev/p/zDWwNL

`<script setup lang="ts">` 기준. 프로젝트 코딩 규칙은 SKILL.md의 "Vue 코딩 규칙" 절을 따른다.

## 반응형 데이터

### ref vs reactive

| 함수 | 원시형 반응성 | 참조형 반응성 | `.value` | 반환 | 암시적 깊은 감시 |
|---|---|---|---|---|---|
| `ref()` | O | O | 필요 | 참조(Ref) 객체 | X |
| `reactive()` | **X** | O | 불필요 | 반응형 프록시 | O |

**`ref()`로 통일한다.** `reactive()`는 원시형에서 반응성을 잃고, 구조 분해에서도 반응성이
끊어진다. 두 함수가 섞이면 어느 쪽 제약이 걸리는지 매번 판단해야 하고, 판단이 틀리면
화면이 갱신되지 않는 버그가 된다.

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

const count = ref(123) // 반응성 O
const broken = reactive(123) // 반응성 X. TS에서는 타입 에러로 바로 드러난다

const user = ref({ name: 'HEROPY', age: 85 })
console.log(user.value.name)
</script>
```

템플릿 안에서는 `ref`든 `reactive`든 `.value`를 쓰지 않는다.

```vue
<template>
  <div>{{ count }}</div>
  <div>{{ user.name }}</div>
</template>
```

### 요소 참조

`useTemplateRef()`에 템플릿의 `ref` 속성값을 넘기면 DOM 요소가 담긴다 (Vue 3.5+).
타입은 템플릿에서 추론되므로 직접 적지 않는다. 마운트 전에는 `null`이므로 접근 시점에 주의한다.

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

const inputEl = useTemplateRef('inputEl')
onMounted(() => inputEl.value?.focus())
</script>

<template>
  <input ref="inputEl" />
</template>
```

Vue 3.5 미만이라면 같은 이름의 `ref`를 선언하는 방식을 쓴다.

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputEl = ref<HTMLInputElement | null>(null)
onMounted(() => inputEl.value?.focus())
</script>
```

## 템플릿 문법

| 문법 | 용도 |
|---|---|
| `{{ 표현식 }}` | 데이터 보간. 문(statement)이 아닌 **표현식**만 가능 |
| `v-html` | HTML 문자열 출력. XSS 위험이 있으므로 신뢰할 수 있는 값에만 쓴다 |
| `:속성` (`v-bind`) | 속성 바인딩. `:disabled="isDisabled"` |
| `:class` | 객체(`{ active: isActive }`) 또는 배열 형태 |
| `:style` | 객체 형태. 속성명은 camelCase 또는 kebab-case |
| `v-if` / `v-else-if` / `v-else` | 조건부 렌더링. 조건이 거짓이면 DOM에서 제거 |
| `v-show` | 조건부 표시. `display: none`으로만 감춘다. 토글이 잦으면 이쪽 |
| `v-for` | 리스트 렌더링. **항상 `:key`를 함께 쓴다** |
| `@이벤트` (`v-on`) | 이벤트 핸들링 |
| `v-model` | 양방향 바인딩 |

### v-if와 v-for

**같은 요소에 함께 쓰지 않는다.** Vue 3에서는 `v-if`가 먼저 평가돼 `v-for`의 별칭
변수에 접근할 수 없다. `<template v-for>`로 감싸고 안쪽 요소에 `v-if`를 두거나,
`computed()`로 미리 걸러낸 배열을 순회한다.

```vue
<template>
  <!-- 권장: computed로 미리 거른다 -->
  <li
    v-for="user in activeUsers"
    :key="user.id">
    {{ user.name }}
  </li>
</template>
```

### v-for의 다양한 대상

```vue
<template>
  <!-- 배열: (값, 인덱스) -->
  <li
    v-for="(item, i) in items"
    :key="item.id">
    {{ i }}: {{ item.name }}
  </li>

  <!-- 객체: (값, 키, 인덱스) -->
  <li
    v-for="(value, key, i) in user"
    :key="key">
    {{ key }}: {{ value }}
  </li>

  <!-- 숫자 범위: 1부터 시작 -->
  <li
    v-for="n in 5"
    :key="n">
    {{ n }}
  </li>
</template>
```

### 이벤트 수식어

| 수식어 | 동작 |
|---|---|
| `.prevent` | `event.preventDefault()` |
| `.stop` | `event.stopPropagation()` |
| `.capture` | 캡처 단계에서 처리 |
| `.self` | 이벤트 대상이 자기 자신일 때만 |
| `.once` | 한 번만 실행 |
| `.passive` | 스크롤 성능 개선. `.prevent`와 함께 쓰지 않는다 |
| `.enter` `.esc` `.tab` 등 | 키 수식어 |
| `.left` `.right` `.middle` | 마우스 버튼 수식어 |

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input @keyup.enter="search" />
  </form>
</template>
```

## 양식 입력 바인딩

| 요소 | 바인딩 대상 |
|---|---|
| 텍스트 / textarea | 문자열 |
| 단일 체크박스 | 불리언 (`true-value` / `false-value`로 값 지정 가능) |
| 다중 체크박스 | 배열 (각 input에 `value` 필요) |
| 라디오 | 선택된 `value` |
| 단일 select | 선택된 `value` |
| 다중 select (`multiple`) | 배열 |
| `contenteditable` | `v-model` 불가. `@input`으로 직접 처리 |

수식어: `.lazy`(change 시점에 동기화), `.number`(숫자로 변환), `.trim`(앞뒤 공백 제거)

## computed와 watch

| 기준 | `computed()` | `watch()` |
|---|---|---|
| 목적 | 값 만들기 | 변화에 반응해 동작 실행 |
| 반환 | 계산된 값(Ref) | 감시 종료 함수 |
| 캐싱 | O (의존 데이터가 바뀔 때만 재계산) | X |
| 감시 대상 | 게터에서 쓴 데이터를 자동 추적 | 첫 번째 인수로 명시 |
| 비동기 | 쓰지 않는다 | 쓸 수 있다 |

판단 기준은 간단하다. **템플릿에 표시할 값을 만드는 것이면 `computed()`**,
로컬 스토리지 저장이나 데이터 요청처럼 값 바깥에서 일어나는 일이면 `watch()`다.

```vue
<script setup lang="ts">
// 안 좋음: watch로 파생 값을 만든다. 상태가 둘로 늘고 동기화 책임이 사람에게 온다
const price = ref(1000)
const formattedPrice = ref('')
watch(price, v => (formattedPrice.value = v.toLocaleString()), {
  immediate: true
})

// 좋음: 상태는 하나로 유지된다. immediate도 필요 없다
const formatted = computed(() => price.value.toLocaleString())
</script>
```

값을 만드는 데 비동기 작업이 필요하면 `watch()`를 쓴다. 게터는 값을 읽는 시점에
호출되므로, 그 안에서 요청을 보내면 언제 몇 번 발생할지 예측할 수 없다.

### watch 패턴

```ts
// 단일 감시
watch(count, (newVal, oldVal) => {})

// 다중 감시: 배열로 넘기면 콜백 인수도 배열
watch([a, b], ([newA, newB], [oldA, oldB]) => {})

// 게터 감시: 객체의 특정 속성만
watch(
  () => user.value.name,
  name => {}
)

// 깊은 감시: 중첩 속성 변화까지 (비용이 크므로 필요할 때만)
watch(user, () => {}, { deep: true })

// 즉시 실행
watch(count, () => {}, { immediate: true })

// 감시 종료
const stop = watch(count, () => {})
stop()

// 정리 콜백: 다음 콜백 실행 직전 / 감시 종료 시 호출
watch(id, (newId, oldId, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  fetch(`/api/${newId}`, { signal: controller.signal })
})

// 정리 콜백 (Vue 3.5+): onWatcherCleanup은 콜백 안 어디서든 호출할 수 있다
import { onWatcherCleanup } from 'vue'

watch(id, newId => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  fetch(`/api/${newId}`, { signal: controller.signal })
})
```

`ref`가 객체를 담고 있을 때 속성만 바꾸면 `deep` 없이는 감지되지 않는다.
반대로 `reactive()`는 항상 깊은 감시라 의도치 않게 비용이 커질 수 있다.

## 생명주기 훅

| 훅 | 시점 |
|---|---|
| `onBeforeMount` | 마운트 직전 |
| `onMounted` | 마운트 완료. **DOM 접근은 여기서** |
| `onBeforeUpdate` | 갱신 직전 |
| `onUpdated` | 갱신 완료 |
| `onBeforeUnmount` | 언마운트 직전. **타이머와 리스너 정리** |
| `onUnmounted` | 언마운트 완료 |
| `onErrorCaptured` | 하위 컴포넌트 에러 포착 |

## 컴포저블

로직 재사용의 표준 수단이다. 믹스인은 쓰지 않는다.

- 파일 위치: `src/composables/useXxx.ts`
- 함수 이름: `use` 접두사
- 반환: 필요한 것만 객체로. 상태는 `ref`, 파생 값은 `computed`
- 컴포넌트 안에서 정리가 필요하면 컴포저블 내부에서 `onUnmounted`로 처리한다

```ts
// src/composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e: MouseEvent) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<script setup lang="ts">
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>
```

컴포넌트 API(Props, Emits, Slots, `v-model`, `provide`/`inject`)는
[components.md](components.md)를 참고한다.
