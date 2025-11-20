# Fastcomet 서버 통합 배포 가이드

## 개요

이 문서는 이미 여러 서비스가 실행 중인 Fastcomet 서버에 KPOP Ranker 프론트엔드를 안전하게 통합 배포하는 방법을 설명합니다.

## 기존 서버 환경

현재 Fastcomet 서버에서 PM2로 실행 중인 서비스:

```
├── kpop-backend (FastAPI 백엔드)
├── kpop-ultimate-v21 (스케줄러/크롤러)
├── kpop-ai-scheduler (AI 스케줄러)
└── autobid 관련 서비스들
```

## 아키텍처

```
                          ┌─────────────────┐
                          │  Nginx (80/443) │
                          └────────┬────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
         ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
         │  Frontend   │   │   Backend   │   │  Scheduler  │
         │  (Port 3007)│   │  (Port 8000)│   │             │
         │  Next.js    │   │   FastAPI   │   │   Python    │
         └─────────────┘   └─────────────┘   └─────────────┘
```

## 포트 할당

| 서비스 | 포트 | 용도 |
|--------|------|------|
| Frontend | 3007 | Next.js 프로덕션 서버 |
| Backend API | 8000 | FastAPI (기존) |
| Nginx | 80, 443 | 리버스 프록시 + SSL |

## 1단계: 서버 SSH 접속

```bash
ssh ddhldnjs@chargeap.net
# 또는
ssh ddhldnjs@your-server-ip
```

## 2단계: 프로젝트 디렉토리 준비

### Git 기반 배포 (권장)

```bash
# 프로젝트 디렉토리로 이동
cd /home/ddhldnjs

# 기존 디렉토리가 없으면 clone
git clone https://github.com/pdy7080/kpop-ranker.git kpopranker
cd kpopranker

# 기존 디렉토리가 있으면 pull
cd /home/ddhldnjs/kpopranker
git pull origin main
```

### SCP 기반 배포 (대안)

로컬에서:
```bash
# 프로젝트 디렉토리에서
npm run build  # 로컬 빌드

# 서버로 전송 (.next와 필수 파일만)
scp -r .next package.json ecosystem.config.js \
  ddhldnjs@chargeap.net:/home/ddhldnjs/kpopranker/
```

## 3단계: 서버 환경 검증

```bash
# 서버에서 검증 스크립트 실행
cd /home/ddhldnjs/kpopranker
chmod +x scripts/check-server-ready.sh
./scripts/check-server-ready.sh
```

**검증 항목:**
- ✓ Node.js 18+ 설치 확인
- ✓ PM2 설치 확인
- ✓ 포트 3007 사용 가능 확인
- ✓ 디스크 공간 확인
- ✓ 메모리 확인
- ✓ 기존 PM2 프로세스 확인

## 4단계: 의존성 설치 및 빌드

```bash
cd /home/ddhldnjs/kpopranker

# 의존성 설치 (프로덕션만)
npm install --production

# 또는 전체 설치 후 빌드
npm install
npm run build

# 빌드 확인
ls -la .next/standalone/server.js  # 파일 존재 확인
ls -la .next/prerender-manifest.json  # 파일 존재 확인
```

## 5단계: PM2로 프론트엔드 시작

### 신규 배포

```bash
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
│ 3   │ kpop-ranker-frontend  │ online  │ 0       │ 1%   │ 120mb  │  ← 새로 추가됨
└─────┴───────────────────────┴─────────┴─────────┴──────┴────────┘
```

### 업데이트 배포

```bash
# 코드 업데이트
git pull origin main

# 빌드
npm run build

# PM2 재시작 (무중단)
pm2 reload kpop-ranker-frontend

# 또는 완전 재시작
pm2 restart kpop-ranker-frontend
```

## 6단계: 로그 모니터링

```bash
# 실시간 로그 확인
pm2 logs kpop-ranker-frontend

# 에러 로그만 확인
pm2 logs kpop-ranker-frontend --err

# 최근 100줄 확인
pm2 logs kpop-ranker-frontend --lines 100

# 파일로 직접 확인
tail -f logs/frontend-out.log
tail -f logs/frontend-error.log
```

**정상 시작 로그 예시:**
```
PM2        | App [kpop-ranker-frontend:0] online
0|frontend | ▲ Next.js 14.0.4
0|frontend | - Local:        http://localhost:3007
0|frontend | - Network:      http://0.0.0.0:3007
0|frontend | ✓ Ready in 319ms
```

## 7단계: Nginx 설정 업데이트

### 설정 파일 편집

```bash
sudo vi /etc/nginx/sites-available/kpopranker
```

### Nginx 설정 예시

```nginx
# KPOP Ranker 통합 설정
upstream kpop_frontend {
    server localhost:3007;
    keepalive 64;
}

upstream kpop_backend {
    server localhost:8000;
    keepalive 64;
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name kpopranker.chargeapp.net www.kpopranker.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 메인 설정
server {
    listen 443 ssl http2;
    server_name kpopranker.chargeapp.net www.kpopranker.com;

    # SSL 인증서 (기존 설정 유지)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 로그
    access_log /var/log/nginx/kpopranker-access.log;
    error_log /var/log/nginx/kpopranker-error.log;

    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # 프론트엔드 (Next.js)
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

        # 타임아웃
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 백엔드 API (FastAPI)
    location /api {
        proxy_pass http://kpop_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS 헤더 (이미 백엔드에서 처리하는 경우 불필요)
        # add_header Access-Control-Allow-Origin *;
    }

    # 정적 파일 캐싱
    location /_next/static {
        proxy_pass http://kpop_frontend;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # 이미지 최적화
    location /_next/image {
        proxy_pass http://kpop_frontend;
        proxy_cache_valid 200 1d;
    }

    # 파비콘
    location /favicon.ico {
        proxy_pass http://kpop_frontend;
        access_log off;
    }
}
```

