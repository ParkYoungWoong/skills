# React Router 내비게이션

## Link 활용

`<Link>`는 가장 기본적인 탐색 컴포넌트로, `to` 속성의 경로로 이동한다. `<a>`와 달리 페이지 전체를 다시 로드하지 않고 필요한 부분만 업데이트한다. (아래 세 블록은 사용 조각이다)

```tsx
import { Link } from 'react-router'

<Link to="/about">About</Link>
```

탐색 히스토리를 변경하지 않고 현재 항목을 대체하려면 `replace` 속성을 사용한다. 로그인 페이지처럼 뒤로 가기로 돌아가지 않아야 하는 경우에 유용하다.

```tsx
<Link
  to="/about"
  replace>
  About
</Link>
```

스크롤 복원을 끄고 싶다면 `preventScrollReset` 속성을 사용한다. 중첩 라우팅에서 하위 페이지로 이동할 때 유용할 수 있다.

```tsx
<Link
  to={`/movies/${movie.imdbID}`}
  preventScrollReset={true}>
  {movie.Title}
</Link>
```

## NavLink 활용

`<NavLink>`는 현재 경로와 비교해 활성 상태를 자동으로 표시하는 `<Link>`의 확장형이다. 일치하는 경우 자동으로 `active` 클래스가 추가된다.

`className`에 함수를 전달하면 `isActive`로 활성 상태에 따라 스타일을 다르게 적용할 수 있다. 기본 골격의 `TheHeader.tsx`에 CSS 모듈과 `className` 함수만 추가한다.

```css
/* src/components/TheHeader.module.css */
.nav {
  display: flex;
  gap: 14px;
}
.active {
  color: red;
  font-weight: bold;
}
```

```tsx
// src/components/TheHeader.tsx
import { NavLink } from 'react-router'
import styles from './TheHeader.module.css'

const navigations = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' }
]

export default function TheHeader() {
  return (
    <header>
      <nav className={styles.nav}>
        {navigations.map(nav => (
          <NavLink
            key={nav.to}
            to={nav.to}
            className={({ isActive }) => (isActive ? styles.active : '')}>
            {nav.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
```

활성 상태를 `children`에서 활용하고 싶다면 함수를 `children`으로 전달한다. (사용 조각)

```tsx
<NavLink to="/about">
  {({ isActive }) => (
    <>
      <span className={isActive ? styles.active : ''}>About</span>
      페이지로 이동
    </>
  )}
</NavLink>
```

`end` 속성은 현재 경로가 `to`와 **정확히** 일치할 때만 활성화한다.

| 컴포넌트 사용 | 현재 URL | 활성화 여부 |
|--|--|--|
| `<NavLink to="/about" />` | `/about` | `true` |
| `<NavLink to="/about" />` | `/about/team` | `true` |
| `<NavLink to="/about" end />` | `/about` | `true` |
| `<NavLink to="/about" end />` | `/about/team` | `false` |
| `<NavLink to="/about/" end />` | `/about` | `false` |
| `<NavLink to="/about/" end />` | `/about/` | `true` |

`caseSensitive`로 대소문자 구분을 켤 수 있다.

| 컴포넌트 사용 | 현재 URL | 활성화 여부 |
|--|--|--|
| `<NavLink to="/about/A" />` | `/about/a` | `true` |
| `<NavLink to="/about/A" caseSensitive />` | `/about/a` | `false` |

## useNavigate / Navigate / redirect

**`useNavigate` 훅**: 프로그래밍 방식으로 페이지 이동. 문자열 경로, 숫자(`-1` 뒤로 가기, `1` 앞으로 가기), 또는 `{ pathname, search, hash }` 객체를 인수로 받는다.

```tsx
// src/components/LoginButton.tsx
import { useNavigate } from 'react-router'

export default function LoginButton() {
  const navigate = useNavigate()

  function push() {
    navigate('/about')
  }
  function replace() {
    navigate('/about', { replace: true })
  }
  function go(n: number) {
    navigate(n)
  }

  return (
    <>
      <button onClick={push}>페이지 이동</button>
      <button onClick={replace}>페이지 이동(뒤로가기 불가)</button>
      <button onClick={() => go(1)}>앞으로 가기</button>
      <button onClick={() => go(-1)}>뒤로 가기</button>
    </>
  )
}
```

쿼리스트링/해시는 객체(`To` 타입)로 구조화해 전달할 수 있다.

```tsx
// src/components/GoTo.tsx
import { useNavigate } from 'react-router'

// To 객체의 타입(참고용)
// interface To {
//   pathname?: string
//   search?: string
//   hash?: string
// }

export default function GoTo() {
  const navigate = useNavigate()
  const query = { name: 'Neo', age: '85' }
  const hash = '#h1-title'

  function goDirect() {
    navigate('/signin?name=Neo&age=22#h1-title')
  }
  function goWithSearchParams() {
    navigate(`/signin?${new URLSearchParams(query).toString()}${hash}`)
  }
  function goWithObject() {
    navigate({
      pathname: '/signin',
      search: new URLSearchParams(query).toString(),
      hash
    })
  }

  return (
    <>
      <button onClick={goDirect}>직접 작성</button>
      <button onClick={goWithSearchParams}>URLSearchParams 사용</button>
      <button onClick={goWithObject}>객체 사용</button>
    </>
  )
}
```

**`<Navigate>` 컴포넌트**: 렌더링되는 즉시 다른 경로로 리다이렉트. 조건부 렌더링 단계에서 유용하다.

```tsx
// src/components/PrivatePage.tsx
import { Navigate } from 'react-router'

export default function PrivatePage({ isAuth }: { isAuth: boolean }) {
  if (!isAuth) {
    return (
      <Navigate
        to="/signin"
        replace
      />
    )
  }
  return <h1>비공개 내용</h1>
}
```

**`redirect` 함수**: Loader/Action 등 라우트 정의 외부에서 리다이렉트를 반환할 때 사용한다. 자세한 활용은 [보호된 경로](protected-routes.md) 항목 참고.
