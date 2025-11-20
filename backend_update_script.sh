#!/bin/bash
# 백엔드 서버에 이미지 품질 개선 적용 스크립트

set -e

echo "🚀 백엔드 이미지 품질 개선 스크립트 시작"
echo "================================================"

# 백엔드 디렉토리로 이동
cd /home/dccla/kpopranker-backend

echo "📁 현재 디렉토리: $(pwd)"
echo ""

# Python 파일 찾기
echo "🔍 API 파일 검색 중..."
MAIN_FILE=$(find . -name "main.py" -o -name "app.py" -o -name "api.py" | head -1)

if [ -z "$MAIN_FILE" ]; then
    echo "❌ main.py, app.py, api.py 파일을 찾을 수 없습니다"
    echo "📂 디렉토리 구조:"
    ls -la
    exit 1
fi

echo "✅ 찾은 파일: $MAIN_FILE"
echo ""

# album-image-smart 엔드포인트 찾기
echo "🔍 album-image-smart 엔드포인트 검색 중..."
if grep -q "album-image-smart" "$MAIN_FILE"; then
    echo "✅ album-image-smart 엔드포인트 발견"
    echo ""
    echo "📄 관련 코드:"
    grep -A 10 "album-image-smart" "$MAIN_FILE"
else
    echo "⚠️  main.py에서 찾을 수 없음. 다른 파일 검색..."
    API_FILE=$(grep -r "album-image-smart" . --include="*.py" | head -1 | cut -d: -f1)
    if [ -n "$API_FILE" ]; then
        echo "✅ 찾은 파일: $API_FILE"
        MAIN_FILE="$API_FILE"
    else
        echo "❌ album-image-smart 엔드포인트를 찾을 수 없습니다"
        exit 1
    fi
fi

echo ""
echo "================================================"
echo "✅ 스크립트 완료"
echo ""
echo "📝 다음 단계:"
echo "1. $MAIN_FILE 파일 확인"
echo "2. size 파라미터 처리 로직 추가"
echo "3. 서비스 재시작"
