# 설정 상세

SKILL.md의 단계에서 필요한 부분만 읽는다.

## 환경 점검 명령

한 번에 실행하고, 출력에서 필요한 값만 보고에 옮긴다.

### bash, zsh (macOS, Linux, WSL, Git Bash)

```bash
uname -srm; [ "$(uname -s)" = Darwin ] && sw_vers -productVersion
echo "shell=$SHELL term=${TERM_PROGRAM:-none} wsl=${WSL_DISTRO_NAME:-no} gitbash=${MSYSTEM:-no}"
for c in brew apt-get dnf pacman zypper apk; do command -v "$c" >/dev/null 2>&1 && echo "pkg=$c"; done
sudo -n true 2>/dev/null && echo "sudo=nopass" || echo "sudo=needs-password"
if [ "$(uname -s)" = Darwin ] && ! xcode-select -p >/dev/null 2>&1; then echo "clt=missing (do not run git)"; else git --version 2>/dev/null || echo "git=missing"; fi
if command -v gh >/dev/null 2>&1; then gh --version | head -1; a=$(gh auth status --json hosts --jq '.hosts[][] | [.login, .active, .state] | @tsv' 2>/dev/null || gh auth status 2>&1 | grep -i account); echo "gh_accounts=${a:-none}"; else echo "gh=missing"; fi
for k in user.name user.email init.defaultBranch pull.rebase core.quotepath github.user; do echo "$k=$(git config --global --get "$k" 2>/dev/null)"; done
git config --show-origin --get-regexp '^credential\.' 2>/dev/null
if git rev-parse --show-toplevel 2>/dev/null; then git status -sb | head -1; git remote -v; echo "commits=$(git rev-list --count HEAD 2>/dev/null || echo 0) changes=$(git status --porcelain | wc -l | tr -d ' ')"; else echo "repo=no"; fi
curl -sI -m 5 https://github.com >/dev/null && echo "network=ok" || echo "network=fail"
```

- macOS의 `/usr/bin/git`은 명령줄 도구(Command Line Tools)가 없으면 설치 창을 띄우는 껍데기다. `clt=missing`이면 `git`을 실행하지 않고 설치로 간다.
- `gh auth status --json`이 없는 오래된 gh는 텍스트 출력으로 대신한다.
- `git rev-parse --show-toplevel`이 대상 폴더와 다르면 상위 폴더 저장소의 일부다.

### PowerShell (Windows PowerShell 5.1, PowerShell 7)

```powershell
"ps=$($PSVersionTable.PSVersion) os=$([Environment]::OSVersion.Version) arch=$env:PROCESSOR_ARCHITECTURE term=$env:TERM_PROGRAM wt=$([bool]$env:WT_SESSION)"
"admin=$(([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))"
foreach ($c in 'winget','scoop','choco','git','gh','pwsh','wsl') { $p = Get-Command $c -ErrorAction SilentlyContinue; if ($p) { "$c=$($p.Source)" } else { "$c=missing" } }
foreach ($f in "$env:ProgramFiles\Git\cmd\git.exe", "$env:ProgramFiles\GitHub CLI\gh.exe", "$env:ProgramFiles\Git\bin\bash.exe") { if (Test-Path $f) { "exists=$f" } }
if (Get-Command git -ErrorAction SilentlyContinue) { git --version; foreach ($k in 'user.name','user.email','init.defaultBranch','pull.rebase','core.quotepath','core.autocrlf','github.user') { "$k=$(git config --global --get $k)" }; git config --show-origin --get-regexp '^credential\.' }
if (Get-Command gh -ErrorAction SilentlyContinue) { gh --version | Select-Object -First 1; gh auth status --json hosts --jq '.hosts[][] | [.login, .active, .state] | @tsv'; if ($LASTEXITCODE -ne 0) { gh auth status } }
if (Get-Command git -ErrorAction SilentlyContinue) { git rev-parse --show-toplevel 2>$null; if ($LASTEXITCODE -eq 0) { git status -sb | Select-Object -First 1; git remote -v } else { 'repo=no' } }
```

