# React Router 페이지 전환 애니메이션과 배포 설정

### 페이지 전환 애니메이션

[Motion](https://motion.dev/)(구 Framer Motion)으로 페이지 전환 애니메이션을 적용한다.

설치:

    {pm} install motion

> 패키지 이름이 `framer-motion`에서 `motion`으로 바뀌었다. `framer-motion`도 아직 같은 버전으로 배포되지만 레거시 이름이므로 새 프로젝트는 `motion`을 쓴다.

핵심 아이디어:

- `<motion.div>`의 `initial` / `animate` / `exit` / `transition` 속성으로 진입·진출 애니메이션 정의
- 페이지 전환 시 이전 페이지에도 애니메이션을 적용하려면 `<AnimatePresence>`로 감싸고 `<motion.div>`의 `key`에 고유 값(보통 `location.pathname`)을 전달
- `<Outlet>` 대신 **`useOutlet`** 훅을 사용해 자식 라우트를 데이터로 받아 와야 `<AnimatePresence>`가 페이지 변화를 감지해 트리거할 수 있다

기본 레이아웃을 다음과 같이 수정한다.

```tsx
// src/routes/layouts/Default.tsx
import { motion, AnimatePresence } from 'motion/react'
import { useLocation, useOutlet, ScrollRestoration } from 'react-router'
import TheHeader from '@/components/TheHeader'

export default function DefaultLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <>
      <TheHeader />
      <AnimatePresence>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, position: 'absolute' }}
          transition={{ duration: 0.3 }}>
          {outlet}
        </motion.div>
      </AnimatePresence>
      <ScrollRestoration />
    </>
  )
}
```

애니메이션 확인이 잘 안 되면 `transition.duration`을 1초 이상으로 늘려서 확인한다.

### 배포 설정

`createBrowserRouter`는 클라이언트 라우팅이므로, 사용자가 직접 URL을 입력하거나 새로고침해도 SPA가 정상 동작하려면 호스팅 측에서 모든 요청을 `index.html`로 리라이트(rewrite/redirect)해야 한다.

> 이 프로젝트에는 별도의 Vercel 배포 스킬(예: `deploy-to-vercel`, `vercel-cli-with-tokens`)이 존재할 수 있으니, 배포 자체는 그 스킬을 활용한다. 여기서는 SPA 리라이트 설정만 다룬다.

**Vercel** — 프로젝트 루트에 `vercel.json` 생성:

```json
{
  "rewrites": [{ "source": "/:path*", "destination": "/index.html" }]
}
```

**Netlify** — 공개 폴더(`/public`) 경로에 `_redirects` 생성:

```
/*  /index.html  200
```

또는 프로젝트 루트에 `netlify.toml` 생성:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Firebase** — 프로젝트 루트에 `firebase.json` 생성:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
