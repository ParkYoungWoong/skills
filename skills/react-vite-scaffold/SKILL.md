---
name: react-vite-scaffold
description: (heropy) Use when initializing a new Vite + React (CSR) project or when an existing Vite React project needs missing configuration (ESLint, Prettier, Tailwind CSS, VSCode settings, path aliases).
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 2.3.0
---

# Vite React Project Scaffold

> 참고: https://www.heropy.dev/p/6iFzkB

Vite 기반 React(CSR) 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완하는 스킬.

## 필수 실행 체크리스트 (MANDATORY)

**스킬 시작 즉시, 아래 항목을 TodoWrite에 1:1로 등록한 뒤 순서대로 진행한다. 건너뛰기 금지.**

1. 프로젝트 상태 감지 (1단계)
2. 모드 결정: 스캐폴딩 모드 vs 보완 모드 (2단계)
3. 프로젝트 생성 [스캐폴딩 모드일 때만] (3단계)
4. Tailwind CSS 설치 및 구성 [tailwindcss 미설치 시] (4단계)
5. 경로 별칭 구성 [vite.config/tsconfig에 alias 미설정 시] (5단계)
6. Prettier 구성 [prettier 미설치 시. ESLint 프로젝트는 ESLint 통합까지, 그 외는 Prettier 단독] (6단계)
7. .prettierrc 생성 [파일 없을 때] (7단계)
8. .vscode/settings.json 생성 [파일 없을 때] (8단계)
9. **최종 검증**: 1단계 감지 표를 다시 돌며 모든 구성이 충족됐는지 확인하고 lint와 build를 실행, 누락 시 해당 단계 재실행 (9단계)

각 항목은 조건 충족 시 "skipped"로 완료 처리하되, **조건 판단 근거(파일/패키지 존재 여부)를 명시**한 뒤 넘어간다.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

다음 파일들을 확인하여 현재 프로젝트 상태를 판별한다:

| 확인 대상 | 감지 방법 |
|-----------|-----------|
| 빈 디렉토리 여부 | 현재 디렉토리에 파일이 없거나 `package.json`이 없음 |
| Vite 프로젝트 | `vite.config.ts` 또는 `vite.config.js` 존재 |
| TypeScript | `tsconfig.json` 또는 `tsconfig.app.json` 존재 |
| Tailwind CSS | `package.json`의 `dependencies`/`devDependencies`에 `tailwindcss` 존재 |
| 린터 종류 | `eslint.config.js` 또는 `eslint.config.mjs` 존재 -> ESLint, `.oxlintrc.json`만 존재 -> Oxlint, 둘 다 없음 -> 없음 |
| Prettier 구성 | `.prettierrc` 존재 |
| VSCode 설정 | `.vscode/settings.json` 존재 |
| 패키지 매니저 | `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm` |

### 2단계: 분기 처리

**빈 디렉토리인 경우 (스캐폴딩 모드):**

1. 프로젝트 생성 명령 실행
2. 아래 설정 전부 자동 적용

**기존 Vite 프로젝트인 경우 (보완 모드):**

1. 위 감지 기준으로 설치 상태 자동 판별
2. 누락된 설정만 식별하여 자동 생성
3. 이미 존재하는 설정 파일은 건드리지 않음

