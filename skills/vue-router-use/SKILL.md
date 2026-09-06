---
name: vue-router-use
description: (heropy) Use when adding Vue Router to an existing Vue 3 (Vite) project, configuring routes/layouts/navigation, or implementing route-level features such as navigation guards, protected routes, dynamic segments, query strings, nested routing, 404 pages, lazy loading, page transition animations, file-based routing, or SPA hosting redirects (Vercel/Netlify/Firebase). 사용자가 "vue-router", "뷰 라우터", "라우팅 붙여 줘", "페이지 이동", "RouterLink", "useRoute", "내비게이션 가드", "파일 기반 라우팅"을 언급할 때도 이 스킬을 따른다.
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.1.0
---

# Vue Router 사용 규칙

> 참고: https://www.heropy.dev/p/2Hstmu

기존 Vue 3(Vite) 프로젝트에 Vue Router를 도입하거나, 라우트/레이아웃/내비게이션 등
부분 기능을 추가하는 스킬. Vue Router **5.3.1** 기준이다(5.2 이상이면 내용이 같다).

> Vue Router 4를 쓰고 있다면 [파일 기반 라우팅](references/file-based-routing.md)만
> 별도 패키지(`unplugin-vue-router`)가 필요하고, 나머지 내용은 그대로 적용할 수 있다.

## 필수 실행 체크리스트 (MANDATORY)

**스킬 시작 즉시, 아래 항목을 TodoWrite에 1:1로 등록한 뒤 순서대로 진행한다. 건너뛰기 금지.**

1. 프로젝트 상태 감지 (1단계)
2. 작업 모드 결정: 초기 도입 vs 부분 기능 추가 (2단계)
3. `vue-router` 설치 [미설치 시] (3단계)
4. 기본 라우터 골격 생성 [라우터 파일이 없을 때] (4단계)
5. 사용자가 추가로 요청한 기능을 기능 가이드에서 찾아 적용 (5단계)
6. **최종 검증**: 생성/수정한 파일과 동작을 확인 (6단계)

각 항목은 조건 충족 시 "skipped"로 완료 처리하되, **조건 판단 근거를 명시**한 뒤 넘어간다.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

| 확인 대상 | 감지 방법 |
|---|---|
| Vue 프로젝트 | `package.json`의 dependencies에 `vue` 존재 |
| Vite 프로젝트 | `vite.config.ts` 또는 `vite.config.js` 존재 |
| TypeScript | `tsconfig.json` 또는 `tsconfig.app.json` 존재 |
| vue-router 설치 | `package.json`에 `vue-router` 존재 (버전도 확인) |
| 라우터 폴더 | `src/routes/index.ts` 또는 `src/router/index.ts` 존재. 있는 쪽이 이후 기준 경로 |
| 페이지 폴더 | `src/routes/pages/` 또는 공식 스타터(create-vue)의 `src/views/` 존재 |
| 파일 기반 라우팅 | `typed-router.d.ts` 또는 `src/pages/` 존재 |
| 경로 별칭 | `vite.config`와 `tsconfig.app.json`에 `@` alias 설정 |
| 패키지 매니저 | `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm` |

Vue 프로젝트가 아니면 사용자에게 알리고 중단한다.

### 2단계: 작업 모드 결정

**초기 도입 모드**: `vue-router`가 없거나 라우터 파일이 없는 경우.
3~4단계를 수행해 기본 골격을 만든다.

**부분 기능 추가 모드**: 이미 라우터가 구성돼 있는 경우.
3~4단계를 건너뛰고 5단계로 간다. **기존 라우트 구성을 통째로 다시 쓰지 않는다.**

기준 경로는 다음 규칙으로 정한다.

- 라우터 폴더는 1단계에서 감지한 기존 경로(`src/routes` 또는 `src/router`)를 따르고,
  없으면 `src/routes`를 쓴다. 이 문서와 references에 적힌 `src/routes`, `@/routes`는
  감지한 폴더로 치환해 읽는다.
- 페이지 폴더도 같다. 공식 스타터처럼 `src/views/`를 쓰고 있으면 새 페이지도 거기에 만들고,
  `src/routes/pages`는 만들지 않는다.
- 파일 이름 규칙은 유지한다: 페이지 `<이름>Page.vue`, 레이아웃 `<이름>Layout.vue`.

