# Fastcomet 서버 배포 - 빠른 시작 가이드

## 🚀 빠른 배포 (5분 완성)

### 서버에서 실행할 명령어

```bash
# 1. SSH 접속
ssh ddhldnjs@chargeap.net

# 2. 프로젝트 디렉토리로 이동 (또는 클론)
cd /home/ddhldnjs/kpopranker
# 또는 신규 설치시: git clone https://github.com/pdy7080/kpop-ranker.git kpopranker

# 3. 최신 코드 가져오기
git pull origin main

# 4. 의존성 설치
npm install

# 5. 프로덕션 빌드
npm run build

# 6. logs 디렉토리 생성
mkdir -p logs

# 7. PM2로 시작
pm2 start ecosystem.config.js

# 8. 상태 확인
pm2 list
pm2 logs kpop-ranker-frontend --lines 20

# 9. 자동 시작 설정 (최초 1회만)
pm2 startup
pm2 save
```

### 확인 사항

```bash
# ✅ 프론트엔드가 실행 중인지 확인
pm2 list | grep "kpop-ranker-frontend"

# ✅ 포트 리스닝 확인
netstat -tuln | grep 3007

# ✅ 웹 접속 테스트
curl -I http://localhost:3007
```

## 📋 배포 전 체크리스트

- [ ] Node.js 18+ 설치됨
- [ ] PM2 설치됨 (`npm install -g pm2`)
- [ ] 포트 3007 사용 가능
- [ ] Git 저장소 설정됨
- [ ] SSH 접근 가능

## 🔄 업데이트 배포 (기존 서비스 실행 중)

```bash
# 1. SSH 접속
ssh ddhldnjs@chargeap.net

# 2. 프로젝트 디렉토리
cd /home/ddhldnjs/kpopranker

# 3. 최신 코드 가져오기
git pull origin main

# 4. 빌드
npm run build

# 5. 무중단 재시작
pm2 reload kpop-ranker-frontend

# 6. 확인
pm2 logs kpop-ranker-frontend --lines 20
```

## 🌐 Nginx 설정 (최초 1회)

### 1. Nginx 설정 파일 생성

```bash
sudo vi /etc/nginx/sites-available/kpopranker
```

### 2. 기본 설정 (복사해서 사용)

```nginx
upstream kpop_frontend {
    server localhost:3007;
    keepalive 64;
}

upstream kpop_backend {
    server localhost:8000;
    keepalive 64;
}

server {
    listen 80;
    server_name kpopranker.chargeapp.net www.kpopranker.com;

    location / {
        proxy_pass http://kpop_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://kpop_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/kpopranker /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

## 🔧 주요 PM2 명령어

```bash
# 상태 확인
pm2 list

# 로그 확인
pm2 logs kpop-ranker-frontend

# 재시작
pm2 restart kpop-ranker-frontend

# 무중단 재시작
pm2 reload kpop-ranker-frontend

# 중지
pm2 stop kpop-ranker-frontend

# 삭제
pm2 delete kpop-ranker-frontend

# 모니터링
pm2 monit

# 상세 정보
pm2 show kpop-ranker-frontend
```

## 🐛 트러블슈팅

### 프론트엔드가 시작되지 않음

```bash
# 에러 로그 확인
pm2 logs kpop-ranker-frontend --err

# 빌드 재시도
npm run build

# PM2 재시작
pm2 restart kpop-ranker-frontend
```

### 포트 충돌

```bash
# 3007 포트 사용 프로세스 확인
lsof -i :3007

# 프로세스 종료
kill -9 <PID>

# 또는 ecosystem.config.js에서 포트 변경
# PORT: 3007 → PORT: 3008
```

### 502 Bad Gateway

```bash
# 프론트엔드 실행 확인
pm2 list

# 포트 리스닝 확인
netstat -tuln | grep 3007

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# Nginx 재시작
sudo systemctl restart nginx
```

### 메모리 부족

```bash
# 메모리 확인
free -h

# PM2 메모리 사용량
pm2 list

# 프론트엔드만 재시작
pm2 restart kpop-ranker-frontend
```

## 📊 현재 서버 구성

```
PM2 프로세스:
├── kpop-backend (port 8000) - FastAPI 백엔드
├── kpop-ultimate-v21 - 스케줄러/크롤러
├── kpop-ai-scheduler - AI 스케줄러
├── autobid 서비스들
└── kpop-ranker-frontend (port 3007) ← 새로 추가

도메인:
├── kpopranker.chargeapp.net → Nginx → Frontend (3007)
└── /api → Nginx → Backend (8000)
```

## 📝 환경 변수 (선택사항)

프로젝트 루트에 `.env.production` 파일 생성:

```bash
# .env.production
NODE_ENV=production
PORT=3007
NEXT_PUBLIC_API_URL=https://api.kpopranker.chargeapp.net
```

## ✅ 배포 성공 확인

### 1. PM2 상태 확인
```bash
pm2 list
# kpop-ranker-frontend가 "online" 상태여야 함
```

### 2. 로그 확인
```bash
pm2 logs kpop-ranker-frontend --lines 10
# "✓ Ready in XXXms" 메시지 확인
```

### 3. 브라우저 테스트
```
https://kpopranker.chargeapp.net
```

### 4. API 연동 확인
브라우저 개발자 도구에서 네트워크 탭 확인:
- `/api/*` 요청이 정상 처리되는지 확인

## 🎯 다음 단계

배포 완료 후:

1. **성능 모니터링 설정**
   - Google Analytics 연동
   - 에러 트래킹 (Sentry)

2. **SSL 인증서 설정** (HTTPS)
   - Let's Encrypt 사용
   - `sudo certbot --nginx`

3. **자동 배포 파이프라인**
   - GitHub Actions 설정
   - 푸시 시 자동 배포

4. **백업 자동화**
   - 일일 백업 스크립트 작성

## 📚 상세 문서

- **전체 배포 가이드**: [SERVER_INTEGRATION_GUIDE.md](docs/SERVER_INTEGRATION_GUIDE.md)
- **배포 문서**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 🆘 문제 발생 시

1. 로그 확인: `pm2 logs kpop-ranker-frontend`
2. 상세 가이드 참조: `docs/SERVER_INTEGRATION_GUIDE.md`
3. GitHub Issues에 문의

---

**마지막 업데이트**: 2024-01-17
**배포 환경**: Fastcomet 서버 (기존 서비스 통합)
**포트**: 3007
**도메인**: kpopranker.chargeapp.net
