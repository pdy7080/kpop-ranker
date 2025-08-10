#!/bin/bash
# Vercel Prebuilt 배포 스크립트

echo "🚀 KPOP Ranker 프론트엔드 배포 시작..."

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm ci

# 2. 환경변수 설정
echo "🔧 환경변수 설정..."
cp .env.production .env.local

# 3. 로컬 빌드
echo "🏗️ Next.js 빌드 중..."
npm run build

# 4. Vercel 빌드
echo "📦 Vercel 빌드 중..."
npx vercel build

# 5. Prebuilt 배포
echo "🚀 Vercel에 배포 중..."
npx vercel deploy --prebuilt --prod

echo "✅ 배포 완료!"
echo "🌐 https://kpop-ranker.vercel.app 에서 확인하세요"
