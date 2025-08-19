@echo off
echo ===================================
echo KPOP Ranker Frontend - 5차배포
echo ===================================
echo.
echo 프론트엔드 서버 시작...
echo API URL: http://localhost:5001
echo.

cd /d "C:\project\ai07_배포\5차배포_완전통합\frontend"

echo 현재 경로: %cd%
echo.

npm run dev

pause