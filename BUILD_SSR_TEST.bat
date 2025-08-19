@echo off
echo ========================================
echo KPOP Ranker - SSR Build Test
echo ========================================
echo.
echo Config changed to SSR mode:
echo - output: 'export' removed
echo - exportPathMap removed
echo - All dynamic routes supported now!
echo.
echo ========================================

cd /d C:\project\ai07\kpop-frontend-v2

echo Cleaning old builds...
if exist .next\cache rmdir /s /q .next\cache

echo.
echo Building with SSR mode...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS!
    echo ========================================
    echo.
    echo Build output: .next folder
    echo.
    echo To run the server:
    echo   npm start     (production on port 3000)
    echo   npm run dev   (development on port 3007)
    echo.
    echo All features supported:
    echo - Dynamic routes (/track/[artist]/[track])
    echo - Server-side rendering
    echo - API routes
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
    echo Check the errors above
)

pause
