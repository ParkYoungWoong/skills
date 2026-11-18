---
name: github-workflow
description: (heropy) Use when a user wants to upload a folder to GitHub, connect a project to a GitHub repository, or set up Git and GitHub on a computer where nothing may be installed or configured yet (git, GitHub CLI, git config, login), and for everyday pull, commit, push, branch, pull request, clone, and conflict work afterward. Works on macOS, Windows, Linux, and WSL in any terminal. 사용자가 "깃헙에 올려 줘", "깃허브 저장소에 업로드해 줘", "GitHub에 업로드", "저장소 만들어 줘", "원격 저장소 연결", "git 설정", "gh 로그인", "커밋하고 푸시", "최신 내용 가져와 줘", "충돌 해결"을 언급할 때도 이 스킬을 따른다.
model: sonnet
effort: high
metadata:
  author: ParkYoungWoong
  version: 1.0.0
---

# Git/GitHub 작업

요청 하나로 환경 점검, 설치와 설정, GitHub 연결, 실제 작업까지 이어서 처리한다.
아무것도 설치되지 않은 컴퓨터와 이미 다 설정된 컴퓨터 모두 같은 순서를 따르고, 이미 된 단계는 건너뛴다.

## 원칙

- 점검이 먼저다. 되어 있는 것은 건드리지 않는다. 전역 설정은 비어 있는 값만 채우고, 있는 값을 바꿔야 하면 이전 값과 함께 묻는다.
- 승인은 한 번에 묶는다. 설치, 로그인, 전역 설정, 새 저장소(이름, 공개 범위), 첫 업로드 파일처럼 컴퓨터나 GitHub에 남는 일은 계획으로 보여 주고 한 번 확인받은 뒤 끝까지 진행한다. 커밋, 푸시처럼 사용자가 직접 요청한 일은 다시 묻지 않는다.
- 설명 수준은 사용자에 맞춘다. 명령어나 용어로 요청하거나 환경이 이미 갖춰져 있으면 결과만 쓴다. 처음 쓰는 사람으로 보이면 용어는 그대로 쓰되 처음 나올 때 한 번만 괄호로 짧게 풀이한다. 예: `gh(GitHub CLI, 터미널에서 GitHub을 다루는 공식 도구)`.
- 사용자의 언어로 답한다.
- 프로젝트에 자체 규칙(AGENTS.md, CONTRIBUTING.md, 프로젝트 전용 Git 스킬 등의 브랜치, 커밋 규칙)이 있으면 그 규칙이 이 스킬보다 우선한다.

## 진행 안내

처음 쓰는 사람은 화면이 오래 멈춰 있으면 고장 난 줄 알고 창을 닫는다. 기다리는 동안 지금 무엇을 하는지 보이게 한다.

- 점검을 시작할 때 `환경 확인 중...` 한 줄을 먼저 쓴다. 점검 뒤 전체 단계 수를 정하고, 단계마다 시작과 끝을 한 줄씩 쓴다. 단계가 하나뿐이고 금방 끝나면 결과만 쓴다.

  ```plaintext
  [2/5] GitHub CLI 설치 중... (1~2분)
  [2/5] 완료: gh 2.105.0
  ```

- 10초 넘게 걸릴 수 있는 일(설치, 다운로드, 로그인 대기, 큰 업로드, 클론)은 실행 전에 예상 시간과 그동안 보일 화면을 먼저 알린다. 기다리는 일은 짧은 간격으로 상태를 확인하고, 확인할 때마다 진행 중임을 한 줄로 알린다.
- 사용자가 직접 해야 하는 일(브라우저 승인, 설치 창 클릭, 비밀번호 입력)은 `지금 할 일:`로 시작해서 무엇을 누르는지와 끝난 뒤 무엇을 하면 되는지 쓴다.
- 오류는 원문을 길게 붙이지 않는다. 원인 한 줄과 다음 행동을 쓰고, 해결되면 이어서 진행한다.

## 1단계: 환경 점검

명령을 실행하는 셸을 먼저 정한다. 사용자가 여는 터미널이 아니라 에이전트가 명령을 실행하는 셸이 기준이다.
macOS, Linux, WSL, Git Bash는 bash/zsh 명령을, Windows PowerShell과 PowerShell 7은 PowerShell 명령을 쓴다. cmd이면 `powershell -NoProfile -Command "..."`로 감싼다.

