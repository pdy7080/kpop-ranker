# 🚀 KPOP Ranker - 최종 배포 단계

## 서버 정보
- **Server**: chargeapp.net (d11475.sgp1.stableserver.net)
- **IP**: 103.138.189.39
- **Location**: Singapore
- **User**: ddhldnjs

---

## 📋 배포 전 체크리스트

### 로컬에서 완료된 사항
- ✅ TypeScript 빌드 에러 해결
- ✅ Production 빌드 성공
- ✅ PM2 ecosystem.config.js 설정
- ✅ 자동화 스크립트 작성
- ✅ 배포 문서 작성

### 서버에서 확인할 사항
- ⬜ SSH 접속 확인
- ⬜ 프로젝트 경로 확인
- ⬜ Node.js 18+ 설치 확인
- ⬜ PM2 설치 확인
- ⬜ 포트 3007 사용 가능 확인

---

## 🔑 Step 1: SSH 접속

### 방법 1: 도메인으로 접속
```bash
ssh ddhldnjs@chargeapp.net
```

### 방법 2: IP로 접속
```bash
ssh ddhldnjs@103.138.189.39
```

### 방법 3: Hostname으로 접속
```bash
ssh ddhldnjs@d11475.sgp1.stableserver.net
```

**접속 성공 후 다음 단계로 진행**

---

## 🗺️ Step 2: 서버 환경 확인

```bash
# 현재 위치 확인
pwd

# 홈 디렉토리 내용 확인
ls -la

# PM2 프로세스 확인
pm2 list

# Node.js 버전 확인 (18 이상 필요)
node -v

# PM2 버전 확인
pm2 -v

# 포트 3007 사용 확인
netstat -tuln | grep 3007
# 또는
lsof -i :3007
```

**예상 출력:**
```
PM2 프로세스:
├── kpop-backend
├── kpop-ultimate-v21
├── kpop-ai-scheduler
└── autobid 서비스들
```

---

## 📂 Step 3: 프로젝트 디렉토리 설정

### Case A: 디렉토리가 이미 있는 경우
```bash
cd ~/kpopranker
git status
git pull origin main
```

### Case B: 디렉토리가 없는 경우
```bash
cd ~
git clone https://github.com/pdy7080/kpop-ranker.git kpopranker
cd kpopranker
```

### Case C: Git 없이 SCP로 배포
로컬에서:
```bash
# 프로젝트 디렉토리에서
npm run build

# 서버로 전송
scp -r .next package.json package-lock.json ecosystem.config.js scripts \
  ddhldnjs@chargeapp.net:/home/ddhldnjs/kpopranker/
```

---

## 🔧 Step 4: 환경 검증 스크립트 실행

```bash
cd ~/kpopranker

# 스크립트 실행 권한 부여
chmod +x scripts/check-server-ready.sh

# 검증 실행
./scripts/check-server-ready.sh
```

**검증 항목:**
- ✓ Node.js 18+ 설치됨
- ✓ PM2 설치됨
- ✓ 포트 3007 사용 가능
- ✓ 디스크 공간 충분
- ✓ 메모리 충분

**문제가 있으면 해결 후 다음 단계로**

---

## 📦 Step 5: 의존성 설치

```bash
cd ~/kpopranker

# package-lock.json이 있으면 clean install
npm ci

# 또는 일반 설치
npm install

# 설치 확인
ls -la node_modules
```

---

## 🏗️ Step 6: Production 빌드

```bash
cd ~/kpopranker

# 빌드 실행
npm run build
```

**예상 출력:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (18/18)
🔧 Running post-build script...
✅ Successfully created prerender-manifest.json
🎉 Post-build script completed successfully!
```

**빌드 확인:**
```bash
# .next 디렉토리 확인
ls -la .next

# prerender-manifest.json 확인
ls -la .next/prerender-manifest.json
```

---

## 📝 Step 7: ecosystem.config.js 경로 수정 (필요시)

```bash
# 현재 경로 확인
pwd

# 출력 예: /home/ddhldnjs/kpopranker
```

ecosystem.config.js의 `cwd` 값이 실제 경로와 일치하는지 확인:

```bash
vi ecosystem.config.js

# 또는
nano ecosystem.config.js
```

**확인할 부분:**
```javascript
cwd: '/home/ddhldnjs/kpopranker',  // 이 경로가 pwd 출력과 일치해야 함
```

---

## 🚀 Step 8: PM2로 시작

```bash
cd ~/kpopranker

# logs 디렉토리 생성
mkdir -p logs

# PM2로 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 list
```

**예상 출력:**
```
┌─────┬───────────────────────┬─────────┬─────────┬──────┬────────┐
│ id  │ name                  │ status  │ restart │ cpu  │ memory │
├─────┼───────────────────────┼─────────┼─────────┼──────┼────────┤
│ 0   │ kpop-backend          │ online  │ 5       │ 0%   │ 3.4mb  │
│ 1   │ kpop-ultimate-v21     │ online  │ 9       │ 0%   │ 73.4mb │
│ 2   │ kpop-ai-scheduler     │ online  │ 12      │ 0%   │ 41.2mb │
│ 3   │ kpop-ranker-frontend  │ online  │ 0       │ 1%   │ 120mb  │ ✨
└─────┴───────────────────────┴─────────┴─────────┴──────┴────────┘
```

---

## 📊 Step 9: 로그 확인

```bash
# 실시간 로그 확인
pm2 logs kpop-ranker-frontend

