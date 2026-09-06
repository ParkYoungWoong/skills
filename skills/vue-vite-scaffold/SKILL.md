---
name: vue-vite-scaffold
description: (heropy) Use when initializing a new Vite + Vue 3 project or when an existing Vite Vue project needs missing configuration (ESLint, Prettier, Tailwind CSS, VSCode settings, path aliases, oxlint). Also use when Vue component code in such a project must follow the project-wide coding conventions (script setup, ref over reactive, composables, scoped styles).
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.1.0
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
6. ESLint + Prettier 구성 [eslint.config.* 파일이 없을 때] (6단계)
7. Prettier 구성 파일 [Prettier 구성 파일이 없을 때 생성, 공식 스타터의 .prettierrc.json에는 병합, Oxfmt 프로젝트는 skip] (7단계)
8. .vscode/settings.json 생성 [파일 없을 때] (8단계)
9. typecheck 스크립트 구성 [TypeScript 프로젝트인데 typecheck 또는 type-check 스크립트가 없을 때] (9단계)
10. **최종 검증**: 1단계 감지 표를 다시 돌며 모든 구성이 충족됐는지 확인하고 실제로 실행해 본다 (10단계)

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
| 전역 CSS 파일 | `src/main.ts`(또는 `src/main.js`)가 import하는 `.css` 파일 경로. Vite 템플릿은 `src/style.css`, 공식 스타터는 `src/assets/main.css` |
| ESLint 구성 | `eslint.config.js`, `eslint.config.ts`, `eslint.config.mjs` 중 하나 존재 |
| 포매터 종류 | `.oxfmtrc.json` 존재 -> Oxfmt, `.prettierrc*` 파일 또는 `package.json`의 `prettier` 키 존재 -> Prettier, 둘 다 없음 -> 없음 |
| Prettier 구성 파일 | `.prettierrc`, `.prettierrc.json`, `.prettierrc.yaml` 등 `.prettierrc*` 파일 또는 `package.json`의 `prettier` 키 |
| VSCode 설정 | `.vscode/settings.json` 파일 존재. `.vscode/extensions.json`만 있는 경우는 미설정으로 본다 |
| 스크립트 | `package.json`의 `typecheck` 또는 `type-check`, `lint`, `format` 스크립트 존재 여부 |
| 패키지 매니저 | `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm` |

> `{pm}`은 프로젝트의 lock 파일로 판별한 패키지 매니저로 대체한다.
> `pnpm-lock.yaml` -> `pnpm`, `yarn.lock` -> `yarn`, `bun.lockb` 또는 `bun.lock` -> `bun`, `package-lock.json` 또는 lock 파일 없음 -> `npm`.
> `{pmx}`는 해당 패키지 매니저의 실행 명령으로 대체한다. `npm` -> `npx`, `pnpm` -> `pnpm dlx`, `yarn` -> `yarn dlx`, `bun` -> `bunx`.

### 2단계: 분기 처리

**빈 디렉토리인 경우 (스캐폴딩 모드):**

1. 3단계 A(Vite 최소 템플릿)로 생성한다. 사용자가 "공식 스타터", "Official Vue Starter", "create-vue"를 언급한 경우에만 B로 생성한다. 어느 쪽인지 묻지 않는다.
2. 아래 설정 전부 자동 적용

**기존 Vite Vue 프로젝트인 경우 (보완 모드):**

1. 위 감지 기준으로 설치 상태 자동 판별
2. 누락된 설정만 식별하여 자동 생성
3. 이미 존재하는 설정 파일은 건드리지 않음. 같은 역할의 파일이 다른 이름으로 있으면(`eslint.config.ts`, `.prettierrc.json`) 새 파일을 만들지 않고 그 파일을 기준으로 병합한다

### 3단계: 프로젝트 생성

요구사항: Node.js 20.19+ (22.x를 쓴다면 22.12+). 공식 스타터(B)는 Node.js 22.18+ (24.x를 쓴다면 24.12+).

**A. Vite 최소 템플릿** (기본값. 이 스킬이 나머지 구성을 채운다)

```bash
{pm} create vite@latest . -- --template vue-ts --no-interactive
```

JavaScript 프로젝트라면 `--template vue`를 쓴다.

**B. Official Vue Starter** (사용자가 명시적으로 요청했을 때만. 라우터, Pinia, 테스트, 린터, 포매터를 한 번에 포함)

스킬이 자동으로 진행할 때는 비대화형 플래그로 생성한다. create-vue는 DIRECTORY가 `.`이거나 유효한 패키지 이름이 아니면
패키지 이름을 묻는 대화형으로 바뀌므로, 현재 폴더 이름(소문자, 하이픈만 허용)으로 하위 폴더에 생성한 뒤 내용을 현재 폴더로 옮긴다.

