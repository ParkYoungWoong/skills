# React Router 페이지 지연 로딩

### 페이지 지연 로딩

초기 로딩 시간을 줄이기 위해 페이지 컴포넌트를 동적으로 로드한다. 페이지가 처음 사용될 때 번들이 로드된다.

- 번들 크기 감소 → 초기 로딩 시간 단축
- 네트워크 대역폭 절약
- 페이지가 크면 전환 시 지연 발생 가능
- 로딩/에러 처리로 인한 복잡성 증가

기본 사용은 `lazy` + 동적 `import`이다.

```tsx
// src/routes/index.tsx
import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/about',
    element: <About />
  }
])
```

**로딩 처리** — `Suspense`로 로딩 상태를 표시한다.

```tsx
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    )
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <About />
      </Suspense>
    )
  }
])
```

**에러 처리** — `react-error-boundary`의 `ErrorBoundary`로 감싼다.

설치:

    {pm} install react-error-boundary

```tsx
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createBrowserRouter, RouterProvider } from 'react-router'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error.message}</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <Home />
        </Suspense>
      </ErrorBoundary>
    )
  },
  {
    path: '/about',
    element: (
      <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error.message}</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <About />
        </Suspense>
      </ErrorBoundary>
    )
  }
])
```

**커스텀 로드 함수** — 라우트마다 반복되는 `<ErrorBoundary>` + `<Suspense>` 래핑을 한 곳에 정리하기 위해 `dynamic` 헬퍼를 만든다. 공통 기본 처리에 더해 라우트별 개별 로딩/에러 처리도 지정할 수 있다.

```tsx
// src/routes/dynamic.tsx
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'

interface DynamicOptions {
  error?: ({ error }: FallbackProps) => React.ReactNode
  loading?: React.ReactNode
}

export function dynamic(
  importFn: () => Promise<{ default: React.ComponentType }>,
  options: DynamicOptions = {}
) {
  const Component = lazy(() => importFn())

  return function DynamicComponent() {
    return (
      <ErrorBoundary
        fallbackRender={
          options.error ||
          (({ error }) => (
            <div>Error: {(error as Error)?.message || 'Unknown error!!'}</div>
          ))
        }>
        <Suspense fallback={options.loading || <div>Loading...</div>}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    )
  }
}
```

라우트 정의에서 `element` 대신 **`Component`** 속성에 `dynamic(...)`의 반환값을 전달한다.

```tsx
// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import { dynamic } from './dynamic'
import DefaultLayout from './layouts/Default'

const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      {
        path: '/',
        Component: dynamic(() => import('./pages/Home'))
      },
      {
        path: '/about',
        Component: dynamic(() => import('./pages/About'), {
          error: ({ error }) => <div>페이지를 출력할 수 없어요!({error.message})</div>
        })
      }
    ]
  }
])
```
