#!/bin/bash
# KPOP Ranker - Server Build Script
# 서버에서 실행할 빌드 스크립트

echo "========================================" 
echo "KPOP Ranker Frontend Build on Server"
echo "========================================"
echo ""

# 프론트엔드 디렉토리로 이동
cd ~/public_html/kpop-frontend-v2

# 기존 빌드 제거
echo "[1/5] Cleaning old builds..."
rm -rf .next out

# 환경 변수 설정
echo "[2/5] Setting production environment..."
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.kpopranker.chargeapp.net

# 의존성 설치 (필요한 경우)
echo "[3/5] Installing dependencies..."
npm ci --production

# 빌드 시도
echo "[4/5] Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "[5/5] Exporting static files..."
    npx next export
    
    if [ -d "out" ]; then
        echo ""
        echo "========================================" 
        echo "BUILD SUCCESS!"
        echo "Moving files to public directory..."
        echo "========================================"
        
        # 기존 파일 백업
        if [ -d "../kpopcharts.chargeapp.net" ]; then
            mv ../kpopcharts.chargeapp.net ../kpopcharts.backup.$(date +%Y%m%d)
        fi
        
        # 새 파일 복사
        cp -r out ../kpopcharts.chargeapp.net
        
        echo "Deployment complete!"
    else
        echo "Export failed. Trying alternative method..."
    fi
else
    echo "Build failed. Check memory usage."
fi
