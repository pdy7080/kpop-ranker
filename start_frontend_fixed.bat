@echo off
cd /d "C:\project\ai07_배포\5차배포_완전통합\frontend"
echo Starting KPOP Ranker Frontend Server...
echo Port: 3007
echo API URL: %NEXT_PUBLIC_API_URL%
npm run dev
pause
