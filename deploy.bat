@echo off
echo 🚀 KPOP Ranker 프론트엔드 배포 시작...

REM 1. 의존성 설치
echo 📦 의존성 설치 중...
call npm ci

REM 2. 환경변수 설정
echo 🔧 환경변수 설정...
copy .env.production .env.local /Y

REM 3. 로컬 빌드
echo 🏗️ Next.js 빌드 중...
call npm run build

REM 4. Vercel 빌드
echo 📦 Vercel 빌드 중...
call npx vercel build

REM 5. Prebuilt 배포
echo 🚀 Vercel에 배포 중...
call npx vercel deploy --prebuilt --prod

echo ✅ 배포 완료!
echo 🌐 https://kpop-ranker.vercel.app 에서 확인하세요
pause
