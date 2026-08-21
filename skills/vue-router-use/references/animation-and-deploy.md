# Vue Router 페이지 전환 애니메이션과 배포 설정

## 페이지 전환 애니메이션

Vue의 `<Transition>` 컴포넌트로 페이지가 바뀔 때의 전환 애니메이션을 추가한다.

**전제:** `<RouterView />`로 출력되는 페이지 컴포넌트의 최상위 요소가 **단일 요소**여야 한다.
프래그먼트(루트 요소가 여러 개)면 애니메이션이 적용되지 않는다.

```vue
<!-- src/routes/layouts/LayoutProvider.vue -->
<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Default from './DefaultLayout.vue'
import Empty from './EmptyLayout.vue'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: keyof typeof layouts
  }
}

const layouts = {
  Default,
  Empty
} as const

const route = useRoute()
</script>

<template>
  <Component :is="layouts[route.meta.layout || 'Default']">
    <Transition
      name="fade"
      mode="out-in">
      <RouterView />
    </Transition>
  </Component>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
```

`mode="out-in"`은 기존 페이지가 완전히 사라진 뒤 새 페이지가 나타나게 한다.
빼면 두 페이지가 동시에 존재해 레이아웃이 흔들린다.

## 배포 설정

`createWebHistory`(HTML5 Mode)를 쓰는 프로젝트는 모든 요청을 `index.html`로
**재작성(Rewrite)** 하는 서버 설정이 필요하다. 주소를 다른 곳으로 돌리는 리다이렉트와 달리,
재작성은 사용자가 입력한 주소를 그대로 둔 채 서버가 응답할 파일만 바꾼다.

이 설정이 없으면 사용자가 URL을 직접 입력하거나 페이지를 새로고침할 때 404가 난다.

### Vercel

```json
// vercel.json (프로젝트 루트)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify

```plaintext
# public/_redirects
/*  /index.html  200
```

또는 프로젝트 루트에 `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Firebase

```json
// firebase.json (프로젝트 루트)
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
