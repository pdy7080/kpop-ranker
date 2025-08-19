@echo off
echo ========================================
echo KPOP Ranker - Next.js 14 Build
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo [1/2] Cleaning old builds...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo.
echo [2/2] Building (out folder will be created automatically)...
set NODE_ENV=production
call npm run build

echo.
if exist out (
    echo ========================================
    echo SUCCESS! out folder created
    echo Upload this folder to server:
    echo C:\project\ai07\kpop-frontend-v2\out
    echo ========================================
    dir out
) else (
    echo Build failed - no out folder created
)

pause
