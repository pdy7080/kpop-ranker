# KPOP Ranker v2 - Fastcomet 배포 가이드

## 📋 배포 전 체크리스트

### 로컬에서 확인
- [x] TypeScript 빌드 에러 해결 완료
- [x] `npm run build` 성공
- [x] `npm run start` 로컬 테스트 성공
- [x] PM2 ecosystem 설정 파일 작성 완료

## 🚀 Fastcomet 서버 배포 절차

### 1. 서버 접속
```bash
ssh ddhldnjs@autobid.chargeapp.net
```

### 2. 프로젝트 디렉토리로 이동
```bash
cd /home/ddhldnjs/kpopranker
# 또는 새로 생성
mkdir -p /home/ddhldnjs/kpopranker
cd /home/ddhldnjs/kpopranker
```

### 3. 프로젝트 파일 업로드

#### 방법 A: Git을 통한 배포 (권장)
```bash
# 로컬에서 GitHub에 푸시
git add .
git commit -m "🚀 Production build ready for Fastcomet deployment"
git push origin master

# 서버에서 클론/풀
cd /home/ddhldnjs/kpopranker
git pull origin master
```

#### 방법 B: SCP를 통한 직접 업로드
```bash
# 로컬에서 실행 (Windows Git Bash 또는 WSL)
cd /c/project/kpopranker
scp -r . ddhldnjs@autobid.chargeapp.net:/home/ddhldnjs/kpopranker/
```

### 4. 서버에서 의존성 설치 및 빌드
```bash
cd /home/ddhldnjs/kpopranker

# Node.js 버전 확인 (16+ 필요)
node --version

# 의존성 설치
npm install --production=false

# 프로덕션 빌드
npm run build

# prerender-manifest.json 생성 (필수!)
cd .next
node -e "const content = require('fs').readFileSync('prerender-manifest.js', 'utf8'); const json = content.match(/self\.__PRERENDER_MANIFEST=(.+)/)[1]; require('fs').writeFileSync('prerender-manifest.json', json, 'utf8'); console.log('Created prerender-manifest.json')"
cd ..
```

### 5. 로그 디렉토리 생성
```bash
mkdir -p logs
```

### 6. PM2로 애플리케이션 시작
```bash
# ecosystem.config.js 파일에서 cwd 경로 확인/수정
# cwd: '/home/ddhldnjs/kpopranker' 로 되어있는지 확인

# PM2로 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs kpop-ranker-frontend

# PM2 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

### 7. Nginx 설정 (이미 설정되어 있을 수 있음)
```nginx
# /etc/nginx/sites-available/kpopranker.conf

server {
    listen 80;
    server_name www.kpopranker.com kpopranker.com;

    # HTTPS 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.kpopranker.com kpopranker.com;

    # SSL 인증서 경로 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/kpopranker.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kpopranker.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 파일 캐싱
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## 📊 PM2 관리 명령어

```bash
# 애플리케이션 상태 확인
pm2 status

# 실시간 로그 확인
pm2 logs kpop-ranker-frontend

# 최근 로그 확인
pm2 logs kpop-ranker-frontend --lines 100

# 애플리케이션 재시작
pm2 restart kpop-ranker-frontend

# 애플리케이션 중지
pm2 stop kpop-ranker-frontend

# 애플리케이션 삭제
pm2 delete kpop-ranker-frontend

# 모니터링
pm2 monit

# 메모리/CPU 사용량
pm2 info kpop-ranker-frontend
```

## 🔄 업데이트 배포 절차

```bash
# 서버 접속
ssh ddhldnjs@autobid.chargeapp.net

# 프로젝트 디렉토리로 이동
cd /home/ddhldnjs/kpopranker

# 최신 코드 가져오기
git pull origin master

# 의존성 업데이트 (필요시)
npm install

# 빌드
npm run build

# prerender-manifest.json 재생성
cd .next
node -e "const content = require('fs').readFileSync('prerender-manifest.js', 'utf8'); const json = content.match(/self\.__PRERENDER_MANIFEST=(.+)/)[1]; require('fs').writeFileSync('prerender-manifest.json', json, 'utf8'); console.log('Created prerender-manifest.json')"
cd ..

# PM2 재시작
pm2 restart kpop-ranker-frontend

# 로그 확인
pm2 logs kpop-ranker-frontend --lines 50
```

## 🔧 문제 해결

### 포트 3000이 이미 사용 중인 경우
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000

# 또는
netstat -tlnp | grep 3000

# 프로세스 종료
kill -9 <PID>

# 또는 ecosystem.config.js에서 다른 포트 사용
env: {
  NODE_ENV: 'production',
  PORT: 3001,  # 다른 포트로 변경
}
```

### 빌드 에러 발생 시
```bash
# 캐시 삭제 후 재빌드
rm -rf .next node_modules
npm install
npm run build
```

### prerender-manifest.json 누락 시
```bash
cd /home/ddhldnjs/kpopranker/.next
node -e "const content = require('fs').readFileSync('prerender-manifest.js', 'utf8'); const json = content.match(/self\.__PRERENDER_MANIFEST=(.+)/)[1]; require('fs').writeFileSync('prerender-manifest.json', json, 'utf8'); console.log('Created prerender-manifest.json')"
```

### 메모리 부족 시
```bash
# ecosystem.config.js에서 메모리 제한 조정
max_memory_restart: '1G'  # 500M에서 1G로 증가
```

## 📈 성능 최적화

### 1. PM2 Cluster 모드 (선택사항)
```javascript
// ecosystem.config.js
{
  instances: 'max',  // 또는 2, 4 등 CPU 코어 수에 맞게
  exec_mode: 'cluster'
}
```

### 2. Nginx 캐싱 활성화
위의 Nginx 설정에 이미 포함되어 있습니다.

### 3. CDN 연동 (선택사항)
- Cloudflare 등의 CDN을 통해 정적 파일 전송

## 🔐 환경 변수 설정

서버에 `.env.production` 파일 생성:
```bash
# /home/ddhldnjs/kpopranker/.env.production
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.kpopranker.chargeapp.net
```

## ✅ 배포 완료 체크리스트

- [ ] 서버에서 빌드 성공
- [ ] PM2로 애플리케이션 실행 중
- [ ] Nginx 설정 완료 및 재시작
- [ ] HTTPS 접속 정상 작동
- [ ] API 연동 정상 작동
- [ ] 404/500 에러 페이지 정상 작동
- [ ] PM2 부팅 시 자동 시작 설정 완료
- [ ] 로그 정상 기록

## 📞 지원

문제 발생 시:
1. PM2 로그 확인: `pm2 logs kpop-ranker-frontend`
2. Nginx 로그 확인: `sudo tail -f /var/log/nginx/error.log`
3. 애플리케이션 로그: `cat /home/ddhldnjs/kpopranker/logs/frontend-error.log`

---

**작성일**: 2025-11-17
**작성자**: Claude (Senior Developer Mode)
**프로젝트**: KPOP Ranker v2
