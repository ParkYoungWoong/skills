---
name: vue-vite-scaffold
description: (heropy) Use when initializing a new Vite + Vue 3 project or when an existing Vite Vue project needs missing configuration (ESLint, Prettier, Tailwind CSS, VSCode settings, path aliases, oxlint). Also covers the project-wide Vue coding conventions (script setup, ref over reactive, composables, scoped styles).
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.0.1
---

# Vite Vue Project Scaffold

> 참고: https://www.heropy.dev/p/aBLqC5
> 코딩 규칙 참고: https://www.heropy.dev/p/EzuOg2

Vite 기반 Vue 3 프로젝트를 스캐폴딩하거나, 기존 프로젝트의 누락된 설정을 자동 보완하는 스킬.

## 필수 실행 체크리스트 (MANDATORY)

**스킬 시작 즉시, 아래 항목을 TodoWrite에 1:1로 등록한 뒤 순서대로 진행한다. 건너뛰기 금지.**

1. 프로젝트 상태 감지 (1단계)
2. 모드 결정: 스캐폴딩 모드 vs 보완 모드 (2단계)
3. 프로젝트 생성 [스캐폴딩 모드일 때만] (3단계)
4. Tailwind CSS 설치 및 구성 [tailwindcss 미설치 시] (4단계)
5. 경로 별칭 구성 [vite.config/tsconfig에 alias 미설정 시] (5단계)
6. ESLint + Prettier 구성 [prettier 패키지 또는 eslint-plugin-prettier 미설치 시] (6단계)
7. .prettierrc 생성 [파일 없을 때] (7단계)
8. .vscode/settings.json 생성 [파일 없을 때] (8단계)
9. typecheck 스크립트 구성 [TypeScript 프로젝트인데 스크립트 없을 때] (9단계)
10. **최종 검증** — 1단계 감지 표를 다시 돌며 모든 구성이 충족됐는지 확인하고 실제로 실행해 본다 (10단계)

각 항목은 조건 충족 시 "skipped"로 완료 처리하되, **조건 판단 근거(파일/패키지 존재 여부)를 명시**한 뒤 넘어간다.

## 동작 흐름

### 1단계: 프로젝트 상태 감지

다음 파일들을 확인하여 현재 프로젝트 상태를 판별한다:

| 확인 대상 | 감지 방법 |
|-----------|-----------|
| 빈 디렉토리 여부 | 현재 디렉토리에 파일이 없거나 `package.json`이 없음 |
| Vite 프로젝트 | `vite.config.ts` 또는 `vite.config.js` 존재 |
| Vue | `package.json`의 dependencies에 `vue` 존재 |
| TypeScript | `tsconfig.json` 또는 `tsconfig.app.json` 존재 |
| 공식 스타터 여부 | `.oxlintrc.json` 또는 `eslint.config.ts` 존재 |
| Tailwind CSS | `package.json`에 `tailwindcss` 존재 |
| ESLint 구성 | `eslint.config.js` / `eslint.config.ts` / `eslint.config.mjs` 존재 |
| Prettier 구성 | `.prettierrc` 존재 |
| VSCode 설정 | `.vscode/settings.json` 존재 |
| 패키지 매니저 | `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb`/`bun.lock` → bun, `package-lock.json` 또는 없음 → npm |

### 2단계: 분기 처리

**빈 디렉토리인 경우 (스캐폴딩 모드):**

1. 3단계에서 생성 방식을 사용자에게 확인
2. 아래 설정 전부 자동 적용

**기존 Vite Vue 프로젝트인 경우 (보완 모드):**

1. 위 감지 기준으로 설치 상태 자동 판별
2. 누락된 설정만 식별하여 자동 생성
3. 이미 존재하는 설정 파일은 건드리지 않음

### 3단계: 프로젝트 생성

`{pm}`은 패키지 매니저 감지 규칙에 따라 결정된 패키지 매니저로 대체한다. (npm, pnpm, yarn, bun)
요구사항: Node.js 20.19+ (22.x를 쓴다면 22.13+)

생성 방식은 두 가지다. **사용자에게 어느 쪽인지 확인한 뒤 진행한다.**

**A. Vite 최소 템플릿** (기본값. 이 스킬이 나머지 구성을 채운다)

```bash
{pm} create vite@latest . -- --template vue-ts
```

JavaScript 프로젝트라면 `--template vue`를 쓴다.

**B. Official Vue Starter** (라우터, Pinia, 테스트, 린터, 포매터를 한 번에 선택)

