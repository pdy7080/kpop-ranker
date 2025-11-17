# Google AdSense 통합 계획

## 프로젝트 정보
- **현재 배포**: Vercel (www.kpopranker.com)
- **백엔드 API**: api.kpopranker.chargeapp.net
- **백업 태그**: v2.0.0-pre-adsense (2025-11-17)
- **배포 방식**: GitHub Desktop → GitHub → Vercel 자동 배포

---

## 1. Google AdSense 계정 준비

### 1.1 AdSense 계정 확인
1. Google AdSense 접속: https://www.google.com/adsense
2. 로그인 후 사이트 등록 확인
3. **사이트 URL**: www.kpopranker.com
4. **승인 상태 확인** (필수)

### 1.2 AdSense 코드 발급
AdSense 승인 후 받게 되는 코드 예시:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

**중요**: `ca-pub-XXXXXXXXXXXXXXXX` 부분을 실제 Publisher ID로 교체

---

## 2. 통합 전략

### 전략 A: 자동 광고 (권장 - 초기 단계)

**장점:**
- 설정 간편 (코드 1개만 추가)
- Google AI가 최적 위치 자동 선택
- 수익 최적화 자동화

**구현 방법:**
1. `app/layout.tsx`의 `<head>` 섹션에 AdSense 스크립트 추가
2. AdSense 대시보드에서 "자동 광고" 활성화

### 전략 B: 수동 광고 배치 (고급)

**장점:**
- 광고 위치 정밀 제어
- 디자인 일관성 유지
- 사용자 경험 최적화

**배치 위치 제안:**
1. **헤더 하단** - 배너 광고 (728x90 또는 반응형)
2. **사이드바** - 스카이스크래퍼 (160x600 또는 300x600)
3. **차트 목록 중간** - 네이티브 광고
4. **페이지 하단** - 배너 광고 (728x90)

---

## 3. 구현 계획

### Phase 1: 기본 통합 (자동 광고)

#### Step 1: 환경 변수 설정
```bash
# .env.local 파일 생성/수정
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

#### Step 2: AdSense 컴포넌트 생성
**파일**: `app/components/AdSense/AdSenseScript.tsx`

```typescript
'use client';

import Script from 'next/script';

export default function AdSenseScript() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!adsenseId) {
    console.warn('AdSense ID가 설정되지 않았습니다.');
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
```

#### Step 3: Layout에 통합
**파일**: `app/layout.tsx` 수정

```typescript
import AdSenseScript from './components/AdSense/AdSenseScript';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* 기존 meta 태그들... */}
        <AdSenseScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

### Phase 2: 수동 광고 배치 (옵션)

#### 광고 단위 컴포넌트
**파일**: `app/components/AdSense/AdUnit.tsx`

```typescript
'use client';

import { useEffect } from 'react';

interface AdUnitProps {
  slot: string; // AdSense 광고 슬롯 ID
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export default function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}: AdUnitProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense 로드 실패:', err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
```

#### 사용 예시
```typescript
// 차트 페이지에 광고 추가
import AdUnit from '@/components/AdSense/AdUnit';

export default function ChartPage() {
  return (
    <div>
      <h1>차트</h1>

      {/* 상단 배너 광고 */}
      <AdUnit slot="1234567890" format="horizontal" />

      <div className="chart-content">
        {/* 차트 내용... */}
      </div>

      {/* 하단 광고 */}
      <AdUnit slot="0987654321" format="rectangle" />
    </div>
  );
}
```

---

## 4. 성능 최적화

### 4.1 지연 로딩
```typescript
// Next.js Script 컴포넌트의 strategy 옵션 활용
strategy="afterInteractive"  // 페이지 인터랙티브 후 로드
```

### 4.2 Lazy Loading (클라이언트 사이드)
```typescript
import dynamic from 'next/dynamic';

const AdUnit = dynamic(() => import('@/components/AdSense/AdUnit'), {
  ssr: false,
  loading: () => <div className="ad-skeleton">광고 로딩 중...</div>
});
```

### 4.3 광고 블로커 감지 (옵션)
```typescript
useEffect(() => {
  const checkAdBlocker = () => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    document.body.appendChild(testAd);

    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        console.log('AdBlocker 감지됨');
        // 대체 수익화 방법 표시 가능
      }
      testAd.remove();
    }, 100);
  };

  checkAdBlocker();
}, []);
```

