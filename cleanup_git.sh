#!/bin/bash
# Git에서 백업 파일들 명시적 삭제 스크립트

echo "=== Git에서 백업 파일들 삭제 ==="

# 삭제할 파일들 목록
FILES=(
    "src/pages/index_new.tsx"
    "src/pages/index_bak.tsx"
    "src/pages/index_improved.tsx"
    "src/pages/search_0824.tsx"
    "src/pages/trending_backup.tsx"
    "src/pages/trending_old.tsx"
    "src/pages/track/_backup_artistId.tsx"
    "src/pages/trending/index.tsx.backup"
    "BACKUP_TEMP/"
)

# 각 파일 삭제
for file in "${FILES[@]}"; do
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo "Removing: $file"
        git rm -r "$file" 2>/dev/null || git rm "$file" 2>/dev/null || echo "Failed to remove $file"
    else
        echo "Not in Git: $file"
    fi
done

echo "=== Git 상태 확인 ==="
git status

echo "=== 커밋 준비 완료 ==="
echo "다음 명령어를 실행하세요:"
echo "git add ."
echo "git commit -m \"Remove backup files to fix NextJS routing conflicts\""
echo "git push"
