#!/bin/bash
# 🚀 KPOP Ranker 프론트엔드 배포 스크립트

echo "🚀 KPOP Ranker 프론트엔드 배포 시작..."

# 환경변수 설정
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.kpopranker.chargeapp.net

echo "📋 환경설정:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - API_URL: $NEXT_PUBLIC_API_URL"

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 빌드
echo "🔨 프로덕션 빌드 중..."
npm run build

# 서버 시작
echo "🚀 프로덕션 서버 시작..."
npm run start

echo "✅ 프론트엔드 배포 완료!"
echo "🌍 서비스 URL: https://kpopranker.chargeapp.net"
