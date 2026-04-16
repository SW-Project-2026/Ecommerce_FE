# DaOn Frontend

> 다(All) 있다 + 취향이 켜지다(On) — AI 맞춤 쇼핑 플랫폼

## 🛠 Tech Stack

- React 18 + Vite
- Docker + Nginx
- GitHub Actions CI/CD
- Oracle Cloud (Ubuntu)

## 🎯 Git Convention

- 🎉 **Start:** Start New Project `[:tada:]`
- ✨ **Feat:** 새로운 기능을 추가 `[:sparkles:]`
- 🐛 **Fix:** 버그 수정 `[:bug:]`
- 🎨 **Design:** CSS 등 사용자 UI 디자인 변경 `[:art:]`
- ♻️ **Refactor:** 코드 리팩토링 `[:recycle:]`
- 🔧 **Settings:** Changing configuration files `[:wrench:]`
- 🗃️ **Comment:** 필요한 주석 추가 및 변경 `[:card_file_box:]`
- ➕ **Dependency/Plugin:** Add a dependency/plugin `[:heavy_plus_sign:]`
- 📝 **Docs:** 문서 수정 `[:memo:]`
- 🔀 **Merge:** Merge branches `[:twisted_rightwards_arrows:]`
- 🚀 **Deploy:** Deploying stuff `[:rocket:]`
- 🚚 **Rename:** 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우 `[:truck:]`
- 🔥 **Remove:** 파일을 삭제하는 작업만 수행한 경우 `[:fire:]`
- ⏪️ **Revert:** 전 버전으로 롤백 `[:rewind:]`

## 🪴 Branch Convention (GitHub Flow)

- `main`: 배포 가능한 브랜치, 항상 배포 가능한 상태를 유지
- `feature/{description}`: 새로운 기능을 개발하는 브랜치
    - 예: `feature/social-login`

### Flow

1. `main` 브랜치에서 새로운 브랜치를 생성.
2. 작업을 완료하고 커밋 메시지에 맞게 커밋.
3. Pull Request를 생성 / 팀원들의 리뷰.
4. 리뷰가 완료되면 `main` 브랜치로 병합.
5. 병합 후, 필요시 배포.

```bash
# 새로운 기능 개발
git checkout -b feature/social-login

# 작업 완료 후, main 브랜치로 병합
git checkout main
git pull origin main
git merge feature/social-login
git push origin main
```
