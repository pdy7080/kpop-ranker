# 🎉 Google AdSense 활성화 가이드

## 축하합니다! 🎊

Google AdSense 심사가 통과되었습니다! 이제 사이트에서 광고를 활성화하고 수익을 창출할 수 있습니다.

---

## ✅ 이미 완료된 작업

### 1. 환경 변수 설정 ✓
- `.env.local` 파일에 Publisher ID 설정 완료
- Publisher ID: `ca-pub-1636519993066011`

### 2. AdSense 스크립트 통합 ✓
- `src/pages/_document.tsx`에 AdSense 스크립트 추가 완료
- 모든 페이지에서 자동으로 AdSense 스크립트 로드

### 3. AdSense 컴포넌트 구현 ✓
다음 컴포넌트들이 준비되어 있습니다:
- `src/components/AdSense/AdSenseScript.tsx` - 전역 스크립트 로더
- `src/components/AdSense/AdUnit.tsx` - 디스플레이 광고 컴포넌트
- `src/components/AdSense/InFeedAd.tsx` - 인피드 광고 컴포넌트

### 4. 메인 페이지 광고 배치 ✓
`src/pages/index.tsx`에 3곳에 광고 슬롯 준비 완료:
- **광고 1**: 검색 섹션 하단
- **광고 2**: TOP 3와 HOT TRACKS 사이
- **광고 3**: HOT TRACKS 하단

---

## 📋 지금 해야 할 작업

### 🎯 단계 1: AdSense 대시보드에서 광고 단위 생성

1. **Google AdSense 대시보드 접속**
   - 주소: https://adsense.google.com
   - Google 계정으로 로그인

2. **광고 단위 생성하기**
   - 왼쪽 메뉴에서 **광고 → 개요** 클릭
   - **광고 단위 기준** 선택
   - **디스플레이 광고** 선택

3. **3개의 광고 단위를 생성하세요:**

   #### 광고 단위 1: 검색 하단 배너
   ```
   이름: KPOP_Search_Bottom
   광고 유형: 디스플레이 광고
   광고 크기: 반응형
   ```

   #### 광고 단위 2: 콘텐츠 중간
   ```
   이름: KPOP_Content_Middle
   광고 유형: 디스플레이 광고
   광고 크기: 반응형
   ```

   #### 광고 단위 3: 콘텐츠 하단
   ```
   이름: KPOP_Content_Bottom
   광고 유형: 디스플레이 광고
   광고 크기: 반응형
   ```

4. **광고 슬롯 ID 복사하기**
   - 각 광고 단위를 생성한 후 표시되는 **광고 슬롯 ID**를 복사하세요
   - 슬롯 ID는 숫자로만 이루어져 있습니다 (예: `1234567890`)

---

### 🎯 단계 2: 광고 슬롯 ID를 코드에 적용

복사한 광고 슬롯 ID를 다음 파일에 적용하세요:

**파일: `src/pages/index.tsx`**

다음 3개의 `YOUR_AD_SLOT_X`를 실제 슬롯 ID로 교체하세요:

```tsx
// 광고 1: 검색 섹션 하단 (약 314번째 줄)
<AdUnit
  adSlot="YOUR_AD_SLOT_1"  // ← 여기를 실제 슬롯 ID로 변경
  adFormat="auto"
  fullWidthResponsive={true}
  className="text-center"
/>

// 광고 2: TOP 3와 HOT TRACKS 사이 (약 437번째 줄)
<AdUnit
  adSlot="YOUR_AD_SLOT_2"  // ← 여기를 실제 슬롯 ID로 변경
  adFormat="auto"
  fullWidthResponsive={true}
  className="text-center"
/>

// 광고 3: HOT TRACKS 하단 (약 545번째 줄)
<AdUnit
  adSlot="YOUR_AD_SLOT_3"  // ← 여기를 실제 슬롯 ID로 변경
  adFormat="auto"
  fullWidthResponsive={true}
  className="text-center"
/>
```

**변경 예시:**
```tsx
// 변경 전
<AdUnit adSlot="YOUR_AD_SLOT_1" ... />

// 변경 후 (예: 슬롯 ID가 1234567890인 경우)
<AdUnit adSlot="1234567890" ... />
```

---

### 🎯 단계 3: 로컬에서 테스트

광고 슬롯 ID를 적용한 후, 로컬에서 테스트하세요:

