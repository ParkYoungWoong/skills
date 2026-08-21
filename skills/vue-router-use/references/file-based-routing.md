# Vue Router 파일 기반 라우팅

Vue Router **5부터** 페이지 컴포넌트의 파일 경로에서 라우트를 자동으로 만들어 준다.
별도 패키지였던 `unplugin-vue-router`가 통합된 것이라 추가로 설치할 패키지는 없다.

> Vue Router 4에서는 쓸 수 없다.

## 1. 번들러 플러그인 등록

Vue 플러그인이 페이지 컴포넌트를 처리하기 전에 라우트를 먼저 수집해야 하므로,
**`VueRouter()`를 `vue()`보다 앞에** 쓴다.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import VueRouter from 'vue-router/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    VueRouter(),
    vue()
  ]
})
```

## 2. 생성된 타입 인식시키기

플러그인 등록 후 개발 서버를 한 번 실행하면 프로젝트 루트에 `typed-router.d.ts`가 생긴다.
각 라우트의 이름과 경로, 동적 파라미터 타입이 여기에 기록되므로 `include`에 추가한다.

```json
// tsconfig.app.json
{
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "./typed-router.d.ts"
  ]
}
```

## 3. 파일 구조가 곧 경로

`src/pages` 폴더에 페이지 컴포넌트를 추가하면 파일 경로가 그대로 접근 경로가 된다.
파일 이름을 대괄호로 감싸면 동적 경로가 되고, 폴더와 이름이 같은 파일을 나란히 두면
중첩 경로가 된다.

```plaintext
├─src/
│  └─pages/
│     ├─movies/
│     │  └─[movieId].vue
│     ├─about.vue
│     ├─index.vue
│     └─movies.vue
```

| 파일 | 생성되는 경로 |
|---|---|
| `pages/index.vue` | `/` |
| `pages/about.vue` | `/about` |
| `pages/movies.vue` | `/movies` |
| `pages/movies/[movieId].vue` | `/movies/:movieId` |
| `pages/[...pathMatch].vue` | `/:pathMatch(.*)*` (404) |

`movies/[movieId].vue`는 `movies.vue`의 자식 라우트가 되어, `movies.vue`에 작성한
`<RouterView />` 위치에 출력된다. `children` 속성을 폴더 구조가 대신한다.

## 4. 라우터 구성

```ts
// src/routes/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

## 5. 지연 로딩

모든 페이지에 이미 적용돼 있다. 반대로 첫 화면처럼 즉시 필요한 페이지는
`importMode` 옵션에서 `'sync'`를 반환해 초기 번들에 포함시킨다.

```ts
export default defineConfig({
  plugins: [
    VueRouter({
      importMode: filepath =>
        filepath.endsWith('src/pages/index.vue') ? 'sync' : 'async'
    }),
    vue()
  ]
})
```

## 6. `definePage` 매크로

`meta`처럼 라우트 객체에 쓰던 정보는 페이지 컴포넌트에서 `definePage`로 지정한다.
컴파일 시점에 처리되는 매크로라 가져오지 않아도 된다.

```vue
<!-- src/pages/movies.vue -->
<script setup lang="ts">
definePage({
  meta: { auth: true }
})
</script>
```

라우트 이름도 파일 경로에서 자동으로 만들어진다. `pages/movies/[movieId].vue`의 이름은
`'MovieDetails'`가 아니라 `'/movies/[movieId]'`다. **직접 붙인 이름으로 이동하던 코드는
그대로 동작하지 않는다.** 쓰던 이름을 유지하려면 `definePage`의 `name`에 쓰고,
라우트별 가드(`beforeEnter`)도 같은 방식으로 지정한다.

```vue
<!-- src/pages/movies/[movieId].vue -->
<script setup lang="ts">
definePage({
  name: 'MovieDetails',
  beforeEnter: to => {
    console.log(to.fullPath)
  }
})
</script>
```

## 7. 타입 추론

자동 생성된 타입 덕분에 `useRoute()`에 라우트 이름을 전달하면 그 페이지의 동적 파라미터
타입까지 추론된다. 아래 `movieId`는 타입 단언 없이 `string`으로 추론된다.

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute('/movies/[movieId]')
const movieId = route.params.movieId
</script>
```

`definePage`로 이름을 바꿨다면 `useRoute('MovieDetails')`로 쓴다.

## 8. ESLint 조정

`vue/multi-word-component-names`는 컴포넌트 이름을 두 단어 이상으로 요구하지만,
페이지 파일 이름은 곧 접근 경로라서 `about.vue`처럼 한 단어일 수밖에 없다.

**프로젝트 전체에서 끄지 말고 페이지 폴더에서만 끈다.** 플랫 구성은 뒤에 오는 객체가
앞을 덮어쓰므로, 규칙을 켜는 `eslint-plugin-vue` 프리셋보다 **뒤에** 써야 한다.

```js
// eslint.config.js
export default defineConfigWithVueTs(
  // ...
  {
    files: ['src/pages/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
)
```

JavaScript 구성이라면 `definePage`가 `no-undef`에 걸리므로 전역으로도 선언한다.

```js
{
  languageOptions: {
    globals: { definePage: 'readonly' }
  }
}
```

## 그대로 쓸 수 있는 것

파일 기반 라우팅은 `routes` 배열을 대체할 뿐이다.
레이아웃, 스크롤 복원, `router.beforeEach` 가드, 전환 애니메이션은 손댈 필요가 없다.
