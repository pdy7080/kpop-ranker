@echo off
echo ========================================
echo Quick Build Test - Error Detection
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo Current directory: %CD%
echo.

echo Running build and capturing errors...
echo.

npm run build 2>&1 | findstr /i "error warn fail"

echo.
echo ========================================
echo Full build output:
echo ========================================
echo.

npm run build

pause
