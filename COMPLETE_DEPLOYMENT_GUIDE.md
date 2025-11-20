# 🚀 KPOP Ranker 고화질 이미지 완전 배포 가이드

## 📋 현재 상태

### ✅ 완료된 작업 (프론트엔드)
- [x] ImageWithFallback 컴포넌트 개선 (`imageSize` prop 추가)
- [x] 메인 페이지 고화질 적용 (TOP 3, HOT TRACKS)
- [x] 트렌딩 페이지 고화질 적용
- [x] Git 커밋 및 GitHub Push
- [x] Vercel 자동 배포 진행 중

### ⏳ 진행 필요 (백엔드)
- [ ] API 엔드포인트에 size 파라미터 처리 추가
- [ ] 스케줄러에 고화질 저장 로직 추가
- [ ] 기존 이미지 고화질로 재수집
- [ ] 백엔드 재시작

---

## 🎯 목표

1. **즉시 효과**: 프론트엔드 배포로 일부 고화질 적용
2. **완전 효과**: 백엔드 수정으로 모든 이미지 고화질
3. **지속 효과**: 스케줄러 수정으로 신규 이미지도 고화질

---

## 📝 Step 1: 프론트엔드 확인 (3-5분 후)

### Vercel 배포 확인
```
1. https://www.kpopranker.com 접속
2. 메인 페이지 확인
3. F12 → Network 탭
4. 이미지 URL에 ?size=640 파라미터 포함 확인
```

### 예상 결과
- ✅ 이미지 URL: `...?size=640` 포함
- ⚠️ 이미지 품질: 일부만 개선 (백엔드가 size를 아직 처리 안 함)

---

## 📝 Step 2: 백엔드 수정 (15분)

### 준비된 파일
- `backend_api_sample.py` - 완전한 API 코드 샘플
- `backend_manual_update.md` - 상세 수동 가이드
- `BACKEND_UPDATE_GUIDE.md` - 기술 문서

### 빠른 실행 가이드

#### 1. 서버 접속
```bash
ssh dccla@autobid.chargeapp.net
cd /home/dccla/kpopranker-backend
```

#### 2. 백업
```bash
mkdir -p backups/$(date +%Y%m%d)
cp *.py backups/$(date +%Y%m%d)/
```

#### 3. API 파일 수정

**backend_api_sample.py 파일을 참조하여 아래 부분 수정:**

```python
@app.route('/api/album-image-smart/<artist>/<track>')
def get_album_image_smart(artist, track):
    # 🆕 추가: size 파라미터 처리
    from flask import request
    size = request.args.get('size', '640', type=int)

    # ... 기존 코드 ...

    # 이미지 가져오는 부분 찾기
    images = spotify_data.get('album', {}).get('images', [])

    # 🆕 수정: size에 따라 이미지 선택
    if size >= 640 and len(images) > 0:
        image_url = images[0]['url']  # 640x640
    elif size >= 300 and len(images) > 1:
        image_url = images[1]['url']  # 300x300
    else:
        image_url = images[0]['url']  # 기본값

    # ... 나머지 코드 ...
```

#### 4. 문법 체크
```bash
python3 -m py_compile main.py
```

#### 5. 재시작
```bash
pm2 restart kpopranker-backend
pm2 logs kpopranker-backend --lines 50
```

#### 6. 테스트
```bash
# size=640 테스트
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=640" | grep Content-Length

# size=300 테스트
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/aespa/Whiplash?size=300" | grep Content-Length

# ✅ 성공: 두 값이 다름 (640: ~35KB, 300: ~12KB)
# ❌ 실패: 두 값이 같음
```

---

## 📝 Step 3: 스케줄러 수정 (5분)

### 스케줄러 파일 찾기
```bash
find /home/dccla/kpopranker-backend -name "*schedule*" -o -name "*cron*" -o -name "*crawler*"
```

### 코드 수정

**이미지 저장 부분을 다음과 같이 수정:**

```python
def save_track_image(artist, track):
    spotify_data = get_spotify_data(artist, track)

    # 🆕 항상 첫 번째 이미지 = 최대 크기 (640x640)
    images = spotify_data.get('album', {}).get('images', [])

    if images:
        image_url = images[0]['url']  # ← 이렇게 수정

        # DB에 저장
        save_to_db(artist, track, image_url, size='640x640')
```

### 재시작
```bash
pm2 restart kpopranker-scheduler  # 스케줄러 프로세스 이름에 따라 변경
```

---

## 📝 Step 4: 기존 이미지 재수집 (선택사항, 1-2시간)

### 준비된 스크립트
- `refresh_images_script.py` - 자동 재수집 스크립트

### 실행 방법

#### Option A: 백엔드 서버에서 직접 실행
```bash
# 1. 스크립트 업로드
scp refresh_images_script.py dccla@autobid.chargeapp.net:/home/dccla/kpopranker-backend/

# 2. 서버에서 실행
ssh dccla@autobid.chargeapp.net
cd /home/dccla/kpopranker-backend

# 3. 환경 변수 설정
export SPOTIFY_CLIENT_ID='your_client_id'
export SPOTIFY_CLIENT_SECRET='your_client_secret'

# 4. 테스트 (상위 10개만)
python3 refresh_images_script.py
# 선택: 1 (테스트 모드)

# 5. 전체 실행 (백그라운드)
nohup python3 refresh_images_script.py > refresh.log 2>&1 &
# 선택: 3 (전체 모드), y (확인)

# 6. 진행 상황 확인
tail -f refresh.log
```