```bash
{pm} create vue@latest <프로젝트_이름> -- --ts --router --pinia --vitest --eslint --prettier
mv <프로젝트_이름>/.[!.]* <프로젝트_이름>/* . && rmdir <프로젝트_이름>
```

사용자가 직접 대화형으로 만들 때는 다음 순서로 묻는다. `Select a variant`에서 공식 스타터를 고르면 이후 질문은 create-vue의 것이다.

```bash
{pm} create vite@latest <프로젝트_폴더_이름>

  Select a framework: Vue
  Select a variant: Official Vue Starter
  Use TypeScript? Yes
  Select features to include in your project:
    JSX Support / Router (SPA development) / Pinia (state management) /
    Vitest (unit testing) / End-to-End Testing / Linter (error prevention) /
    Prettier (code formatting)
```

`Linter (error prevention)`를 고르면 ESLint와 oxlint가 함께 들어간다. 실험 기능(`Enable experimental features`)에서
`Replace Prettier with Oxfmt`, `Vue 3.6 (Release Candidate)`를 고를 수 있지만 이 스킬은 고르지 않는다.

공식 스타터는 경로 별칭 `@`, `.editorconfig`, `.vscode/settings.json`, `eslint.config.ts`, `.prettierrc.json`,
`type-check`와 `lint`, `format` 스크립트를 이미 포함하므로 **5, 6, 8, 9단계를 건너뛴다.**
Tailwind는 포함되지 않으므로 4단계는 그대로 수행하고, 7단계는 `.prettierrc.json`에 병합한다.
이어서 아래 "공식 스타터 추가 처리"를 본다.

### 4단계: Tailwind CSS 설치 [조건: tailwindcss 미설치 시]

```bash
{pm} add -D tailwindcss @tailwindcss/vite
```

`vite.config.ts`의 기존 `plugins` 배열 끝에 Tailwind 플러그인(`tailwindcss()`)을 추가한다.
`vue()`, `vueDevTools()`, `resolve.alias` 등 기존 항목은 그대로 유지한다.

Vite 최소 템플릿:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()]
})
```

공식 스타터:

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

1단계에서 감지한 전역 CSS 파일 최상단에 추가한다. 뒤따르는 기존 `@import`(공식 스타터의 `./base.css`)는 유지한다.

```css
@import 'tailwindcss';
```

해당 CSS 파일이 `src/main.ts`에서 import되고 있는지 확인한다.

### 5단계: 경로 별칭 구성 [조건: vite.config 또는 tsconfig에 `@` alias 미설정 시]

`vite.config.ts`에 `resolve.alias` 설정을 추가한다. 기존 `plugins`는 그대로 유지한다.
`@`와 `node_modules` 두 별칭을 항상 함께 추가한다.

```ts
// vite.config.ts
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: 'node_modules', replacement: '/node_modules' }
    ]
  }
})
```

`node_modules` 별칭은 `<style>` 안에서 `@import 'node_modules/swiper/swiper.css'`처럼
패키지 CSS를 가져올 때 쓴다.

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

> TypeScript v5 이하(`tsc --version`으로 확인)인 경우, `"baseUrl": "."` 을 `paths` 위에 추가한다.

### 6단계: ESLint + Prettier 구성 [조건: eslint.config.* 파일이 없을 때]

`eslint.config.js`, `eslint.config.ts`, `eslint.config.mjs` 중 하나라도 있으면(공식 스타터 포함) 이 단계 전체를 건너뛴다.
ESLint는 `.js`를 `.ts`보다 먼저 읽으므로, 새 파일을 만들면 기존 구성이 통째로 무시된다.

Vite의 Vue 템플릿에는 ESLint가 포함되지 않는다. 전부 직접 설치한다.

TypeScript 프로젝트:

```bash
{pm} add -D eslint @eslint/js eslint-plugin-vue @vue/eslint-config-typescript prettier eslint-config-prettier eslint-plugin-prettier
```

JavaScript 프로젝트:

```bash
{pm} add -D eslint @eslint/js globals eslint-plugin-vue prettier eslint-config-prettier eslint-plugin-prettier
```

Tailwind를 설치했다면 Prettier 플러그인도 함께 추가한다:

```bash
{pm} add -D prettier-plugin-tailwindcss
```

포매터가 Oxfmt(`.oxfmtrc.json` 존재)인 프로젝트에서는 `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`,
`prettier-plugin-tailwindcss`를 설치하지 않고, 아래 구성에서 `prettierRecommended`를 뺀다.

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
| `prettier-plugin-tailwindcss` | Tailwind 클래스 정렬 (Tailwind 설치 시) |

프로젝트 루트에 `eslint.config.js`를 생성한다.

TypeScript 프로젝트:

```js
// eslint.config.js
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs
} from '@vue/eslint-config-typescript'
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
// eslint.config.js
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

