# Vue Router 라우팅 패턴

## 동적 경로

`path`에 `:` 기호로 변수를 지정하면 URL의 일부를 변수처럼 쓸 수 있다.
단일 컴포넌트로 여러 페이지를 관리한다. 라우트 객체의 일부만 적으면 다음과 같다.

```ts
{
  name: 'MovieDetails',
  path: '/movies/:movieId',
  component: MovieDetailsPage
}
```

값은 `useRoute()`가 반환한 라우트 정보의 `params`에서 읽는다.

**주의:** 같은 라우트 안에서 동적 경로 값만 바뀌면(`/movies/tt1` -> `/movies/tt2`)
Vue Router는 컴포넌트를 새로 만들지 않고 **재사용한다.** 그래서 `onMounted` 같은
생명주기 훅은 다시 호출되지 않고, `route.params`를 구조 분해로 꺼내면 반응성도 잃는다.
`watch`로 감시하거나 `onBeforeRouteUpdate` 가드로 처리한다.
`KEY`는 발급받은 OMDb API 키로 바꾼다.

```vue
<!-- src/routes/pages/MovieDetailsPage.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Movie {
  imdbID: string
  Title: string
  Poster: string
}

const route = useRoute()
const movie = ref<Movie | null>(null)

async function fetchMovieDetails(movieId: string) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=KEY&i=${movieId}`)
  movie.value = await res.json()
}

watch(
  () => route.params.movieId as string,
  movieId => fetchMovieDetails(movieId),
  { immediate: true } // 첫 진입에서도 한 번 호출한다
)
</script>

<template>
  <template v-if="movie">
    <h1>{{ movie.Title }}</h1>
    <img
      :src="movie.Poster"
      :alt="movie.Title" />
  </template>
</template>
```

> 예제의 `apikey=KEY`는 플레이스홀더다. [OMDb API](https://www.omdbapi.com/apikey.aspx)에서
> 키를 발급받아 환경 변수로 관리한다. 키를 소스에 그대로 두지 않는다.

## 쿼리스트링

`?plot=full&page=2` 같은 쿼리스트링은 `route.query`에서 읽는다.
동적 경로와 달리 라우트 객체에 미리 정의할 필요가 없고 어느 경로에서든 읽을 수 있다.
페이지 컴포넌트의 일부만 적으면 다음과 같다.

```vue
<!-- src/routes/pages/MovieDetailsPage.vue (일부) -->
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// /movies/tt4154796?plot=full&page=2 로 접근한 경우
console.log(route.query.plot) // 'full'
console.log(route.query.page) // '2'
</script>
```

값은 주소 문자의 일부이므로 숫자가 필요하면 직접 변환한다.
타입은 `string | null` 또는 그 배열이다.

| 주소 | `route.query.plot` |
|---|---|
| `?plot=full` | `'full'` |
| `?plot=` | `''` |
| `?plot` | `null` |
| `?plot=full&plot=short` | `['full', 'short']` |

쿼리스트링만 바뀌는 이동도 동적 경로와 마찬가지로 컴포넌트를 재사용한다. `watch`로 감시한다.

```ts
watch(
  () => route.query.plot,
  plot => {
    /* ... */
  }
)
```

검색어나 필터처럼 값이 자주 바뀌면 히스토리를 남기지 않도록 `replace`를 쓴다.
경로를 생략하고 `query`만 전달하면 현재 경로를 유지한 채 쿼리스트링만 바뀐다.
이때 **기존 쿼리스트링은 통째로 대체되므로 유지할 값은 펼쳐서 함께 넘긴다.**
페이지 컴포넌트의 일부만 적으면 다음과 같다.

```vue
<!-- src/routes/pages/MovieDetailsPage.vue (일부) -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function updatePlot(plot: string) {
  router.replace({ query: { ...route.query, plot } })
}
</script>

<template>
  <RouterLink
    :to="{ query: { plot: 'short' } }"
    replace>
    줄거리 짧게
  </RouterLink>
</template>
```

## 중첩 경로

부모 라우트 컴포넌트 안에 자식 라우트 컴포넌트를 포함한다.
자식이 출력될 위치를 부모 페이지에 `<RouterView />`로 지정한다. 라우트 객체의 일부만 적으면 다음과 같다.

```ts
{
  name: 'Movies',
  path: '/movies',
  component: MoviesPage,
  children: [
    { name: 'MovieDetails', path: ':movieId', component: MovieDetailsPage }
  ]
}
```

자식의 `path`는 `/`로 시작하지 않는다. 부모 경로에 이어 붙는다. `KEY`는 발급받은 OMDb API 키로 바꾼다.

```vue
<!-- src/routes/pages/MoviesPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

interface Movie {
  imdbID: string
  Title: string
}

const searchTitle = ref('')
const movies = ref<Movie[]>([])

async function fetchMovies() {
  const url = `https://www.omdbapi.com/?apikey=KEY&s=${searchTitle.value}`
  const res = await fetch(url)
  const { Search } = await res.json()
  movies.value = Search
}
</script>

<template>
  <div>
    <h1>Movies page!</h1>
    <input
      v-model="searchTitle"
      @keydown.enter="fetchMovies" />
    <button @click="fetchMovies">검색</button>
    <ul>
      <li
        v-for="movie in movies"
        :key="movie.imdbID">
        <RouterLink :to="`/movies/${movie.imdbID}`">
          {{ movie.Title }}
        </RouterLink>
      </li>
    </ul>
    <!-- 자식 라우트(상세 정보)가 여기에 출력된다 -->
    <RouterView />
  </div>
</template>
```

부모의 기본 화면이 필요하면 `path: ''`인 자식을 둔다.

## 찾을 수 없는 페이지 (404)

`pathMatch`라는 이름으로 모든 하위 경로를 일치시키는 정규식을 쓴다. 라우트 객체의 일부만 적으면 다음과 같다.

```ts
{
  name: 'NotFound',
  path: '/:pathMatch(.*)*',
  component: NotFoundPage
}
```

Vue Router는 **배열에 작성한 순서가 아니라 경로가 얼마나 구체적인지를 점수로 계산해서**
일치 여부를 확인한다. 이 경로는 가장 덜 구체적이므로 배열의 어느 위치에 두어도
다른 라우트를 모두 확인한 뒤에 일치한다. 다만 읽는 순서와 실제 동작을 맞추기 위해
배열의 가장 마지막에 두는 것이 일반적이다.
