# KPOP FANfolio Frontend v2

K-POP 차트 트래킹 & 포트폴리오 서비스의 프론트엔드입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Charts**: Chart.js + react-chartjs-2
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast

## 시작하기

### 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 프로덕션 빌드

```bash
# 정적 파일 빌드
npm run build
npm run export

# out/ 폴더의 내용을 서버에 업로드
```

## 환경 변수

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 주요 기능

1. **스마트 검색**
   - AI 기반 검색어 자동 완성
   - 오타 보정
   - 아티스트/트랙 추천

2. **차트 조회**
   - 10개 음원 차트 실시간 순위
   - 앨범 이미지 표시
   - 발표 시간 표시

3. **포트폴리오**
   - 좋아하는 아티스트/트랙 관리
   - 가치 변동 추적
   - 순위 변화 시각화

4. **트렌딩**
   - 인기 아티스트
   - 급상승 트랙
   - 실시간 TOP 차트

## 배포

FastComet 정적 호스팅:

```bash
# 빌드
npm run build && npm run export

# out/ 폴더의 모든 파일을 서버에 업로드
# 경로: /home/username/kpopranker.chargeapp.net/
```

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/         # 페이지 컴포넌트
├── lib/           # API 클라이언트, 유틸리티
├── store/         # Zustand 스토어
├── hooks/         # 커스텀 훅
└── styles/        # 글로벌 스타일
```
