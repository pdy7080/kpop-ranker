# K-POP Ranker v2 - Context

> Claude Code가 프로젝트를 이해하기 위한 기술 컨텍스트

## 🛠️ 기술 스택

### Backend
- **언어**: Python 3.9+
- **프레임워크**: Flask 2.x
- **데이터베이스**: SQLite (개발), PostgreSQL (프로덕션 예정)
- **ORM**: SQLAlchemy
- **API 문서**: Swagger/OpenAPI
- **크롤링**: BeautifulSoup4, Selenium
- **스케줄링**: APScheduler

### Frontend
- **언어**: TypeScript 5.x
- **프레임워크**: Next.js 15 (App Router)
- **스타일링**: 
  - TailwindCSS 3.x
  - shadcn/ui 컴포넌트
- **차트**: Recharts
- **상태 관리**: React Hooks (useState, useEffect, custom hooks)
- **HTTP 클라이언트**: Fetch API
- **폼 검증**: Zod (예정)

### DevOps
- **버전 관리**: Git
- **패키지 관리**: 
  - Python: pip + venv
  - Node: npm
- **린팅**: 
  - Python: pylint, black
  - TypeScript: ESLint, Prettier
- **테스팅**: 
  - Python: pytest
  - TypeScript: Jest, React Testing Library

## 📁 주요 파일 및 역할

### Backend 핵심 파일
```
backend/
├── app.py                    # Flask 앱 엔트리포인트
├── config.py                 # 환경 설정
├── api/
│   ├── routes.py            # API 라우트 정의
│   ├── charts.py            # 차트 API
│   └── artists.py           # 아티스트 API
├── services/
│   ├── crawler_service.py   # 크롤링 서비스
│   ├── normalizer.py        # 정규화 로직
│   └── matcher.py           # 매칭 알고리즘
├── models/
│   ├── chart.py             # 차트 모델
│   └── artist.py            # 아티스트 모델
└── checkpoint.py            # CDD 체크포인트
```

### Frontend 핵심 파일
```
frontend/src/
├── app/
│   ├── page.tsx             # 메인 페이지 (/)
│   ├── layout.tsx           # 루트 레이아웃
│   ├── search/page.tsx      # 검색 페이지
│   └── chart/[id]/page.tsx  # 차트 상세
├── components/
│   ├── ui/                  # 재사용 UI (20+ 개)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── sections/
│       ├── HeroSection.tsx
│       └── ChartSection.tsx
├── lib/
│   ├── api.ts               # API 클라이언트 (중요!)
│   ├── hooks/               # Custom Hooks (13개)
│   │   ├── useCharts.ts
│   │   ├── useArtists.ts
│   │   └── ...
│   └── utils.ts             # 유틸리티 함수
└── types/
    ├── chart.ts             # 차트 타입 정의
    └── artist.ts            # 아티스트 타입
```

### 설정 파일
- **Backend**:
  - `requirements.txt` - Python 의존성
  - `.env` - 환경 변수 (DB URL, API 키 등)
  - `config.py` - Flask 설정
  
- **Frontend**:
  - `package.json` - Node 의존성
  - `tsconfig.json` - TypeScript 설정
  - `tailwind.config.ts` - Tailwind 설정
  - `next.config.js` - Next.js 설정
  - `.env.local` - 로컬 환경 변수

## 🎯 코딩 컨벤션

### Python (Backend)
```python
# 네이밍
- 클래스: PascalCase (ChartService)
- 함수/변수: snake_case (get_chart_data)
- 상수: UPPER_SNAKE_CASE (API_BASE_URL)

# 스타일
- 들여쓰기: 4 spaces
- 최대 라인 길이: 100자
- Docstring: Google Style
- Type hints 사용 권장

# 예시
def normalize_artist_name(name: str, language: str = 'ko') -> str:
    """
    아티스트 이름을 정규화합니다.
    
    Args:
        name: 원본 아티스트 이름
        language: 언어 코드 (ko, en, ja)
    
    Returns:
        정규화된 아티스트 이름
    """
    return name.strip().lower()
```

### TypeScript (Frontend)
```typescript
// 네이밍
- 컴포넌트: PascalCase (ChartCard)
- 함수/변수: camelCase (fetchChartData)
- 상수: UPPER_SNAKE_CASE (API_BASE_URL)
- 타입/인터페이스: PascalCase (ChartData)

// 스타일
- 들여쓰기: 2 spaces
- 최대 라인 길이: 80자
- 세미콜론 사용
- Single quotes 선호

// 예시
interface ChartData {
  id: string;
  name: string;
  ranking: number;
}

export async function fetchChartData(chartId: string): Promise<ChartData> {
  const response = await fetch(`/api/charts/${chartId}`);
  return response.json();
}
```

## 🔌 API 엔드포인트