사용자가 Vue 커스텀 규칙을 요청하면 구성의 **가장 마지막**에 아래 객체(조각)를 추가한다.

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

### 7단계: Prettier 구성 파일 [조건: Prettier 구성 파일이 없을 때 생성. 공식 스타터의 .prettierrc.json에는 병합]

포매터가 Oxfmt인 프로젝트에서는 이 단계를 건너뛴다. `.oxfmtrc.json`과 `format` 스크립트는 건드리지 않는다.

Prettier 구성 파일이 전혀 없으면 프로젝트 루트에 `.prettierrc`를 생성한다.
Tailwind를 설치하지 않았으면 `plugins` 항목을 뺀다.

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

공식 스타터의 `.prettierrc.json`이 있으면 새 파일을 만들지 않고 그 파일에 위 옵션을 병합한다.
`$schema`는 유지하고, 스타터가 넣은 `printWidth`는 삭제해 두 스캐폴드(react-vite-scaffold, vue-vite-scaffold)의 규칙을 같게 맞춘다.
`prettier-plugin-tailwindcss`가 설치되어 있지 않으면 `{pm} add -D prettier-plugin-tailwindcss`로 추가한다.

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
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

판단 기준은 `settings.json` 파일이다. Vite 템플릿이 만드는 `.vscode/extensions.json`만 있는 경우는 없는 것으로 보고 생성한다.

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

포매터가 Oxfmt인 프로젝트에서는 `editor.defaultFormatter`를 `oxc.oxc-vscode`로 둔다.

사용자에게 아래 VS Code 확장 설치를 안내한다.

- `dbaeumer.vscode-eslint` (ESLint)
- `esbenp.prettier-vscode` (Prettier - Code formatter)
- `Vue.volar` (Vue - Official): Vue 프로젝트에 필수

### 9단계: typecheck 스크립트 [조건: TypeScript 프로젝트인데 typecheck 또는 type-check 스크립트가 없을 때]

`<template>` 안의 타입 오류는 편집기를 열지 않으면 드러나지 않는다.
존재하지 않는 속성 참조, 문자열 자리에 들어간 `ref` 객체, 잘못 쓴 Props 이름이 모두 여기서 걸린다.
**AI가 작성한 Vue 코드를 검증하는 가장 중요한 수단이다.**

`vue-tsc`와 `typescript`가 없으면 설치한다:

```bash
{pm} add -D vue-tsc typescript
```

`package.json`에 스크립트를 추가한다. `lint` 스크립트가 이미 있으면(공식 스타터의 `run-s "lint:*"` 등) 건드리지 않는다.

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

- [ ] `tailwindcss`, `@tailwindcss/vite` 설치됨 + `vite.config.ts`에 플러그인 등록됨(기존 플러그인 유지) + 전역 CSS에 `@import 'tailwindcss'` 존재
- [ ] [Vite 템플릿] `vite.config.ts`와 `tsconfig.app.json`(TypeScript) 모두에 `@`, `node_modules` 경로 별칭 존재. [공식 스타터] `@` 별칭 존재
- [ ] `prettier` 설치됨 (Oxfmt 프로젝트 제외)
- [ ] [이 스킬이 eslint.config.*를 만든 경우] `eslint-config-prettier`, `eslint-plugin-prettier` 설치됨
- [ ] `eslint.config.*`의 **맨 마지막** 항목이 `prettierRecommended` 또는 `skipFormatting`
- [ ] Prettier 구성 파일(`.prettierrc*`) 존재. Tailwind 설치 시 `plugins`에 `prettier-plugin-tailwindcss` 포함 (Oxfmt 프로젝트 제외)
- [ ] [Oxfmt 프로젝트] `.oxfmtrc.json`과 `format` 스크립트가 변경되지 않음
- [ ] `.vscode/settings.json` 존재
- [ ] [TypeScript] `typecheck` 또는 `type-check` 스크립트 존재
- [ ] 이 스킬이 생성하거나 수정한 `.vue` 파일이 "Vue 코딩 규칙"을 지킨다 (`<script setup lang="ts">`, `scoped` 스타일, `@/` 별칭)
- [ ] [TypeScript] `{pm} run typecheck` (공식 스타터는 `type-check`) 통과
- [ ] `{pm} run lint` 통과
- [ ] `{pm} run build` 통과 (TypeScript 검사 포함)

**누락 항목이 있으면 해당 단계로 돌아가 즉시 보완한다.** 검증 통과 전에는 작업 종료 금지.

## 공식 스타터 추가 처리

