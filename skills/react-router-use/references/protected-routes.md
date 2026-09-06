# React Router 보호된 경로

## 보호된 경로

승인된 사용자만 특정 라우트에 접근하도록 제한한다. 라우트 정의의 `loader` 속성에 Loader 함수를 두고, 함수 안에서 인증을 확인해 미인증이면 `redirect`로 로그인 페이지로 보낸다.

Loader 함수는 페이지 렌더링 **전에** 호출되며, 요청 정보(`request`)를 받는다.

```ts
// src/routes/loaders/requiresAuth.ts
import { redirect } from 'react-router'

export interface User {
  name: string
  age: number
}

async function getUser() {
  const token = localStorage.getItem('accessToken')
  // const res = await fetch('https://api.heropy.dev/user/me', {
  //   headers: { Authorization: `Bearer ${token}` }
  // })
  // return res.json()

  // 토큰 정보가 있으면 사용자 정보를 반환한다.
  if (token) return { name: 'Neo', age: 22 } satisfies User
  return null
}

// 페이지 접근 시 호출되는 로더(Loader) 함수
export async function requiresAuth({ request }: { request: Request }) {
  const user = await getUser()
  if (!user) {
    const url = new URL(request.url) // 요청 페이지의 URL 정보
    const redirectTo = url.pathname + url.search // 요청 페이지의 경로 + 쿼리스트링
    return redirect(`/signin?redirectTo=${encodeURIComponent(redirectTo)}`)
  }
  return user // 반환 데이터는 `useLoaderData`로 사용할 수 있다.
}
```

로그인 페이지는 `useSearchParams`로 `redirectTo`를 읽어, 인증 후 원래 페이지로 돌려보낸다.

```tsx
// src/routes/pages/SignIn.tsx
import { useSearchParams, useNavigate } from 'react-router'

export default function SignIn() {
  const navigate = useNavigate()
  // 쿼리스트링 정보를 가져와 사용하기 쉽게 객체로 변환한다.
  const [searchParams] = useSearchParams()
  const query = Object.fromEntries(searchParams)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // `<form>`의 새로고침(기본 동작)을 방지한다.
    event.preventDefault()
    // `<form>`의 데이터를 가져와 사용하기 쉽게 객체로 변환한다.
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData) as Record<string, string>
    // 로그인 정보가 모두 있으면 임시로 로그인 처리한다.
    if (data.email && data.password) {
      localStorage.setItem('accessToken', 'abcd1234')
      navigate(query.redirectTo || '/')
    }
  }

  return (
    <>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
        />
        <button type="submit">Sign In</button>
      </form>
    </>
  )
}
```

라우트 트리에 `loader`를 붙인다. 이제 `/movies` 및 그 하위로 접근하면 Loader가 먼저 실행된다. `/signin` 라우트는 보호 대상 라우트보다 앞에 둔다. (아래는 `children` 배열의 일부 조각이다. 전체 형태는 [누적 적용 완성 예시](routing-patterns.md#누적-적용-완성-예시) 참고)

```tsx
// src/routes/index.tsx (children 배열 일부)
import SignIn from '@/routes/pages/SignIn'
import { requiresAuth } from '@/routes/loaders/requiresAuth'

// children 배열에 SignIn 라우트를 추가하고, 보호 대상 라우트에 loader 부착
{
  path: '/signin',
  element: <SignIn />
},
{
  path: '/movies',
  element: <Movies />,
  loader: requiresAuth,
  children: [
    {
      path: ':movieId',
      element: <MovieDetails />
    }
  ]
}
```

Loader가 반환한 데이터는 페이지 컴포넌트에서 `useLoaderData`로 사용한다. (사용 조각)

```tsx
// src/routes/pages/Movies.tsx (useLoaderData 부분)
import { useLoaderData } from 'react-router'
import type { User } from '@/routes/loaders/requiresAuth'

export default function Movies() {
  const user = useLoaderData() as User | undefined
  // ...
}
```
