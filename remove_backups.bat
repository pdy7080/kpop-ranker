@echo off
echo ========================================
echo Removing all backup files
echo ========================================
echo.

cd /d C:\project\ai07_배포\frontend

echo Removing .bak files...
del /s /q *.bak 2>nul

echo Removing .backup files...
del /s /q *.backup 2>nul

echo Removing _backup folders...
for /d /r . %%d in (*_backup*) do @if exist "%%d" rd /s /q "%%d"

echo.
echo Backup files removed!
echo.
pause
