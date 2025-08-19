@echo off
echo ========================================
echo KPOP Ranker 프론트엔드 설치 스크립트
echo ========================================
echo.

echo [1/3] Node.js 버전 확인...
node --version
npm --version
echo.

echo [2/3] 기존 node_modules 삭제 (있다면)...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo.

echo [3/3] 패키지 설치...
npm install
echo.

echo ========================================
echo 설치 완료!
echo.
echo 개발 서버 실행: npm run dev
echo ========================================
pause