```bash
{pm} create vite@latest <프로젝트_폴더_이름>

  Select a framework: Vue
  Select a variant: Official Vue Starter ↗
```

공식 스타터를 고르면 이후 질문은 스타터의 것이다. `Router (SPA development)`,
`Pinia (state management)`, `Vitest (unit testing)`, `Linter (error prevention)`,
`Prettier (code formatting)` 등을 스페이스로 선택한다.

공식 스타터는 경로 별칭 `@`, `.editorconfig`, `.vscode/settings.json`을 이미 포함하므로
**5단계와 8단계를 건너뛴다.** Tailwind는 포함되지 않으므로 4단계는 그대로 수행한다.

공식 스타터를 골랐다면 아래 "공식 스타터 추가 처리"를 이어서 본다.

### 4단계: Tailwind CSS 설치 [조건: tailwindcss 미설치 시]

```bash
{pm} i -D tailwindcss @tailwindcss/vite prettier-plugin-tailwindcss
```

`vite.config.ts`에 Tailwind 플러그인(`tailwindcss()`) 추가:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ]
})
```

전역 CSS 파일(`src/style.css` 또는 공식 스타터의 `src/assets/main.css`) 최상단에 추가:

```css
@import 'tailwindcss';
```

해당 CSS 파일이 `src/main.ts`에서 import되고 있는지 확인한다.

### 5단계: 경로 별칭 구성 [조건: vite.config 또는 tsconfig에 `@` alias 미설정 시]

`vite.config.ts`의 `resolve.alias` 설정:

```ts
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: 'node_modules', replacement: '/node_modules' }
    ]
  }
})
```

`node_modules` 별칭은 `<style>` 안에서 `@import 'node_modules/swiper/swiper.css'`처럼
패키지 CSS를 가져올 때 쓴다. 필요 없으면 생략해도 된다.

TypeScript 프로젝트라면 `tsconfig.app.json`에 경로 별칭을 추가한다.
Vite가 만든 `tsconfig.json`은 다른 구성 파일을 참조만 하므로 거기에 넣으면 동작하지 않는다.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "node_modules/*": ["./node_modules/*"]
    }
  }
}
```

> TypeScript v5 이하(`tsc --version`으로 확인)인 경우, `"baseUrl": "./"` 를 `paths` 위에 추가한다.

### 6단계: ESLint + Prettier 구성 [조건: prettier 패키지 또는 eslint-plugin-prettier 미설치 시]

Vite의 Vue 템플릿에는 ESLint가 포함되지 않는다. 전부 직접 설치한다.

TypeScript 프로젝트:

```bash
{pm} i -D eslint @eslint/js eslint-plugin-vue @vue/eslint-config-typescript prettier eslint-config-prettier eslint-plugin-prettier
```

JavaScript 프로젝트:

```bash
{pm} i -D eslint @eslint/js globals eslint-plugin-vue prettier eslint-config-prettier eslint-plugin-prettier
```

| 패키지 | 설명 |
|---|---|
| `eslint` | ESLint 코어 |
| `@eslint/js` | ESLint 기본 추천 규칙 모음 |
| `globals` | 실행 환경 전역 변수 목록 (JavaScript일 때) |
| `eslint-plugin-vue` | Vue 문법 분석 및 검사 |
| `@vue/eslint-config-typescript` | TypeScript 규칙 + `*.vue`의 `<script lang="ts">`를 분석할 파서 연결 |
| `prettier` | Prettier 코어 |
| `eslint-config-prettier` | Prettier와 충돌하는 ESLint 규칙 비활성화 |
| `eslint-plugin-prettier` | Prettier 규칙을 ESLint 규칙으로 통합 |

프로젝트 루트에 `eslint.config.js`를 생성한다.

TypeScript 프로젝트:

```js
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import { globalIgnores } from 'eslint/config'

export default defineConfigWithVueTs(
  { files: ['**/*.{vue,ts,mts,tsx}'] },
  globalIgnores(['**/dist/**']),
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  prettierRecommended
)
```

JavaScript 프로젝트:

```js
import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  { files: ['**/*.{vue,js,mjs,jsx}'] },
  globalIgnores(['**/dist/**']),
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  prettierRecommended
])
```

