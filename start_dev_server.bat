@echo off
echo ============================================
echo  KPOP Ranker - Frontend Development Server
echo ============================================
echo.
echo Starting development server on port 3007...
echo API Server: http://localhost:5000
echo Frontend: http://localhost:3007
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

:: 환경 변수 설정
set NODE_ENV=development
set NEXT_PUBLIC_API_URL=http://localhost:5000
set PORT=3007

:: 개발 서버 실행
npm run dev

pause
