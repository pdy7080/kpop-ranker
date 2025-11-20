# Chargeapp.net 서버 정보

## 서버 상세 정보

```
Server Name:     chargeapp.net
Server Status:   running
Hostname:        d11475.sgp1.stableserver.net
IP Address:      103.138.189.39/24
Location:        Singapore (SGP1)
Provider:        Stableserver
```

## SSH 접속 정보

### 기본 접속
```bash
ssh ddhldnjs@chargeapp.net
# 또는
ssh ddhldnjs@103.138.189.39
# 또는
ssh ddhldnjs@d11475.sgp1.stableserver.net
```

### SSH Config 설정 (선택사항)

로컬 `~/.ssh/config` 파일에 추가:

```
Host chargeapp
    HostName chargeapp.net
    User ddhldnjs
    Port 22
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

설정 후 간단하게 접속:
```bash
ssh chargeapp
```

## 배포 경로

### 프로젝트 디렉토리 구조 (추정)

```
/home/ddhldnjs/
├── kpopranker/              ← 프론트엔드 (배포할 위치)
│   ├── .next/
│   ├── ecosystem.config.js
│   ├── package.json
│   └── ...
├── kpop-backend/            ← 백엔드 (기존)
├── kpop-ultimate-v21/       ← 스케줄러 (기존)
└── autobid/                 ← Autobid 서비스 (기존)
```

### 실제 경로 확인 필요

서버에 접속하여 다음 명령어로 경로를 확인하세요:

```bash
# SSH 접속 후
pwd                          # 현재 디렉토리 확인
ls -la                       # 홈 디렉토리 내용 확인
pm2 list                     # 실행 중인 서비스 확인
pm2 show kpop-backend        # 백엔드 경로 확인
```

## PM2 프로세스 현황

현재 실행 중인 서비스:
- `kpop-backend` - FastAPI 백엔드
- `kpop-ultimate-v21` - 스케줄러/크롤러
- `kpop-ai-scheduler` - AI 스케줄러
- `autobid` 관련 서비스들

## 배포 전 확인사항

### 1. 프로젝트 경로 확인

```bash
ssh ddhldnjs@chargeapp.net

# 백엔드 경로 확인
pm2 show kpop-backend | grep "exec cwd"

# kpopranker 디렉토리가 있는지 확인
ls -la ~/kpopranker

# 없으면 생성 또는 클론
mkdir -p ~/kpopranker
# 또는
cd ~
git clone https://github.com/pdy7080/kpop-ranker.git kpopranker
```

### 2. 포트 사용 확인

```bash
# 3007 포트가 사용 중인지 확인
netstat -tuln | grep 3007
# 또는
lsof -i :3007

# 사용 중이면 다른 포트 선택
```

### 3. Node.js 버전 확인

```bash
node -v   # v18 이상 필요
npm -v
pm2 -v
```

## ecosystem.config.js 경로 설정

현재 설정:
```javascript
cwd: '/home/ddhldnjs/kpopranker',
```

**서버에서 실제 경로 확인 후** ecosystem.config.js의 `cwd` 값을 업데이트하세요.

## 배포 명령어 (최종 확인 후)

```bash
# 1. SSH 접속
ssh ddhldnjs@chargeapp.net

# 2. 경로 확인 및 이동
cd /home/ddhldnjs/kpopranker
# 또는 실제 경로: cd ~/kpopranker

# 3. Git 업데이트
git pull origin main

# 4. 의존성 설치
npm install

# 5. 빌드
npm run build

# 6. 로그 디렉토리 생성
mkdir -p logs

# 7. PM2로 시작
pm2 start ecosystem.config.js

# 8. 상태 확인
pm2 list
pm2 logs kpop-ranker-frontend --lines 20

# 9. 자동 시작 설정 (최초 1회)
pm2 save
```

## Nginx 설정 (도메인 연결)

### 예상 도메인
- `kpopranker.chargeapp.net` → Frontend (3007)
- `api.kpopranker.chargeapp.net` → Backend (8000)

### Nginx 설정 파일 위치 (확인 필요)
```bash
# Nginx 설정 파일 확인
sudo nginx -t

# 일반적인 위치들
ls /etc/nginx/sites-available/
ls /etc/nginx/conf.d/
```

## 방화벽 확인 (필요시)

```bash
# 방화벽 상태 확인
sudo ufw status

# 포트 3007 허용 (내부 통신용이므로 선택사항)
sudo ufw allow 3007/tcp

# Nginx 포트 (이미 열려있을 가능성 높음)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 서버 사양 확인

```bash
# CPU 정보
lscpu | grep "Model name"
nproc  # CPU 코어 수

# 메모리 정보
free -h

# 디스크 공간
df -h

# 현재 부하
top
# 또는
htop
```

## 트러블슈팅 체크리스트

배포 중 문제 발생 시:

1. **경로 문제**
   ```bash
   pwd
   ls -la
   ```

2. **권한 문제**
   ```bash
   ls -la ~/kpopranker
   chmod -R 755 ~/kpopranker
   ```

3. **Node.js 버전**
   ```bash
   node -v  # 18 이상 필요
   nvm install 18  # 필요시
   ```

4. **PM2 문제**
   ```bash
   pm2 list
   pm2 logs kpop-ranker-frontend --err
   pm2 restart kpop-ranker-frontend
   ```

5. **포트 충돌**
   ```bash
   netstat -tuln | grep 3007
   lsof -i :3007
   ```

## 다음 단계

1. ✅ 서버 정보 확인 완료
2. ⬜ SSH 접속하여 경로 확인
3. ⬜ 프로젝트 클론 또는 업데이트
4. ⬜ 빌드 및 배포
5. ⬜ PM2 설정
6. ⬜ Nginx 설정 (도메인 연결)

---

**서버 위치**: Singapore
**예상 지연시간**: 한국 ↔ 싱가포르 ~50ms
**배포 방식**: PM2 (기존 서비스들과 통합)
**포트**: 3007 (Frontend), 8000 (Backend)