### 3단계: vue-router 설치 [조건: 미설치 시]

```bash
{pm} add vue-router
```

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm`.
> `{pmx}`는 해당 패키지 매니저의 실행 명령으로 대체한다. `npm` -> `npx`, `pnpm` -> `pnpm dlx`, `yarn` -> `yarn dlx`, `bun` -> `bunx`.

### 4단계: 기본 라우터 골격 생성 [조건: 라우터 파일 없을 때]

아래 구조로 만든다.

```plaintext
├─src/
│  ├─components/
│  │  └─TheHeader.vue
│  ├─routes/
│  │  ├─layouts/
│  │  │  ├─DefaultLayout.vue
│  │  │  ├─EmptyLayout.vue
│  │  │  └─LayoutProvider.vue
│  │  ├─pages/
│  │  │  ├─HomePage.vue
│  │  │  └─AboutPage.vue
│  │  └─index.ts
│  ├─App.vue
│  └─main.ts
```

임포트 규칙: 상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다. 다른 폴더의 파일은 `@/` 별칭으로 가져온다.

**1) 페이지 컴포넌트**

```vue
<!-- src/routes/pages/HomePage.vue -->
<template>
  <h1>Home page!</h1>
</template>
```

```vue
<!-- src/routes/pages/AboutPage.vue -->
<template>
  <h1>About page!</h1>
</template>
```

**2) 라우터 구성**

`scrollBehavior`를 함께 넣는다. `savedPosition`은 뒤로/앞으로 가기일 때만 값을 갖고
그 외에는 `null`이다.

```ts
// src/routes/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/routes/pages/HomePage.vue'
import AboutPage from '@/routes/pages/AboutPage.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0 }
  },
  routes: [
    {
      name: 'Home',
      path: '/',
      component: HomePage
    },
    {
      name: 'About',
      path: '/about',
      component: AboutPage
    }
  ]
})

export default router
```

> 첫 두 매개변수에 밑줄(`_`)을 붙이는 이유는 Vite가 만든 TypeScript 구성에
> `noUnusedParameters`가 켜져 있기 때문이다. 그대로 두면 개발 서버는 통과하지만
> `build`에서 오류가 난다.

**3) 헤더**

```vue
<!-- src/components/TheHeader.vue -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
nav {
  display: flex;
  gap: 10px;
}
.router-link-exact-active {
  font-weight: bold;
}
</style>
```

**4) 레이아웃**

공통 구조를 각 페이지에서 직접 넣으면 페이지 전환마다 불필요한 리렌더링이 생긴다.
레이아웃으로 분리한다.

```vue
<!-- src/routes/layouts/DefaultLayout.vue -->
<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <slot />
</template>
```

```vue
<!-- src/routes/layouts/EmptyLayout.vue -->
<template>
  <slot />
</template>
```

**5) 레이아웃 제공자**

`meta.layout` 값에 맞는 레이아웃을 동적 컴포넌트로 출력하고, `<RouterView />`를
자식으로 넘겨 각 레이아웃의 `<slot>` 위치에 페이지가 출력되게 한다.
`RouteMeta`를 확장해 잘못된 레이아웃 이름을 타입으로 막는다.

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
    <RouterView />
  </Component>
</template>
```

**6) 최상위 컴포넌트와 진입점**

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import LayoutProvider from '@/routes/layouts/LayoutProvider.vue'
</script>

<template>
  <LayoutProvider />
</template>
```

`main.ts`는 통째로 바꾸지 않는다. 기존 import(예: `./style.css`)와 `.use()` 체인은 유지하고
`router` import와 `.use(router)`만 추가한다.

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/routes'
import './style.css'

createApp(App).use(router).mount('#app')
```

Pinia가 이미 등록돼 있으면 `.use(router)`를 그 뒤에 둔다. Pinia는 라우터보다 앞이어야
가드 안에서 스토어를 쓸 수 있다.

```ts
// src/main.ts (Pinia가 있는 프로젝트)
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/routes'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')
```

> `@/` 임포트는 `@/*` 경로 별칭이 필요하다. 1단계 감지 결과 별칭이 없으면
> `vue-vite-scaffold` 스킬의 경로 별칭 단계를 먼저 적용한다. 사용자가 거부하면 상대 경로로 바꾼다.

