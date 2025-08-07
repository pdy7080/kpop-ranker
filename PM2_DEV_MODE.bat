@echo off
echo ========================================
echo KPOP Ranker - PM2 Development Mode
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Checking PM2...
pm2 --version

echo.
echo [2] Stopping existing process if any...
pm2 stop kpop-frontend 2>nul
pm2 delete kpop-frontend 2>nul

echo.
echo [3] Starting with PM2...
pm2 start npm --name kpop-frontend -- run dev

echo.
echo [4] PM2 Status...
pm2 list

echo.
echo ========================================
echo Server is running on http://localhost:3007
echo.
echo PM2 Commands:
echo   pm2 logs kpop-frontend    (view logs)
echo   pm2 stop kpop-frontend    (stop server)
echo   pm2 restart kpop-frontend (restart)
echo   pm2 monit                 (monitor)
echo ========================================
echo.
pause
