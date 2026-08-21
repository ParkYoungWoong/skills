---
name: react-router-use
description: (heropy) Use when adding React Router (Data Mode) to an existing React (Vite/CSR) project, configuring routes/layouts/navigation, or implementing route-level features such as loaders, protected routes, dynamic segments, nested routing, 404 pages, lazy loading, page transition animations, or SPA hosting redirects (Vercel/Netlify/Firebase).
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.1.0
---

# React Router (Data Mode) Use

> 참고: https://www.heropy.dev/p/9tesDt

기존 React(Vite/CSR) 프로젝트에 React Router 7.x **Data Mode**(`createBrowserRouter` + `RouterProvider`)를 도입하거나, 이미 react-router가 구성된 프로젝트에 라우트/레이아웃/내비게이션/Loader 등 부분 기능을 추가하는 스킬.

이 스킬은 **Data Mode** 기준이다. `<BrowserRouter><Routes><Route>`로 구성되는 Declarative Mode 또는 Remix 기반 Framework Mode(`@react-router/dev`)가 필요하면 이 스킬은 적합하지 않다.

## 필수 실행 체크리스트 (MANDATORY)

**스킬 시작 즉시, 아래 항목을 TodoWrite에 1:1로 등록한 뒤 순서대로 진행한다. 건너뛰기 금지.**