아래 항목을 한두 번의 명령으로 모아서 확인한다. 셸별 명령은 [references/setup.md](references/setup.md#환경-점검-명령)에 있다.

| 항목 | 확인할 것 |
| --- | --- |
| 시스템 | OS와 버전, CPU(arm64/x64), WSL/Git Bash 여부, 로그인 셸, 터미널 앱 |
| 설치 수단 | brew, winget, scoop, apt, dnf, pacman 등 쓸 수 있는 패키지 관리자, 관리자 권한 |
| Git | 설치 여부와 버전. macOS는 `xcode-select -p`가 실패하면 `git`을 실행하지 않는다(설치 창이 뜬다) |
| GitHub CLI | 설치 여부와 버전, 로그인한 계정(여러 개면 전부와 활성 계정) |
| Git 설정 | user.name, user.email, init.defaultBranch, pull.rebase, core.quotepath, 자격 증명 도우미 |
| 대상 폴더 | Git 저장소인지, 상위 폴더 저장소의 일부인지, 브랜치, 커밋 수, 원격 주소, 변경 파일 수, 진행 중인 병합, .gitignore |
| 네트워크 | github.com 접속 |

### GitHub 계정 찾기

로그인 전에는 후보를 모으고, 로그인 뒤에 확정한다. 출처와 명령은 [references/setup.md](references/setup.md#github-계정-찾기)에 있다.

- 후보가 하나면 그 계정으로 진행한다.
- 후보끼리 다르거나 gh 계정이 여럿이면 목록을 보여 주고 고르게 한다. 활성 계정을 말없이 바꾸지 않는다.
- 후보가 없으면 로그인으로 확정한다. 로그인할 수 없고 계정도 모를 때만 아이디를 묻는다.

### 보고

결과는 표 하나로 보고한다. 문제없는 항목은 짧게, 할 일이 있는 항목은 무엇을 할지 함께 쓴다.

```plaintext
| 항목 | 상태 |
| --- | --- |
| 시스템 | Windows 11 (x64), PowerShell 5.1, VS Code 터미널 |
| Git | 없음 -> 설치 |
| GitHub CLI(gh) | 없음 -> 설치 |
| GitHub 로그인 | 안 됨 -> 브라우저로 로그인 |
| 커밋 작성자 정보 | 없음 -> GitHub 계정으로 설정 |
| 이 폴더 | Git 저장소 아님, 파일 23개 |
```

모두 갖춰져 있으면 표 대신 한 줄(`환경 확인: Git 2.47, gh 로그인 octocat`)로 쓴다. 요청한 작업에 승인할 일(새 저장소 등)이 없으면 바로 5단계로 간다.

## 2단계: 계획과 승인

점검 결과로 할 일을 정하고, 보고와 함께 한 번에 확인받는다. 필요한 항목만 남긴다.

1. Git 설치
2. GitHub CLI 설치
3. GitHub 로그인과 Git 연결
4. 커밋 작성자 정보와 기본값 설정(넣을 값을 함께 보여 준다)
5. 요청한 작업(예: 비공개 저장소 `work-notes`를 만들고 파일 23개 업로드)

승인을 받기 전에는 점검과 읽기만 한다. 설치, 로그인, 전역 설정 변경, 저장소 생성은 승인 뒤에 시작한다. 승인이 필요한 일이 없으면 묻지 않고 진행한다.

## 3단계: 설치

OS별 명령, 관리자 권한이 없을 때, 설치 직후 명령을 못 찾을 때(PATH)는 [references/setup.md](references/setup.md#설치)를 따른다.

- 패키지 관리자가 있으면 쓴다. macOS는 Homebrew, Windows는 winget, Linux는 배포판의 패키지 관리자다.
- 비밀번호(sudo), Windows 사용자 계정 컨트롤 창, macOS 설치 창처럼 사용자의 입력이 필요한 단계는 대신 입력하지 않는다. 무엇이 뜨는지 알리고, 사용자가 끝내면 다시 점검한다.
- 설치 뒤에는 점검을 다시 해서 버전을 확인하고, 사용자가 쓰는 다른 터미널에서도 인식되는지 확인한다([터미널별 확인](references/setup.md#터미널별-확인)).
- gh를 설치할 수 없는 환경(회사 PC 정책 등)이면 [gh 없이 진행하기](references/setup.md#gh-없이-진행하기)로 바꾼다.

## 4단계: 로그인과 기본 설정

### GitHub 로그인

이미 로그인되어 있으면 건너뛴다.

1. 로그인 명령을 백그라운드로 실행하고 출력은 파일로 받는다. 터미널 입력이 없는 상태로 실행하면 gh는 일회용 코드와 주소만 출력하고 브라우저 승인을 기다린다(최대 15분). 셸별 실행 방법은 [references/setup.md](references/setup.md#로그인-실행)에 있다.

   ```bash
   gh auth login --hostname github.com --git-protocol https --web
   ```

2. 출력에서 코드를 찾아 보여 주고, `https://github.com/login/device`를 브라우저로 직접 연다.

   ```plaintext
   지금 할 일: 열린 브라우저에서 GitHub에 로그인하고 코드 ABCD-1234를 입력한 뒤 Authorize를 누르세요.
   ```

3. `gh auth status`를 몇 초 간격으로 확인하며 기다리고, 성공하면 바로 다음으로 간다. 기다리는 동안 로그인과 무관한 준비(`git init`, `.gitignore`)는 먼저 해 둔다. 같은 응답 안에서 계속 기다릴 수 없는 환경이면 "자동으로 이어 간다"고 약속하지 말고, 승인을 마친 뒤 답장해 달라고 쓴다.
4. 백그라운드 실행이나 출력 확인이 안 되는 환경이면 사용자가 자기 터미널에서 `gh auth login --web`을 실행하게 하고, 끝났다고 하면 다시 확인한다.

### Git 연결

새로 로그인했으면 `gh auth setup-git`을 실행해서 git이 gh 계정으로 푸시하게 한다. 푸시할 때 로그인을 다시 하지 않아도 되고, gh와 git이 같은 계정을 쓴다.
SSH나 기존 자격 증명으로 이미 푸시가 되던 환경은 건드리지 않고, 인증 오류가 날 때만 제안한다.

### 커밋 작성자와 기본값

비어 있는 값만 `git config --global`로 채운다. 값은 `gh api user --jq '.login, .name, .id'`로 얻는다.

| 설정 | 값 | 이유 |
| --- | --- | --- |
| `user.name` | GitHub 프로필 이름, 없으면 아이디 | 커밋 작성자 |
| `user.email` | `<id>+<login>@users.noreply.github.com` | 개인 메일을 공개하지 않고, 메일 비공개 설정 때문에 푸시가 거부되는 것도 막는다 |
| `init.defaultBranch` | `main` | GitHub 기본 브랜치와 맞춘다 |
| `pull.rebase` | `false` | 풀 방식을 정하지 않아 생기는 오류를 막는다 |
| `core.quotepath` | `false` | 한글 파일 이름이 `\355\225\234`처럼 보이지 않게 한다 |

사용자가 실제 메일을 원하면 그 메일을 쓴다. Windows에서 `core.autocrlf`가 비어 있으면 `true`로 둔다.

## 5단계: 요청한 작업

### GitHub에 올리기

1. 대상 폴더를 확인한다. 홈 폴더, 드라이브 루트, 바탕화면이나 문서 폴더 전체처럼 범위가 너무 넓으면 멈추고 묻는다. 상위 폴더가 이미 저장소면 그 사실을 알리고 어느 쪽으로 할지 묻는다.
2. 저장소가 아니면 `git init -b main`을 실행한다(Git 2.28 미만은 `git init` 후 `git checkout -b main`).
3. `.gitignore`가 없으면 폴더 내용에 맞게 만든다. OS 파일(`.DS_Store`, `Thumbs.db`), 환경 변수 파일(`.env`), 의존성 폴더(`node_modules`, `.venv`), 빌드 결과, 로그가 기본이다.
4. 올라갈 파일을 점검한다([업로드 전 파일 점검](references/setup.md#업로드-전-파일-점검)).
   - 비밀 정보로 보이는 파일(`.env`, `*.pem`, `*.key`, `id_rsa`, 인증 정보 JSON 등)은 `.gitignore`에 넣는다.
   - 50MB를 넘는 파일은 알리고, 100MB를 넘는 파일은 GitHub이 거부하므로 제외하거나 Git LFS를 제안한다.
5. 저장소 이름과 공개 범위를 정한다. 이름은 폴더 이름을 쓰되 영문, 숫자, `-`, `_`, `.`만 쓴다(다른 글자는 GitHub이 `-`로 바꾼다). 한글 이름이면 영문 이름을 제안한다. 공개 범위의 기본은 비공개(private)다. 같은 이름의 저장소가 있으면 다른 이름을 제안한다.
6. 저장소 이름, 공개 범위, 올라갈 파일 수와 주요 폴더, 제외할 파일은 2단계 승인에 함께 넣는다. Git이 없어 승인 전에 4를 못 하면 폴더의 파일 수만 넣고, 설치 뒤 점검에서 제외한 파일은 결과와 함께 알린다. 이름이 이미 있을 때만 그 자리에서 다시 묻는다.
7. 첫 커밋을 만들고 저장소를 만들면서 올린다.

   ```bash
   gh repo create <이름> --private --source . --remote origin --push
   ```

   - 조직 저장소는 `<조직>/<이름>`으로 만든다.
   - `origin`이 이미 있으면 새로 만들지 않고 `git push -u origin HEAD`로 올린다.
   - 사용자가 알려 준 기존 저장소에 이미 커밋이 있으면 푸시하지 않는다. 그 저장소를 새 폴더에 클론해서 파일을 옮기는 방법을 안내한다.
8. 저장소 주소(`gh repo view --json url --jq .url`)와 올린 파일 수로 마무리한다.

### 저장(커밋과 푸시)

1. `git status`와 `git diff --stat`으로 바뀐 내용을 파악한다.
2. 새로 들어가는 파일에 비밀 정보나 큰 파일이 있거나, 많은 파일이 지워지면 멈추고 묻는다. 그 밖에는 묻지 않는다.
3. 커밋 메시지는 저장소의 최근 커밋 스타일과 언어를 따른다. 기록이 없으면 사용자의 언어로 한 줄 요약한다.
4. 커밋, 풀, 푸시 순서로 진행한다. 원격 브랜치가 없으면 `git push -u origin HEAD`로 올린다.
5. 커밋 메시지, 파일 수, 저장소 주소로 결과를 알린다.

### 가져오기(풀)

1. `git pull`을 실행한다. 사용자가 정해 둔 `pull.rebase` 값이 있으면 그대로 따른다.
2. 커밋하지 않은 변경 때문에 막히면 먼저 커밋할지, 잠시 치워 둘지(`git stash`) 묻는다.
3. 새로 들어온 커밋을 `git log --oneline ORIG_HEAD..HEAD`로 확인해서 작성자와 내용 중심으로 요약한다.

### 브랜치와 풀 리퀘스트

- 작업 브랜치는 `git switch -c <이름>`으로 만들고, 첫 푸시는 `git push -u origin HEAD`로 한다.
- 풀 리퀘스트는 `gh pr create --fill`이나 제목과 본문을 지정해서 만들고 주소를 알린다. 확인과 병합은 `gh pr view`, `gh pr merge`를 쓴다.
- main에 직접 푸시가 거부되면(브랜치 보호 규칙) 브랜치에 푸시하고 풀 리퀘스트로 안내한다.

### 충돌 해결

1. 어느 쪽을 남길지 스스로 정하지 않고 멈춘다.
2. 충돌한 파일마다 내 변경과 원격 변경을 나란히 보여 주고 차이를 설명한다.
3. 사용자가 정하면 그대로 고치고 `git add`, `git commit --no-edit` 뒤 푸시한다.
4. 사용자가 취소를 원하면 `git merge --abort`로 되돌린다.

### 내려받기(클론)

`gh repo clone <소유자>/<이름> [폴더]`를 쓴다. gh가 없으면 `git clone <주소>`를 쓴다.

### 되돌리기

푸시한 커밋은 `git revert`로 되돌린다. 커밋하지 않은 변경을 버리는 `git restore`는 내용이 사라지므로 파일 목록을 보여 주고 묻는다.

오류 메시지별 해결 방법은 [references/troubleshooting.md](references/troubleshooting.md)에 있다.

## 금지

- `git push --force`, `git reset --hard`, `git clean`, `git branch -D`, 커밋 기록 다시 쓰기는 사용자가 직접 요청하고 사라지는 내용을 확인한 경우에만 실행한다. 강제 푸시는 `--force-with-lease`로 한다.
- `.gitignore`에 있는 파일을 `git add -f`로 넣지 않는다.
- 토큰과 비밀번호를 화면이나 파일에 출력하지 않는다. `gh auth token`, `gh auth status --show-token`, `git credential fill`을 실행하지 않는다.
- 비밀번호나 토큰을 대신 입력하거나 사용자에게 받아 적지 않는다.
- 공개(public) 저장소는 사용자가 공개를 명시한 경우에만 만든다.