### Nginx 설정 적용

```bash
# 설정 테스트
sudo nginx -t

# 문제 없으면 리로드
sudo systemctl reload nginx

# 또는
sudo service nginx reload
```

## 8단계: 방화벽 설정 (필요시)

```bash
# 포트 3007 열기 (내부 통신용이므로 선택사항)
sudo ufw allow 3007/tcp

# Nginx 포트는 이미 열려있어야 함
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 상태 확인
sudo ufw status
```

## 9단계: 동작 확인

### 서비스 상태 확인

```bash
# PM2 상태
pm2 list

# 프론트엔드 로그
pm2 logs kpop-ranker-frontend --lines 20

# 포트 리스닝 확인
netstat -tuln | grep 3007
# 또는
lsof -i :3007
```

### 브라우저 테스트

```bash
# 로컬호스트 테스트 (서버에서)
curl http://localhost:3007

# 외부 도메인 테스트
curl https://kpopranker.chargeapp.net
```

**예상 응답:** HTML 페이지 내용 또는 200 OK

### 헬스체크

```bash
# 프론트엔드 접속 테스트
curl -I http://localhost:3007

# 백엔드 API 테스트
curl -I http://localhost:8000/api/health
```

## 10단계: PM2 자동 시작 설정

```bash
# PM2 startup 스크립트 생성 (최초 1회)
pm2 startup

# 현재 프로세스 목록 저장
pm2 save

# 확인
pm2 list
```

이제 서버 재부팅 시 자동으로 모든 서비스(frontend 포함)가 시작됩니다.

## 모니터링 및 유지보수

### 리소스 모니터링

```bash
# PM2 모니터링 대시보드
pm2 monit

# 메모리/CPU 사용량
pm2 list

# 상세 정보
pm2 show kpop-ranker-frontend
```

### 로그 관리

```bash
# 로그 파일 크기 확인
du -sh logs/*.log

# 오래된 로그 정리 (30일 이상)
find logs/ -name "*.log" -mtime +30 -delete

# 로그 로테이션 (PM2 기본 제공)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 성능 최적화

```bash
# 메모리 사용량이 높으면 재시작
pm2 restart kpop-ranker-frontend

# 크론으로 자동 재시작 (이미 ecosystem.config.js에 설정됨)
# 매일 새벽 4시에 재시작됨
```

## 트러블슈팅

### 프론트엔드가 시작되지 않음

```bash
# 에러 로그 확인
pm2 logs kpop-ranker-frontend --err

# 일반적인 원인:
# 1. 포트 충돌 → 다른 프로세스 종료 또는 포트 변경
# 2. 빌드 실패 → npm run build 재실행
# 3. 메모리 부족 → 다른 서비스 재시작 또는 서버 업그레이드
```

### 502 Bad Gateway

```bash
# 프론트엔드가 실행 중인지 확인
pm2 list

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/kpopranker-error.log

# 포트 리스닝 확인
netstat -tuln | grep 3007
```

### 메모리 부족

```bash
# 현재 메모리 사용량
free -h

# PM2 프로세스별 메모리
pm2 list

# 프론트엔드 메모리 제한 조정 (ecosystem.config.js)
# max_memory_restart: '500M' → '1G'

pm2 restart kpop-ranker-frontend
```

### 빌드 실패

```bash
# 빌드 로그 확인
npm run build 2>&1 | tee build.log

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 롤백 절차

문제 발생 시 이전 버전으로 복원:

```bash
# Git 기반 롤백
cd /home/ddhldnjs/kpopranker
git log --oneline -10  # 커밋 히스토리 확인
git reset --hard <previous-commit-hash>
npm run build
pm2 restart kpop-ranker-frontend

# 백업 기반 롤백
# (사전에 백업 생성했다면)
cd /home/ddhldnjs
mv kpopranker kpopranker-broken
mv kpopranker-backup kpopranker
pm2 restart kpop-ranker-frontend
```

## 보안 체크리스트

- [ ] 환경 변수에 민감 정보 없음 확인
- [ ] API 키는 .env 파일에만 저장
- [ ] .env 파일은 .gitignore에 추가됨
- [ ] HTTPS 설정 완료
- [ ] 방화벽 규칙 적용
- [ ] 로그 파일 권한 적절하게 설정
- [ ] 정기적인 업데이트 계획 수립

## 다음 단계

1. **성능 모니터링 설정**
   - Google Analytics 또는 Plausible 연동
   - 에러 트래킹 (Sentry 등)

2. **CI/CD 파이프라인 구축**
   - GitHub Actions로 자동 배포
   - 테스트 자동화

3. **백업 자동화**
   - 일일 백업 스크립트
   - 데이터베이스 백업 (있는 경우)

4. **CDN 연동** (선택사항)
   - CloudFlare 또는 AWS CloudFront
   - 정적 리소스 캐싱

## 참고 자료

- [Next.js Deployment 공식 문서](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx 설정 가이드](https://nginx.org/en/docs/)

## 지원

문제가 발생하면:
1. 먼저 로그 확인 (`pm2 logs kpop-ranker-frontend`)
2. 트러블슈팅 섹션 참조
3. GitHub Issues에 문의

---

**배포 완료 체크리스트:**
- [ ] 서버 환경 검증 완료
- [ ] 의존성 설치 완료
- [ ] 빌드 성공
- [ ] PM2로 프론트엔드 시작
- [ ] Nginx 설정 업데이트
- [ ] 도메인 접속 확인
- [ ] 백엔드 API 연동 확인
- [ ] 로그 모니터링 설정
- [ ] 자동 시작 설정 완료
