@echo off
echo ========================================
echo KPOP Ranker - Server Build (No Export)
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo Building for server deployment...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo Note: This is a server build, not static export
    echo You need to run 'npm start' on the server
    echo ========================================
) else (
    echo Build failed!
)

pause