### Base URL
- 개발: `http://localhost:5001/api`
- 프로덕션: TBD

### 주요 엔드포인트
```
GET  /api/charts              # 차트 목록
GET  /api/charts/:id          # 차트 상세
GET  /api/artists             # 아티스트 검색
GET  /api/artists/:id         # 아티스트 상세
GET  /api/rankings            # 랭킹 데이터
POST /api/crawl               # 크롤링 시작 (관리자)
```

### 응답 형식
```json
{
  "success": true,
  "data": { ... },
  "message": "Success",
  "timestamp": "2025-10-30T12:00:00Z"
}
```

## 🗃️ 데이터베이스 스키마

### 주요 테이블
```sql
-- charts
id, name, source, updated_at

-- artists
id, name, normalized_name, aliases

-- rankings
id, chart_id, artist_id, rank, score, date

-- chart_entries
id, chart_id, title, artist, rank, date
```

## 🎨 UI/UX 가이드

### 디자인 시스템
- **컬러 팔레트**: TailwindCSS 기본 + 커스텀
- **타이포그래피**: Inter 폰트
- **간격**: TailwindCSS spacing (4px 단위)
- **반응형 브레이크포인트**:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

### 컴포넌트 구조
```typescript
// 모든 UI 컴포넌트는 shadcn/ui 기반
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 재사용 가능한 컴포넌트 작성
// Props는 명확하게 타입 정의
```

## 🧪 테스트 가이드

### Backend 테스트
```bash
# 전체 테스트 실행
pytest

# 특정 파일 테스트
pytest tests/test_normalizer.py

# 커버리지 확인
pytest --cov=backend
```

### Frontend 테스트
```bash
# 단위 테스트
npm test

# 특정 컴포넌트 테스트
npm test -- Button.test.tsx

# E2E 테스트 (예정)
npm run test:e2e
```

## 🚨 중요 주의사항

### 1. 아티스트명 정규화
- **절대** 정규화 없이 직접 비교하지 말 것
- 항상 `normalizer.py`의 함수 사용
- 다국어 처리 고려 (한글, 영문, 일본어)

### 2. API 에러 핸들링
```typescript
// ✅ 올바른 방식
try {
  const data = await fetchChartData(id);
} catch (error) {
  console.error('Chart fetch failed:', error);
  // 사용자에게 에러 표시
}

// ❌ 잘못된 방식
const data = await fetchChartData(id); // 에러 핸들링 없음
```

### 3. 성능 고려사항
- 큰 리스트는 페이지네이션 사용
- 이미지는 Next.js Image 컴포넌트 사용
- API 요청은 적절히 캐싱
- 불필요한 리렌더링 방지 (React.memo, useMemo)

## 📚 참고 문서

프로젝트 내 주요 문서:
- `docs/api_guide.md` - API 완전 가이드 (2000+ 라인)
- `docs/ARCHITECTURE.md` - 시스템 아키텍처
- `docs/CDD_METHODOLOGY.md` - CDD 방법론
- `PROJECT_STRUCTURE.md` - 상세 구조

외부 문서:
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Flask 공식 문서](https://flask.palletsprojects.com/)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)

## 🔧 개발 환경 설정

### 필수 환경 변수

**Backend (.env)**
```bash
FLASK_ENV=development
DATABASE_URL=sqlite:///kpop_charts.db
SECRET_KEY=your-secret-key
API_BASE_URL=http://localhost:5001
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 개발 서버 실행
```bash
# Backend (Terminal 1)
cd backend
python app.py
# → http://localhost:5001

# Frontend (Terminal 2)
cd frontend
npm run dev
# → http://localhost:3000
```

## 💡 Claude Code 사용 팁

### 효과적인 프롬프트 예시
```
✅ "frontend/src/components/ui/에 ChartCard 컴포넌트를 만들어줘. 
    Props는 title, rank, artist를 받고, shadcn/ui Card를 사용해."

✅ "backend/services/crawler_service.py의 fetch_melon_chart 함수에 
    에러 핸들링을 추가해줘. 3회 재시도 로직 포함."

❌ "차트 컴포넌트 만들어줘" (너무 모호함)
```

### 작업 전 체크리스트
- [ ] `PROJECT.md` 읽고 프로젝트 구조 이해
- [ ] `TASKS.md`에서 현재 작업 확인
- [ ] `CONTEXT.md`에서 기술 스택 확인
- [ ] 관련 문서 (`docs/`) 참조
- [ ] 테스트 코드 작성 계획

---

**🎯 핵심 원칙**: 
1. 항상 타입을 명시하라 (Python Type Hints, TypeScript)
2. 에러 핸들링을 빼먹지 마라
3. 테스트 코드를 함께 작성하라
4. 문서화는 코드와 함께 업데이트하라
