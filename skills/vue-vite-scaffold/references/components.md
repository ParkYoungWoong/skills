# Vue 컴포넌트 API 패턴

> 원본: https://www.heropy.dev/p/zDWwNL

`<script setup lang="ts">` 기준. Vue 3.5+.

## 컴파일러 매크로

`defineProps()`, `defineEmits()`, `withDefaults()`, `defineModel()`, `defineOptions()`,
`defineSlots()`는 실행되는 함수가 아니라 **컴파일 단계에서 사라지는 선언**이다.
따라서 가져오기(import)가 필요 없다.

주의: 매크로는 `<script setup>` **최상위에서만** 인식된다. `setup()` 바깥으로
끌어올려지므로 지역 변수를 참조할 수 없고, 조건문이나 함수 안에서 호출하면
변환되지 않고 그대로 남아 런타임 에러가 난다.

## Props

타입 기반 선언만 쓴다.

```vue
<!-- src/components/TextField.vue -->
<script setup lang="ts">
const { myValue, backgroundColor = 'yellow' } = defineProps<{
  myValue: string
  backgroundColor?: string // 선택적 Prop
}>()
</script>

<template>
  <input
    :style="{ backgroundColor }"
    :value="myValue" />
</template>
```

- 기본값은 **반응형 Props 구조 분해**(Reactive Props Destructure)로 준다.
  Vue 3.5+에서 기본 활성화되며, 구조 분해한 변수도 반응성을 유지한다.
- 템플릿에서는 `props` 객체 없이 이름으로 바로 접근한다.
  따라서 **지역 반응형 데이터 이름을 Prop 이름과 겹치게 짓지 않는다.**
- 부모에서 전달할 때는 kebab-case가 관례다. SFC 템플릿에서는 camelCase도 동작하지만
  in-DOM 템플릿에서는 kebab-case만 쓸 수 있다.

```vue
<template>
  <TextField
    :my-value="text"
    background-color="royalblue" />
</template>
```

Vue 3.5 미만이라면 구조 분해가 반응성을 잃으므로 `withDefaults()`를 쓴다.
이때 배열이나 객체 같은 참조형 기본값은 인스턴스마다 별도 값을 갖도록 **함수로 감싸서 반환**한다.

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    myValue: string
    backgroundColor?: string
    tags?: string[]
  }>(),
  {
    backgroundColor: 'yellow',
    tags: () => [] // 참조형 기본값은 함수로
  }
)
</script>
```

## Emits

Props로 받은 데이터는 자식에서 변경할 수 없다. 변경이 필요하면 이벤트로 부모에 알린다.

```vue
<!-- src/components/TextField.vue -->
<script setup lang="ts">
const { myValue } = defineProps<{ myValue: string }>()
const emit = defineEmits<{
  update: [value: string]
  search: [keyword: string]
}>()

function handler(event: Event) {
  emit('update', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    :value="myValue"
    @input="handler" />
  <button @click="$emit('search', myValue)">검색</button>
</template>
```

```vue
<!-- 부모 -->
<template>
  <TextField
    :my-value="text"
    @update="text = $event"
    @search="search" />
</template>
```

첨부한 데이터는 핸들러의 첫 번째 인수(템플릿에서는 `$event`)로 전달된다.

## Slots

### 기본 슬롯과 대체 콘텐츠

```vue
<!-- 자식 -->
<template>
  <div class="card">
    <slot>전달된 내용이 없을 때 표시할 대체 콘텐츠</slot>
  </div>
</template>
```

### 이름 슬롯

```vue
<!-- 자식 -->
<template>
  <header><slot name="header" /></header>
  <main><slot /></main>
  <footer><slot name="footer" /></footer>
</template>
```

```vue
<!-- 부모: #이름 은 v-slot:이름 의 축약 -->
<template>
  <TheCard>
    <template #header>제목</template>
    본문 (기본 슬롯)
    <template #footer>바닥글</template>
  </TheCard>
</template>
```

### 범위 슬롯

자식의 데이터를 부모의 슬롯 콘텐츠에서 쓸 때 사용한다.

```vue
<!-- 자식 -->
<template>
  <li
    v-for="item in items"
    :key="item.id">
    <slot
      :item="item"
      :index="item.id" />
  </li>
</template>
```

```vue
<!-- 부모 -->
<template>
  <TheList :items="items">
    <template #default="{ item }">{{ item.name }}</template>
  </TheList>
</template>
```

## 폴스루 속성

Props나 Emits로 선언하지 않은 속성(`class`, `style`, `id`, `@click` 등)은
자식 컴포넌트의 **루트 요소**로 자동 상속된다.

- 루트 요소가 여러 개(프래그먼트)면 Vue가 어디에 붙일지 몰라 경고를 낸다.
  이때는 `v-bind="$attrs"`로 붙일 위치를 직접 지정한다.
- 자동 상속을 끄려면 `defineOptions({ inheritAttrs: false })`를 쓴다.
- 스크립트에서 폴스루 속성을 읽으려면 `useAttrs()`를 쓴다.

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="wrapper">
    <input v-bind="$attrs" />
  </div>
</template>
```

## v-model

`defineModel()`이 Prop 선언과 `update:modelValue` 이벤트 발생을 한 번에 처리한다.

```vue
<!-- 자식 -->
<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <input v-model="model" />
</template>
```

```vue
<!-- 부모 -->
<template>
  <TextField v-model="text" />
</template>
```

이름 있는 모델과 기본값, 수식어도 지원한다.

```vue
<script setup lang="ts">
const title = defineModel<string>('title', { default: '' })
const [content, contentModifiers] = defineModel<string>('content')
</script>
```

```vue
<template>
  <MyEditor
    v-model:title="title"
    v-model:content.trim="content" />
</template>
```

## 동적 컴포넌트

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import TabA from '@/components/TabA.vue'
import TabB from '@/components/TabB.vue'

const current = shallowRef(TabA)
</script>

<template>
  <KeepAlive>
    <component :is="current" />
  </KeepAlive>
</template>
```

- 컴포넌트 정의 객체를 `ref()`에 담으면 불필요하게 깊은 반응형 프록시가 만들어진다.
  `shallowRef()`를 쓴다.
- `<KeepAlive>`로 감싸면 전환 시 컴포넌트 상태가 유지된다.

## Provide / Inject

깊은 컴포넌트 트리에 데이터를 내려보낼 때 쓴다. **레이아웃 수준에서만 사용한다.**
일반적인 부모-자식 통신은 Props와 Emits로 한다.

```ts
// src/keys.ts
import type { InjectionKey, Ref } from 'vue'

export const themeKey = Symbol() as InjectionKey<Ref<string>>
```

```vue
<!-- 레이아웃 -->
<script setup lang="ts">
import { ref, provide } from 'vue'
import { themeKey } from '@/keys'

const theme = ref('dark')
provide(themeKey, theme)
</script>
```

```vue
<!-- 하위 컴포넌트 -->
<script setup lang="ts">
import { inject } from 'vue'
import { themeKey } from '@/keys'

const theme = inject(themeKey)
</script>
```

`InjectionKey<T>`를 쓰면 주입 값의 타입이 그대로 추론된다.
문자열 키를 쓰면 이름 충돌 위험이 있고 타입도 잃는다.

## 전역 상태

`provide` / `inject`로 전역 상태를 흉내 내지 않는다. 여러 화면이 공유하는 상태는
Pinia로 관리한다. `pinia-use` 스킬을 참고한다.
