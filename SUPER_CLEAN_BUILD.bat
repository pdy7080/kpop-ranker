@echo off
echo ========================================
echo KPOP Ranker - Super Clean Build
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Deleting ALL cache and build files...
rmdir /s /q .next 2>nul
rmdir /s /q out 2>nul
rmdir /s /q node_modules\.cache 2>nul
del /q tsconfig.tsbuildinfo 2>nul

echo.
echo [2] Building with clean state...
set NODE_ENV=production
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS!
    echo ========================================
    echo.
    echo To start server:
    echo   npm start
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
)

pause
