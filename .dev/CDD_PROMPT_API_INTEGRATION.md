# 🔄 CDD 재개 프롬프트 - API 데이터 연동 작업

**작성일:** 2025-10-27 18:00  
**현재 진행률:** 95% (레이아웃 100% 완료, 데이터 연동 작업 시작)  
**다음 작업:** API 데이터 연동 완료 (30-40분)

---

## 📊 현재 상태

### ✅ 완료된 작업 (95%)

#### 1️⃣ **v1 스타일 레이아웃 100% 완성**
```
✅ Hero.tsx (검은 배경 + 통계 카드)
✅ SearchSection.tsx (간소화)
✅ TopThreeSection.tsx (금/은/동 메달)
✅ HotTracksSection.tsx (4x3 그리드)
✅ PartnersSection.tsx (보라색 배경)
✅ Footer.tsx (간단한 푸터)
```

**파일 위치:**
```
C:\project\kpopranker-v2\frontend\src\
├── components\sections\
│   ├── Hero.tsx
│   ├── SearchSection.tsx
│   ├── TopThreeSection.tsx (신규 생성)
│   ├── HotTracksSection.tsx (신규 생성)
│   └── PartnersSection.tsx (신규 생성)
├── components\layout\
│   └── Footer.tsx (신규 생성)
└── app\
    └── page.tsx (최종 통합)
```

#### 2️⃣ **Mock 데이터로 작동 확인 완료**
```
✅ TOP 3 섹션 표시
✅ HOT TRACKS 그리드 표시
✅ v1과 레이아웃 동일
✅ 모든 섹션 정상 작동
```

#### 3️⃣ **백엔드 API 구조 확인 완료**
```
✅ API 서버: localhost:8000
✅ 주요 엔드포인트 파악
   - GET /api/trending
   - GET /api/charts/{chart_name}
   - GET /api/search
   - GET /api/track/{artist}/{title}
   - GET /api/status
✅ 데이터 형식 확인
✅ API 클라이언트 (lib/api.ts) 분석
```

---

## 🎯 다음 작업: API 데이터 연동 (95% → 100%)

### 목표
**Mock 데이터를 실제 API 데이터로 교체**

### 작업 시간
**30-40분 예상**

---

## 📝 상세 작업 단계

### Step 1: useTrending Hook 생성 (10분) ⚡

**목적:** API 데이터를 쉽게 사용하기 위한 React Hook

**파일 생성:** `C:\project\kpopranker-v2\frontend\src\lib\hooks\useTrendingData.ts`

```typescript
'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api'
import type { TrendingData, ChartEntry } from '@/lib/api'

interface UseTrendingDataOptions {
  period?: 'hourly' | 'daily' | 'weekly'
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useTrendingData(options: UseTrendingDataOptions = {}) {
  const [data, setData] = useState<ChartEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.getTrendingWithFallback({
        period: options.period || 'daily',
        limit: 100
      })
      
      if (response.success && response.data?.data) {
        setData(response.data.data)
      } else {
        throw new Error(response.error || 'Failed to fetch trending data')
      }
    } catch (err) {
      console.error('Trending data error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [options.period])

  return {
    data,
    isLoading,
    error,
    refresh: fetchData
  }
}
```

---

### Step 2: TopThreeSection 데이터 연동 (10분) ⚡

**수정 파일:** `C:\project\kpopranker-v2\frontend\src\components\sections\TopThreeSection.tsx`

```typescript
'use client'

import { Trophy } from 'lucide-react'
import { cn } from '@/utils'
import { useTrendingData } from '@/lib/hooks/useTrendingData'

export default function TopThreeSection() {
  // API 데이터 사용
  const { data: trendingData, isLoading, error } = useTrendingData({
    period: 'daily'
  })

  // TOP 3 추출
  const topThree = trendingData.slice(0, 3).map((entry, idx) => ({
    rank: idx + 1,
    artist: entry.artist,
    track: entry.track,
    image_url: entry.image_url,
    charts: [
      { name: entry.chart_name, color: getChartColor(entry.chart_name) }
    ]
  }))

  // 로딩 상태
  if (isLoading) {
    return (
      <section className="py-8 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>TOP 3 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }

  // 에러 상태
  if (error) {
    console.error('TOP 3 에러:', error)
    // 에러 시 Mock 데이터 사용 (기존 코드 유지)
  }

  // 데이터가 없으면 Mock 사용
  const displayTracks = topThree.length > 0 ? topThree : [/* Mock 데이터 */]

  // 나머지 렌더링 코드는 그대로 유지...
}

function getChartColor(chartName: string): string {
  const colors: Record<string, string> = {
    'melon': '#00CD3C',
    'genie': '#FF6B00',
    'bugs': '#FFB800',
    'flo': '#FF1493',
    'spotify': '#1DB954',
    'apple': '#FA243C',
    'lastfm': '#D51007'
  }
  return colors[chartName] || '#888888'
}
```

---

### Step 3: HotTracksSection 데이터 연동 (10분) ⚡

**수정 파일:** `C:\project\kpopranker-v2\frontend\src\components\sections\HotTracksSection.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Flame } from 'lucide-react'
import { useTrendingData } from '@/lib/hooks/useTrendingData'

export default function HotTracksSection() {
  const { data: trendingData, isLoading, error } = useTrendingData({
    period: 'daily'
  })

  // 4-15위 추출 (TOP 3 제외)
  const hotTracks = trendingData.slice(3, 15).map((entry, idx) => ({
    rank: idx + 4,
    artist: entry.artist,
    track: entry.track,
    image_url: entry.image_url,
    charts: [
      { name: entry.chart_name, color: getChartColor(entry.chart_name) }
    ]
  }))

  if (isLoading) {
    return (
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  const displayTracks = hotTracks.length > 0 ? hotTracks : [/* Mock 데이터 */]

  // 나머지 렌더링 코드는 그대로...
}
```