1. 프로젝트 상태 감지 (1단계)
2. 작업 모드 결정: 초기 도입 vs 기능 추가 (2단계)
3. `react-router` 설치 [미설치 시] (3단계)
4. 기본 라우터 골격 생성 [라우터 파일 없을 때] (4단계)
5. 사용자가 추가로 요청한 기능을 [기능 가이드](#기능-가이드) 섹션에서 찾아 적용 (5단계)
6. **최종 검증** — 1단계 감지 표를 다시 돌며 누락된 자동 적용 항목이 있으면 재실행 (6단계)

각 항목은 조건 충족 시 "skipped"로 완료 처리하되, **조건 판단 근거(파일/패키지 존재 여부)를 명시**한 뒤 넘어간다.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

| 확인 대상 | 감지 방법 |
|-----------|-----------|
| React 프로젝트 | `package.json`의 `dependencies`에 `react` 존재 |
| TypeScript | `tsconfig.json` 또는 `tsconfig.app.json` 존재 |
| react-router 설치 | `package.json`의 `dependencies`에 `react-router` 존재 |
| `react-router-dom` 사용 여부 | `package.json`의 dependencies 또는 `src/` 소스에 `from 'react-router-dom'` 임포트 존재 (v6→v7 마이그레이션 감지용) |
| 라우터 파일 | `src/routes/index.tsx` 존재 여부 |
| 레이아웃 파일 | `src/routes/layouts/Default.tsx` 존재 여부 |
| 헤더 컴포넌트 | `src/components/TheHeader.tsx` 존재 여부 |
| `main.tsx` 렌더 구조 | `src/main.tsx`의 `createRoot(...).render(...)` 자식이 (a) 단순 `<App />`인지, (b) 이미 `<Router />`/`<RouterProvider>`가 연결되어 있는지, (c) 다른 Provider/Wrapper(ThemeProvider, ErrorBoundary, i18n 등)가 감싸고 있는지 |
| `@/*` 경로 별칭 | `tsconfig` 또는 `vite.config`에 `@/*` alias 존재 (이 스킬의 예제는 `@/components/...` 임포트 사용) |
| 패키지 매니저 | `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb`/`bun.lock` → bun, `package-lock.json` 또는 없음 → npm |

### 2단계: 작업 모드 결정

**초기 도입 모드** — `react-router` 미설치 **그리고** `react-router-dom` 미사용 **그리고** `src/routes/index.tsx` 없음:
1. 3단계로 `react-router`를 설치한다
2. 4단계로 기본 라우터 골격(`src/routes/index.tsx`, `src/routes/layouts/Default.tsx`, `src/components/TheHeader.tsx`, `src/routes/pages/Home.tsx`/`About.tsx`)을 자동 생성하고 `src/main.tsx`의 렌더 호출을 **surgical하게** 라우터 연결로 바꾼다(자세한 규칙은 4단계 `src/main.tsx` 절 참고)
3. 사용자가 추가로 요청한 기능만 5단계에서 적용한다

**기능 추가 모드** — `react-router` 이미 설치되어 있거나 라우터 파일이 이미 존재:
1. 3·4단계는 skipped로 처리한다 (조건 미충족)
2. 5단계에서 사용자 요청에 해당하는 기능 가이드만 골라 적용한다

**마이그레이션 모드** — 1단계 감지에서 `react-router-dom` 사용이 확인됨:
1. 사용자에게 v6 `react-router-dom` → v7 `react-router` 마이그레이션을 진행할지 **명시적으로 확인**한다. 동의 없이 임의로 임포트를 바꾸지 않는다.
2. 동의가 있으면, 모든 `from 'react-router-dom'` 임포트를 `from 'react-router'`로 일괄 변경하고 `react-router-dom`을 제거(`{pm} uninstall react-router-dom`)한 뒤 `react-router`를 설치한다. 그 외 기존 라우트 구조는 그대로 둔다.
3. 마이그레이션 후 사용자가 새로 요청한 기능만 5단계에서 적용한다.

> **이미 존재하는 파일은 덮어쓰지 않는다.** 기존 파일은 사용자가 명시적으로 변경을 요청한 부분만 최소한으로 수정한다.

### 3단계: react-router 설치 [조건: 미설치 시]

> v7부터는 `react-router-dom`을 사용하지 않는다. 항상 `react-router`만 설치한다.

명령:

    {pm} install react-router

`{pm}`은 1단계의 패키지 매니저 감지 결과(npm/pnpm/yarn/bun)로 대체한다.

### 4단계: 기본 라우터 골격 생성 [조건: 라우터 파일 없을 때]

다음 폴더/파일 구조를 생성한다. 이미 존재하는 파일은 건드리지 않는다.

```
src/
├─components/
│  └─TheHeader.tsx
├─routes/
│  ├─layouts/
│  │  └─Default.tsx
│  ├─pages/
│  │  ├─About.tsx
│  │  └─Home.tsx
│  └─index.tsx
└─main.tsx
```

각 파일의 초기 내용은 다음과 같다.

`src/routes/pages/Home.tsx`:

```tsx
export default function Home() {
  return <h1>Home</h1>
}
```

`src/routes/pages/About.tsx`:

```tsx
export default function About() {
  return <h1>About</h1>
}
```

`src/components/TheHeader.tsx` — `<Link>`/`<NavLink>`를 쓰면 페이지 이동 시 전체가 다시 로드되지 않고 필요한 부분만 업데이트된다:

```tsx
import { NavLink } from 'react-router'

const navigations = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' }
]

export default function TheHeader() {
  return (
    <header>
      <nav>
        {navigations.map(nav => (
          <NavLink
            key={nav.to}
            to={nav.to}>
            {nav.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
```

`src/routes/layouts/Default.tsx` — `<Outlet>` 자리에 자식 라우트가 렌더링된다. `<ScrollRestoration>`은 페이지 이동 시 스크롤 위치를 자동으로 처리한다:

```tsx
import { Outlet, ScrollRestoration } from 'react-router'
import TheHeader from '@/components/TheHeader'

export default function DefaultLayout() {
  return (
    <>
      <TheHeader />
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
```

`src/routes/index.tsx` — 경로(`path`) 없이 `element`만 지정한 최상위 라우트의 `children`에 페이지 라우트를 둔다. 그러면 자식 라우트가 렌더링될 때 부모 `<DefaultLayout />`도 같이 렌더링된다:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import DefaultLayout from './layouts/Default'
import Home from './pages/Home'
import About from './pages/About'

const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/about',
        element: <About />
      }
    ]
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}
```

`src/main.tsx` — **항상 이미 존재하는 파일이므로 전체를 덮어쓰지 않는다.** 1단계의 `main.tsx` 렌더 구조 감지 결과에 따라 다음과 같이 처리한다.

- **(a) 자식이 단순 `<App />`인 경우** (Vite 기본 템플릿) — `App` 임포트를 제거하고 `Router` 임포트를 추가한 뒤 렌더 자리의 `<App />`만 `<Router />`로 교체한다. `<StrictMode>` 등 기존 wrapper는 그대로 유지한다. `App.tsx`가 더 이상 어디에서도 사용되지 않으면 사용자에게 삭제 여부를 확인한 뒤 제거한다.
- **(b) 이미 `<Router />`/`<RouterProvider>`가 연결되어 있는 경우** — `main.tsx`는 건드리지 않는다.
- **(c) 다른 Provider/Wrapper(ThemeProvider, ErrorBoundary, i18n 등)가 `<App />`을 감싸고 있는 경우** — 임의로 손대지 말고 사용자에게 다음 두 가지 중 어떤 구조를 원하는지 확인한다.
  1. 기존 wrapper들 안에 `<Router />`를 그대로 끼워 넣어 wrapper → Router 순서를 유지
  2. `<Router />`를 가장 바깥으로 빼서 라우트별로 wrapper의 영향을 받지 않게 할지

원하는 결과 예시(가장 단순한 (a) 케이스):

```tsx
import { createRoot } from 'react-dom/client'
import Router from './routes'