#### Option B: 관리자 API 사용
```bash
# backend_api_sample.py의 refresh_all_images() 엔드포인트 사용

curl -X POST https://api.kpopranker.chargeapp.net/api/admin/refresh-images \
     -H "X-Admin-Key: YOUR_SECRET_KEY"
```

---

## 🔍 검증 방법

### 1. API 테스트
```bash
# 고화질 요청
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/BTS/Dynamite?size=640"

# 중화질 요청
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/BTS/Dynamite?size=300"

# ✅ 성공 기준:
# - size=640: Content-Length: 30000~40000 (약 35KB)
# - size=300: Content-Length: 10000~15000 (약 12KB)
# - 두 값이 다르면 성공!
```

### 2. 웹사이트 확인
```
1. https://www.kpopranker.com 접속
2. 메인 페이지 TOP 3 섹션 확인
3. 이미지가 선명한지 육안 확인
4. F12 → Network → Img 필터
5. 이미지 크기 확인 (30KB 이상이면 성공)
```

### 3. 브라우저 캐시 클리어
```
- Chrome: Ctrl+Shift+R (하드 리로드)
- Firefox: Ctrl+F5
- Safari: Cmd+Option+R
```

---

## 📊 예상 결과

### Step 1 완료 후 (프론트엔드만)
- 개선율: 30-50%
- 일부 이미지만 고화질
- 백엔드가 이미 고화질을 제공하는 경우에만 효과

### Step 2 완료 후 (백엔드 API)
- 개선율: 70-90%
- 대부분 이미지 고화질
- 신규 요청은 고화질 제공

### Step 3 완료 후 (스케줄러)
- 개선율: 90-95%
- 신규 크롤링 데이터도 고화질
- 지속적인 품질 유지

### Step 4 완료 후 (재수집)
- 개선율: 100% 🎉
- 모든 기존 이미지 고화질
- 완벽한 사용자 경험

---

## ⏱️ 예상 소요 시간

| 단계 | 작업 | 소요 시간 | 난이도 |
|------|------|-----------|--------|
| 1 | 프론트엔드 확인 | 5분 | ⭐ |
| 2 | 백엔드 API 수정 | 15분 | ⭐⭐ |
| 3 | 스케줄러 수정 | 5분 | ⭐⭐ |
| 4 | 이미지 재수집 | 1-2시간 | ⭐⭐⭐ |

**총 소요 시간:** 25분 (재수집 제외) ~ 2시간 30분 (전체)

---

## 🐛 문제 해결

### 백엔드 수정 실패 시
```bash
# 백업에서 복원
cp backups/$(date +%Y%m%d)/main.py main.py

# 재시작
pm2 restart kpopranker-backend
```

### 이미지가 여전히 저화질인 경우
```bash
# 1. 백엔드 로그 확인
pm2 logs kpopranker-backend

# 2. API 응답 확인
curl -I "...?size=640"

# 3. 브라우저 캐시 클리어
# Ctrl+Shift+R

# 4. CDN 캐시 클리어
# Vercel 대시보드 → Deployments → ... → Redeploy
```

### SSH 연결 문제
```bash
# 연결 시간 초과 시
ssh -o ConnectTimeout=30 dccla@autobid.chargeapp.net

# 키 인증 문제 시
ssh -i ~/.ssh/id_rsa dccla@autobid.chargeapp.net
```

---

## 📞 지원

### 준비된 파일들
1. **backend_api_sample.py** - 완전한 API 코드
2. **refresh_images_script.py** - 이미지 재수집 스크립트
3. **backend_manual_update.md** - 상세 수동 가이드
4. **BACKEND_UPDATE_GUIDE.md** - 기술 문서
5. **IMAGE_QUALITY_IMPROVEMENTS.md** - 개선 사항 문서
6. **DEPLOYMENT_INSTRUCTIONS.md** - 배포 가이드

### 빠른 참조
- API 수정: `backend_manual_update.md` 2-4단계
- 스케줄러 수정: `BACKEND_UPDATE_GUIDE.md` 2번 섹션
- 이미지 재수집: `refresh_images_script.py` 실행
- 문제 해결: 위 "문제 해결" 섹션

---

## ✅ 최종 체크리스트

### 필수 작업 (완전한 고화질 지원)
- [x] 프론트엔드 배포 (Vercel)
- [ ] 백엔드 API 수정
- [ ] 백엔드 재시작
- [ ] API 테스트
- [ ] 웹사이트 확인

### 선택 작업 (최상의 품질)
- [ ] 스케줄러 수정
- [ ] 기존 이미지 재수집
- [ ] 성능 모니터링

---

## 🎉 완료 후

모든 작업이 완료되면:
1. ✅ 모든 이미지 640x640 고화질
2. ✅ 신규 크롤링 데이터도 고화질
3. ✅ 프론트엔드 size 파라미터 작동
4. ✅ 백엔드 size 파라미터 처리
5. ✅ 스케줄러 고화질 저장
6. ✅ 사용자 경험 대폭 개선! 🎉

---

**작성일**: 2025-11-18
**작성자**: Claude Code
**우선순위**: 🔥 높음
**난이도**: ⭐⭐ 중간

**다음 단계**: [backend_manual_update.md](backend_manual_update.md) 파일을 열어 즉시 시작하세요!
