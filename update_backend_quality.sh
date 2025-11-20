#!/bin/bash
# 백엔드 이미지 품질 개선 - 완전 자동화 스크립트

set -e
cd /home/dccla/kpopranker-backend

echo "🚀 백엔드 이미지 품질 개선 시작"
echo "================================"
echo ""

# 1. 백업 생성
echo "📦 백업 생성 중..."
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp *.py "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ 백업 완료: $BACKUP_DIR"
echo ""

# 2. main.py 찾기
echo "🔍 API 파일 검색 중..."
if [ -f "main.py" ]; then
    API_FILE="main.py"
elif [ -f "app.py" ]; then
    API_FILE="app.py"
elif [ -f "api.py" ]; then
    API_FILE="api.py"
else
    echo "❌ API 파일을 찾을 수 없습니다"
    ls -la *.py
    exit 1
fi
echo "✅ 찾은 파일: $API_FILE"
echo ""

# 3. album-image-smart 엔드포인트 확인
echo "🔍 album-image-smart 엔드포인트 확인 중..."
if ! grep -q "album-image-smart" "$API_FILE"; then
    echo "❌ album-image-smart 엔드포인트를 찾을 수 없습니다"
    echo "다른 파일에서 검색 중..."
    grep -r "album-image-smart" . --include="*.py" | head -5
    exit 1
fi
echo "✅ 엔드포인트 발견"
echo ""

# 4. Python 패치 코드 생성
echo "📝 패치 코드 생성 중..."
cat > /tmp/patch_image_quality.py << 'PYTHON_EOF'
#!/usr/bin/env python3
import re
import sys

def patch_album_image_endpoint(filename):
    """album-image-smart 엔드포인트에 size 파라미터 처리 추가"""

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 이미 패치되었는지 확인
    if 'request.args.get' in content and 'size' in content:
        print("✅ 이미 size 파라미터 처리가 있습니다 (패치 불필요)")
        return False

    # 패턴 1: Flask route
    pattern1 = r"(@app\.route\(['\"]\/api\/album-image-smart\/<[^>]+>\/<[^>]+>['\"].*?\)[\s\n]+def\s+\w+\([^)]+\):)"

    # 패턴 2: FastAPI route
    pattern2 = r"(@app\.get\(['\"]\/api\/album-image-smart\/\{[^}]+\}\/\{[^}]+\}['\"].*?\)[\s\n]+(?:async\s+)?def\s+\w+\([^)]+\):)"

    # 추가할 코드
    size_handling = '''
    # 이미지 크기 파라미터 처리 (고화질 지원)
    size = request.args.get('size', '640', type=int) if 'request' in dir() else 640
'''

    # Flask 패턴 매치
    if re.search(pattern1, content):
        print("✅ Flask 엔드포인트 발견")
        # route 데코레이터 다음 줄에 삽입
        content = re.sub(
            pattern1,
            r'\1\n' + size_handling,
            content
        )

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ 패치 적용 완료")
        return True

    # FastAPI 패턴 매치
    elif re.search(pattern2, content):
        print("✅ FastAPI 엔드포인트 발견")
        print("⚠️  FastAPI는 수동 수정이 필요합니다")
        return False

    else:
        print("❌ 알려진 패턴을 찾을 수 없습니다")
        return False

if __name__ == '__main__':
    filename = sys.argv[1] if len(sys.argv) > 1 else 'main.py'
    success = patch_album_image_endpoint(filename)
    sys.exit(0 if success else 1)
PYTHON_EOF

chmod +x /tmp/patch_image_quality.py
echo "✅ 패치 스크립트 생성 완료"
echo ""

# 5. 패치 적용
echo "🔧 패치 적용 중..."
python3 /tmp/patch_image_quality.py "$API_FILE" || {
    echo "⚠️  자동 패치 실패 - 수동 수정 필요"
    echo ""
    echo "📄 현재 코드 확인:"
    grep -A 15 "album-image-smart" "$API_FILE" | head -20
    exit 0
}
echo ""

# 6. 변경 사항 확인
echo "📄 변경 사항 확인:"
echo "--------------------------------"
grep -A 20 "album-image-smart" "$API_FILE" | head -25
echo "--------------------------------"
echo ""

# 7. 문법 체크
echo "🔍 Python 문법 체크..."
python3 -m py_compile "$API_FILE" && {
    echo "✅ 문법 체크 통과"
} || {
    echo "❌ 문법 오류 발견 - 백업에서 복원 중..."
    cp "$BACKUP_DIR/$API_FILE" "$API_FILE"
    echo "✅ 복원 완료"
    exit 1
}
echo ""

echo "================================"
echo "✅ 백엔드 패치 완료!"
echo ""
echo "📝 다음 단계:"
echo "1. 서비스 재시작: pm2 restart kpopranker-backend"
echo "2. 또는: sudo systemctl restart kpopranker-backend"
echo ""
echo "🧪 테스트:"
echo "curl -I 'https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=640'"
echo ""