### 5단계: 사용자 요청에 따른 기능 적용

사용자가 명시적으로 추가 기능을 요청한 경우에만 아래 매핑에서 해당 항목을 찾아 적용한다.
요청이 없으면 기본 골격만 두고 종료한다.

| 사용자 요청 예시 | 적용할 기능 |
|---|---|
| "/movies/:movieId 같은 동적 페이지 만들어 줘" | [동적 경로](references/routing-patterns.md) |
| "검색어를 주소에 남기고 싶어" / "쿼리스트링" | [쿼리스트링](references/routing-patterns.md) |
| "검색 결과를 모달로 띄우고 싶어" / "중첩 라우트로 처리" | [중첩 경로](references/routing-patterns.md) |
| "404 페이지 만들어 줘" | [찾을 수 없는 페이지](references/routing-patterns.md) |
| "로그인한 사용자만 접근하게 해 줘" / "인증 가드" | [내비게이션 가드](references/navigation-guards.md) |
| "초기 로딩 줄이게 코드 스플리팅" / "지연 로딩" | [페이지 지연 로딩](references/lazy-loading.md) |
| "페이지 바뀔 때 페이드 효과" | [페이지 전환 애니메이션](references/animation-and-deploy.md) |
| "Vercel/Netlify/Firebase 배포 시 새로고침에서 404" | [배포 설정](references/animation-and-deploy.md) |
| "폴더 구조로 라우트 자동 생성" / "파일 기반 라우팅" | [파일 기반 라우팅](references/file-based-routing.md) |
| "활성 링크 스타일" / "이름으로 이동" | [내비게이션](references/navigation.md) |
| "프로그래밍 방식으로 페이지 이동" | [내비게이션](references/navigation.md) |
| "레이아웃을 페이지마다 다르게" | 아래 "레이아웃 지정" |

### 6단계: 최종 검증 (MANDATORY)

1단계의 감지 표를 **다시 한 번 스캔**해 다음을 확인한다.

- [ ] **초기 도입 모드였던 경우:** `package.json`에 `vue-router` 존재,
      `src/routes/index.ts`, `src/routes/layouts/{DefaultLayout,EmptyLayout,LayoutProvider}.vue`,
      `src/components/TheHeader.vue`, `src/routes/pages/{HomePage,AboutPage}.vue` 존재,
      `src/main.ts`가 `.use(router)`를 호출하고 `src/App.vue`가 `<LayoutProvider />`를 렌더링
- [ ] 생성/수정한 파일이 2단계에서 정한 기준 경로 아래에 있고 이름 규칙
      (`<이름>Page.vue`, `<이름>Layout.vue`)을 따르며, 다른 폴더 임포트는 `@/` 별칭을 씀
- [ ] 사용자가 명시적으로 요청한 기능의 결과 파일(예: `src/routes/guards/requiresAuth.ts`)이
      모두 존재하고 라우트 트리에 올바르게 연결됨
- [ ] 가드를 추가했다면 `src/main.ts`에서 가드 파일을 **import** 했는지 확인
      (빠뜨리면 `router.beforeEach`가 등록되지 않아 가드가 전혀 동작하지 않는다)
- [ ] [파일 기반 라우팅] `typed-router.d.ts`가 생성돼 있고 `tsconfig.app.json`의 `include`에 포함됨
- [ ] 사용자가 요청하지 않은 영역의 기존 파일이 수정되지 않음
      (특히 기존 `main.ts`의 import와 `.use()` 체인이 보존됨)
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과 (TypeScript 검사 포함)

`RouteMeta` 확장이 누락되면 `build`의 타입 검사에서 걸린다.
`lint` 스크립트가 없는 프로젝트(ESLint 미구성)는 그 항목을 "skipped"로 두고 근거를 적는다.

**누락 항목이 있으면 해당 단계로 돌아가 즉시 보완한다.** 검증 통과 전에는 작업 종료 금지.

## 기능 가이드

### 레이아웃 지정

페이지에서 어떤 레이아웃을 쓸지는 라우트 객체의 `meta.layout`에서 정한다.
지정하지 않으면 `Default`가 쓰인다. 라우트 객체의 일부만 적으면 다음과 같다.

