# heropy-skills

[HEROPY](https://heropy.dev)의 스킬 모음입니다.

```bash
npx skills add ParkYoungWoong/skills
```

**설치 예시:**

```bash
◇  Select skills to install
│  react-vite-scaffold, zustand-use,...
│
◇  Installation scope
│  Project
│
◇  Installation method
│  Symlink
│
◇  Proceed with installation?
│  Yes
```

상황에 맞게 스킬이 자동으로 감지되거나 다음과 같이 스킬을 직접 호출할 수 있습니다.

**Claude Code 스킬 호출 예시:**

```plaintext
❯ /react-next-scaffold
```

## 스킬 목록

### [react-vite-scaffold](./skills/react-vite-scaffold/SKILL.md)

Vite 기반 React(CSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

```bash
npx skills add ParkYoungWoong/skills --skill react-vite-scaffold
```

- Vite + React + TypeScript 프로젝트 스캐폴딩
- 기존 프로젝트의 누락된 설정 자동 감지 및 보완
- 기본 포함 항목:
  - Tailwind CSS
  - ESLint + Prettier (통합 구성)
  - 경로 별칭 (`@/*`)
  - `.vscode/settings.json` (저장 시 자동 포매팅)
- 라우팅·서버 상태·전역 상태는 각각 `react-router-use`, `tanstack-react-query-use`, `zustand-use` 스킬로 분리

### [react-next-scaffold](./skills/react-next-scaffold/SKILL.md)

Next.js 기반 React(SSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

```bash
npx skills add ParkYoungWoong/skills --skill react-next-scaffold
```

- Next.js + React + TypeScript 프로젝트 스캐폴딩
- 기존 프로젝트의 누락된 설정 자동 감지 및 보완
- 기본 포함 항목:
  - Tailwind CSS
  - TanStack Query + QueryProvider (Next.js 스트리밍 지원)
  - ESLint + Prettier (통합 구성)
  - 경로 별칭 (`@/*`)
  - `.vscode/settings.json` (저장 시 자동 포매팅)

### [react-vite-to-next-migration](./skills/react-vite-to-next-migration/SKILL.md)

Vite + React(TS) 프로젝트를 Next.js(App Router, v16) 프로젝트로 마이그레이션합니다.

```bash
npx skills add ParkYoungWoong/skills --skill react-vite-to-next-migration
```

- Vite 전용 파일 제거 및 Next.js 설정 파일 생성 (`next.config.ts`, `tsconfig.json`)
- 진입점 변환 (`index.html` / `main.tsx` → `src/app/layout.tsx`)
- React Router → App Router 디렉토리 기반 라우팅 변환
- React Router 훅/`<Link>` → `next/navigation`, `next/link` 치환
- `VITE_*` 환경 변수 → `NEXT_PUBLIC_*` 변환 및 `import.meta.env.*` 치환
- 클라이언트/서버 컴포넌트 자동 판별 (`'use client'` 추가)
- Tailwind CSS / TanStack Query / Zustand 사용 시 자동 처리
- 빌드/lint 통과 및 Vite 잔존물 제거를 확인하는 최종 검증 단계

### [react-router-use](./skills/react-router-use/SKILL.md)

기존 React(Vite/CSR) 프로젝트에 React Router 7 **Data Mode**를 도입하거나, 라우트/레이아웃/내비게이션/Loader 등 부분 기능을 추가합니다.

```bash
npx skills add ParkYoungWoong/skills --skill react-router-use
```

- React Router 7 Data Mode (`createBrowserRouter` + `RouterProvider`) 도입
- 기본 라우터 골격 자동 생성 (Layout, Header, Home/About 페이지)
- `react-router-dom` v6 → v7 마이그레이션 지원 (사용자 동의 후)
- 동적 세그먼트 / 중첩 라우팅 / 404 페이지
- 보호된 경로 (Loader + `redirect`)
- 페이지 지연 로딩 (`lazy` + `Suspense` + `ErrorBoundary`)
- 페이지 전환 애니메이션 (Motion)
- SPA 호스팅 리라이트 설정 (Vercel / Netlify / Firebase)
- 기능별 상세 가이드는 `references/`로 분리되어 필요할 때만 로드

### [tanstack-react-query-use](./skills/tanstack-react-query-use/SKILL.md)

React / Next.js 프로젝트에서 TanStack Query(v5)로 서버 데이터를 가져오고 캐싱·동기화하는 코드를 작성합니다.

```bash
npx skills add ParkYoungWoong/skills --skill tanstack-react-query-use
```

- `useQuery` / `useMutation` / `useInfiniteQuery` 표준 사용 패턴
- `queryKey` 규칙 및 `staleTime` / `gcTime` 캐시 전략
- 낙관적 업데이트(Optimistic Update) 패턴
- 무한 스크롤 / 페이지네이션 구현
- Next.js App Router 환경 지원 (`useSuspenseQuery` + SSR)
- ReactQueryDevtools 및 `@tanstack/eslint-plugin-query` 설정
- 작성 후 확인용 체크리스트 제공

### [zustand-use](./skills/zustand-use/SKILL.md)

React 프로젝트에서 Zustand로 전역 상태(스토어)를 설계·작성하는 표준 패턴을 따릅니다.

```bash
npx skills add ParkYoungWoong/skills --skill zustand-use
```

- 단일 파일(`src/stores/<이름>.ts`) 스토어 정의, `use이름Store` 명명 규칙
- 액션을 상태와 같은 레벨에 정의하는 패턴, 상태 초기화/삭제 패턴
- 선택자(Selector)로 한 번에 하나씩 구독, 묶어서 구독할 때만 `useShallow`
- 미들웨어 합성 순서: `devtools(persist(subscribeWithSelector(immer(combine(...)))))`
- TypeScript: `combine` 추론 방식 / JavaScript: 순수 `create` 최소 템플릿
- 트리거 입력('OO 스토어 생성')으로 스토어 폴더 탐색/생성 및 기본 템플릿 파일 자동 생성
- 비동기 액션 / 컴포넌트 외부 사용 패턴

### [vue-vite-scaffold](./skills/vue-vite-scaffold/SKILL.md)

Vite 기반 Vue 3 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완합니다.

```bash
npx skills add ParkYoungWoong/skills --skill vue-vite-scaffold
```

- Vite 최소 템플릿 / Official Vue Starter 두 가지 생성 경로 지원
- 기존 프로젝트의 누락된 설정 자동 감지 및 보완
- 기본 포함 항목:
  - Tailwind CSS
  - ESLint(`eslint-plugin-vue`, `@vue/eslint-config-typescript`) + Prettier
  - 경로 별칭 (`@/*`)
  - `.vscode/settings.json` (저장 시 자동 포매팅)
  - `vue-tsc` 타입체크 스크립트
- 공식 스타터의 oxlint 버전 충돌 및 ESLint 중복 보고 해결
- Vue 코딩 규칙 (`script setup`, `ref` 우선, 컴포저블, `scoped` 스타일)
- Composition API / 컴포넌트 API 상세 가이드는 `references/`로 분리

### [vue-router-use](./skills/vue-router-use/SKILL.md)

기존 Vue 3(Vite) 프로젝트에 Vue Router 5를 도입하거나, 라우트/레이아웃/내비게이션 등 부분 기능을 추가합니다.

```bash
npx skills add ParkYoungWoong/skills --skill vue-router-use
```

- `createRouter` + `createWebHistory` 기본 라우터 골격 자동 생성
- 레이아웃 제공자 패턴 (`meta.layout` + 동적 컴포넌트)
- 스크롤 복원 (`scrollBehavior`)
- 동적 경로 / 쿼리스트링 / 중첩 경로 / 404 페이지
- 내비게이션 가드 (인증, 게스트 전용, `RouteMeta` 확장)
- 페이지 지연 로딩 및 로딩 표시
- 페이지 전환 애니메이션 (`<Transition>`)
- 파일 기반 라우팅 (Vue Router 5, `definePage`)
- SPA 호스팅 리라이트 설정 (Vercel / Netlify / Firebase)

### [pinia-use](./skills/pinia-use/SKILL.md)

Vue 프로젝트에서 Pinia로 전역 상태(스토어)를 설계·작성하는 표준 패턴을 따릅니다.

```bash
npx skills add ParkYoungWoong/skills --skill pinia-use
```

- 단일 파일(`src/stores/<이름>.ts`) 스토어 정의, `use이름Store` 명명 규칙
- 옵션 스토어 기본, 셋업 스토어 선택 기준
- `storeToRefs`로 반응성을 유지한 구조 분해
- 인스턴스 멤버 활용 (`$patch`, `$subscribe`, `$onAction`, `$reset`, `$dispose`)
- 셋업 스토어에서 `$reset`을 직접 정의하는 패턴
- 트리거 입력('OO 스토어 생성')으로 스토어 폴더 탐색/생성 및 기본 템플릿 파일 자동 생성

### [lighthouse](./skills/lighthouse/SKILL.md)

Google Lighthouse를 로컬에서 실행하여 웹 페이지의 성능, 접근성, SEO 등을 분석하고 개선점을 제안합니다.

```bash
npx skills add ParkYoungWoong/skills --skill lighthouse
```

- LHCI CLI 자동 실행 (`@lhci/cli`, 헤드리스 Chrome)
- 4개 카테고리 종합 분석 (Performance, Accessibility, Best Practices, SEO)
- 다회 측정 후 중앙값 실행을 대표로 선택
- 실행 직후 설정 반영 여부 검증 (모바일/데스크톱 에뮬레이션 확인)
- 단일 URL / 인증 뒤 페이지는 chrome-devtools MCP 분기 지원
- 카테고리별 구체적 개선점 제안
- 프로젝트 프레임워크 자동 감지 (Next.js, Vite, Nuxt, Angular 등)
- 사용자 확인 후 코드 수정 지원

### [kb-bank-styles](./skills/kb-bank-styles/SKILL.md)

KB국민은행 / KB스타뱅킹의 시각 언어를 따라 한국 금융권(뱅킹 앱·웹) UI를 만드는 스타일 가이드입니다.

```bash
npx skills add ParkYoungWoong/skills --skill kb-bank-styles
```

- 디자인 토큰 (컬러·타이포·스페이싱·라운딩·그림자), Tailwind v4 `@theme` 기반
- 모바일(KB스타뱅킹) / 웹(kbstar.com) 두 가지 프리셋
- 컴포넌트 스니펫 16종 (Button, AccountCard, AmountInput, BottomSheet 등)
- 홈/송금/내역 페이지 템플릿
- 기본 폰트는 Pretendard(OFL-1.1), KB금융체는 라이선스 확보 시 옵트인
- 한국 금융권 UX 컨벤션 반영