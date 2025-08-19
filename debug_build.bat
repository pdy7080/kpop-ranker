@echo off
echo ====================================
echo KPOP Ranker 빌드 문제 해결 도우미
echo ====================================

cd /d "C:\project\ai07\kpop-frontend-v2"

echo.
echo [단계 1] Node.js 및 npm 버전 확인
node --version
npm --version

echo.
echo [단계 2] 의존성 설치 확인
echo 기존 node_modules 정리...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

echo.
echo 새로운 의존성 설치...
npm install

echo.
echo [단계 3] TypeScript 컴파일 테스트
echo TypeScript 설정 확인...
npx tsc --noEmit

echo.
echo [단계 4] Next.js 빌드 시도
echo 환경변수 설정...
set NODE_ENV=production

echo.
echo 빌드 실행...
npm run build

echo.
echo [단계 5] 빌드 결과 분석
if exist ".next" (
    echo ✅ 빌드 성공!
    echo .next 폴더 내용:
    dir .next /w
    
    echo.
    echo 빌드 크기 확인:
    dir .next\static /s
) else (
    echo ❌ 빌드 실패
    echo 오류 로그를 확인하세요.
)

echo.
echo 완료. 아무 키나 누르면 종료합니다.
pause
