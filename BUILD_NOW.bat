@echo off
echo ========================================
echo KPOP Ranker - Production Build (SSR)
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Checking environment...
echo Current directory: %CD%
echo.

echo [2] Building...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS!
    echo ========================================
    echo.
    echo Build output: .next folder
    echo.
    echo To start server:
    echo   npm start
    echo.
    echo Server will run on: http://localhost:3000
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
)

pause
