# 🚀 AdSense 빠른 시작 가이드

## ✅ 완료된 작업
- AdSense 컴포넌트 구현 완료
- 메인 페이지에 3곳 광고 배치 완료
- _document.tsx에 AdSense 스크립트 통합 완료
- 환경 변수 설정 완료 (ca-pub-1636519993066011)

## 🎯 지금 바로 해야 할 3가지

### 1️⃣ AdSense 대시보드에서 광고 단위 생성
https://adsense.google.com → 광고 → 개요 → 광고 단위 기준 → 디스플레이 광고

**3개 생성:**
- KPOP_Search_Bottom (검색 하단)
- KPOP_Content_Middle (콘텐츠 중간)
- KPOP_Content_Bottom (콘텐츠 하단)

각 광고 단위의 **광고 슬롯 ID (숫자)**를 복사하세요.

---

### 2️⃣ 코드에 슬롯 ID 적용

**파일: `src/pages/index.tsx`**

다음 3곳을 찾아서 수정:

```tsx
// 1. 약 316번째 줄
<AdUnit adSlot="YOUR_AD_SLOT_1" ... />
// ↓ 변경
<AdUnit adSlot="1234567890" ... />  // 실제 슬롯 ID로 변경

// 2. 약 439번째 줄
<AdUnit adSlot="YOUR_AD_SLOT_2" ... />
// ↓ 변경
<AdUnit adSlot="1234567890" ... />  // 실제 슬롯 ID로 변경

// 3. 약 547번째 줄
<AdUnit adSlot="YOUR_AD_SLOT_3" ... />
// ↓ 변경
<AdUnit adSlot="1234567890" ... />  // 실제 슬롯 ID로 변경
```

---

### 3️⃣ 빌드 & 배포

```bash
# 1. 로컬 테스트 (선택사항)
npm run dev
# http://localhost:3000 접속해서 확인

# 2. 프로덕션 빌드
npm run build

# 3. 서버 배포
scp -r out/* chargeap@d11475.sgp1.stableserver.net:~/kpop.chargeapp.net/
```

---

## ⏱️ 광고 표시 시간

- **슬롯 ID 적용**: 즉시
- **Google 검토**: 1-24시간
- **광고 노출 시작**: 검토 완료 후

💡 처음 1-2일은 빈 광고 공간이 표시될 수 있습니다 (정상입니다!)

---

## 📚 더 자세한 내용

전체 가이드: [ADSENSE_ACTIVATION_GUIDE.md](./ADSENSE_ACTIVATION_GUIDE.md)

---

**작성일**: 2025-11-20
