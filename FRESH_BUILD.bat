@echo off
echo ========================================
echo KPOP Ranker - Complete Clean Build
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Removing ALL build artifacts and cache...
if exist .next rd /s /q .next
if exist out rd /s /q out
if exist node_modules\.cache rd /s /q node_modules\.cache

echo.
echo [2] Setting environment...
set NODE_ENV=production

echo.
echo [3] Building fresh...
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