createRoot(document.getElementById('root')!).render(
  <>
    <Router />
  </>
)
```

> `@/components/TheHeader` 임포트는 `@/*` 경로 별칭이 필요하다. 1단계 감지 결과 별칭이 없으면 임포트를 상대 경로(`../../components/TheHeader`)로 바꾸거나, 사용자에게 별칭 설정을 권유한다(별칭 설정은 `react-vite-scaffold` 스킬의 5단계 책임이며, 이 스킬에서 자동으로 건드리지 않는다).

### 5단계: 사용자 요청에 따른 기능 적용

사용자가 명시적으로 추가 기능을 요청한 경우에만 [기능 가이드](#기능-가이드) 섹션에서 해당 항목을 찾아 적용한다. 요청이 없으면 기본 골격만 두고 종료한다.

요청과 기능의 매핑 예:

| 사용자 요청 예시 | 적용할 기능 |
|------------------|-------------|
| "/movies/:movieId 같은 동적 페이지 만들어 줘" | [동적 세그먼트](references/routing-patterns.md) |
| "검색 결과를 모달로 띄우고 싶어" / "중첩 라우트로 처리" | [중첩 라우팅](references/routing-patterns.md) |
| "404 페이지 만들어 줘" | [찾을 수 없는 페이지](references/routing-patterns.md) |
| "로그인한 사용자만 접근하게 해 줘" / "Protected Route" | [보호된 경로](references/protected-routes.md) |
| "초기 로딩 줄이게 코드 스플리팅" / "lazy 적용" | [페이지 지연 로딩](references/lazy-loading.md) |
| "페이지 바뀔 때 페이드 효과" | [페이지 전환 애니메이션](references/animation-and-deploy.md) |
| "Vercel/Netlify/Firebase 배포 시 새로고침에서 404" | [배포 설정](references/animation-and-deploy.md) |
| "NavLink 활성 스타일 / end / caseSensitive" | [NavLink 활용](references/navigation.md) |
| "프로그래밍 방식으로 페이지 이동" | [useNavigate / Navigate / redirect](references/navigation.md) |
| "Link에 state 넘기기 / replace / 스크롤 유지" | [Link 활용](references/navigation.md) |
| "Declarative/Framework 모드 차이" | [모드 비교](#모드-비교) |

### 6단계: 최종 검증 (MANDATORY)

모든 단계 수행 후, 1단계의 감지 표를 **다시 한 번 스캔**해 다음을 확인한다.

- [ ] **초기 도입 모드였던 경우:** `package.json`에 `react-router` 존재, `src/routes/index.tsx`, `src/routes/layouts/Default.tsx`, `src/components/TheHeader.tsx`, `src/routes/pages/Home.tsx`/`About.tsx` 존재, `src/main.tsx`가 `<Router />`를 렌더링하고 기존의 wrapper(`<StrictMode>` 등)는 보존됨
- [ ] **마이그레이션 모드였던 경우:** `package.json`에서 `react-router-dom`이 제거되고 `react-router`가 추가됨, `src/`의 어느 파일에도 `from 'react-router-dom'` 임포트가 남아 있지 않음
- [ ] **모든 모드 공통:** 사용자가 명시적으로 요청한 기능별 가이드의 결과 파일(예: `src/routes/loaders/requiresAuth.ts`)이 모두 존재하고, 라우트 트리에 올바르게 연결됨
- [ ] 사용자가 별도로 요청하지 않은 영역의 기존 파일은 수정되지 않음 (특히 기존 `main.tsx`의 커스텀 Provider/Wrapper가 보존됨)

**누락 항목이 있으면 해당 단계로 돌아가 즉시 보완한다.** 검증 통과 전에는 작업 종료 금지.

---

## 기능 가이드

사용자가 명시적으로 요청한 기능만 골라 적용한다. 각 항목의 변경 사항은 누적되도록 설계되어 있으므로, 이미 다른 항목이 적용된 상태에서 추가로 적용해도 충돌하지 않는다.

### 모드 비교

React Router는 선언적(Declarative), 데이터(Data), 프레임워크(Framework)의 3가지 모드를 제공하며 기능이 누적적으로 확장된다. 이 스킬은 **Data 모드**를 기준으로 한다.

- **Declarative 모드** — `<BrowserRouter><Routes><Route>` 기반. 가장 기본적인 API. 단순한 SPA에 적합.
- **Data 모드** — `createBrowserRouter` + `RouterProvider`. Loader/Action/Fetcher 등 데이터 기능 추가. 좀 더 복잡한 CSR 프로젝트에 적합.
- **Framework 모드** — Remix와 통합. SSR, Type-Safe href 등 추가 기능. 풀 스택 프로젝트에 적합. `@react-router/dev`가 필요하므로 이 스킬의 범위 밖.

자세한 모드별 기능 비교는 React Router 공식 문서의 [API & Mode availability table](https://reactrouter.com/start/modes#api--mode-availability-table)을 참고한다.

### 레이아웃과 ScrollRestoration

기본 골격(4단계)이 이미 `<DefaultLayout>`과 `<ScrollRestoration>`을 포함한다. 추가 레이아웃이 필요한 경우(예: 인증 후 영역 전용 레이아웃) 동일한 방식으로 `routes/layouts/`에 컴포넌트를 만들고 라우트 트리의 적절한 위치에 `element`로 끼워 넣는다.

`<ScrollRestoration>`은 최상위 레이아웃에 **한 번만** 추가한다. 페이지 이동 시 스크롤 위치를 복원하거나 새 페이지의 스크롤을 최상단으로 이동시킨다.

### 그 밖의 기능

아래 기능은 `references/`로 분리돼 있다. 5단계 매핑 표에서 해당 항목이 필요할 때만 그 파일을 읽는다.

| 파일 | 다루는 내용 |
|---|---|
| [references/navigation.md](references/navigation.md) | `Link` 활용, `NavLink` 활성 스타일, `useNavigate` / `Navigate` / `redirect` |
| [references/routing-patterns.md](references/routing-patterns.md) | 동적 세그먼트, 중첩 라우팅, 찾을 수 없는 페이지(404) |
| [references/protected-routes.md](references/protected-routes.md) | 보호된 경로 (loader + `redirect`) |
| [references/lazy-loading.md](references/lazy-loading.md) | 페이지 지연 로딩 (`lazy` + `Suspense` + `ErrorBoundary`) |
| [references/animation-and-deploy.md](references/animation-and-deploy.md) | 페이지 전환 애니메이션, SPA 호스팅 리라이트 설정 |


---

## 주의사항

- 이미 존재하는 설정/소스 파일은 덮어쓰지 않는다. 사용자가 명시적으로 요청한 부분만 수정한다.
- Declarative Mode(`<BrowserRouter>`) 또는 Framework Mode(`@react-router/dev`) 기반 코드를 작성해 달라는 요청은 이 스킬의 범위가 아니다. 사용자에게 모드 선택을 한 번 더 확인한 뒤, 필요하면 이 스킬을 사용하지 않는다는 사실을 알린다.
- React Router v7부터 `react-router-dom`은 사용하지 않는다. 1단계에서 `react-router-dom` 사용이 감지되면 2단계의 **마이그레이션 모드**로 동작한다(사용자 동의 없이 임의로 임포트를 바꾸지 않는다).
- Loader 함수는 페이지 컴포넌트 렌더링 전에 실행되므로, 그 안에서 동기적으로 무거운 작업을 수행하지 않는다. 외부 요청은 `await`로 처리하되 사용자 경험을 해치지 않는 최소한의 작업으로 제한한다.
- `<ScrollRestoration>`은 라우터 트리에 **한 번만** 둔다. 여러 레이아웃에 중복으로 두면 동작이 예측 불가능해진다.
- `dynamic` 헬퍼 적용 시 라우트 정의의 `element`가 아니라 **`Component`** 속성을 사용해야 한다. `element`는 React 엘리먼트(`<Foo />`)를, `Component`는 컴포넌트 타입(`Foo`)을 받는다.
- 패키지 매니저는 기존 lock 파일로 판별한다. lock 파일이 없거나 `package-lock.json`만 있으면 `npm`을 사용한다.
