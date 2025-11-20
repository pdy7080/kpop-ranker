# 🎯 K-POP Ranker v2 프로젝트 지침
# Claude Desktop이 이 프로젝트를 작업할 때 참조하는 가이드

## 📍 프로젝트 정보
- **이름**: K-POP Ranker v2
- **위치**: C:\project\kpopranker-v2
- **현재 Phase**: 3 (배포 및 최적화)
- **개발 스타일**: GitHub 미사용, 로컬 중심, Windows PC

## 🎯 프로젝트 목표
전 세계 K-POP 팬들을 위한 실시간 차트 모니터링 및 분석 플랫폼

### 완료된 작업
- ✅ Phase 1: 코어 모듈 (Normalizer, Matcher, Pipeline) 100%
- ✅ Phase 2: API Server (FastAPI 8개 엔드포인트) + Frontend (Next.js 3페이지) 100%
- ✅ 6개 차트 크롤러 완성 (Melon, Genie, Bugs, FLO, Spotify, Apple Music)
- ✅ 90+ 테스트 통과

### 다음 작업
- 🎯 Phase 3: 배포 및 최적화
- 🎯 성능 최적화
- 🎯 모니터링 시스템

## 🔧 Claude 작업 규칙

### 1. 파일 작업
```
✅ 모든 파일은 C:\project\kpopranker-v2 내에서만
✅ 절대 C:\project 외부에 파일 생성 금지
✅ 중요 파일 수정 전 백업 권장
```

### 2. Git 사용
```
✅ Git은 로컬만 사용 (GitHub 푸시 금지!)
✅ 커밋은 자주 (30분마다 권장)
✅ 커밋 메시지는 명확하게
   예: "Task 5.1: Vercel 배포 설정 추가"
```

### 3. 백업
```
✅ 중요 작업 전/후 백업 실행
✅ 백업 위치: D:\Backups\kpopranker-v2
✅ 명령어: .\tools\auto_backup.ps1
✅ 빠른 백업: .\tools\auto_backup.ps1 -Quick
```

### 4. 개발 습관
```
✅ 30분마다 Git 커밋
✅ 1시간마다 백업 확인
✅ 하루 종료 시 전체 백업
✅ Task 완료 시 CDD 체크포인트
```

## 🚀 자주 쓰는 명령어

### 백업
```powershell
# 전체 백업
.\tools\auto_backup.ps1

# 빠른 백업 (중요 파일만)
.\tools\auto_backup.ps1 -Quick
```

### Git
```bash
# 상태 확인
git status

# 변경사항 커밋
git add .
git commit -m "메시지"

# 히스토리 확인
git log --oneline -10
```

### 프로젝트 현황
```powershell
# 현황 대시보드
.\tools\project_status.ps1
```

### 서버 실행
```bash
# 전체 시작
.\START_NOW.bat

# Backend만 (새 터미널)
cd packages\api
python main.py

# Frontend만 (새 터미널)
cd frontend
npm run dev
```

## 🚨 절대 금지 사항

### ❌ GitHub 관련
```
❌ GitHub에 푸시하지 마세요
❌ GitHub 토큰 사용하지 마세요
❌ 온라인 저장소 연결하지 마세요
```

### ❌ 보안
```
❌ API 키를 코드에 하드코딩하지 마세요
❌ .env 파일을 Git에 커밋하지 마세요
❌ 민감한 정보를 로그에 출력하지 마세요
```

---

**작성일**: 2025-10-24  
**버전**: v1.0  
**상태**: ✅ Phase 2 완료, Phase 3 준비
