@echo off
echo ========================================
echo KPOP Ranker - Production Build
echo Date: 2025-08-06
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo [1/4] Cleaning old builds...
if exist out rmdir /s /q out
if exist .next rmdir /s /q .next

echo.
echo [2/4] Setting production environment...
set NODE_ENV=production

echo.
echo [3/4] Building Next.js application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Exporting static files...
call npx next export

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Export failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD SUCCESS!
echo Static files: C:\project\ai07\kpop-frontend-v2\out
echo ========================================
echo.
dir out
pause
