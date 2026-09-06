# Vue Router 내비게이션 가드

페이지 이동 전에 조건을 확인해 이동을 취소하거나 다른 경로로 리다이렉트한다.
주로 로그인 등 사용자 인증 확인에 쓴다.

```plaintext
├─src/
│  ├─routes/
│  │  ├─guards/
│  │  │  ├─guestOnly.ts
│  │  │  ├─requiresAuth.ts
│  │  │  └─index.ts
│  │  ├─pages/
│  │  │  └─SignInPage.vue
│  │  └─index.ts
│  └─main.ts
```

## 1. 라우트에 `meta` 지정

`routes` 배열의 일부만 적으면 다음과 같다.

```ts
routes: [
  {
    name: 'SignIn',
    path: '/signin',
    component: SignInPage,
    meta: { guestOnly: true }
  },
  {
    name: 'Movies',
    path: '/movies',
    component: MoviesPage,
    meta: { auth: true },
    children: [/* ... */]
  }
]
```

## 2. 가드 작성

접근이 거부되면 이동할 경로를 `redirect` 함수에서 반환한다.
원래 가려던 경로(`to.fullPath`)를 `redirectTo` 쿼리스트링으로 넘기면 로그인 후 되돌려 보낼 수 있다.

```ts
// src/routes/guards/requiresAuth.ts
import type { RouteGuard } from '.'

export const requiresAuth: RouteGuard = {
  guard(to) {
    if (to.meta.auth) {
      const token = localStorage.getItem('accessToken')
      // 토큰이 유효한지 확인
      if (!token) return false
    }
    return true
  },
  redirect: to => ({ path: '/signin', query: { redirectTo: to.fullPath } })
}
```

```ts
// src/routes/guards/guestOnly.ts
import type { RouteGuard } from '.'

export const guestOnly: RouteGuard = {
  guard(to) {
    if (to.meta.guestOnly) {
      const token = localStorage.getItem('accessToken')
      if (token) return false
    }
    return true
  },
  redirect: () => '/'
}
```

## 3. 가드 등록과 `RouteMeta` 확장

`router.beforeEach`의 콜백은 모든 페이지 접근 직전에 호출되며, `to`는 이동할 페이지의
라우트 객체다. 레이아웃의 `meta.layout`을 확장했던 것처럼 `meta.auth`와 `meta.guestOnly`도
확장한다. 확장하지 않으면 두 속성의 타입이 `unknown`으로 남는다.

```ts
// src/routes/guards/index.ts
import type {
  RouteLocationNormalizedGeneric,
  RouteLocationRaw
} from 'vue-router'
import router from '@/routes'
import { requiresAuth } from './requiresAuth'
import { guestOnly } from './guestOnly'

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    guestOnly?: boolean
  }
}

router.beforeEach(to => {
  if (!requiresAuth.guard(to)) return requiresAuth.redirect(to)
  if (!guestOnly.guard(to)) return guestOnly.redirect(to)
  return true
})

export interface RouteGuard {
  guard(to: RouteLocationNormalizedGeneric): boolean
  redirect(to: RouteLocationNormalizedGeneric): RouteLocationRaw
}
```

## 4. 진입점에서 가드 파일 가져오기 (빠뜨리기 쉬움)

기존 import(예: `./style.css`)와 `.use()` 체인은 유지하고 가드 import 한 줄만 추가한다.

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/routes'
import '@/routes/guards'
import './style.css'

createApp(App).use(router).mount('#app')
```

**이 import를 빠뜨리면 `router.beforeEach`가 호출되지 않아 가드가 전혀 동작하지 않는다.**

## 5. 로그인 페이지

`redirectTo` 쿼리스트링이 있으면 로그인 후 그 경로로 돌려보낸다.

```vue
<!-- src/routes/pages/SignInPage.vue -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function handleSubmit(event: Event) {
  const formData = new FormData(event.target as HTMLFormElement)
  const entries = Object.fromEntries(formData) as Record<string, string>
  const { email, password } = entries
  if (email && password) {
    localStorage.setItem('accessToken', 'abcd1234')
    const redirectTo = (route.query.redirectTo as string) || '/'
    router.push(redirectTo)
  }
}
</script>

<template>
  <h1>Sign In page!</h1>
  <form @submit.prevent="handleSubmit">
    <input
      name="email"
      type="email"
      placeholder="Email" />
    <input
      name="password"
      type="password"
      placeholder="Password" />
    <button type="submit">로그인</button>
  </form>
</template>
```

> 위 예제는 흐름을 보이기 위한 임시 처리다. 실제 프로젝트에서는 서버 인증 결과를 쓰고,
> 토큰 저장 위치와 만료 처리는 프로젝트의 인증 정책을 따른다.
> 인증 상태를 여러 화면이 공유한다면 `localStorage` 직접 접근 대신 Pinia 스토어로 감싼다
> (`pinia-use` 스킬 참고). 이때 `createPinia()`가 라우터보다 먼저 등록돼 있어야
> 가드 안에서 스토어를 쓸 수 있다.
