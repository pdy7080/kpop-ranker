@echo off
echo ========================================
echo KPOP Ranker - Static Pages Only Build
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo Cleaning...
rmdir /s /q .next 2>nul
rmdir /s /q out 2>nul

echo.
echo Building static pages only (no dynamic routes)...
set NODE_ENV=production
call npm run build

echo.
if exist out (
    echo ========================================
    echo SUCCESS! out folder created
    echo Note: Dynamic pages (artist, track) disabled
    echo Upload: C:\project\ai07\kpop-frontend-v2\out
    echo ========================================
    dir out
) else (
    echo Still no out folder. Check build errors above.
)

pause
