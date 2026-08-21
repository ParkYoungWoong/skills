# Vue Router 페이지 지연 로딩

## 지연 로딩

페이지 컴포넌트를 정적으로 가져오면 사용자가 방문하지 않을 페이지까지 초기 번들에 들어가
첫 화면이 나타나기까지의 시간이 길어진다.

`component`에 컴포넌트 대신 `import` 함수를 호출하는 함수를 넣으면, 그 페이지는 별도
파일로 분리되어 접근 시점에 내려받는다.

**사용자가 가장 먼저 보게 되는 페이지는 어차피 필요하므로 지연 로딩하지 않는다.**

```ts
import HomePage from './pages/HomePage.vue'

const router = createRouter({
  // ...
  routes: [
    {
      path: '/',
      component: HomePage // 첫 화면은 정적으로
    },
    {
      path: '/about',
      component: () => import('./pages/AboutPage.vue')
    },
    {
      name: 'Movies',
      path: '/movies',
      component: () => import('./pages/MoviesPage.vue')
    }
  ]
})
```

## 로딩 표시

Vue Router는 이동을 확정하기 전에 페이지를 먼저 내려받는다. 내려받는 동안 이전 페이지가
그대로 표시되고 화면이 비지 않으므로, React의 `<Suspense>`처럼 별도의 경계 컴포넌트를
만들 필요가 없다.

다만 네트워크가 느리면 클릭하고 화면이 바뀌기까지 시간이 걸리므로 진행 표시를 더한다.
`router.beforeEach`에서 켜고 `router.afterEach`에서 끈다.
**내려받기에 실패하면 `afterEach` 대신 `router.onError`가 호출되므로 여기서도 함께 꺼야
표시가 남지 않는다.**

```ts
// src/routes/index.ts
import { ref } from 'vue'

const router = createRouter({
  // ...
})

export const isPageLoading = ref(false)

router.beforeEach(() => {
  isPageLoading.value = true
})
router.afterEach(() => {
  isPageLoading.value = false
})
router.onError(() => {
  isPageLoading.value = false
})

export default router
```

레이아웃 제공자에서 이 상태를 쓴다.

```vue
<!-- src/routes/layouts/LayoutProvider.vue -->
<script setup lang="ts">
import { isPageLoading } from '@/routes'
// ...
</script>

<template>
  <Component :is="layouts[route.meta.layout || 'Default']">
    <div v-if="isPageLoading">로딩 중...</div>
    <RouterView />
  </Component>
</template>
```

> 파일 기반 라우팅을 쓰면 지연 로딩이 모든 페이지에 이미 적용돼 있다.
> [file-based-routing.md](file-based-routing.md) 참고.
