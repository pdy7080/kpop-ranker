@echo off
echo ========================================
echo KPOP Ranker - Development Server
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo Starting development server...
echo This will run without building.
echo.
echo Server will start on http://localhost:3007
echo Press Ctrl+C to stop
echo.

call npm run dev

pause
