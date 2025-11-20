# K-POP Ranker v2

## 📌 프로젝트 개요
K-POP 아티스트 랭킹 및 차트 분석 시스템 - 여러 차트 소스를 통합하여 정규화된 데이터 제공

**프로젝트 경로**: `C:\project\kpopranker-v2`  
**버전**: v2 (Phase 2 완료)  
**상태**: ✅ Backend + Frontend 완전 구축

## 🎯 주요 목표
1. 여러 K-POP 차트 데이터 크롤링 및 통합
2. 아티스트명 정규화 및 매칭 시스템
3. 실시간 차트 조회 및 분석
4. 사용자 친화적인 웹 인터페이스 제공

## 🏗️ 아키텍처

### Backend (Flask + Python)
- **위치**: `backend/` (v1 운영) + `packages/` (v2 모듈)
- **주요 기능**:
  - RESTful API 서버
  - 차트 데이터 크롤링 (Melon, Bugs, Genie 등)
  - 아티스트명 정규화 엔진
  - SQLite 데이터베이스 관리
  - CDD 체크포인트 시스템

### Frontend (Next.js + TypeScript)
- **위치**: `frontend/`
- **주요 기능**:
  - Server-Side Rendering (SSR)
  - 차트 데이터 시각화
  - 검색 및 필터링
  - 반응형 UI (모바일/데스크톱)

## 📂 핵심 디렉토리 구조

```
kpopranker-v2/
├── backend/              # Flask API 서버 (v1)
│   ├── app.py           # 메인 엔트리포인트
│   ├── api/             # API 엔드포인트
│   ├── services/        # 비즈니스 로직
│   └── models/          # 데이터 모델
│
├── frontend/            # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/        # App Router 페이지
│   │   ├── components/ # 재사용 컴포넌트 (20+ 개)
│   │   ├── lib/        # API 클라이언트, Hooks
│   │   ├── types/      # TypeScript 타입
│   │   └── utils/      # 유틸리티
│   └── public/         # 정적 파일
│
├── packages/            # 코어 모듈 (v2)
│   ├── core/           # 정규화/매칭 시스템
│   ├── crawlers/       # 차트 크롤러
│   └── utils/          # 공통 유틸
│
├── docs/               # 문서 (2000+ 라인)
│   ├── PROJECT_GUIDELINES.md
│   ├── ARCHITECTURE.md
│   ├── api_guide.md
│   └── CDD_METHODOLOGY.md
│
└── .claude/            # Claude Code 설정 (이 폴더)
    ├── PROJECT.md      # 이 파일
    ├── TASKS.md        # 작업 목록
    └── CONTEXT.md      # 기술 컨텍스트
```

## 🔑 주요 기능

### 1. 차트 데이터 크롤링
- Melon, Bugs, Genie, Spotify 등 다중 소스
- 스케줄링 및 자동 업데이트
- 에러 핸들링 및 재시도 메커니즘

### 2. 아티스트명 정규화
- 한글/영문/일본어 표기 통합
- 별칭 및 변형명 매핑
- 신뢰도 기반 매칭 시스템

### 3. RESTful API
- `/api/charts` - 차트 목록 조회
- `/api/artists` - 아티스트 검색
- `/api/rankings` - 랭킹 데이터
- Swagger 문서화

### 4. 프론트엔드
- Next.js 15 App Router
- TailwindCSS + shadcn/ui
- Recharts 데이터 시각화
- 반응형 디자인

## 🚀 실행 방법

### Backend 실행
```bash
# 백엔드 서버 시작
START_BACKEND.bat

# 또는 수동 실행
cd backend
python app.py
```

### Frontend 실행
```bash
# 프론트엔드 개발 서버 시작
START_FRONTEND.bat

# 또는 수동 실행
cd frontend
npm run dev
```

### 통합 실행
```bash
# 백엔드 + 프론트엔드 동시 실행
START_ALL.bat
```

## 📊 현재 상태

### ✅ 완료된 기능
- Backend API 서버 구축
- 차트 크롤러 시스템
- 아티스트명 정규화 엔진
- Frontend UI 완전 구축 (20+ 컴포넌트)
- 검색 및 필터링 기능
- 차트 상세 페이지
- 데이터 시각화

### 🚧 진행 중
- 성능 최적화
- 테스트 커버리지 확대
- 추가 차트 소스 통합

### 📋 계획됨
- 사용자 맞춤 추천
- 실시간 알림 시스템
- 소셜 공유 기능

## 📚 주요 문서

자세한 내용은 다음 문서를 참조하세요:

- **`docs/PROJECT_GUIDELINES.md`** - 프로젝트 가이드라인
- **`docs/api_guide.md`** - API 완전 가이드 (2000+ 라인)
- **`docs/ARCHITECTURE.md`** - 시스템 아키텍처
- **`PROJECT_STRUCTURE.md`** - 상세 디렉토리 구조
- **`QUICK_START.md`** - 빠른 시작 가이드

## 🔧 개발 도구

### 필수 도구
- **Python** 3.9+
- **Node.js** 18+
- **npm** 또는 **yarn**
- **Git**

### 권장 IDE
- **VS Code** (추천)
  - 확장: Python, ESLint, Prettier, Tailwind CSS IntelliSense

## 👥 개발 워크플로우

1. **작업 시작 전**: `TASKS.md` 확인
2. **개발 중**: `CONTEXT.md` 참조
3. **커밋 전**: 테스트 실행
4. **완료 후**: `TASKS.md` 업데이트

## 📞 문제 해결

### Backend 실행 안 됨
- `venv` 활성화 확인
- `requirements.txt` 재설치
- 포트 충돌 확인 (기본 5001)

### Frontend 빌드 오류
- `node_modules` 삭제 후 재설치
- `.next` 캐시 삭제
- 환경 변수 확인 (`.env.local`)

### 크롤링 실패
- 네트워크 연결 확인
- 크롤러 타겟 사이트 변경 여부 확인
- 로그 파일 확인 (`logs/`)

---

**💡 Tip**: Claude Code를 사용할 때는 이 문서와 `CONTEXT.md`, `TASKS.md`를 함께 참조하세요!
