@echo off
echo ========================================
echo KPOP Ranker - Production Build (Fixed)
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo Setting production environment...
set NODE_ENV=production

echo.
echo Building Next.js application...
call npm run build

echo.
if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo Exporting static files...
    call npx next export
    echo.
    echo ========================================
    echo BUILD COMPLETE!
    echo Output: C:\project\ai07\kpop-frontend-v2\out
    echo ========================================
) else (
    echo Build failed! Check the error messages above.
)

pause