---

## 5. 테스트 계획

### 5.1 로컬 테스트
```bash
cd "C:\project\ai07_배포\GitHub새로클론_20250811\kpop-ranker"

# .env.local 파일 생성
echo NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX > .env.local

# 개발 서버 실행
npm run dev
```

**확인 사항:**
- [ ] 브라우저 콘솔에 AdSense 스크립트 로드 확인
- [ ] 네트워크 탭에서 `adsbygoogle.js` 요청 확인
- [ ] 페이지 로딩 성능 영향 최소화 확인

### 5.2 Vercel Preview 배포 테스트
```bash
# feature 브랜치 생성
git checkout -b feature/google-adsense

# 변경사항 커밋
git add .
git commit -m "feat: Add Google AdSense integration"

# GitHub에 푸시
git push origin feature/google-adsense
```

Vercel이 자동으로 Preview URL 생성
- Preview URL에서 AdSense 작동 확인
- 실제 광고 표시까지 24-48시간 소요 가능 (초기 승인 기간)

### 5.3 프로덕션 배포
```bash
# main 브랜치에 병합
git checkout main
git merge feature/google-adsense

# GitHub Desktop으로 푸시
# → Vercel 자동 배포
```

---

## 6. AdSense 정책 준수

### 필수 사항
1. **콘텐츠 정책**
   - 저작권 준수 (K-POP 차트 데이터 출처 명시)
   - 성인 콘텐츠 제외
   - 불법 콘텐츠 제외

2. **광고 배치 정책**
   - 광고와 콘텐츠 명확히 구분
   - "광고" 라벨 추가 권장
   - 클릭 유도 금지

3. **트래픽 정책**
   - 자연 검색 트래픽 중심
   - 봇/자동화 트래픽 금지
   - 클릭 사기 방지

---

## 7. 수익 모니터링

### 7.1 AdSense 대시보드
- 일일 수익 확인
- CTR (Click-Through Rate) 모니터링
- RPM (Revenue Per Mille) 추적

### 7.2 Google Analytics 연동
- AdSense와 Analytics 연결
- 광고 성과 분석
- 사용자 행동 분석

---

## 8. 롤백 계획

### 문제 발생 시 즉시 롤백

#### 방법 1: Git 태그로 복구
```bash
cd "C:\project\ai07_배포\GitHub새로클론_20250811\kpop-ranker"

git checkout v2.0.0-pre-adsense
git checkout -b rollback-adsense
git push origin rollback-adsense --force
```

#### 방법 2: Vercel Dashboard 롤백
1. Vercel Dashboard → Deployments
2. "v2.0.0-pre-adsense" 이전 배포 선택
3. "Promote to Production" 클릭

---

## 9. 예상 타임라인

| 단계 | 소요 시간 | 작업 내용 |
|------|-----------|-----------|
| **Phase 1** | 30분 | AdSense 스크립트 추가, 자동 광고 활성화 |
| **테스트** | 1시간 | 로컬 + Preview 배포 테스트 |
| **배포** | 10분 | GitHub 푸시 → Vercel 자동 배포 |
| **검증** | 24-48시간 | AdSense 광고 활성화 대기 |
| **Phase 2** (옵션) | 2-3시간 | 수동 광고 배치 최적화 |

---

## 10. 체크리스트

### 배포 전
- [ ] AdSense 계정 승인 완료
- [ ] Publisher ID 확보
- [ ] .env.local 파일 생성 및 ID 설정
- [ ] 백업 태그 생성 (v2.0.0-pre-adsense) ✅
- [ ] AdSense 스크립트 컴포넌트 생성
- [ ] Layout에 스크립트 추가
- [ ] 로컬 테스트 완료

### 배포 후
- [ ] Preview URL에서 스크립트 로드 확인
- [ ] 프로덕션 배포 완료
- [ ] AdSense 대시보드에서 사이트 연결 확인
- [ ] 24-48시간 후 광고 표시 확인
- [ ] 페이지 성능 영향 모니터링
- [ ] 수익 데이터 확인 시작

---

**작성일**: 2025-11-17
**버전**: 1.0
**다음 단계**: AdSense Publisher ID 확보 후 Phase 1 구현 시작
