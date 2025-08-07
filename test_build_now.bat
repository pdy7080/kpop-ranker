@echo off
cd /d C:\project\ai07\kpop-frontend-v2
echo Current directory: %CD%
echo.
echo Running build...
npm run build 2>&1
echo.
echo Build exit code: %ERRORLEVEL%
pause
