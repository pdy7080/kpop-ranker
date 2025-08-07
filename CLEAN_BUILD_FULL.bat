@echo off
echo ========================================
echo KPOP Ranker - Complete Clean Build
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Removing ALL build artifacts...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [2] Reinstalling dependencies...
call npm ci

echo.
echo [3] Building with clean state...
set NODE_ENV=production
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo BUILD FAILED
    echo ========================================
)

pause