- `os` 빌드 번호가 22000 이상이면 Windows 11이다.
- `exists=`는 있는데 `git=missing`, `gh=missing`이면 설치는 되었고 PATH만 반영되지 않은 상태다([PATH 반영](#path-반영)).
- 한글이 깨져 보이면 먼저 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`을 실행한다.

## GitHub 계정 찾기

위에서부터 찾고, 찾은 값은 후보로만 쓴다. 비밀번호와 토큰은 읽지 않는다.

- gh 로그인 계정: `gh auth status --json hosts --jq '.hosts[][] | [.login, .active] | @tsv'`
- 이 폴더의 원격 주소: `git remote -v`의 `github.com/<소유자>/`(조직일 수 있다)
- Git 설정: `git config --global github.user`
- macOS 키체인(계정 이름만 나온다): `security find-internet-password -s github.com 2>/dev/null | grep '"acct"'`
- Windows 자격 증명 관리자: `cmdkey /list | Select-String -Context 0,2 github`
- 커밋 작성자 정보: `user.name`, `user.email`의 앞부분(아이디와 다를 수 있다)

로그인 뒤에는 `gh api user --jq .login`이 확정값이다. gh 활성 계정과 키체인 계정, 원격 주소 소유자가 서로 다르면 어느 계정으로 작업할지 묻는다. 계정을 바꿀 때는 `gh auth switch --hostname github.com --user <아이디>`를 쓰고, 이 명령은 다른 터미널의 gh에도 적용된다고 알린다.

## 설치

### macOS

| 대상 | 방법 | 시간 |
| --- | --- | --- |
| Git | `xcode-select --install`을 실행하면 설치 창이 뜬다. `xcode-select -p`가 성공할 때까지 기다린다 | 5~15분 |
| Git, gh(Homebrew가 있을 때) | `brew install git gh` | 1~3분 |
| gh(Homebrew가 없을 때) | 아래 설치 파일을 받아 연다. 설치 창에서 비밀번호를 입력한다 | 1~2분 |

```bash
v=$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest | sed -n 's/.*"tag_name": *"v\([^"]*\)".*/\1/p')
curl -fL -o ~/Downloads/gh.pkg "https://github.com/cli/cli/releases/download/v$v/gh_${v}_macOS_universal.pkg"
open ~/Downloads/gh.pkg
```

- 명령줄 도구 설치 창: `지금 할 일: 뜬 창에서 '설치'를 누르고 약관에 동의하세요. 끝나면 알려 주세요.`
- Homebrew를 새로 설치하려면 사용자가 자기 터미널에서 `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`를 실행하고 비밀번호를 입력해야 한다. 개발 도구를 계속 쓸 사람에게만 권한다.
- `/opt/homebrew/bin/brew`는 있는데 `brew`를 못 찾으면(Apple Silicon) 셸 시작 파일에 PATH를 넣는다. zsh는 `~/.zprofile`, bash는 `~/.bash_profile`이다.

  ```bash
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  eval "$(/opt/homebrew/bin/brew shellenv)"
  ```

### Windows

```powershell
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements
```

- 각 1~3분 걸린다. 사용자 계정 컨트롤 창이 뜨면 `지금 할 일: '예'를 누르세요.`
- Git for Windows에는 Git Bash와 Git Credential Manager가 함께 들어 있다.
- 관리자 권한이 없어 설치가 막히면 관리자 권한이 필요 없는 Scoop을 쓴다. 실행 정책 변경은 계속 남는 설정이므로 승인에 포함한다.

  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
  scoop install git gh
  ```

- winget이 없는 오래된 Windows 10은 Microsoft Store에서 '앱 설치 관리자'를 업데이트하거나, 설치 파일(Git: https://git-scm.com/downloads/win, gh: https://github.com/cli/cli/releases/latest 의 `windows_amd64.msi`)을 받아 `Start-Process`로 연다.
- Windows PowerShell 5.1에서 한글 커밋 메시지는 `git commit -m "..."` 인수로 넘긴다. 파이프로 넘기면 글자가 `?`로 바뀔 수 있다.

### Linux

| 배포판 | 명령 |
| --- | --- |
| Ubuntu, Debian | `sudo apt-get update && sudo apt-get install -y git gh` |
| Fedora | `sudo dnf install -y git gh` |
| Arch | `sudo pacman -S --needed git github-cli` |
| openSUSE | `sudo zypper install -y git gh` |
| Alpine | `sudo apk add git github-cli` |

- 배포판 저장소에 gh가 없거나 너무 오래되었으면 공식 저장소를 등록한다: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
- `sudo=needs-password`이면 비밀번호를 받지 않고, 사용자가 자기 터미널에서 명령을 직접 실행하게 한다.

### WSL

WSL은 Windows와 별개의 Linux다. Windows 쪽에 설치하고 로그인했어도 WSL 안에서 Linux 방법으로 다시 설치하고 `gh auth login`도 따로 한다. WSL에서 브라우저는 `cmd.exe /c start <주소>`로 연다.

### PATH 반영

설치 직후 명령을 못 찾으면 현재 세션의 PATH만 낡은 것이다. 다시 설치하지 않는다.

| 셸 | 명령 |
| --- | --- |
| PowerShell | `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')` |
| Git Bash | `export PATH="$PATH:/c/Program Files/Git/cmd:/c/Program Files/GitHub CLI"` |
| macOS Homebrew | `eval "$(/opt/homebrew/bin/brew shellenv)"` |

- 에이전트가 명령마다 새 셸을 띄우면 갱신이 다음 명령에 남지 않는다. 명령마다 앞에 붙이거나 전체 경로(`& "$env:ProgramFiles\GitHub CLI\gh.exe"`)를 쓴다.
- 사용자에게는 이미 열려 있던 터미널과 편집기가 새 설치를 모른다고 알린다. VS Code는 창을 모두 닫고 다시 열어야 통합 터미널에 반영된다.

## 터미널별 확인

설치하거나 PATH를 바꾼 뒤, 사용자가 쓰는 터미널마다 인식되는지 확인한다.

| 환경 | 명령 |
| --- | --- |
| macOS, Linux zsh | `zsh -lc 'command -v git gh'` |
| macOS, Linux bash | `bash -lc 'command -v git gh'` |
| fish | `fish -c 'command -v git gh'` (PATH는 `fish_add_path`로 추가) |
| Windows PowerShell | `powershell -NoProfile -Command "Get-Command git, gh"` |
| PowerShell 7 | `pwsh -NoProfile -Command "Get-Command git, gh"` |
| cmd | `cmd /c where git gh` |
| Git Bash | `& "$env:ProgramFiles\Git\bin\bash.exe" -lc 'command -v git gh'` |

- 같은 OS 안의 터미널은 전역 Git 설정(`~/.gitconfig`)과 gh 로그인(운영체제 자격 증명 저장소)을 함께 쓴다. WSL만 따로다.
- PATH를 `~/.zshrc`에만 넣은 경우는 `zsh -lc`에서 보이지 않을 수 있다. 이때는 `~/.zprofile`로 옮기기를 제안한다.

## 로그인 실행

에이전트에 백그라운드 실행 기능이 있으면 그 기능으로 실행하고 출력을 읽는다. 없으면 셸에서 분리해서 실행한다.

```bash
log="${TMPDIR:-/tmp}/gh-login.log"
nohup gh auth login --hostname github.com --git-protocol https --web < /dev/null > "$log" 2>&1 &
```

```powershell
$log = Join-Path $env:TEMP 'gh-login.log'
Start-Process gh -ArgumentList 'auth','login','--hostname','github.com','--git-protocol','https','--web' -RedirectStandardError $log -RedirectStandardOutput "$log.out" -WindowStyle Hidden
```

1~2초 뒤 로그 파일을 읽으면 다음 두 줄이 있다.

```plaintext
! First copy your one-time code: ABCD-1234
Open this URL to continue in your web browser: https://github.com/login/device
```

- 브라우저 열기: macOS `open <주소>`, Windows `Start-Process <주소>`, Linux `xdg-open <주소>`, WSL `cmd.exe /c start <주소>`
- 코드를 클립보드에 넣어 두면 붙여 넣기만 하면 된다: macOS `printf %s ABCD-1234 | pbcopy`, Windows `Set-Clipboard -Value ABCD-1234`
- 완료 확인: `gh auth status --hostname github.com`의 종료 코드가 0이면 성공이다. 15분이 지나면 코드가 만료되므로 다시 실행한다.
- 이 방식은 Git 연결을 하지 않으므로 이어서 `gh auth setup-git`을 실행하고, `git config --global --get-all credential.https://github.com.helper`에 `gh auth git-credential`이 보이는지 확인한다.

## 업로드 전 파일 점검

`git init` 뒤, 첫 커밋 전에 실행한다. `git ls-files -co --exclude-standard`의 목록이 `git add -A`로 들어갈 파일이다.

```bash
git ls-files -co --exclude-standard | wc -l
git -c core.quotepath=false ls-files -co --exclude-standard | cut -d/ -f1 | sort | uniq -c | sort -rn | head
git -c core.quotepath=false ls-files -co --exclude-standard | grep -iE '(^|/)(\.env(\.[^/]*)?|id_(rsa|ed25519|ecdsa)|[^/]*\.(pem|key|p12|pfx|jks|keystore)|[^/]*credentials?[^/]*\.json|[^/]*secret[^/]*|service-account[^/]*\.json|\.npmrc|\.netrc)$'
git ls-files -co --exclude-standard -z | xargs -0 wc -c 2>/dev/null | awk '$0 !~ /^ *[0-9]+ total$/ && $1 > 52428800 { s=$1; sub(/^ *[0-9]+ /, ""); printf "%d MB\t%s\n", s/1048576, $0 }'
```

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$files = @(git -c core.quotepath=false ls-files -co --exclude-standard)
$files.Count
$files | ForEach-Object { ($_ -split '/')[0] } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10 Count, Name
$files | Where-Object { $_ -match '(^|/)(\.env(\.[^/]*)?|id_(rsa|ed25519|ecdsa)|[^/]*\.(pem|key|p12|pfx|jks|keystore)|[^/]*credentials?[^/]*\.json|[^/]*secret[^/]*|service-account[^/]*\.json|\.npmrc|\.netrc)$' }
$files | Where-Object { (Get-Item -LiteralPath $_ -ErrorAction SilentlyContinue).Length -gt 50MB }
```

- 셋째 줄은 비밀 정보로 보이는 파일, 넷째 줄은 50MB를 넘는 파일이다. `.env.example`처럼 값이 없는 예시 파일은 올려도 된다.
- `node_modules`, `.venv` 같은 폴더가 목록에 보이면 `.gitignore`가 빠진 것이다.

## gh 없이 진행하기

gh를 설치할 수 없을 때는 Git만으로 진행한다.

1. 사용자가 GitHub에서 빈 저장소를 만들게 한다.

   ```plaintext
   지금 할 일: https://github.com/new 에서 저장소 이름을 입력하고 Private을 고른 뒤,
   README 추가 같은 옵션은 선택하지 않고 Create repository를 누르세요. 만들어진 주소를 알려 주세요.
   ```

2. `git remote add origin <주소>`로 연결하고 `git push -u origin main`으로 올린다.
3. 첫 푸시에서 로그인을 요구한다. Windows는 Git Credential Manager가 브라우저 로그인 창을 띄운다. macOS와 Linux는 사용자 이름과 개인 액세스 토큰(Settings > Developer settings > Personal access tokens)을 터미널에 입력해야 하므로, 사용자가 자기 터미널에서 푸시하게 한다. 토큰을 대신 받지 않는다.
