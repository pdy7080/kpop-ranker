@echo off
echo ========================================
echo Manual Downgrade Steps
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Current Next.js version:
npm list next

echo.
echo [2] Removing Next.js 15...
call npm uninstall next eslint-config-next

echo.
echo [3] Installing Next.js 14...
call npm install next@14.2.30 eslint-config-next@14.2.30 --save

echo.
echo [4] Checking installation...
npm list next

echo.
pause
