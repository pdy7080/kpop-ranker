# 🔧 백엔드 이미지 품질 개선 가이드

## 📋 개요
프론트엔드에서 `?size=640` 파라미터를 보내도록 수정했습니다.
백엔드도 이 파라미터를 처리하도록 수정해야 완전한 고화질 이미지 지원이 가능합니다.

## 🎯 목표
- `/api/album-image-smart/{artist}/{track}` 엔드포인트에 `?size` 파라미터 지원 추가
- Spotify API 호출 시 적절한 이미지 크기 선택
- 스케줄러 크롤링 시에도 고화질 이미지 저장

## 📝 수정 필요 사항

### 1. API 엔드포인트 수정

#### 현재 상태 확인
```bash
ssh dccla@autobid.chargeapp.net
cd /home/dccla/kpopranker-backend

# API 파일 찾기
find . -name "*.py" | xargs grep -l "album-image-smart"
```

#### 수정할 코드 (Python FastAPI/Flask 예시)

**Before (예상 코드):**
```python
@app.route('/api/album-image-smart/<artist>/<track>')
def get_album_image(artist, track):
    # Spotify API 호출
    spotify_data = get_spotify_data(artist, track)

    # 첫 번째 이미지 (보통 가장 큰 것)
    image_url = spotify_data['album']['images'][0]['url']

    return redirect(image_url)
```

**After (수정 코드):**
```python
from flask import request

@app.route('/api/album-image-smart/<artist>/<track>')
def get_album_image(artist, track):
    # size 파라미터 가져오기 (기본값: 640)
    size = request.args.get('size', '640', type=int)

    # Spotify API 호출
    spotify_data = get_spotify_data(artist, track)

    # 이미지 크기별로 적절한 것 선택
    images = spotify_data['album']['images']

    # Spotify 이미지는 보통 3가지 크기:
    # images[0]: 640x640 (큰 것)
    # images[1]: 300x300 (중간)
    # images[2]: 64x64 (작은 것)

    if size >= 640:
        image_url = images[0]['url']  # 640x640
    elif size >= 300:
        image_url = images[1]['url'] if len(images) > 1 else images[0]['url']
    else:
        image_url = images[2]['url'] if len(images) > 2 else images[0]['url']

    return redirect(image_url)
```

### 2. 스케줄러/크롤러 수정

스케줄러에서 이미지를 저장할 때도 고화질을 저장하도록 수정:

```python
# 스케줄러 코드 (예시)
def save_track_image(artist, track):
    spotify_data = get_spotify_data(artist, track)

    # ✅ 고화질 이미지 사용 (첫 번째 = 640x640)
    image_url = spotify_data['album']['images'][0]['url']

    # 이미지 다운로드 및 저장
    response = requests.get(image_url)
    with open(f'static/track_images/{artist}_{track}_HQ.jpg', 'wb') as f:
        f.write(response.content)

    # DB에 저장
    db.save_image_url(artist, track, image_url, size='640x640')
```

## 🚀 배포 단계

### 1. 백엔드 서버 접속
```bash
ssh dccla@autobid.chargeapp.net
cd /home/dccla/kpopranker-backend
```

### 2. 백업 생성
```bash
# 현재 코드 백업
cp main.py main.py.backup.$(date +%Y%m%d_%H%M%S)

# 또는 전체 백업
tar -czf ../kpopranker-backend-backup-$(date +%Y%m%d_%H%M%S).tar.gz .
```

### 3. 코드 수정
```bash
# 편집기로 API 파일 열기
nano main.py  # 또는 vi main.py

# 위의 "After" 코드로 수정
# Ctrl+X, Y, Enter로 저장 (nano 기준)
```

### 4. 서비스 재시작
```bash
# PM2 사용 중인 경우
pm2 restart kpopranker-backend

# systemd 사용 중인 경우
sudo systemctl restart kpopranker-backend

# 수동 실행 중인 경우
pkill -f "python.*main.py"
nohup python main.py &
```

### 5. 테스트
```bash
# 로컬에서 테스트
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=640"
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=300"

# Content-Length가 다른지 확인
# 640: 약 30-40KB
# 300: 약 10-15KB
```

## 🔍 검증 방법

### API 응답 비교
```bash
# 큰 이미지 (640x640)
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/BTS/Dynamite?size=640" \
  | grep Content-Length

# 작은 이미지 (300x300)
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/BTS/Dynamite?size=300" \
  | grep Content-Length

# Content-Length가 달라야 정상
```

### 프론트엔드에서 확인
1. https://www.kpopranker.com 접속
2. 메인 페이지 TOP 3 섹션 확인
3. 브라우저 개발자 도구 (F12) → Network 탭
4. 이미지 요청 URL에 `?size=640` 포함 확인
5. 이미지가 선명하게 표시되는지 확인

## ⚠️ 주의사항

### 현재 상태
- ✅ 프론트엔드: `?size=640` 파라미터 전송 중
- ⏳ 백엔드: 파라미터를 무시하고 기존 동작 유지
- 결과: 이미지 품질 개선 효과 없음

### 백엔드 수정 후
- ✅ 프론트엔드: `?size=640` 파라미터 전송
- ✅ 백엔드: 640x640 고화질 이미지 반환
- 결과: 🎉 이미지 품질 대폭 개선!

### 성능 영향
- **대역폭**: 약 2-3배 증가 (10KB → 30KB per image)
- **로딩 속도**: Lazy loading으로 최소화
- **사용자 경험**: 크게 개선

## 🐛 문제 해결

### 이미지가 여전히 저화질인 경우
1. 백엔드 로그 확인: `tail -f /var/log/kpopranker-backend.log`
2. API 응답 확인: `curl -I "...?size=640"`
3. 브라우저 캐시 클리어: Ctrl+Shift+R

### Spotify API 오류
```python
# 에러 처리 추가
try:
    images = spotify_data['album']['images']
    if not images:
        # 기본 이미지 반환
        return send_file('static/default-album.svg')
except (KeyError, IndexError) as e:
    logger.error(f"Image fetch error: {e}")
    return send_file('static/default-album.svg')
```

## 📊 예상 효과

### Before (개선 전)
- 이미지 크기: ~10KB (300x300)
- 시각적 품질: 보통
- 사용자 반응: "이미지가 흐릿해요"

### After (개선 후)
- 이미지 크기: ~30KB (640x640)
- 시각적 품질: 고화질
- 사용자 반응: "이미지가 선명해요!" 🎉

## 📞 추가 지원

문제가 발생하면:
1. 백엔드 로그 확인
2. API 응답 테스트
3. 필요시 롤백: `cp main.py.backup.YYYYMMDD_HHMMSS main.py`

---

**작성일**: 2025-11-18
**작성자**: Claude Code
**우선순위**: 🔥 높음 (프론트엔드 배포 완료, 백엔드 대기 중)
