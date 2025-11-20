#!/bin/bash

###############################################################################
# 서버 배포 준비 상태 검증 스크립트
# Fastcomet 서버에서 실행하여 프론트엔드 배포 환경을 검증합니다.
###############################################################################

echo "=================================================="
echo "KPOP Ranker Frontend - 서버 배포 준비 검증"
echo "=================================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Node.js 버전 확인
echo "1. Node.js 버전 확인..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js 설치됨: $NODE_VERSION"

    # 버전 18 이상 확인
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js 버전이 요구사항(>=18)을 만족합니다."
    else
        echo -e "${RED}✗${NC} Node.js 버전이 18 미만입니다. 업그레이드가 필요합니다."
    fi
else
    echo -e "${RED}✗${NC} Node.js가 설치되지 않았습니다."
fi
echo ""

# 2. PM2 설치 확인
echo "2. PM2 설치 확인..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✓${NC} PM2 설치됨: v$PM2_VERSION"
else
    echo -e "${RED}✗${NC} PM2가 설치되지 않았습니다."
    echo "   설치: npm install -g pm2"
fi
echo ""

# 3. 포트 사용 확인
echo "3. 포트 3007 사용 확인..."
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":3007 "; then
        echo -e "${YELLOW}⚠${NC} 포트 3007이 이미 사용 중입니다:"
        netstat -tuln | grep ":3007 "
        echo "   기존 프로세스를 종료하거나 다른 포트를 사용하세요."
    else
        echo -e "${GREEN}✓${NC} 포트 3007 사용 가능"
    fi
elif command -v lsof &> /dev/null; then
    if lsof -i :3007 &> /dev/null; then
        echo -e "${YELLOW}⚠${NC} 포트 3007이 이미 사용 중입니다:"
        lsof -i :3007
        echo "   기존 프로세스를 종료하거나 다른 포트를 사용하세요."
    else
        echo -e "${GREEN}✓${NC} 포트 3007 사용 가능"
    fi
else
    echo -e "${YELLOW}⚠${NC} 포트 확인 도구(netstat/lsof)를 찾을 수 없습니다."
fi
echo ""

# 4. 디스크 공간 확인
echo "4. 디스크 공간 확인..."
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${GREEN}✓${NC} 디스크 공간 충분: ${DISK_USAGE}% 사용 중"
else
    echo -e "${YELLOW}⚠${NC} 디스크 공간 부족: ${DISK_USAGE}% 사용 중"
fi
df -h .
echo ""

# 5. 메모리 확인
echo "5. 메모리 확인..."
if command -v free &> /dev/null; then
    free -h
    AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
    if [ "$AVAILABLE_MEM" -gt 500 ]; then
        echo -e "${GREEN}✓${NC} 사용 가능한 메모리 충분: ${AVAILABLE_MEM}MB"
    else
        echo -e "${YELLOW}⚠${NC} 사용 가능한 메모리 부족: ${AVAILABLE_MEM}MB"
        echo "   프론트엔드 실행 시 메모리 부족이 발생할 수 있습니다."
    fi
else
    echo -e "${YELLOW}⚠${NC} 메모리 확인 도구를 찾을 수 없습니다."
fi
echo ""

# 6. 기존 PM2 프로세스 확인
echo "6. 기존 PM2 프로세스 확인..."
if command -v pm2 &> /dev/null; then
    echo "현재 실행 중인 PM2 프로세스:"
    pm2 list
    echo ""

    if pm2 list | grep -q "kpop-ranker-frontend"; then
        echo -e "${YELLOW}⚠${NC} kpop-ranker-frontend가 이미 실행 중입니다."
        echo "   업데이트 시: pm2 reload kpop-ranker-frontend"
    else
        echo -e "${GREEN}✓${NC} kpop-ranker-frontend 프로세스 없음 (신규 배포 가능)"
    fi
fi
echo ""

# 7. Git 저장소 확인 (선택사항)
echo "7. Git 저장소 확인..."
if [ -d .git ]; then
    echo -e "${GREEN}✓${NC} Git 저장소 초기화됨"
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    if [ -n "$CURRENT_BRANCH" ]; then
        echo "   현재 브랜치: $CURRENT_BRANCH"
    fi
else
    echo -e "${YELLOW}⚠${NC} Git 저장소가 아닙니다."
    echo "   Git 기반 배포를 사용하려면 'git init' 실행"
fi
echo ""

# 8. 빌드 디렉토리 확인
echo "8. 빌드 디렉토리 확인..."
if [ -d .next ]; then
    echo -e "${GREEN}✓${NC} .next 디렉토리 존재"

    if [ -f .next/standalone/server.js ]; then
        echo -e "${GREEN}✓${NC} standalone 빌드 완료"
    else
        echo -e "${YELLOW}⚠${NC} standalone 빌드가 없습니다. 'npm run build' 실행 필요"
    fi

    if [ -f .next/prerender-manifest.json ]; then
        echo -e "${GREEN}✓${NC} prerender-manifest.json 존재"
    else
        echo -e "${YELLOW}⚠${NC} prerender-manifest.json 없음. postbuild 스크립트 실행 필요"
    fi
else
    echo -e "${RED}✗${NC} .next 디렉토리가 없습니다. 'npm run build' 실행 필요"
fi
echo ""

# 9. node_modules 확인
echo "9. node_modules 확인..."
if [ -d node_modules ]; then
    echo -e "${GREEN}✓${NC} node_modules 디렉토리 존재"
else
    echo -e "${RED}✗${NC} node_modules가 없습니다. 'npm install' 실행 필요"
fi
echo ""

# 10. 로그 디렉토리 생성 확인
echo "10. 로그 디렉토리 확인..."
if [ -d logs ]; then
    echo -e "${GREEN}✓${NC} logs 디렉토리 존재"
else
    echo -e "${YELLOW}⚠${NC} logs 디렉토리가 없습니다. 자동으로 생성합니다..."
    mkdir -p logs
    if [ -d logs ]; then
        echo -e "${GREEN}✓${NC} logs 디렉토리 생성됨"
    fi
fi
echo ""

# 최종 결과
echo "=================================================="
echo "검증 완료!"
echo "=================================================="
echo ""
echo "다음 단계:"
echo "1. 문제가 있는 항목을 해결하세요."
echo "2. 빌드 실행: npm run build"
echo "3. PM2로 시작: pm2 start ecosystem.config.js"
echo "4. 로그 확인: pm2 logs kpop-ranker-frontend"
echo ""