> TypeScript에서 `defineConfigWithVueTs`를 쓰는 이유는 `*.vue` 파일의 `<script lang="ts">`
> 내부를 분석할 파서까지 함께 연결해 주기 때문이다. `typescript-eslint`를 직접 나열하면
> 파서가 연결되지 않아 `Parsing error`가 발생한다.
> `vueTsConfigs.recommended`는 TypeScript 규칙만 포함하므로, `no-empty` 같은 ESLint
> 기본 추천 규칙까지 쓰려면 `js.configs.recommended`를 함께 넣는다.
>
> ESLint 9부터 `eslint.config.js` 플랫 구성이 기본이고, 10에서 `.eslintrc.*` 지원이 제거됐다.

사용자가 Vue 커스텀 규칙을 요청하면 구성의 **가장 마지막**에 아래 객체를 추가한다.

```js
{
  rules: {
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'never'
    }],
    'vue/html-self-closing': ['error', {
      html: { void: 'always', normal: 'never', component: 'always' },
      svg: 'always',
      math: 'always'
    }],
    'vue/comment-directive': 'off',
    'vue/no-v-html': 'off'
  }
}
```

### 7단계: .prettierrc [조건: 파일 없을 때]

```json
{
  "semi": false,
  "singleQuote": true,
  "singleAttributePerLine": true,
  "bracketSameLine": true,
  "endOfLine": "lf",
  "trailingComma": "none",
  "arrowParens": "avoid",
  "printWidth": 100
}
```

Tailwind를 설치했다면 `"plugins": ["prettier-plugin-tailwindcss"]`를 함께 넣는다.

### 8단계: .vscode/settings.json [조건: 파일 없을 때]

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

사용자에게 아래 VS Code 확장 설치를 안내한다.

- `dbaeumer.vscode-eslint` (ESLint)
- `esbenp.prettier-vscode` (Prettier - Code formatter)
- `Vue.volar` (Vue - Official) — Vue 프로젝트에 필수

### 9단계: typecheck 스크립트 [조건: TypeScript 프로젝트인데 스크립트 없을 때]

`<template>` 안의 타입 오류는 편집기를 열지 않으면 드러나지 않는다.
존재하지 않는 속성 참조, 문자열 자리에 들어간 `ref` 객체, 잘못 쓴 Props 이름이 모두 여기서 걸린다.
**AI가 작성한 Vue 코드를 검증하는 가장 중요한 수단이다.**

```bash
{pm} i -D vue-tsc typescript
```

`package.json`에 스크립트를 추가한다.

```json
{
  "scripts": {
    "typecheck": "vue-tsc --build",
    "lint": "eslint . --fix"
  }
}
```

### 10단계: 최종 검증 (MANDATORY)

모든 단계 수행 후, 1단계의 감지 표를 **다시 한 번 스캔**하고 실제로 명령을 실행해 확인한다.

- [ ] `tailwindcss`, `@tailwindcss/vite` 설치됨 + `vite.config.ts`에 플러그인 등록됨 + 전역 CSS에 `@import 'tailwindcss'` 존재
- [ ] `vite.config.ts`와 `tsconfig.app.json` 모두에 `@` 경로 별칭 존재
- [ ] `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier` 설치됨
- [ ] `eslint.config.*`에 `prettierRecommended`가 **맨 마지막**에 포함됨
- [ ] `.prettierrc` 존재
- [ ] `.vscode/settings.json` 존재
- [ ] `{pm} run typecheck` 통과 (TypeScript 프로젝트)
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과

**누락 항목이 있으면 해당 단계로 돌아가 즉시 보완한다.** 검증 통과 전에는 작업 종료 금지.

## 공식 스타터 추가 처리

3단계에서 `Official Vue Starter ↗`를 골랐거나, 기존 프로젝트에 `.oxlintrc.json`이 있으면
아래를 확인한다.

### 린터 버전 맞추기

`eslint-plugin-oxlint`와 `oxlint`는 **같은 버전이어야 한다.** 템플릿 구성 문제로
버전이 달라 설치가 실패할 수 있다.

```bash
npm error code ERESOLVE
npm error Found: oxlint@1.74.0
npm error Could not resolve dependency:
npm error peer oxlint@"~1.73.0" from eslint-plugin-oxlint@1.73.0
```

이 경우 `package.json`에서 두 패키지 버전을 **더 낮은 쪽으로** 맞춘 뒤 다시 설치한다.

```json
{
  "devDependencies": {
    "eslint-plugin-oxlint": "~1.73.0",
    "oxlint": "~1.73.0"
  }
}
```

### ESLint와 oxlint 중복 제거

