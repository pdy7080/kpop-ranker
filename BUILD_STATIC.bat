@echo off
echo ========================================
echo KPOP Ranker - Static Export (Dynamic Routes Disabled)
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo Building static pages...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Exporting static files...
    call npx next export
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo Output: C:\project\ai07_배포\frontend\out
    echo Note: Dynamic routes (artist/track pages) are disabled
    echo ========================================
) else (
    echo Build failed!
)

pause
