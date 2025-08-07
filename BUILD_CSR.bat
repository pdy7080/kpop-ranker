@echo off
echo ========================================
echo KPOP Ranker - CSR Build
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Cleaning cache...
if exist .next\cache rmdir /s /q .next\cache

echo.
echo [2] Building with CSR pages...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS!
    echo ========================================
    echo.
    echo Build output: .next folder
    echo.
    echo To start:
    echo   npm start
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
    echo.
    echo If you see "NextRouter was not mounted" errors,
    echo the CSR fix may not have been applied properly.
    echo.
    echo Try running: sync_csr_pages.bat
    echo ========================================
)

pause
