# AdSense 통합 완료 및 다음 단계

## ✅ 완료된 작업

### 1. 환경 변수 설정
- `.env.local` 파일 생성
- AdSense Publisher ID 설정: `ca-pub-1636519993066011`

### 2. AdSense 컴포넌트 생성
다음 3개의 컴포넌트를 생성했습니다:

#### `src/components/AdSense/AdSenseScript.tsx`
- 전역 AdSense 스크립트 로더
- Next.js Script 컴포넌트를 사용한 최적화된 로딩
- `strategy="afterInteractive"` - 페이지 인터랙션 후 로드

#### `src/components/AdSense/AdUnit.tsx`
- 범용 디스플레이 광고 컴포넌트
- 다양한 포맷 지원 (auto, horizontal, rectangle, vertical)
- 반응형 설정 가능

#### `src/components/AdSense/InFeedAd.tsx`
- 인피드 광고 컴포넌트
- 콘텐츠 목록 중간에 자연스럽게 삽입
- 유동적 레이아웃 (`data-ad-format="fluid"`)

### 3. Layout 통합
- `src/app/layout.tsx`에 AdSenseScript 추가
- 모든 페이지에서 AdSense 스크립트 자동 로드

### 4. 메인 페이지 광고 배치
`src/app/page.tsx`에 3곳에 광고 배치:
- **광고 1**: 검색 섹션 하단 (horizontal format)
- **광고 2**: TOP 3와 HOT TRACKS 사이 (in-feed ad)
- **광고 3**: HOT TRACKS 하단 (rectangle format)

## 📋 다음 단계

### 1. AdSense 대시보드에서 광고 단위 생성

Google AdSense 대시보드(https://adsense.google.com)에서:

1. **광고 → 광고 단위** 로 이동
2. 다음 3개의 광고 단위를 생성:

   **광고 단위 1: 검색 하단 배너**
   - 이름: `KPOP_Search_Bottom_Banner`
   - 유형: 디스플레이 광고
   - 크기: 반응형
   - 권장 형식: Horizontal

   **광고 단위 2: 콘텐츠 인피드**
   - 이름: `KPOP_Content_InFeed`
   - 유형: 인피드 광고
   - 크기: 반응형
   - 레이아웃: 인아티클

   **광고 단위 3: HOT TRACKS 하단**
   - 이름: `KPOP_HotTracks_Bottom`
   - 유형: 디스플레이 광고
   - 크기: 반응형 또는 300x250

3. 각 광고 단위에서 **광고 슬롯 ID**를 복사

### 2. 광고 슬롯 ID 적용

`src/app/page.tsx`에서 플레이스홀더를 실제 슬롯 ID로 교체:

```tsx
// 현재 (플레이스홀더)
<AdUnit adSlot="YOUR_AD_SLOT_ID_1" ... />

// 변경 후 (실제 슬롯 ID)
<AdUnit adSlot="1234567890" ... />
```

### 3. 로컬 테스트

```bash
# 개발 서버 실행 (이미 실행 중)
npm run dev

# 브라우저에서 확인
http://localhost:3007
```

**테스트 시 확인사항:**
- ✅ 브라우저 콘솔에 "✅ AdSense script loaded" 메시지 확인
- ✅ 광고 공간이 화면에 표시되는지 확인
- ⚠️ 로컬 환경에서는 실제 광고가 표시되지 않을 수 있음 (정상)
- ⚠️ 광고 차단 플러그인 비활성화 필요

### 4. 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 확인
# out/ 폴더에 정적 파일 생성됨
```

### 5. 서버 배포

#### 옵션 A: 현재 서버에 직접 배포
```bash
# 로컬에서 빌드 후
npm run build

# 서버로 업로드
scp -r out/* chargeap@d11475.sgp1.stableserver.net:~/kpop.chargeapp.net/
```

#### 옵션 B: GitHub를 통한 배포
```bash
# 로컬 변경사항 커밋
git add .
git commit -m "Add Google AdSense integration

- Add AdSense components (Script, AdUnit, InFeedAd)
- Integrate AdSense into root layout
- Place ads on main page (3 locations)
- Configure environment variables

🤖 Generated with Claude Code"

git push origin master

# 서버에서
ssh chargeap@d11475.sgp1.stableserver.net
cd ~/kpop.chargeapp.net
git pull origin master
npm install  # 새로운 의존성이 있을 경우
npm run build
```

### 6. 프로덕션 확인

배포 후 https://www.kpopranker.com 에서:
- ✅ 광고가 정상적으로 표시되는지 확인
- ✅ 광고 레이아웃이 페이지 디자인과 잘 어울리는지 확인
- ✅ 모바일/데스크톱 모두에서 반응형으로 작동하는지 확인

### 7. AdSense 검토 대기

- 새로운 사이트는 AdSense 팀의 검토가 필요할 수 있습니다
- 일반적으로 1-3일 소요
- 검토 완료 전까지 빈 광고 공간이 표시될 수 있습니다

## 🎯 광고 최적화 팁

### 광고 배치 모범 사례
- ✅ 콘텐츠와 광고의 균형 유지
- ✅ 사용자 경험을 해치지 않는 위치 선택
- ✅ 첫 화면(Above the fold)에 광고 1개 이하
- ⚠️ 광고를 너무 많이 배치하지 않기 (AdSense 정책 위반 가능)

### 성능 모니터링
AdSense 대시보드에서 모니터링할 항목:
- 노출수 (Impressions)
- 클릭수 (Clicks)
- 클릭률 (CTR)
- 페이지 RPM (Page RPM)
- 예상 수익 (Estimated Earnings)

## 📚 추가 참고자료

- [Google AdSense 시작 가이드](https://support.google.com/adsense/answer/6242051)
- [광고 단위 생성 방법](https://support.google.com/adsense/answer/9274025)
- [AdSense 정책](https://support.google.com/adsense/answer/48182)
- [Next.js Script 최적화](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)

## 🔧 문제 해결

### 광고가 표시되지 않는 경우
1. AdSense 계정 상태 확인
2. 광고 슬롯 ID가 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. 광고 차단 플러그인 비활성화
5. AdSense 정책 준수 여부 확인

### 빌드 에러 발생 시
```bash
# TypeScript 에러 확인
npm run build

# 타입 체크만
npx tsc --noEmit
```

## 📝 현재 상태

- ✅ AdSense 컴포넌트 구현 완료
- ✅ Layout 통합 완료
- ✅ 메인 페이지 광고 배치 완료
- 🔄 광고 슬롯 ID 생성 대기 중
- 🔄 프로덕션 배포 대기 중

---

**다음 작업**: AdSense 대시보드에서 광고 단위 생성 및 슬롯 ID 받기
