# Vue Router 내비게이션

## 컴포넌트 방식: `<RouterLink>`

`<a>` 요소는 항상 페이지 전체를 다시 로드한다. `<RouterLink>`는 필요한 부분만 갱신한다.
`href` 대신 `to` 속성에 이동할 경로를 지정하며, 최종적으로 `<a>` 요소로 렌더링된다.

### 활성 클래스

`to`와 현재 경로의 일치 여부에 따라 활성 클래스가 자동으로 붙는다.

| `to` | 현재 경로 | `router-link-active` | `router-link-exact-active` |
|---|---|---|---|
| `/` | `/` | O | O |
| `/` | `/about` | X | X |
| `/about` | `/about` | O | O |
| `/movies` | `/movies` | O | O |
| `/movies` | `/movies/abc123` | O | X |
| `/movies/abc123` | `/movies/abc123` | O | O |

활성 여부는 **경로 문자열의 앞부분이 같은지가 아니라**, 현재 경로가 거쳐 온 라우트 객체
목록에 지정 경로의 라우트 객체가 들어 있는지로 판단한다. 위 표의 `/movies`와
`/movies/abc123` 조합은 두 라우트가 **부모-자식(중첩 경로) 관계일 때** 기준이다.
두 라우트를 나란히 최상위에 두면 `/movies/abc123`에서 `/movies` 링크에 활성 클래스가 붙지 않는다.

```vue
<style scoped>
.router-link-exact-active {
  font-weight: bold;
  color: red;
}
</style>
```

### `to` 속성의 세 가지 표기

```vue
<template>
  <!-- 1. 경로 전체를 문자로 -->
  <RouterLink :to="`/movies/${movieId}?plot=full#title`">이동</RouterLink>

  <!-- 2. path + query + hash 객체 -->
  <RouterLink
    :to="{
      path: `/movies/${movieId}`,
      query: { plot: 'full' },
      hash: '#title'
    }">
    이동
  </RouterLink>

  <!-- 3. name + params + query + hash 객체 -->
  <RouterLink
    :to="{
      name: 'MovieDetails',
      params: { movieId },
      query: { plot: 'full' },
      hash: '#title'
    }">
    이동
  </RouterLink>
</template>
```

## 이름 라우트

라우트 객체의 `name` 속성은 선택이지만 **프로젝트 안에서 고유해야 한다.**
이름으로 관리하면 경로가 바뀌어도 수정할 코드가 최소화되고, 잘못된 경로를 실수로 쓰는 것을 막는다.

```ts
routes: [
  { name: 'Home', path: '/', component: HomePage },
  { name: 'About', path: '/about', component: AboutPage },
  { name: 'SignIn', path: '/signin', component: SignInPage },
  {
    name: 'Movies',
    path: '/movies',
    component: MoviesPage,
    children: [
      { name: 'MovieDetails', path: ':movieId', component: MovieDetailsPage }
    ]
  },
  { name: 'NotFound', path: '/:pathMatch(.*)*', component: NotFoundPage }
]
```

## 프로그래밍 방식: `useRouter()`

`useRouter()`는 라우터 인스턴스를 반환한다. 현재 라우트 정보를 읽는 `useRoute()`와 다르다.

| 메서드 | 동작 |
|---|---|
| `push` | 새 페이지로 이동 (히스토리에 남음) |
| `replace` | 현재 페이지를 대체하고 이동 (뒤로 가기 불가) |
| `back` | 뒤로 가기 |
| `forward` | 앞으로 가기 |
| `go(n)` | 지정한 숫자만큼 이동 |

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <button @click="router.push('/')">이동</button>
  <button @click="router.replace('/about')">이동(뒤로가기 불가)</button>
  <button @click="router.back()">뒤로</button>
  <button @click="router.go(-1)">뒤로</button>
</template>
```

`push`와 `replace`도 `<RouterLink>`의 `to`와 같은 세 가지 표기를 받는다.

```ts
router.push(`/movies/${movieId}?plot=full#title`)

router.push({
  path: `/movies/${movieId}`,
  query: { plot: 'full' },
  hash: '#title'
})

router.push({
  name: 'MovieDetails',
  params: { movieId },
  query: { plot: 'full' },
  hash: '#title'
})
```
