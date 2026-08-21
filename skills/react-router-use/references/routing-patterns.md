# React Router 라우팅 패턴

### 동적 세그먼트

URL의 일부를 변수처럼 사용한다. `:`로 표현한다.

```tsx
// src/routes/index.tsx (라우트 트리 일부)
import MovieDetails from './pages/MovieDetails'

// children 배열에 다음 항목 추가
{
  path: '/movies/:movieId',
  element: <MovieDetails />
}
```

`useParams` 훅으로 값을 추출한다.

```tsx
// src/routes/pages/MovieDetails.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router'

interface Movie {
  Title: string // 영화 제목
  Poster: string // 영화 포스터 URL
}

export default function MovieDetails() {
  const [movie, setMovie] = useState<Movie | null>(null)
  const { movieId } = useParams()

  useEffect(() => {
    fetchMovie()
  }, [movieId])

  async function fetchMovie() {
    const res = await fetch(`https://www.omdbapi.com/?apikey=KEY&i=${movieId}`)
    const movie = await res.json()
    setMovie(movie)
  }

  return <h1>{movie?.Title}</h1>
}
```

`TheHeader`의 `navigations`에 항목을 추가하면 헤더에서 진입할 수 있다.

```tsx
const navigations = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/movies/tt4154796', label: 'Movie(Avengers: Endgame)' }
]
```

### 중첩 라우팅

라우트의 `children`과 `<Outlet>`을 조합해 부모 라우트 안에서 자식 라우트를 렌더링한다. 자식 라우트의 `path`는 부모 경로를 자동으로 상속한다.

```tsx
createBrowserRouter([
  {
    path: '/parent',
    element: <Parent />,
    children: [
      {
        path: 'child', // '/parent/child'
        element: <Child />
      }
    ]
  }
])

function Parent() {
  return (
    <>
      <h1>Parent</h1>
      <Outlet />
    </>
  )
}
function Child() {
  return <h2>Child</h2>
}
```

예: 영화 검색 결과에서 특정 항목을 선택하면 같은 페이지 위에 상세 정보를 모달처럼 띄우는 패턴. 검색 페이지(`<Movies>`)의 자식으로 상세 페이지(`<MovieDetails>`)를 두면, URL은 바뀌지만 검색 페이지의 일부만 업데이트된다.

```tsx
// src/routes/index.tsx (라우트 트리 일부)
{
  path: '/movies',
  element: <Movies />,
  children: [
    {
      path: ':movieId', // '/movies/:movieId'
      element: <MovieDetails />
    }
  ]
}
```

```tsx
// src/routes/pages/Movies.tsx
import { useState } from 'react'
import { Link, Outlet } from 'react-router'

interface Movie {
  imdbID: string
  Title: string
  Poster: string
}

export default function Movies() {
  const [title, setTitle] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])

  async function fetchMovies() {
    const res = await fetch(`https://www.omdbapi.com/?apikey=KEY&s=${title}`)
    const { Search: movies } = await res.json()
    setMovies(movies)
  }

  return (
    <>
      <h1>Movies</h1>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') fetchMovies() }}
      />
      <button onClick={fetchMovies}>Search</button>
      <ul>
        {movies.map(movie => (
          <li key={movie.imdbID}>
            <Link to={`/movies/${movie.imdbID}`}>{movie.Title}</Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </>
  )
}
```

상세 페이지를 모달 형태로 표시한다.

```tsx
// src/routes/pages/MovieDetails.tsx (모달 버전)
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import styles from './MovieDetails.module.css'

interface Movie {
  Title: string
  Poster: string
}

export default function MovieDetails() {
  const [movie, setMovie] = useState<Movie | null>(null)
  const { movieId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMovie()
  }, [movieId])

  async function fetchMovie() {
    const res = await fetch(`https://www.omdbapi.com/?apikey=KEY&i=${movieId}`)
    const movie = await res.json()
    setMovie(movie)
  }

  return (
    <div className={styles.modal}>
      <div
        className={styles.overlay}
        onClick={() => navigate(-1)}
      />
      <div className={styles.content}>
        <h1>{movie?.Title}</h1>
      </div>
    </div>
  )
}
```

```css
/* src/routes/pages/MovieDetails.module.css */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
.content {
  position: relative;
  max-width: 500px;
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
}
```

자식 라우트 렌더링은 보통 `<Outlet>`을 쓰지만, `useOutlet` 훅을 쓰면 자식 라우트를 데이터로 받아 페이지 전환을 감지하거나 애니메이션을 트리거하는 데 활용할 수 있다([페이지 전환 애니메이션](animation-and-deploy.md) 참고).

```tsx
// useOutlet 훅 버전
import { useState } from 'react'
import { Link, useOutlet } from 'react-router'

export default function Movies() {
  const outlet = useOutlet()
  // ...

  return (
    <>
      {/* ... */}
      {outlet}
    </>
  )
}
```

### 찾을 수 없는 페이지

다른 라우트와 일치하지 않을 때만 렌더링되도록 **라우트 트리의 가장 마지막**에 `path: '*'`를 둔다.

```tsx
// src/routes/pages/NotFound.tsx
export default function NotFound() {
  return <h1>404 Page Not Found / 페이지를 찾을 수 없습니다.</h1>
}
```

```tsx
// src/routes/index.tsx (라우트 트리 일부, 가장 마지막에 위치!)
import NotFound from './pages/NotFound'

{
  path: '*',
  element: <NotFound />
}
```
