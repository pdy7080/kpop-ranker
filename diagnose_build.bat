@echo off
echo ========================================
echo KPOP Ranker - Build Error Diagnostic
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo [1] Checking Node/NPM versions...
node --version
npm --version

echo.
echo [2] Cleaning previous build...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo.
echo [3] Installing dependencies...
call npm install

echo.
echo [4] Running build with detailed error output...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build

echo.
echo Exit code: %ERRORLEVEL%
echo.

if %ERRORLEVEL% NEQ 0 (
    echo ========================================
    echo BUILD FAILED - Check errors above
    echo ========================================
) else (
    echo ========================================
    echo BUILD SUCCESS!
    echo ========================================
)

pause
