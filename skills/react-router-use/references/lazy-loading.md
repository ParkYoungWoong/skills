# React Router 페이지 지연 로딩

## 페이지 지연 로딩

초기 로딩 시간을 줄이기 위해 페이지 컴포넌트를 동적으로 로드한다. 페이지가 처음 사용될 때 번들이 로드된다.

- 번들 크기 감소 -> 초기 로딩 시간 단축
- 네트워크 대역폭 절약
- 페이지가 크면 전환 시 지연 발생 가능
- 로딩/에러 처리로 인한 복잡성 증가

설치:

```bash
{pm} add react-error-boundary
```

> 아래 "개념 설명" 세 블록은 `lazy`, `Suspense`, `ErrorBoundary`가 각각 무엇을 하는지 보여 주는 설명용이다. 실제 프로젝트에는 적용하지 않고, 그 아래의 **`dynamic` 헬퍼** 형태만 적용한다.

**개념 설명 1**: 기본 사용은 `lazy` + 동적 `import`다.

```tsx
import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

const Home = lazy(() => import('@/routes/pages/Home'))
const About = lazy(() => import('@/routes/pages/About'))

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

export default function Router() {
  return <RouterProvider router={router} />
}
```

**개념 설명 2**: `Suspense`로 로딩 상태를 표시한다.

```tsx
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

const Home = lazy(() => import('@/routes/pages/Home'))
const About = lazy(() => import('@/routes/pages/About'))

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

export default function Router() {
  return <RouterProvider router={router} />
}
```

**개념 설명 3**: `react-error-boundary`의 `ErrorBoundary`로 감싼다. v6부터 `error`의 타입이 `unknown`이므로 `Error`로 단언해서 쓴다.

```tsx
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createBrowserRouter, RouterProvider } from 'react-router'

const Home = lazy(() => import('@/routes/pages/Home'))
const About = lazy(() => import('@/routes/pages/About'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div>Error: {(error as Error).message}</div>
        )}>
        <Suspense fallback={<div>Loading...</div>}>
          <Home />
        </Suspense>
      </ErrorBoundary>
    )
  },
  {
    path: '/about',
    element: (
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div>Error: {(error as Error).message}</div>
        )}>
        <Suspense fallback={<div>Loading...</div>}>
          <About />
        </Suspense>
      </ErrorBoundary>
    )
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}
```

## dynamic 헬퍼 (실제 적용 형태)

라우트마다 반복되는 `<ErrorBoundary>` + `<Suspense>` 래핑을 한 곳에 정리하기 위해 `dynamic` 헬퍼를 만든다. 공통 기본 처리에 더해 라우트별 개별 로딩/에러 처리도 지정할 수 있다.

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

라우트 정의에서 `element` 대신 **`Component`** 속성에 `dynamic(...)`의 반환값을 전달한다. 기본 골격의 `src/routes/index.tsx`에서 페이지 정적 임포트를 지우고 다음 형태로 바꾼다.

```tsx
// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import { dynamic } from '@/routes/dynamic'
import DefaultLayout from '@/routes/layouts/DefaultLayout'

const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      {
        path: '/',
        Component: dynamic(() => import('@/routes/pages/Home'))
      },
      {
        path: '/about',
        Component: dynamic(() => import('@/routes/pages/About'), {
          error: ({ error }) => (
            <div>페이지를 출력할 수 없어요!({(error as Error).message})</div>
          )
        })
      }
    ]
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}
```
