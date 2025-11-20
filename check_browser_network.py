#!/usr/bin/env python3
"""
브라우저에서 실제 이미지 URL 및 크기를 확인하는 스크립트
"""

import json
import subprocess
import sys

# Chrome DevTools Protocol을 사용하여 네트워크 요청 확인
print("=" * 70)
print("🔍 KPOP Ranker 이미지 품질 확인")
print("=" * 70)
print()

# 1. 실제 웹사이트 HTML 다운로드
print("1️⃣ 웹사이트 HTML 분석 중...")
try:
    result = subprocess.run(
        ['curl', '-s', 'https://www.kpopranker.com'],
        capture_output=True,
        text=True,
        timeout=30
    )
    html = result.stdout

    # Next.js 빌드 ID 확인
    if '"buildId"' in html:
        import re
        build_id_match = re.search(r'"buildId":"([^"]+)"', html)
        if build_id_match:
            build_id = build_id_match.group(1)
            print(f"   ✅ Build ID: {build_id}")
        else:
            print("   ⚠️  Build ID를 찾을 수 없습니다")
    else:
        print("   ⚠️  Next.js 데이터를 찾을 수 없습니다")

except Exception as e:
    print(f"   ❌ HTML 다운로드 실패: {e}")

print()

# 2. API 직접 테스트
print("2️⃣ API 이미지 크기 테스트...")
print()

test_tracks = [
    ("NMIXX", "Blue Valentine"),
    ("WOODZ", "Drowning"),
    ("ALLDAY PROJECT", "FAMOUS"),
    ("aespa", "Whiplash"),
]

for artist, track in test_tracks:
    print(f"   🎵 {artist} - {track}")

    # size=640 테스트
    from urllib.parse import quote
    artist_encoded = quote(artist)
    track_encoded = quote(track)

    url_640 = f"https://api.kpopranker.chargeapp.net/api/album-image-smart/{artist_encoded}/{track_encoded}?size=640"

    try:
        result = subprocess.run(
            ['curl', '-sI', url_640],
            capture_output=True,
            text=True,
            timeout=15
        )

        output = result.stdout

        # Content-Length 추출
        for line in output.split('\n'):
            if 'Content-Length' in line:
                size = line.split(':')[1].strip()
                size_kb = int(size) / 1024
                print(f"      size=640: {size_kb:.1f}KB")

                # 품질 판단
                if size_kb > 50:
                    print(f"      ✅ 고화질 (50KB 이상)")
                elif size_kb > 30:
                    print(f"      ⚠️  중화질 (30-50KB)")
                else:
                    print(f"      ❌ 저화질 (30KB 미만)")
                break
            elif 'Location' in line:
                redirect = line.split(':', 1)[1].strip()
                print(f"      → Redirect: {redirect[:80]}...")

                if '_1000.jpg' in redirect:
                    print(f"      ✅ Melon 1000x1000 (고화질)")
                elif '_500.jpg' in redirect:
                    print(f"      ⚠️  Melon 500x500 (중화질)")
                break
        else:
            print(f"      ⚠️  크기 정보 없음")

    except Exception as e:
        print(f"      ❌ 테스트 실패: {e}")

    print()

# 3. 프론트엔드 코드 확인
print("3️⃣ 프론트엔드 배포 확인...")
try:
    # ImageWithFallback 컴포넌트가 배포되었는지 확인
    result = subprocess.run(
        ['curl', '-s', 'https://www.kpopranker.com/_next/static/chunks/pages/index-*.js', '-L'],
        capture_output=True,
        text=True,
        timeout=30,
        shell=True
    )

    js_content = result.stdout

    if 'size=640' in js_content or 'size=' in js_content:
        print("   ✅ size 파라미터 코드 발견!")
    else:
        print("   ❌ size 파라미터 코드 없음 - 빌드가 오래된 것일 수 있음")

except Exception as e:
    print(f"   ⚠️  JavaScript 확인 실패: {e}")

print()
print("=" * 70)
print("분석 완료!")
print("=" * 70)