```ts
{
  path: '/about',
  component: AboutPage,
  meta: { layout: 'Empty' }
}
```

새 레이아웃은 `src/routes/layouts/<이름>Layout.vue`로 만들고, `LayoutProvider.vue`의
`layouts` 객체에 `<이름>` 키로 등록한다. 등록하지 않으면 `RouteMeta` 타입에 잡혀 빌드가 실패한다.

여러 페이지에 같은 레이아웃을 적용할 때는 라우트마다 지정하지 않는다.
`route.meta`는 현재 경로가 거쳐 온 **모든 라우트 객체의 `meta`를 병합한 결과**이므로,
`component` 없이 `children`만 가지는 라우트로 묶고 부모에 한 번만 쓴다.
자식에서 다시 쓰면 그 값이 우선한다. `routes` 배열의 일부만 적으면 다음과 같다.

```ts
routes: [
  {
    path: '/admin',
    meta: { layout: 'Empty' },
    children: [
      { path: '', component: AdminHomePage },
      { path: 'users', component: AdminUsersPage, meta: { layout: 'Default' } }
    ]
  }
]
```

`component`가 없는 부모 라우트는 화면에 아무것도 더하지 않고 경로와 `meta`만 묶는다.
따라서 자식 페이지는 레이아웃 제공자의 `<RouterView />` 위치에 그대로 출력된다.

### 스크롤 복원

4단계의 `scrollBehavior` 옵션이 담당한다.
뒤로/앞으로 가기면 저장된 위치로, 그 외에는 최상단으로 이동한다.

### 그 밖의 기능

아래 기능은 `references/`로 분리돼 있다. 5단계 매핑 표에서 해당 항목이 필요할 때만 그 파일을 읽는다.

| 파일 | 다루는 내용 |
|---|---|
| [references/navigation.md](references/navigation.md) | `RouterLink` 활성 클래스, `to` 객체 표기, 이름 라우트, `useRouter()` 프로그래밍 방식 탐색 |
| [references/routing-patterns.md](references/routing-patterns.md) | 동적 경로, 쿼리스트링, 중첩 경로, 찾을 수 없는 페이지(404) |
| [references/navigation-guards.md](references/navigation-guards.md) | 인증/게스트 전용 가드, `meta` 기반 분기, `RouteMeta` 확장 |
| [references/lazy-loading.md](references/lazy-loading.md) | 페이지 지연 로딩, 로딩 표시 |
| [references/animation-and-deploy.md](references/animation-and-deploy.md) | `<Transition>` 페이지 전환 애니메이션, SPA 호스팅 리라이트 설정 |
| [references/file-based-routing.md](references/file-based-routing.md) | Vue Router 5의 파일 기반 라우팅, `definePage`, ESLint 조정 |

## 주의사항

- 프로젝트에 `CLAUDE.md`나 `.claude/rules/vue-router.md`가 있으면 그 내용이 이 스킬보다 우선한다.
  기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로 만든다
- 기존 라우트 구성이 있으면 통째로 다시 쓰지 않는다. 요청받은 기능만 더한다
- 상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다. 다른 폴더의 파일은 `@/` 별칭으로 가져온다
- `meta`에 새 속성을 추가할 때마다 `declare module 'vue-router'`로 `RouteMeta`를 확장한다.
  확장하지 않으면 타입이 `unknown`으로 남는다
- 같은 라우트에서 동적 경로 값이나 쿼리스트링만 바뀌면 **컴포넌트가 재사용된다.**
  `onMounted`는 다시 호출되지 않고 `route.params`를 구조 분해하면 반응성도 잃는다.
  `watch`로 감시하거나 `onBeforeRouteUpdate` 가드로 처리한다
- 가드 파일은 `src/main.ts`에서 import해야 등록된다
- 경로 별칭(`@/*`) 설정은 이 스킬의 책임이 아니다. 없으면 `vue-vite-scaffold`의 경로 별칭 단계를 먼저 적용한다
- 패키지 매니저는 기존 프로젝트의 lock 파일로 판별한다

## 함께 보는 스킬

| 필요한 것 | 스킬 |
|---|---|
| 프로젝트 기반 설정 (Tailwind, 경로 별칭, ESLint + Prettier) | `vue-vite-scaffold` |
| 전역 상태 (스토어) | `pinia-use` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