3단계에서 공식 스타터로 생성했거나, 기존 프로젝트에 `.oxlintrc.json`이나 `eslint.config.ts`가 있으면 아래를 확인한다.

- 5, 6, 8, 9단계는 건너뛴다. 4단계는 기존 `plugins`를 유지한 채 수행하고, 7단계는 `.prettierrc.json`에 병합한다.
- 스타터에서 라우터를 골랐다면 `src/router/index.ts`와 `src/views/`가 이미 있다. 이 경우 `vue-router-use` 스킬은 부분 기능 추가 모드로만 쓴다.

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
둘 다 같은 최신 버전으로 올려도 된다.

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
스타터가 만든 `eslint.config.ts`에 Vitest 블록(`pluginVitest`, `files: ['src/**/__tests__/*']`)이 있으면 그대로 둔다.

```ts
// eslint.config.ts
import { globalIgnores } from 'eslint/config'
import {
  defineConfigWithVueTs,
  vueTsConfigs
} from '@vue/eslint-config-typescript'
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

`{pm} run lint`는 oxlint를 먼저 돌리고 ESLint를 이어서 돌린다.

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
프로젝트에 `CLAUDE.md`나 `.claude/rules/vue.md`가 있으면 그 내용이 이 스킬보다 우선한다. 기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로 만든다.

- 모든 Vue 컴포넌트는 `<script setup lang="ts">`를 사용한다. Options API는 쓰지 않는다.
- 반응형 상태는 `ref()`를 기본으로 쓴다. `reactive()`는 특수한 상황이 아니면 쓰지 않는다.
  `reactive()`는 원시형에서 반응성을 잃고 구조 분해에서도 반응성이 끊어진다.
  두 함수가 섞이면 어느 쪽 제약이 걸리는지 매번 판단해야 하고, 틀리면 화면이 갱신되지 않는 버그가 된다.
- 파생 값은 `computed()`로 만든다. `watch()`로 다른 상태를 갱신해 파생 값을 만들지 않는다.
- 로직 재사용은 컴포저블로 한다. 믹스인(mixin)은 쓰지 않는다.
- 컴포저블 파일은 `src/composables/useXxx.ts`에 두고, 함수 이름은 `use` 접두사로 시작한다.
- `<style>`에는 항상 `scoped`를 붙인다. 전역 스타일은 전역 CSS 파일 한 곳에만 작성한다.
- 컴포넌트 파일 이름은 PascalCase 다중 단어로 짓는다. (`MovieCard.vue`)
- 상대 경로는 같은 폴더 안의 파일을 가져올 때만 쓴다. 다른 폴더의 파일은 `@/` 별칭으로 가져온다.
- Props는 `defineProps<T>()` 형태의 타입 기반 선언만 쓴다.
- 컴포넌트 사이 통신은 Props와 Emits로 한다. `provide` / `inject`는 레이아웃 수준에서만 쓴다.
- 템플릿과 JSX에서 속성이 2개 이상이면 한 줄에 하나씩 쓴다. (`.prettierrc`의 `singleAttributePerLine`)

문법 상세는 아래 참조 문서를 필요할 때만 읽는다.

| 파일 | 다루는 내용 |
|---|---|
| [references/composition-api.md](references/composition-api.md) | 반응형 데이터(`ref` vs `reactive`), 템플릿 문법, 양식 바인딩, `computed`와 `watch`, 생명주기 훅, 컴포저블 |
| [references/components.md](references/components.md) | 컴파일러 매크로, Props, Emits, Slots, 폴스루 속성, `v-model`, 동적 컴포넌트, `provide`/`inject` |

## 주의사항

- 프로젝트에 `CLAUDE.md`나 `.claude/rules/vue.md`가 있으면 그 내용이 이 스킬보다 우선한다. 기존 코드가 있으면 파일 위치, 이름, 선언 형식을 먼저 확인하고 같은 스타일로 만든다.
- 이미 존재하는 설정 파일은 덮어쓰지 않는다. 같은 역할의 파일이 있으면 병합만 한다
- 기존 프로젝트 보완 모드에서는 질문 없이 자동으로 진행한다
- `prettierRecommended`(또는 `skipFormatting`)는 항상 ESLint 구성의 **마지막**에 온다.
  앞에 두면 뒤따르는 구성이 포맷 규칙을 다시 켠다
- 빈 디렉토리(스캐폴딩 모드)에서는 `npm`을 사용한다

## 함께 보는 스킬

| 필요한 것 | 스킬 |
|---|---|
| 라우팅 (Vue Router) | `vue-router-use` |
| 전역 상태 (스토어) | `pinia-use` |
| 성능, 접근성, SEO 측정 | `lighthouse` |
