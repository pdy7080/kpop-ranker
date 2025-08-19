#!/bin/bash

# KPOP FANfolio 프론트엔드 배포 스크립트

echo "🚀 KPOP FANfolio 프론트엔드 배포 시작..."

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 2. 빌드
echo "🔨 프로덕션 빌드 중..."
npm run build

# 3. 정적 파일 export
echo "📤 정적 파일 export 중..."
npm run export

# 4. 성공 메시지
echo "✅ 빌드 완료!"
echo ""
echo "📁 배포 방법:"
echo "1. out/ 폴더의 모든 파일을 서버에 업로드"
echo "2. 업로드 경로: /home/username/kpopranker.chargeapp.net/"
echo "3. 파일 권한 확인 (644 또는 755)"
echo ""
echo "🌐 서비스 URL: https://kpopranker.chargeapp.net"
