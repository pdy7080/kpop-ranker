# KPOP Ranker 개발 가이드

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [폴더 구조](#폴더-구조)
3. [서버 아키텍처](#서버-아키텍처)
4. [개발 환경 설정](#개발-환경-설정)
5. [배포 프로세스](#배포-프로세스)
6. [주요 기능 및 코드 위치](#주요-기능-및-코드-위치)
7. [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

**KPOP Ranker**는 여러 음악 차트(Melon, Genie, Bugs, Spotify, FLO, Apple Music, Last.fm)의 데이터를 통합하여 실시간 트렌딩 차트를 제공하는 웹 서비스입니다.

### 기술 스택
- **Frontend**: Next.js (TypeScript, React), TailwindCSS, Framer Motion
- **Backend**: Flask (Python), SQLite
- **Deployment**:
  - Frontend: Vercel
  - Backend: FastComet (d11475.sgp1.stableserver.net)
- **Process Manager**: PM2

### 주요 URL
- **Production**: https://www.kpopranker.com
- **Backend API**: https://api.kpopranker.chargeapp.net
- **Server**: d11475.sgp1.stableserver.net (103.138.189.39)

---

## 폴더 구조

### 로컬 개발 환경

```
C:/project/
├── kpopranker/                    # 백엔드 작업 디렉토리 (참조용)
│   ├── backend_*.py               # 백엔드 수정 파일들
│   └── .claude/                   # Claude 설정 및 문서
│       ├── chargeap-ssh.md        # SSH 접속 가이드
│       └── KPOP_RANKER_DEV_GUIDE.md
│
└── ai07_배포/
    └── GitHub새로클론_20250811/
        └── kpop-ranker/           # 프론트엔드 프로젝트 (Vercel 배포용)
            ├── src/
            │   ├── pages/
            │   │   ├── index.tsx           # 메인 페이지
            │   │   └── trending.tsx        # 트렌딩/개별 차트 페이지
            │   ├── components/
            │   │   ├── Layout.tsx
            │   │   └── ImageWithFallback.tsx
            │   └── styles/
            ├── public/
            ├── package.json
            └── next.config.js
```

### 서버 디렉토리 구조 (FastComet)

```
/home/chargeap/public_html/api.kpopranker.chargeapp.net/
├── api/                           # API 엔드포인트
│   ├── album_image_smart.py      # 🎨 이미지 처리 API (고화질 + Spotify 통합)
│   ├── chart_latest.py           # 📊 개별 차트 API (인코딩 수정 포함)
│   ├── trending.py               # 🔥 통합 트렌딩 API
│   ├── chart_update_status.py   # ⏰ 차트 업데이트 시간
│   └── charts.py                 # 📈 차트 목록
│
├── crawlers/                      # 크롤러 모듈
│   ├── spotify_crawler.py        # 🎧 Spotify (인코딩 수정 완료)
│   ├── melon_crawler.py          # 🍈 Melon
│   ├── genie_crawler.py          # 🧞 Genie
│   ├── bugs_crawler.py           # 🐛 Bugs
│   ├── flo_crawler.py            # 🌊 FLO
│   ├── apple_music_crawler.py   # 🍎 Apple Music
│   └── lastfm_crawler.py         # 🎵 Last.fm
│
├── static/
│   └── track_images/             # 앨범 이미지 캐시
│       └── download_mapping.json
│
├── cache/                         # 차트 데이터 캐시
│   └── charts/
│
├── rank_history.db               # 📦 SQLite 메인 데이터베이스
├── app.py                        # 🚀 Flask 메인 애플리케이션
├── ai_scheduler_v4_2.py          # 🤖 AI 기반 스케줄러
└── ultimate_system_v21_final.py  # 🔄 통합 시스템

```

---

## 서버 아키텍처

### 1. Backend Server (FastComet)

**서버 정보**:
- Hostname: `d11475.sgp1.stableserver.net`
- IP: `103.138.189.39`
- User: `chargeap`
- SSH Key: `~/.ssh/id_ed25519`

**PM2 프로세스**:
```bash
pm2 list

# 주요 프로세스:
# - kpop-backend (Flask API 서버)
# - kpop-ai-scheduler (자동 크롤링 스케줄러)
# - kpop-ultimate-v21 (통합 시스템)
# - kpop-ranker-frontend (서버 사이드 Next.js - 백업용)
```

**데이터 흐름**:
```
크롤러 (매일 자동 실행)
    ↓
chart_snapshots (임시 테이블)
    ↓
unified_master_with_images (통합 테이블)
    ↓
API 엔드포인트 (/api/chart/{chart_name}/latest)
    ↓
Frontend (Vercel)
```

### 2. Frontend (Vercel)

**배포 방법**:
1. 로컬에서 코드 수정
2. GitHub Desktop으로 커밋 & 푸시
3. Vercel이 자동으로 빌드 & 배포

**Repository**: GitHub (자동 연동)
**도메인**: www.kpopranker.com

**주요 페이지**:
- `/` - 메인 페이지 (통합 차트 TOP 3 + HOT TRACKS)
- `/trending` - 트렌딩 페이지 (통합 + 개별 차트)

---

## 개발 환경 설정

### 1. SSH 접속 설정

**기본 접속**:
```bash
ssh -i ~/.ssh/id_ed25519 -o ConnectTimeout=10 chargeap@d11475.sgp1.stableserver.net
```

**추천: SSH Config 설정** (`~/.ssh/config`):
```
Host chargeap
    HostName d11475.sgp1.stableserver.net
    User chargeap
    IdentityFile ~/.ssh/id_ed25519
    ConnectTimeout 10
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

사용:
```bash
ssh chargeap "pm2 list"
scp file.py chargeap:~/path/to/file.py
```

### 2. 로컬 개발 환경

**Frontend**:
```bash
cd C:/project/ai07_배포/GitHub새로클론_20250811/kpop-ranker

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

**환경 변수** (`.env.local`):
```
NEXT_PUBLIC_API_URL=https://api.kpopranker.chargeapp.net
```

### 3. Backend 테스트

**API 테스트**:
```bash
# 통합 트렌딩
curl "https://api.kpopranker.chargeapp.net/api/trending?limit=50"

# 개별 차트
curl "https://api.kpopranker.chargeapp.net/api/chart/spotify/latest"

# 이미지 API (고화질)
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/NMIXX/Blue%20Valentine?size=640"
```

---

## 배포 프로세스

### Frontend 배포 (Vercel)

1. **코드 수정**:
   ```bash
   cd C:/project/ai07_배포/GitHub새로클론_20250811/kpop-ranker
   # src/pages/*.tsx 파일 수정
   ```

2. **Git 커밋**:
   - GitHub Desktop 열기
   - 변경사항 확인
   - Commit message 작성
   - "Push origin" 클릭

3. **Vercel 자동 배포**:
   - Vercel이 자동으로 감지
   - 빌드 시작 (약 2-3분)
   - 배포 완료 시 이메일 알림

4. **배포 확인**:
   ```bash
   # 브라우저에서 확인
   # https://www.kpopranker.com

   # 하드 리프레시 (캐시 무시)
   # Ctrl + Shift + R (Windows)
   # Cmd + Shift + R (Mac)
   ```

### Backend 배포 (FastComet)

#### 방법 1: 개별 파일 수정 (추천)

```bash
# 1. 로컬에서 파일 수정
# C:/project/kpopranker/backend_*.py

# 2. 서버로 업로드
scp -i ~/.ssh/id_ed25519 \
    C:/project/kpopranker/backend_album_image_smart.py \
    chargeap@d11475.sgp1.stableserver.net:~/public_html/api.kpopranker.chargeapp.net/api/album_image_smart.py

# 3. PM2 재시작
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net \
    "pm2 restart kpop-backend"

# 4. 로그 확인
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net \
    "pm2 logs kpop-backend --lines 50 --nostream"
```

#### 방법 2: 크롤러 수정

```bash
# 1. 크롤러 파일 수정
# C:/project/kpopranker/spotify_crawler_fixed.py

# 2. 업로드
scp -i ~/.ssh/id_ed25519 \
    C:/project/kpopranker/spotify_crawler_fixed.py \
    chargeap@d11475.sgp1.stableserver.net:~/public_html/api.kpopranker.chargeapp.net/crawlers/spotify_crawler.py

# 3. 스케줄러 재시작 (크롤러 반영)
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net \
    "pm2 restart kpop-ai-scheduler"
```

#### 방법 3: DB 직접 수정 (긴급 데이터 수정)

```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net \
    "sqlite3 ~/public_html/api.kpopranker.chargeapp.net/rank_history.db \"UPDATE unified_master_with_images SET unified_track='올바른 제목' WHERE unified_track LIKE '%잘못된%'\""
```

---

## 주요 기능 및 코드 위치

### 1. 이미지 품질 개선 시스템

**목적**: 모든 차트에서 고화질(640x640 이상) 이미지 제공

**관련 파일**:
- Backend: `api/album_image_smart.py`
- Frontend: `src/components/ImageWithFallback.tsx`, `src/pages/trending.tsx`

**작동 원리**:
```
1. LocalImageManager (로컬 캐시 우선)
   ↓ (없으면)
2. DB local_image 필드 확인
   ↓ (없으면)
3. DB image_url → CDN 고화질 변환
   - Melon: 500 → 1000
   - Bugs: 50/100 → 500
   - Genie: 600 (이미 고화질)
   ↓ (없으면)
4. Spotify API 호출 (실시간)
   ↓ (없으면)
5. 기본 이미지 (/images/default-album.svg)
```

**Frontend 요청**:
```typescript
// src/components/ImageWithFallback.tsx
const imageUrl = `${API_URL}/api/album-image-smart/${artist}/${track}?size=640`;
```

**Backend 처리**:
```python
# api/album_image_smart.py:47
size = request.args.get('size', '640', type=int)

# Melon CDN 업그레이드 (lines 148-156)
if 'melon.co.kr' in upgraded_url:
    if size >= 640:
        upgraded_url = upgraded_url.replace('_500.jpg', '_1000.jpg')
```

### 2. 인코딩 문제 해결 시스템

**문제**: Spotify 크롤러가 UTF-8 데이터를 이중 인코딩하여 "Don't" → "Donât" 같은 깨진 문자 발생

**해결책**:
1. **크롤러 수정** (`crawlers/spotify_crawler.py`):
   ```python
   # ❌ 기존 (문제 발생)
   'track': self.normalize_encoding(track.get('name', ''))

   # ✅ 수정 (원본 UTF-8 사용)
   'track': track.get('name', '')
   ```

2. **API 레벨 보호** (`api/chart_latest.py:28-48`):
   ```python
   def fix_double_encoding(text):
       """이중 인코딩된 데이터 복구 시도"""
       try:
           return text.encode('latin-1').decode('utf-8')
       except:
           return text
   ```

3. **DB 직접 수정** (긴급 처리):
   ```bash
   sqlite3 rank_history.db "UPDATE ... SET unified_track='올바른 제목'"
   ```

### 3. 차트 데이터 크롤링

**스케줄러**: `ai_scheduler_v4_2.py`
- 매일 자동 실행 (PM2 cron 설정)
- 각 차트별 크롤러 호출
- 데이터 정규화 및 DB 저장

**크롤러 구조** (예: `crawlers/spotify_crawler.py`):
```python
class SpotifyCrawler:
    def crawl_with_api(self):
        """Spotify API 사용"""
        # 1. 토큰 발급
        # 2. 플레이리스트 데이터 가져오기
        # 3. 트랙 정보 + 이미지 URL 추출
        return tracks

    def crawl_kworb(self):
        """백업: Kworb 웹사이트 스크래핑"""
        return tracks
```

**데이터베이스 스키마**:
```sql
-- unified_master_with_images (통합 테이블)
CREATE TABLE unified_master_with_images (
    id INTEGER PRIMARY KEY,
    chart_name TEXT,
    rank_position INTEGER,
    unified_artist TEXT,
    unified_track TEXT,
    original_artist TEXT,
    original_track TEXT,
    image_url TEXT,              -- CDN URL
    local_image TEXT,            -- 로컬 캐시 파일명
    views_or_streams TEXT,
    created_at DATETIME
);
```

### 4. API 엔드포인트

**주요 API**:

| 엔드포인트 | 설명 | 파일 |
|-----------|------|------|
| `/api/trending?limit=50` | 통합 트렌딩 차트 | `api/trending.py` |
| `/api/chart/{chart}/latest` | 개별 차트 최신 데이터 | `api/chart_latest.py` |
| `/api/album-image-smart/{artist}/{track}?size=640` | 고화질 이미지 | `api/album_image_smart.py` |
| `/api/chart/update-status` | 차트 업데이트 시간 | `api/chart_update_status.py` |
| `/api/image-stats` | 이미지 시스템 통계 | `api/album_image_smart.py` |

**예시 응답** (`/api/chart/spotify/latest`):
```json
{
  "success": true,
  "chart": "spotify",
  "tracks": [
    {
      "artist": "Jimin",
      "track": "Who",
      "rank": 1,
      "image_url": "/api/album-image-smart/Jimin/Who",
      "views": "",
      "score": 500
    }
  ],
  "total": 100,
  "last_update": "2025-11-17T10:10:24"
}
```

---

## 트러블슈팅

### 문제 1: 이미지가 저화질로 표시됨

**증상**: 앨범 이미지가 흐릿하게 표시됨 (50x50 또는 500x500)

**해결**:
1. **Frontend 확인**:
   ```bash
   # 브라우저 개발자도구 > Network 탭
   # 이미지 요청 URL에 ?size=640 파라미터가 있는지 확인
   ```

2. **Backend 로그 확인**:
   ```bash
   ssh chargeap "pm2 logs kpop-backend --lines 100 | grep '이미지 요청'"
   ```

3. **CDN URL 업그레이드 확인**:
   ```bash
   curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/NMIXX/Blue%20Valentine?size=640"
   # Location 헤더에서 _1000.jpg 또는 /images/500/ 확인
   ```

### 문제 2: 트랙 제목이 깨져서 표시됨

**증상**: "Don't" → "Donât", 한글 → "ëìí..."

**원인**: 크롤러의 `normalize_encoding()` 함수가 이중 인코딩 발생

**해결**:
1. **크롤러 수정 확인**:
   ```bash
   ssh chargeap "grep -n 'normalize_encoding' ~/public_html/api.kpopranker.chargeapp.net/crawlers/spotify_crawler.py"
   # 결과가 없어야 정상 (모든 호출 제거됨)
   ```

2. **DB 데이터 수정**:
   ```bash
   ssh chargeap "sqlite3 ~/public_html/api.kpopranker.chargeapp.net/rank_history.db \"SELECT unified_artist, unified_track FROM unified_master_with_images WHERE unified_track LIKE '%â%' OR unified_track LIKE '%ë%' LIMIT 10\""

   # 깨진 데이터 발견 시 수정
   ssh chargeap "sqlite3 ~/public_html/api.kpopranker.chargeapp.net/rank_history.db \"UPDATE unified_master_with_images SET unified_track='올바른 제목' WHERE unified_track='깨진제목'\""
   ```

3. **다음 크롤링 대기**: 수정된 크롤러로 다음 날 자동 크롤링 시 정상 데이터 저장

### 문제 3: Spotify 차트 이미지가 안 나옴

**증상**: Spotify 차트에서 일부 트랙의 이미지가 `default-album.svg`로 표시

**원인**: DB에 `image_url`이 없고 로컬 이미지도 없음

**해결**: Spotify API 통합으로 자동 해결 (2025-11-17 배포 완료)
```python
# api/album_image_smart.py:198-248
# Spotify API를 실시간으로 호출하여 이미지 URL 가져옴
```

**확인**:
```bash
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/Jimin/Who?size=640"
# Location: https://i.scdn.co/image/... (Spotify CDN)
```

### 문제 4: PM2 프로세스가 죽어있음

**증상**: API 호출 시 응답 없음 또는 502 Bad Gateway

**확인**:
```bash
ssh chargeap "pm2 list | grep kpop"
# Status가 "stopped" 또는 "errored"
```

**해결**:
```bash
# 재시작
ssh chargeap "pm2 restart kpop-backend"

# 로그 확인
ssh chargeap "pm2 logs kpop-backend --lines 100"

# 메모리 부족 시 재시작
ssh chargeap "pm2 restart kpop-backend --update-env"
```

### 문제 5: Vercel 배포가 실패함

**증상**: GitHub 푸시 후 Vercel 빌드 실패

**원인**:
1. TypeScript 타입 에러
2. 환경 변수 누락
3. 의존성 버전 충돌

**해결**:
1. **로컬에서 빌드 테스트**:
   ```bash
   cd C:/project/ai07_배포/GitHub새로클론_20250811/kpop-ranker
   npm run build
   ```

2. **Vercel 로그 확인**:
   - Vercel Dashboard > Deployments > 실패한 빌드 클릭
   - 에러 메시지 확인

3. **환경 변수 확인**:
   - Vercel Dashboard > Settings > Environment Variables
   - `NEXT_PUBLIC_API_URL` 설정 확인

### 문제 6: SSH 접속이 안 됨

**증상**: `Permission denied (publickey)` 또는 `Connection timeout`

**해결**:
```bash
# 1. SSH 키 권한 확인
chmod 600 ~/.ssh/id_ed25519

# 2. SSH 키 테스트
ssh -i ~/.ssh/id_ed25519 -v chargeap@d11475.sgp1.stableserver.net

# 3. 네트워크 확인
ping d11475.sgp1.stableserver.net -c 3

# 4. 타임아웃 시간 늘리기
ssh -i ~/.ssh/id_ed25519 -o ConnectTimeout=30 chargeap@d11475.sgp1.stableserver.net
```

---

## 빠른 참조

### 자주 사용하는 명령어

```bash
# === Frontend ===
cd C:/project/ai07_배포/GitHub새로클론_20250811/kpop-ranker
npm run dev                # 개발 서버
npm run build              # 프로덕션 빌드

# === Backend ===
# PM2 상태 확인
ssh chargeap "pm2 list"

# 로그 확인
ssh chargeap "pm2 logs kpop-backend --lines 50 --nostream"

# 재시작
ssh chargeap "pm2 restart kpop-backend"

# 파일 업로드
scp file.py chargeap:~/public_html/api.kpopranker.chargeapp.net/api/

# DB 쿼리
ssh chargeap "sqlite3 ~/public_html/api.kpopranker.chargeapp.net/rank_history.db \"SELECT COUNT(*) FROM unified_master_with_images\""

# === API 테스트 ===
# 통합 트렌딩
curl "https://api.kpopranker.chargeapp.net/api/trending?limit=10"

# Spotify 차트
curl "https://api.kpopranker.chargeapp.net/api/chart/spotify/latest"

# 이미지 (고화질)
curl -I "https://api.kpopranker.chargeapp.net/api/album-image-smart/아티스트/곡명?size=640"
```

### 주요 파일 빠른 접근

**Frontend**:
- 메인 페이지: `src/pages/index.tsx`
- 트렌딩 페이지: `src/pages/trending.tsx`
- 이미지 컴포넌트: `src/components/ImageWithFallback.tsx`

**Backend**:
- 이미지 API: `api/album_image_smart.py`
- 차트 API: `api/chart_latest.py`
- Spotify 크롤러: `crawlers/spotify_crawler.py`

### 긴급 연락처 / 리소스

- **서버 접속**: `ssh chargeap`
- **도메인 관리**: FastComet cPanel
- **Frontend 배포**: Vercel Dashboard
- **GitHub**: (Repository URL 확인 필요)
- **SSH 가이드**: `.claude/chargeap-ssh.md`

---

## 변경 이력

### 2025-11-17
- ✅ 이미지 품질 개선 (Bugs 50→500, Melon 500→1000)
- ✅ Spotify API 통합 (이미지 없는 트랙 자동 처리)
- ✅ 인코딩 문제 근본 해결 (크롤러 수정)
- ✅ DB 데이터 수정 (깨진 제목 6개 복구)
- ✅ 개발 문서 작성

### 2025-08-15
- 초기 배포 (Vercel + FastComet)
- 통합 차트 시스템 구축
- AI 스케줄러 도입

---

**최종 수정일**: 2025-11-17
**문서 버전**: 1.0
**작성자**: Claude Code Assistant
