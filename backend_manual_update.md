# 🔧 백엔드 수동 업데이트 가이드 (즉시 실행 가능)

SSH 연결이 느려서 자동화가 어렵습니다. 아래 단계를 직접 따라해주세요.

## 📝 즉시 실행할 명령어들

### 1단계: 서버 접속
```bash
ssh dccla@autobid.chargeapp.net
cd /home/dccla/kpopranker-backend
```

### 2단계: 백업 생성
```bash
# 백업 디렉토리 생성
mkdir -p backups/$(date +%Y%m%d)

# 현재 파일 백업
cp *.py backups/$(date +%Y%m%d)/

# 확인
ls -la backups/
```

### 3단계: API 파일 확인
```bash
# main.py가 있는지 확인
ls -la *.py

# album-image-smart 엔드포인트 찾기
grep -n "album-image-smart" *.py
```

### 4단계: 코드 수정

아래 내용을 복사해서 직접 붙여넣으세요:

```bash
# nano 편집기로 열기 (main.py 또는 app.py)
nano main.py
```

**수정할 부분을 찾으세요:**
```python
@app.route('/api/album-image-smart/<artist>/<track>')
def get_album_image_smart(artist, track):
    # ... 기존 코드 ...
```

**이렇게 수정하세요:**
```python
@app.route('/api/album-image-smart/<artist>/<track>')
def get_album_image_smart(artist, track):
    # 🆕 고화질 이미지 지원: size 파라미터 처리
    from flask import request
    size = request.args.get('size', '640', type=int)

    # ... 기존 코드 계속 ...

    # Spotify API에서 이미지 가져오는 부분 찾기
    # 보통 이런 형태:
    # images = spotify_data['album']['images']
    # image_url = images[0]['url']  # 기존 코드

    # 🆕 size에 따라 적절한 이미지 선택
    images = spotify_data.get('album', {}).get('images', [])

    if not images:
        # 기본 이미지 반환
        return send_file('static/default-album.svg')

    # size 파라미터에 따라 이미지 크기 선택
    if size >= 640 and len(images) > 0:
        image_url = images[0]['url']  # 640x640 (큰 것)
    elif size >= 300 and len(images) > 1:
        image_url = images[1]['url']  # 300x300 (중간)
    elif len(images) > 2:
        image_url = images[2]['url']  # 64x64 (작은 것)
    else:
        image_url = images[0]['url']  # 기본값

    # ... 나머지 코드 계속 ...
```

**저장하기 (nano 기준):**
- `Ctrl + X`
- `Y` (Yes)
- `Enter`

### 5단계: 문법 체크
```bash
# Python 문법 체크
python3 -m py_compile main.py

# 에러가 없으면 다음 단계로
# 에러가 있으면 백업에서 복원:
# cp backups/$(date +%Y%m%d)/main.py main.py
```

### 6단계: 서비스 재시작
```bash
# PM2 사용 중인 경우
pm2 restart kpopranker-backend
pm2 logs kpopranker-backend --lines 50

# 또는 systemd 사용 중인 경우
sudo systemctl restart kpopranker-backend
sudo systemctl status kpopranker-backend

# 또는 수동 실행 중인 경우
pkill -f "python.*main.py"
nohup python3 main.py > backend.log 2>&1 &
tail -f backend.log
```

### 7단계: 테스트
```bash
# 로컬 서버에서 테스트
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=640" | grep Content-Length
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=300" | grep Content-Length

# Content-Length가 달라야 성공!
# size=640: ~30-40KB
# size=300: ~10-15KB
```

## 🔄 스케줄러 수정 (추가 작업)

스케줄러 파일도 수정이 필요합니다:

```bash
# 스케줄러 파일 찾기
find . -name "*schedule*" -o -name "*cron*" -o -name "*crawler*"

# 편집
nano scheduler.py  # 또는 찾은 파일명
```

**수정할 부분:**
```python
# 이미지를 가져오는 부분 찾기
def fetch_track_image(artist, track):
    spotify_data = get_spotify_data(artist, track)

    # 🆕 항상 첫 번째 이미지 사용 (640x640 고화질)
    images = spotify_data.get('album', {}).get('images', [])

    if images:
        image_url = images[0]['url']  # ← 이렇게 수정 (항상 [0])
        # DB에 저장
        save_image_to_db(artist, track, image_url, size='640x640')
```

**저장 후 재시작:**
```bash
pm2 restart kpopranker-scheduler  # 스케줄러 이름에 따라 다름
```

## 🎯 확인 사항

### API 테스트 (성공 기준)
```bash
# 1. size=640 테스트
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/BTS/Dynamite?size=640"

# 예상 응답:
# Content-Length: 35000 (약 35KB)

# 2. size=300 테스트
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/BTS/Dynamite?size=300"

# 예상 응답:
# Content-Length: 12000 (약 12KB)

# ✅ 성공: 두 값이 다름
# ❌ 실패: 두 값이 같음
```

### 웹사이트 확인
```
1. https://www.kpopranker.com 접속
2. F12 → Network 탭
3. 이미지 URL 확인: ?size=640 포함
4. 이미지가 선명하게 표시
```

## ⚠️ 문제 해결

### 문법 에러 발생 시
```bash
# 백업에서 복원
cp backups/$(date +%Y%m%d)/main.py main.py

# 다시 시도
nano main.py
```

### 서비스 시작 안 될 때
```bash
# 로그 확인
tail -100 /var/log/kpopranker-backend.log

# 또는
pm2 logs kpopranker-backend

# 포트 충돌 확인
lsof -i:5000  # 또는 사용 중인 포트
```

### 여전히 저화질인 경우
```bash
# 1. 백엔드 로그 확인
tail -f backend.log

# 2. size 파라미터가 전달되는지 확인
grep "size" backend.log

# 3. 캐시 클리어
# Vercel 대시보드에서 CDN 캐시 클리어
```

## 📊 예상 결과

### Before (수정 전)
- 모든 이미지 동일 크기 (~15KB)
- size 파라미터 무시

### After (수정 후)
- size=640: ~35KB (고화질)
- size=300: ~12KB (중화질)
- size 파라미터 작동 ✅

## ⏱️ 예상 소요 시간
- 코드 수정: 5-10분
- 테스트: 2-3분
- **총 소요 시간: 약 15분**

---

**중요:** 위 단계를 천천히 따라하면서 각 단계마다 결과를 확인하세요!
문제가 생기면 언제든 백업에서 복원할 수 있습니다.

**작성일:** 2025-11-18
**긴급도:** 🔥 높음
