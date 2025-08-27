@echo off
echo === Git에서 백업 파일들 삭제 ===

REM 파일이 Git에서 추적 중인지 확인하고 삭제
git rm "src/pages/index_new.tsx" 2>nul
git rm "src/pages/index_bak.tsx" 2>nul  
git rm "src/pages/index_improved.tsx" 2>nul
git rm "src/pages/search_0824.tsx" 2>nul
git rm "src/pages/trending_backup.tsx" 2>nul
git rm "src/pages/trending_old.tsx" 2>nul
git rm "src/pages/track/_backup_artistId.tsx" 2>nul
git rm "src/pages/trending/index.tsx.backup" 2>nul
git rm -r "BACKUP_TEMP/" 2>nul

echo === 변경사항 추가 ===
git add .

echo === Git 상태 ===
git status

echo === 다음 명령어를 실행하세요 ===
echo git commit -m "Remove backup files to fix NextJS routing conflicts"
echo git push

pause
