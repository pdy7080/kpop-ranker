@echo off
echo ========================================
echo KPOP Ranker - Local Build for Upload
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo [1/3] Setting environment...
set NODE_ENV=production

echo.
echo [2/3] Building...
call npm run build

echo.
echo [3/3] Exporting static files...
call npx next export

echo.
if exist out (
    echo ========================================
    echo BUILD SUCCESS!
    echo Upload this folder to server:
    echo C:\project\ai07\kpop-frontend-v2\out
    echo ========================================
    dir out
) else (
    echo Build failed!
)

pause
