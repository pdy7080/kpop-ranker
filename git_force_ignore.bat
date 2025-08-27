@echo off
echo === Git 캐시 클리어 및 .gitignore 강제 적용 ===

echo 1. Git 캐시 완전 클리어
git rm -r --cached .

echo 2. 모든 파일 다시 추가 (.gitignore 규칙 적용)
git add .

echo 3. 상태 확인
git status

echo === 완료 ===
echo 다음 명령어 실행:
echo git commit -m "Apply .gitignore rules and remove backup files"
echo git push

pause
