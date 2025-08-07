@echo off
echo ========================================
echo KPOP Ranker - Clean Build (SSR Mode)
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Cleaning cache...
if exist .next\cache rmdir /s /q .next\cache

echo.
echo [2] Building...
set NODE_ENV=production
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS!
    echo ========================================
    echo.
    echo Build output: .next folder
    echo.
    echo To start production server:
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
