@echo off
echo ========================================
echo KPOP Ranker - Deployment Build
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo Current directory: %CD%
echo.

echo [1] Installing dependencies...
call npm install

echo.
echo [2] Cleaning old builds...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo.
echo [3] Building for production...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS!
    echo ========================================
    echo.
    echo Build output: .next folder
    echo.
    echo To test locally:
    echo   npm start
    echo.
    echo To deploy to server:
    echo   Upload .next, package.json, and node_modules
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
    echo Check the errors above
)

pause