### 3단계: 프로젝트 생성

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm`.
> `{pmx}`는 해당 패키지 매니저의 실행 명령으로 대체한다. `npm` -> `npx`, `pnpm` -> `pnpm dlx`, `yarn` -> `yarn dlx`, `bun` -> `bunx`.

요구사항: Node.js 20.19+ (22.x를 쓴다면 22.12+)

현재 디렉토리에 Vite 프로젝트 생성:

```bash
{pm} create vite@latest . -- --template react-compiler-ts --eslint --no-interactive
```

> create-vite의 린터 기본값은 Oxlint다. `--eslint`를 빼면 `.oxlintrc.json`만 생성되고 `eslint.config.js`와 ESLint 패키지가 설치되지 않으므로, 이 플래그를 반드시 포함한다.

### 4단계: Tailwind CSS 설치 [조건: tailwindcss 미설치 시]

```bash
{pm} add -D tailwindcss @tailwindcss/vite
```

`vite.config.ts`의 기존 `plugins` 배열 끝에 Tailwind 플러그인(`tailwindcss()`)을 추가한다.
기존 항목(`react()`, React Compiler용 `babel(...)` 등)은 그대로 유지한다.

```ts
// vite.config.ts
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]
})
```

`src/index.css` 파일 최상단에 추가:

```css
@import 'tailwindcss';
```

### 5단계: 경로 별칭 구성 [조건: vite.config 또는 tsconfig에 `@` alias 미설정 시]

`vite.config.ts`에 `resolve.alias` 설정을 추가한다. 기존 `plugins`는 그대로 유지한다.

```ts
// vite.config.ts (resolve 부분)
export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: '/src' }]
  }
})
```

`tsconfig.app.json`에 경로 별칭 추가:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> TypeScript v5 이하(`tsc --version`으로 확인)인 경우, `"baseUrl": "."` 을 `paths` 위에 추가한다.

### 6단계: Prettier 구성 [조건: prettier 미설치 시]

1단계에서 감지한 린터 종류에 따라 분기한다.

**A. ESLint 프로젝트** (`eslint.config.js` 존재)

ESLint 관련 패키지는 프로젝트 생성 시 이미 포함되어 있으므로, Prettier 관련 패키지만 추가 설치한다:

```bash
{pm} add -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss
```

`eslint.config.js`의 기존 `extends` 배열 끝에 `prettierRecommended`를 추가한다. 나머지 항목은 그대로 유지한다.

```js
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierRecommended
    ],
    languageOptions: {
      globals: globals.browser
    }
  }
])
```

**B. Oxlint 프로젝트 또는 린터 없음** (`eslint.config.js` 없음)

Oxlint에는 Prettier 통합 플러그인이 없으므로 Prettier를 단독으로 구성한다.
`.oxlintrc.json`과 `package.json`의 `lint` 스크립트는 건드리지 않는다.

```bash
{pm} add -D prettier prettier-plugin-tailwindcss
```

### 7단계: .prettierrc [조건: 파일 없을 때]

`.prettierrc` 파일이 없으면 프로젝트 루트에 생성:

```json
{
  "semi": false,
  "singleQuote": true,
  "singleAttributePerLine": true,
  "bracketSameLine": true,
  "endOfLine": "auto",
  "trailingComma": "none",
  "arrowParens": "avoid",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 8단계: .vscode/settings.json [조건: 파일 없을 때]

`.vscode/settings.json` 파일이 없으면 생성:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 9단계: 최종 검증 (MANDATORY)

모든 단계 수행 후, 1단계의 감지 표를 **다시 한 번 스캔**하여 아래 항목을 확인한다:

- [ ] `tailwindcss`, `@tailwindcss/vite` 설치됨 + `vite.config.ts`에 플러그인 등록됨(기존 플러그인 유지) + `src/index.css`에 `@import 'tailwindcss'` 존재
- [ ] `vite.config.ts`와 `tsconfig.app.json` 모두에 `@` 경로 별칭 존재
- [ ] `prettier`, `prettier-plugin-tailwindcss` 설치됨
- [ ] [ESLint 프로젝트] `eslint-config-prettier`, `eslint-plugin-prettier` 설치됨 + `eslint.config.js`의 `extends`에 `prettierRecommended` 포함됨
- [ ] [Oxlint 프로젝트] `.oxlintrc.json`과 `lint` 스크립트가 변경되지 않음
- [ ] `.prettierrc` 존재
- [ ] `.vscode/settings.json` 존재
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과 (TypeScript 검사 포함)

**누락 항목이 있으면 해당 단계로 돌아가 즉시 보완한다.** 검증 통과 전에는 작업 종료 금지.

## 주의사항

- 프로젝트에 `CLAUDE.md`나 `.claude/rules/react.md`가 있으면 그 내용이 이 스킬보다 우선한다. 기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로 만든다.
- 상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다. 다른 폴더의 파일은 `@/` 별칭으로 가져온다.
- 이미 존재하는 설정 파일은 덮어쓰지 않는다
- 기존 프로젝트 보완 모드에서는 질문 없이 자동으로 진행한다
- 스캐폴딩 모드는 항상 `--eslint`로 생성하므로 6단계는 A(ESLint 통합)로 진행한다
- 패키지 매니저는 기존 프로젝트의 lock 파일로 판별한다:
  - `pnpm-lock.yaml` -> `pnpm`
  - `yarn.lock` -> `yarn`
  - `bun.lockb` 또는 `bun.lock` -> `bun`
  - `package-lock.json` 또는 lock 파일 없음 -> `npm`
- 빈 디렉토리(스캐폴딩 모드)에서는 `npm`을 사용한다

## 함께 보는 스킬

이 스킬은 프로젝트의 기반 설정(Tailwind, 경로 별칭, ESLint + Prettier, VSCode)만 담당한다.
라우팅, 서버 상태, 전역 상태는 각각 독립 스킬로 분리돼 있으니 필요한 것만 이어서 적용한다.

| 필요한 것 | 스킬 |
|---|---|
| 라우팅 (React Router Data Mode) | `react-router-use` |
| 서버 데이터 fetching / 캐싱 | `tanstack-react-query-use` |
| 전역 상태 (스토어) | `zustand-use` |
| Next.js(SSR) 프로젝트 시작 | `react-next-scaffold` |
| Vite 프로젝트를 Next.js로 이전 | `react-vite-to-next-migration` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
