@echo off
echo ========================================
echo Downgrading Next.js to 14.2.30
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1] Backing up current package.json...
copy package.json package.json.backup15

echo.
echo [2] Applying downgrade...
copy package.json.downgrade package.json /Y

echo.
echo [3] Removing node_modules and lock file...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo.
echo [4] Installing dependencies...
call npm install

echo.
echo [5] Building with Next.js 14...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ BUILD SUCCESS with Next.js 14!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ BUILD FAILED
    echo ========================================
)

pause
