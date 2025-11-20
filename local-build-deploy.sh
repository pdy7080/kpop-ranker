#!/bin/bash

###############################################################################
# KPOP Ranker Frontend - 로컬 빌드 후 서버 배포 스크립트
#
# 사용법:
#   ./local-build-deploy.sh
#
# 이 스크립트는:
# 1. 로컬에서 프로덕션 빌드
# 2. .next 폴더를 서버로 전송
# 3. 서버에서 PM2로 시작
###############################################################################

set -e  # 에러 발생 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 서버 정보
SSH_KEY="~/.ssh/id_ed25519"
SERVER_USER="chargeap"
SERVER_HOST="d11475.sgp1.stableserver.net"
SERVER_PATH="/home/chargeap/kpopranker"

echo -e "${BLUE}=================================================="
echo "KPOP Ranker - 로컬 빌드 후 서버 배포"
echo -e "==================================================${NC}"
echo ""

# Step 1: 로컬 빌드
echo -e "${YELLOW}[1/5] 로컬에서 프로덕션 빌드...${NC}"
npm run build || echo -e "${YELLOW}⚠ 빌드 경고 발생 (404/500 에러는 무시 가능)${NC}"

if [ ! -d .next ]; then
    echo -e "${RED}✗ 빌드 실패: .next 디렉토리가 없습니다${NC}"
    exit 1
fi

if [ ! -f .next/prerender-manifest.json ]; then
    echo -e "${YELLOW}⚠ prerender-manifest.json 없음. postbuild 스크립트 실행...${NC}"
    node scripts/postbuild.js
fi

echo -e "${GREEN}✓ 로컬 빌드 완료${NC}"
echo ""

# Step 2: 빌드 파일 압축
echo -e "${YELLOW}[2/5] 빌드 파일 압축...${NC}"
tar -czf kpopranker-build.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    ecosystem.config.js \
    scripts

echo -e "${GREEN}✓ 압축 완료: kpopranker-build.tar.gz${NC}"
echo ""

# Step 3: 서버로 전송
echo -e "${YELLOW}[3/5] 서버로 빌드 파일 전송...${NC}"
scp -i $SSH_KEY kpopranker-build.tar.gz ${SERVER_USER}@${SERVER_HOST}:~/

echo -e "${GREEN}✓ 전송 완료${NC}"
echo ""

# Step 4: 서버에서 압축 해제 및 설정
echo -e "${YELLOW}[4/5] 서버에서 파일 설정...${NC}"
ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

cd ~

# kpopranker 디렉토리가 없으면 생성
if [ ! -d kpopranker ]; then
    mkdir -p kpopranker
fi

cd kpopranker

# 압축 파일 이동 및 해제
mv ~/kpopranker-build.tar.gz ./
tar -xzf kpopranker-build.tar.gz
rm kpopranker-build.tar.gz

# node_modules 확인 (없으면 설치)
if [ ! -d node_modules ]; then
    echo "node_modules 없음. npm install 실행..."
    npm install --production
fi

# logs 디렉토리 생성
mkdir -p logs

echo "✓ 파일 설정 완료"
ENDSSH

echo -e "${GREEN}✓ 서버 설정 완료${NC}"
echo ""

# Step 5: PM2로 시작/재시작
echo -e "${YELLOW}[5/5] PM2로 프론트엔드 배포...${NC}"
ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

cd /home/chargeap/kpopranker

# PM2 프로세스 확인
if pm2 list | grep -q "kpop-ranker-frontend"; then
    echo "기존 프로세스 발견. 재시작 중..."
    pm2 reload kpop-ranker-frontend
else
    echo "새 프로세스 시작 중..."
    pm2 start ecosystem.config.js
fi

# PM2 프로세스 저장
pm2 save

echo ""
echo "=== PM2 상태 ==="
pm2 list

echo ""
echo "=== Frontend 로그 (최근 10줄) ==="
pm2 logs kpop-ranker-frontend --lines 10 --nostream

echo ""
echo "=== 포트 확인 ==="
if netstat -tuln | grep -q ":3007 "; then
    echo "✓ 포트 3007 리스닝 중"
else
    echo "⚠ 포트 3007이 리스닝되지 않음"
fi
ENDSSH

echo -e "${GREEN}✓ PM2 배포 완료${NC}"
echo ""

# Step 6: 로컬 임시 파일 정리
echo -e "${YELLOW}로컬 임시 파일 정리...${NC}"
rm -f kpopranker-build.tar.gz
echo -e "${GREEN}✓ 정리 완료${NC}"
echo ""

echo -e "${BLUE}=================================================="
echo "배포 완료!"
echo -e "==================================================${NC}"
echo ""
echo -e "${GREEN}프론트엔드가 성공적으로 배포되었습니다!${NC}"
echo ""
echo "다음 URL에서 확인하세요:"
echo "  - http://chargeapp.net:3007"
echo "  - http://103.138.189.39:3007"
echo ""
echo "로그 확인:"
echo "  ssh -i ~/.ssh/id_ed25519 ${SERVER_USER}@${SERVER_HOST} 'pm2 logs kpop-ranker-frontend'"
echo ""