---

### Step 4: Hero 통계 데이터 연동 (10분) ⚡

**수정 파일:** `C:\project\kpopranker-v2\frontend\src\components\sections\Hero.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import apiClient from '@/lib/api'

export default function Hero() {
  const [stats, setStats] = useState({
    totalTracks: 1000,
    totalArtists: 135,
    totalCharts: 8
  })

  useEffect(() => {
    // API에서 실제 통계 가져오기
    const fetchStats = async () => {
      try {
        const response = await apiClient.getSystemStatus()
        if (response.success) {
          setStats({
            totalTracks: response.data.total_tracks || 1000,
            totalArtists: response.data.total_artists || 135,
            totalCharts: Object.keys(response.data.charts || {}).length || 8
          })
        }
      } catch (error) {
        console.error('통계 로드 실패:', error)
        // 실패 시 기본값 유지
      }
    }

    fetchStats()
  }, [])

  // 나머지 렌더링 코드는 그대로...
}
```

---

## 🧪 테스트 체크리스트

### 1️⃣ **백엔드 API 서버 실행**
```bash
# 터미널 1: 백엔드 시작
cd C:\project\kpopranker-v2\packages\api
python main.py

# 확인: http://localhost:8000/health
# 응답 예상: {"status": "ok", "total_tracks": 400}
```

### 2️⃣ **프론트엔드 실행**
```bash
# 터미널 2: 프론트엔드 시작
cd C:\project\kpopranker-v2\frontend
npm run dev

# 확인: http://localhost:3000
```

### 3️⃣ **확인 사항**
```
✅ TOP 3에 실제 데이터 표시
✅ HOT TRACKS에 실제 데이터 표시
✅ Hero 통계가 실제 값으로 변경
✅ 로딩 상태 정상 작동
✅ 에러 시 Mock 데이터 폴백
✅ 콘솔 에러 없음
```

---

## 🔧 문제 해결 가이드

### 문제 1: API 서버 연결 안 됨
**증상:** "API 서버에 연결할 수 없습니다"
**해결:**
```bash
# 1. API 서버 실행 확인
cd C:\project\kpopranker-v2\packages\api
python main.py

# 2. 포트 확인
# http://localhost:8000/health

# 3. 환경 변수 확인
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 문제 2: 데이터가 안 나옴
**증상:** Mock 데이터만 표시
**해결:**
```typescript
// 브라우저 콘솔 확인
// F12 → Console

// 예상 로그:
// "🔄 트렌딩 데이터 조회 (Fallback 포함)"
// "✅ 실제 API 데이터 사용: 100개"
```

### 문제 3: CORS 에러
**증상:** "CORS policy blocked"
**해결:**
```python
# packages/api/main.py 확인
# CORS 설정이 있어야 함:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 예상 결과

### Before (Mock 데이터)
```
TOP 3:
1. Stray Kids - GIANT
2. aespa - Whiplash
3. ROSÉ - APT.
```

### After (실제 데이터)
```
TOP 3:
1. [실제 1위 곡]
2. [실제 2위 곡]
3. [실제 3위 곡]

HOT TRACKS:
[실제 4-15위 곡들]
```

---

## 🚀 다음 단계 (100% 완료 후)

### Optional: 추가 개선 사항
```
⏸️ 이미지 최적화 (WebP 변환)
⏸️ 무한 스크롤 구현
⏸️ 검색 페이지 완성
⏸️ 차트 상세 페이지
⏸️ 배포 준비
```

---

## 📁 주요 파일 요약

```
프론트엔드:
├── src/lib/hooks/useTrendingData.ts    (신규 생성)
├── src/components/sections/
│   ├── TopThreeSection.tsx            (수정)
│   ├── HotTracksSection.tsx           (수정)
│   └── Hero.tsx                       (수정)
└── src/lib/api.ts                     (확인만)

백엔드:
└── packages/api/main.py               (확인만)
```

---

## 💡 개발자 노트

### 핵심 원칙
1. **API 실패 시 항상 Mock 데이터 폴백**
2. **로딩 상태 명확히 표시**
3. **에러는 콘솔에만 로깅, 사용자에게는 폴백**
4. **useTrendingData Hook으로 중복 코드 제거**

### 시간 절약 팁
```typescript
// useTrendingData를 먼저 만들면
// 모든 컴포넌트에서 재사용 가능!

// TopThreeSection
const { data } = useTrendingData()
const topThree = data.slice(0, 3)

// HotTracksSection  
const { data } = useTrendingData()
const hotTracks = data.slice(3, 15)
```

---

## 🎯 성공 기준

### 완료 조건
```
✅ TOP 3에 실제 API 데이터 표시
✅ HOT TRACKS에 실제 API 데이터 표시
✅ Hero 통계가 실제 값
✅ API 실패 시 자동으로 Mock 폴백
✅ 로딩 상태 정상 작동
✅ 콘솔 에러 0개
✅ v1과 동일한 레이아웃 유지
```

---

## 📞 재개 명령어

```
다음 개발자에게:

"[CDD 재개] API 데이터 연동 작업 계속
- 진행률: 95%
- 완료: v1 레이아웃 100%, 백엔드 API 확인
- 다음: useTrendingData Hook 생성 → 컴포넌트 연동
- 시간: 30-40분
- 파일: useTrendingData.ts, TopThreeSection.tsx, HotTracksSection.tsx"
```

---

**작성:** 시니어 개발자  
**검토:** 총괄 PM  
**상태:** 🔥 즉시 재개 가능  
**다음 작업:** useTrendingData Hook 생성부터 시작
