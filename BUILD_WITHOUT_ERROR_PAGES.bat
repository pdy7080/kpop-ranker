@echo off
echo ========================================
echo KPOP Ranker - Build without error pages
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Cleaning build cache...
if exist .next\cache rmdir /s /q .next\cache

echo.
echo [2] Building (404/500 pages removed)...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS!
    echo ========================================
    echo.
    echo Build complete: .next folder
    echo.
    echo To run server:
    echo   npm start
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
)

pause