oxlint는 Rust로 만든 빠른 린터지만, 타입 정보를 쓰는 규칙이나 `eslint-plugin-vue`의
Vue 전용 규칙까지 대신하지는 못해서 ESLint를 함께 쓴다. 둘은 검사 범위가 겹치므로
그대로 두면 같은 문제를 두 번 보고한다. `eslint.config.ts`의
`buildFromOxlintConfigFile` 호출이 이를 해결한다.

```ts
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  { files: ['**/*.{vue,ts,mts,tsx}'] },
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
  skipFormatting
)
```

`npm run lint`는 oxlint를 먼저 돌리고 ESLint를 이어서 돌린다.

### 파일 중첩

공식 스타터는 `.vscode/settings.json`에 파일 중첩(File Nesting)을 켜 둔다.
사용자가 불편하다고 하면 제거하지 말고 `false`로 **명시**한다. 그래야 전역 설정과
무관하게 이 프로젝트에서만 꺼진다.

```json
{
  "explorer.fileNesting.enabled": false
}
```

## Vue 코딩 규칙

생성한 프로젝트에서 Vue 코드를 작성할 때 따르는 규칙이다.
프로젝트에 `CLAUDE.md`나 `.claude/rules/vue.md`가 있으면 그 내용이 우선한다.

- 모든 Vue 컴포넌트는 `<script setup lang="ts">`를 사용한다. Options API는 쓰지 않는다.
- 반응형 상태는 `ref()`를 기본으로 쓴다. `reactive()`는 특수한 상황이 아니면 쓰지 않는다.
  `reactive()`는 원시형에서 반응성을 잃고 구조 분해에서도 반응성이 끊어진다.
  두 함수가 섞이면 어느 쪽 제약이 걸리는지 매번 판단해야 하고, 틀리면 화면이 갱신되지 않는 버그가 된다.
- 파생 값은 `computed()`로 만든다. `watch()`로 다른 상태를 갱신해 파생 값을 만들지 않는다.
- 로직 재사용은 컴포저블로 한다. 믹스인(mixin)은 쓰지 않는다.
- 컴포저블 파일은 `src/composables/useXxx.ts`에 두고, 함수 이름은 `use` 접두사로 시작한다.
- `<style>`에는 항상 `scoped`를 붙인다. 전역 스타일은 전역 CSS 파일 한 곳에만 작성한다.
- 컴포넌트 파일 이름은 PascalCase 다중 단어로 짓는다. (`MovieCard.vue`)
- `import`는 `@/` 별칭을 쓴다. 상대 경로는 같은 폴더 안에서만 허용한다.
- Props는 `defineProps<T>()` 형태의 타입 기반 선언만 쓴다.
- 컴포넌트 사이 통신은 Props와 Emits로 한다. `provide` / `inject`는 레이아웃 수준에서만 쓴다.

문법 상세는 아래 참조 문서를 필요할 때만 읽는다.

| 파일 | 다루는 내용 |
|---|---|
| [references/composition-api.md](references/composition-api.md) | 반응형 데이터(`ref` vs `reactive`), 템플릿 문법, 양식 바인딩, `computed`와 `watch`, 생명주기 훅, 컴포저블 |
| [references/components.md](references/components.md) | 컴파일러 매크로, Props, Emits, Slots, 폴스루 속성, `v-model`, 동적 컴포넌트, `provide`/`inject` |

## 주의사항

- 이미 존재하는 설정 파일은 덮어쓰지 않는다
- 기존 프로젝트 보완 모드에서는 질문 없이 자동으로 진행한다
- `prettierRecommended`(또는 `skipFormatting`)는 항상 ESLint 구성의 **마지막**에 온다.
  앞에 두면 뒤따르는 구성이 포맷 규칙을 다시 켠다
- 패키지 매니저는 기존 프로젝트의 lock 파일로 판별한다:
  - `pnpm-lock.yaml` → `pnpm`
  - `yarn.lock` → `yarn`
  - `bun.lockb` 또는 `bun.lock` → `bun`
  - `package-lock.json` 또는 lock 파일 없음 → `npm`
- 빈 디렉토리(스캐폴딩 모드)에서는 `npm`을 사용한다

## 다음 단계

이 스킬은 프로젝트의 기반 설정만 담당한다.
라우팅과 전역 상태는 각각 독립 스킬로 분리돼 있으니 필요한 것만 이어서 적용한다.

| 필요한 것 | 스킬 |
|---|---|
| 라우팅 (Vue Router) | `vue-router-use` |
| 전역 상태 (스토어) | `pinia-use` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
