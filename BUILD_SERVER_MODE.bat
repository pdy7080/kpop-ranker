@echo off
echo ========================================
echo KPOP Ranker - Server Build (All Features)
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo Backing up current config...
copy next.config.js next.config.backup.js

echo Using server config...
copy next.config.server.js next.config.js /Y

echo.
echo Building for server deployment...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo ========================================
    echo.
    echo Build output: .next folder
    echo.
    echo To run the server:
    echo   npm start (production mode)
    echo   npm run dev (development mode)
    echo.
    echo This build supports:
    echo - All dynamic routes
    echo - Server-side rendering
    echo - API routes
    echo ========================================
) else (
    echo Build failed!
    echo Restoring original config...
    copy next.config.backup.js next.config.js /Y
)

pause
