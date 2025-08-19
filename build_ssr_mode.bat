@echo off
echo ========================================
echo Switching to SSR Mode Build
echo ========================================
echo.

cd /d C:\project\ai07\kpop-frontend-v2

echo [1] Backing up current config...
copy next.config.js next.config.export.backup.js /Y

echo.
echo [2] Switching to SSR config...
copy next.config.ssr.js next.config.js /Y

echo.
echo [3] Cleaning old builds...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo.
echo [4] Building in SSR mode...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS in SSR Mode!
    echo ========================================
    echo.
    echo Now you can run:
    echo   npm start (production)
    echo   npm run dev (development)
    echo.
    echo Build output: .next folder
    echo This supports all dynamic routes!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo BUILD FAILED
    echo ========================================
    echo Restoring original config...
    copy next.config.export.backup.js next.config.js /Y
)

pause
