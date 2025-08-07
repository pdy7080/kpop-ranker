@echo off
echo ========================================
echo KPOP Ranker Frontend Production Build
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo Setting environment to production...
set NODE_ENV=production

echo.
echo Starting Next.js build...
call npm run build

echo.
echo Build complete!
echo Output directory: C:\project\ai07\kpop-frontend-v2\.next
echo.

echo Now running export to create static files...
call npm run export

echo.
echo ========================================
echo Build Successfully Completed!
echo Static files location: C:\project\ai07\kpop-frontend-v2\out
echo ========================================
pause