```bash
# 개발 서버 실행
npm run dev
```

브라우저에서 확인:
- 주소: http://localhost:3000
- 브라우저 콘솔(F12)을 열어 확인

**확인사항:**
- ✅ 콘솔에 "✅ AdSense script loaded" 메시지가 나타나는지 확인
- ✅ 광고 공간이 페이지에 표시되는지 확인
- ⚠️ **참고**: 로컬 환경(localhost)에서는 실제 광고가 표시되지 않습니다
- ⚠️ 광고 차단 플러그인이 활성화되어 있다면 비활성화하세요

---

### 🎯 단계 4: 프로덕션 빌드

로컬 테스트가 완료되면 프로덕션 빌드를 생성하세요:

```bash
# 프로덕션 빌드 생성
npm run build

# 빌드가 성공하는지 확인
# out/ 폴더에 정적 파일이 생성됩니다
```

**빌드 에러가 발생하면:**
```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 에러 메시지를 확인하고 수정하세요
```

---

### 🎯 단계 5: 서버에 배포

#### 옵션 A: 직접 배포 (권장)

```bash
# 1. 로컬에서 빌드
npm run build

# 2. 빌드 결과물을 서버로 업로드
scp -r out/* chargeap@d11475.sgp1.stableserver.net:~/kpop.chargeapp.net/

# 3. 서버 SSH 접속
ssh chargeap@d11475.sgp1.stableserver.net

# 4. 파일 권한 확인
cd ~/kpop.chargeapp.net
ls -la

# 5. 웹 서버 재시작 (필요한 경우)
# (서버 설정에 따라 다를 수 있음)
```

#### 옵션 B: Git을 통한 배포

```bash
# 1. 로컬에서 변경사항 커밋
git add .
git commit -m "Enable Google AdSense with ad slots

- Add AdSense script to _document.tsx
- Place ads on main page (3 locations)
- Configure ad slot IDs from AdSense dashboard

🤖 Generated with Claude Code"

# 2. 원격 저장소에 푸시 (선택사항)
git push origin main

# 3. 서버에서 업데이트
ssh chargeap@d11475.sgp1.stableserver.net
cd ~/kpop.chargeapp.net
git pull origin main
npm run build
```

---

### 🎯 단계 6: 프로덕션 환경 확인

배포 후 실제 사이트에서 광고가 표시되는지 확인하세요:

**확인할 URL:**
- https://www.kpopranker.com

**확인사항:**
1. ✅ 페이지가 정상적으로 로드되는지
2. ✅ 광고 공간이 3곳에 표시되는지
3. ✅ 광고가 페이지 디자인과 잘 어울리는지
4. ✅ 모바일과 데스크톱 모두에서 반응형으로 작동하는지

**브라우저 콘솔 확인:**
- F12를 눌러 개발자 도구 열기
- Console 탭에서 AdSense 관련 에러가 없는지 확인

---

## ⏱️ 광고 표시 대기 시간

**중요:** 광고를 활성화한 직후에는 광고가 바로 표시되지 않을 수 있습니다.

- ✅ 광고 슬롯 ID 적용 완료
- ⏳ Google의 광고 검토: **1-24시간** 소요 가능
- ⏳ 광고 노출 시작: 검토 완료 후 자동 시작

**빈 광고 공간이 표시되는 경우:**
- 정상적인 현상입니다
- Google이 사이트를 검토하고 승인하는 중입니다
- 1-2일 정도 기다려주세요

---

## 🎯 광고 최적화 팁

### 광고 배치 모범 사례
- ✅ **콘텐츠와 광고의 균형 유지**: 광고가 너무 많으면 사용자 경험이 나빠집니다
- ✅ **자연스러운 위치 선택**: 콘텐츠 흐름을 방해하지 않는 위치에 배치
- ✅ **첫 화면에 광고 1개 이하**: Above the fold에는 1개만 배치
- ⚠️ **AdSense 정책 준수**: 광고를 너무 많이 배치하지 마세요

### 현재 광고 배치 위치 (최적화됨)
1. **검색 하단**: 사용자가 검색 후 자연스럽게 보는 위치
2. **TOP 3와 HOT TRACKS 사이**: 콘텐츠 섹션 사이의 자연스러운 구분
3. **HOT TRACKS 하단**: 페이지 하단, 추가 콘텐츠 전