# 최근 20줄만 확인
pm2 logs kpop-ranker-frontend --lines 20

# 에러 로그만 확인
pm2 logs kpop-ranker-frontend --err
```

**정상 시작 로그:**
```
0|frontend | ▲ Next.js 14.0.4
0|frontend | - Local:        http://localhost:3007
0|frontend | - Network:      http://0.0.0.0:3007
0|frontend | ✓ Ready in XXXms
```

---

## ✅ Step 10: 동작 확인

### 서버에서 테스트
```bash
# 로컬호스트 접속 테스트
curl http://localhost:3007

# HTTP 헤더 확인
curl -I http://localhost:3007
```

**예상 응답:** `200 OK` 또는 HTML 내용

### 외부에서 테스트 (브라우저)
```
http://103.138.189.39:3007
```

**방화벽으로 막혀있으면 Nginx 설정 필요**

---

## 🔄 Step 11: PM2 자동 시작 설정

```bash
# PM2 startup 설정 (최초 1회만)
pm2 startup

# 출력된 명령어를 복사하여 실행 (예시)
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ddhldnjs --hp /home/ddhldnjs

# 현재 프로세스 목록 저장
pm2 save

# 확인
pm2 list
```

**이제 서버 재부팅 시 자동으로 시작됩니다!**

---

## 🌐 Step 12: Nginx 설정 (도메인 연결)

### Nginx 설정 파일 생성

```bash
# Nginx 설정 파일 편집 (권한 필요)
sudo vi /etc/nginx/sites-available/kpopranker

# 또는
sudo nano /etc/nginx/sites-available/kpopranker
```

### 기본 설정 (복사해서 붙여넣기)

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
    server_name kpopranker.chargeapp.net;

    access_log /var/log/nginx/kpopranker-access.log;
    error_log /var/log/nginx/kpopranker-error.log;

    # 프론트엔드
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

    # 백엔드 API
    location /api {
        proxy_pass http://kpop_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 정적 파일 캐싱
    location /_next/static {
        proxy_pass http://kpop_frontend;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Nginx 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/kpopranker /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# 문제 없으면 리로드
sudo systemctl reload nginx

# 또는
sudo service nginx reload
```

---

## 🎉 Step 13: 최종 확인

### 1. PM2 상태
```bash
pm2 list
```
→ `kpop-ranker-frontend`가 `online` 상태

### 2. 로그 확인
```bash
pm2 logs kpop-ranker-frontend --lines 10
```
→ `✓ Ready in XXXms` 메시지 확인

### 3. 포트 리스닝
```bash
netstat -tuln | grep 3007
```
→ `0.0.0.0:3007` 또는 `:::3007` 리스닝 중

### 4. 브라우저 테스트
```
http://kpopranker.chargeapp.net
```
→ KPOP Ranker 페이지 표시

### 5. API 연동 확인
브라우저 개발자 도구 → Network 탭 → `/api/*` 요청 확인

---

## 🔄 업데이트 배포 절차

이후 코드 변경 시:

```bash
# SSH 접속
ssh ddhldnjs@chargeapp.net

# 프로젝트 디렉토리
cd ~/kpopranker

# 최신 코드 가져오기
git pull origin main

# 빌드
npm run build

# 무중단 재시작
pm2 reload kpop-ranker-frontend

# 로그 확인
pm2 logs kpop-ranker-frontend --lines 20
```

---

## 🐛 트러블슈팅

### 프론트엔드가 시작되지 않음
```bash
pm2 logs kpop-ranker-frontend --err
npm run build
pm2 restart kpop-ranker-frontend
```

### 포트 충돌
```bash
lsof -i :3007
kill -9 <PID>
pm2 restart kpop-ranker-frontend
```

### 502 Bad Gateway
```bash
pm2 list
netstat -tuln | grep 3007
sudo systemctl restart nginx
```

### 메모리 부족
```bash
free -h
pm2 restart kpop-ranker-frontend
```

### 빌드 실패
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

---

## 📚 참고 문서

- [SERVER_INFO.md](SERVER_INFO.md) - 서버 상세 정보
- [DEPLOY_TO_FASTCOMET.md](DEPLOY_TO_FASTCOMET.md) - 빠른 배포 가이드
- [docs/SERVER_INTEGRATION_GUIDE.md](docs/SERVER_INTEGRATION_GUIDE.md) - 통합 배포 가이드
- [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) - 배포 준비 요약

---

## 📞 문제 발생 시

1. PM2 로그 확인: `pm2 logs kpop-ranker-frontend`
2. Nginx 로그 확인: `sudo tail -f /var/log/nginx/error.log`
3. 서버 리소스 확인: `top` 또는 `htop`

---

## ✅ 배포 완료 체크리스트

배포 후 확인:
- [ ] SSH 접속 성공
- [ ] 프로젝트 디렉토리 설정
- [ ] Node.js 18+ 설치 확인
- [ ] PM2 설치 확인
- [ ] 의존성 설치 완료
- [ ] Production 빌드 성공
- [ ] PM2로 시작 성공
- [ ] `pm2 list`에서 `online` 상태
- [ ] 로그에 `Ready in XXXms` 확인
- [ ] PM2 자동 시작 설정
- [ ] Nginx 설정 완료 (선택사항)
- [ ] 브라우저에서 접속 확인
- [ ] API 연동 확인

---

**배포 시간**: 약 10-15분
**난이도**: ⭐⭐⭐ (중)
**상태**: 🟢 Ready for Production
