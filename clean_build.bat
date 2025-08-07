@echo off
echo ========================================
echo KPOP Ranker - Clean Build
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo [1] Cleaning cache and temp files...
if exist .next\cache rmdir /s /q .next\cache
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [2] Running build...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo ========================================
    echo.
    echo To start the production server:
    echo   npm start
    echo.
    echo Server will run on: http://localhost:3000
    echo ========================================
) else (
    echo.
    echo ========================================
    echo BUILD FAILED - Check errors above
    echo ========================================
)

pause
