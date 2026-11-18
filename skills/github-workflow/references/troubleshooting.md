# 오류 해결

메시지의 일부로 찾는다. 해결 방법에 기록을 지우거나 바꾸는 명령이 있으면 실행 전에 사용자에게 확인받는다.

## 설치와 실행

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `xcrun: error: invalid active developer path` | macOS 명령줄 도구 없음 | `xcode-select --install` |
| `'git' is not recognized`, `command not found: gh` (설치 직후) | 현재 세션의 PATH가 낡음 | [PATH 반영](setup.md#path-반영) |
| `cannot be loaded because running scripts is disabled` | PowerShell 실행 정책 | 스크립트 대신 명령을 직접 실행하거나, 승인받고 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `winget`을 찾을 수 없음 | 오래된 Windows 10 | [Windows 설치](setup.md#windows)의 설치 파일 방법 |
| 출력의 한글이 깨짐(Windows) | 콘솔 인코딩 | `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` |
| 파일 이름이 `"\355\225\234..."`로 보임 | `core.quotepath` | `git config --global core.quotepath false` |

## 설정과 저장소

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `Author identity unknown`, `Please tell me who you are` | 커밋 작성자 정보 없음 | SKILL.md 4단계의 커밋 작성자 설정 |
| `not a git repository` | 다른 폴더에 있거나 저장소가 아님 | 폴더를 확인하고, 맞으면 `git init -b main` |
| `detected dubious ownership in repository` | 폴더 소유자가 현재 사용자와 다름(외장 드라이브, WSL에서 연 Windows 폴더) | 사용자가 믿는 폴더면 `git config --global --add safe.directory <경로>` |
| `Need to specify how to reconcile divergent branches` | `pull.rebase` 미설정 | `git config --global pull.rebase false` 후 다시 풀 |
| `Filename too long` (Windows) | 경로 길이 제한 | `git config --global core.longpaths true` |
| `LF will be replaced by CRLF` | 줄 끝 변환 안내 | 경고일 뿐이므로 진행 |

## 로그인과 권한

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `To get started with GitHub CLI, please run: gh auth login` | gh 로그인 안 됨 | SKILL.md 4단계 로그인 |
| `Support for password authentication was removed` | 비밀번호로 푸시 | `gh auth login` 후 `gh auth setup-git` |
| `Permission to <소유자>/<이름>.git denied to <계정>`, `403` | git이 다른 계정의 자격 증명을 씀 | 맞는 계정으로 `gh auth switch --hostname github.com --user <계정>` 후 `gh auth setup-git` |
| `Repository not found` | 주소 오타, 권한 없음, 다른 계정으로 로그인 | `git remote -v`의 주소와 `gh auth status`의 계정 확인 |
| `Permission denied (publickey)` | 원격 주소가 SSH인데 키가 없거나 등록 안 됨 | 승인받고 HTTPS 주소로 변경: `git remote set-url origin https://github.com/<소유자>/<이름>.git` |
| `Bad credentials`, `The value of the GH_TOKEN environment variable is being used` | 환경 변수 `GH_TOKEN`, `GITHUB_TOKEN`의 토큰이 우선 쓰임 | 사용자에게 알리고, 만료된 토큰이면 환경 변수를 지우게 한다 |
| `Name already exists on this account` | 같은 이름의 저장소가 있음 | 다른 이름 제안. 그 저장소가 비어 있고 사용자가 원하면 `origin`으로 연결 |

## 푸시와 풀

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `[rejected] ... (fetch first)`, `non-fast-forward` | 원격에 내가 없는 커밋이 있음 | 풀 후 다시 푸시. 강제 푸시 금지 |
| `refusing to merge unrelated histories` | 원격 저장소를 README 등과 함께 만듦 | 원격에 README, .gitignore, LICENSE만 있으면 승인받고 `git pull origin main --no-rebase --allow-unrelated-histories`. 그 밖의 내용이 있으면 멈추고 묻는다 |
| `Your local changes ... would be overwritten by merge` | 커밋 안 한 변경과 겹침 | 커밋하거나 `git stash` 후 풀, 이어서 `git stash pop` |
| `CONFLICT (content)` | 같은 부분을 양쪽에서 고침 | SKILL.md의 충돌 해결 |
| `GH007: Your push would publish a private email address` | 커밋 메일이 비공개 설정된 실제 메일 | `user.email`을 noreply 주소로 바꾸고, 푸시 안 된 커밋은 승인받고 `git commit --amend --reset-author --no-edit`(여러 개면 `git rebase -r <기준> --exec "git commit --amend --no-edit --reset-author"`) |
| `GH001: Large files detected`, `exceeds GitHub's file size limit of 100.00 MB` | 100MB를 넘는 파일 | 마지막 커밋에만 있으면 `git rm --cached <파일>`, `.gitignore` 추가, `git commit --amend --no-edit`. 이전 커밋에도 있으면 기록을 다시 써야 하므로 멈추고 방법을 설명한다 |
| `GH006: Protected branch update failed`, `protected branch hook declined` | 브랜치 보호 규칙 | 브랜치에 푸시하고 풀 리퀘스트 |
| `RPC failed`, `the remote end hung up unexpectedly` (큰 푸시) | 한 번에 올리는 양이 큼 | 큰 파일을 점검하고, `git config http.postBuffer 524288000` 후 다시 시도 |

## 네트워크

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `Could not resolve host: github.com`, 시간 초과 | 네트워크 끊김, 회사 프록시 | 연결 확인. 회사 프록시면 사용자나 IT 부서에 주소를 받아 `git config --global http.proxy <주소>` |
| `SSL certificate problem: unable to get local issuer certificate` | 회사 보안 장비의 인증서 | Windows는 `git config --global http.sslBackend schannel`. 그 밖에는 IT 부서의 인증서 안내를 따른다. `http.sslVerify false`는 쓰지 않는다 |