---

## 📊 성능 모니터링

AdSense 대시보드(https://adsense.google.com)에서 다음 지표를 모니터링하세요:

### 주요 지표
- **노출수 (Impressions)**: 광고가 표시된 횟수
- **클릭수 (Clicks)**: 광고가 클릭된 횟수
- **클릭률 (CTR)**: 클릭수 ÷ 노출수 × 100
- **페이지 RPM**: 페이지 조회수 1,000회당 예상 수익
- **예상 수익**: 현재까지의 예상 수익 금액

### 권장 확인 주기
- **매일**: 수익 및 노출수 확인
- **매주**: CTR 및 RPM 분석
- **매월**: 광고 성과 종합 분석 및 최적화

---

## 🔧 문제 해결

### 광고가 표시되지 않는 경우

1. **AdSense 계정 상태 확인**
   - https://adsense.google.com 접속
   - 계정이 활성화되어 있는지 확인
   - 정책 위반 경고가 없는지 확인

2. **광고 슬롯 ID 확인**
   - `src/pages/index.tsx`에서 슬롯 ID가 올바른지 확인
   - `YOUR_AD_SLOT_X`가 남아있지 않은지 확인
   - 슬롯 ID가 숫자로만 되어 있는지 확인

3. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - AdSense 관련 에러 메시지 확인
   - "✅ AdSense script loaded" 메시지가 나타나는지 확인

4. **광고 차단 플러그인**
   - AdBlock, uBlock 등을 비활성화하고 테스트
   - 시크릿 모드에서 테스트

5. **환경 변수 확인**
   ```bash
   # .env.local 파일 확인
   cat .env.local

   # NEXT_PUBLIC_ADSENSE_PUBLISHER_ID가 설정되어 있는지 확인
   # 값: ca-pub-1636519993066011
   ```

6. **빌드 재시도**
   ```bash
   # 캐시 삭제 후 재빌드
   rm -rf .next
   npm run build
   ```

### 빌드 에러가 발생하는 경우

```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 구체적인 에러 메시지 확인
npm run build 2>&1 | tee build-error.log

# 에러가 AdSense 컴포넌트와 관련된 경우:
# 1. src/components/AdSense/AdUnit.tsx 파일 확인
# 2. import 경로가 올바른지 확인
```

---

## 📚 추가 자료

### Google AdSense 공식 문서
- [AdSense 시작 가이드](https://support.google.com/adsense/answer/6242051)
- [광고 단위 생성 방법](https://support.google.com/adsense/answer/9274025)
- [AdSense 정책](https://support.google.com/adsense/answer/48182)
- [광고 게재 정책](https://support.google.com/adsense/answer/1346295)

### Next.js 최적화
- [Next.js Script 최적화](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
- [Next.js 환경 변수](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## ✅ 체크리스트

광고 활성화 전 아래 체크리스트를 확인하세요:

- [ ] AdSense 대시보드에서 3개의 광고 단위 생성
- [ ] 3개의 광고 슬롯 ID 복사
- [ ] `src/pages/index.tsx`에서 `YOUR_AD_SLOT_X`를 실제 슬롯 ID로 교체
- [ ] 로컬에서 테스트 (`npm run dev`)
- [ ] 브라우저 콘솔에서 "AdSense script loaded" 확인
- [ ] 프로덕션 빌드 생성 (`npm run build`)
- [ ] 빌드 에러 없는지 확인
- [ ] 서버에 배포
- [ ] 프로덕션 사이트에서 광고 공간 확인
- [ ] 모바일/데스크톱 반응형 확인
- [ ] AdSense 대시보드에서 노출수 모니터링 시작

---

## 🎊 마지막으로

축하합니다! 모든 설정이 완료되었습니다.

**다음 단계:**
1. 광고 슬롯 ID만 적용하면 됩니다
2. 빌드하고 배포하세요
3. 1-2일 후 광고가 자동으로 표시됩니다
4. AdSense 대시보드에서 수익을 확인하세요

**문제가 발생하면:**
- 이 가이드의 "문제 해결" 섹션을 참고하세요
- Google AdSense 고객센터에 문의하세요
- 빌드 에러는 콘솔 로그를 확인하세요

---

**작성일**: 2025-11-20
**버전**: v1.0
**상태**: ✅ 심사 통과, 광고 활성화 준비 완료
