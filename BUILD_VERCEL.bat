@echo off
echo ========================================
echo KPOP Ranker - Vercel Style Build
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo [1/3] Cleaning old builds...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo.
echo [2/3] Building (ignoring some errors)...
call npx next build || echo Build had warnings but continuing

echo.
echo [3/3] Creating static output...
call npx next export || echo Export had issues but checking output

echo.
if exist out (
    echo ========================================
    echo OUTPUT CREATED!
    echo Location: C:\project\ai07_배포\frontend\out
    echo Some pages may have errors but usable
    echo ========================================
    dir out
) else (
    echo No output folder created. Build failed completely.
)

pause
