# Vercel 환경 변수 설정 가이드

## 문제 상황
브라우저에서 `adsbygoogle.js` 요청이 확인되지 않음 → Vercel에 환경 변수가 설정되지 않았습니다.

## 해결 방법

### 1. Vercel Dashboard에서 환경 변수 추가

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택: `kpop-ranker`

2. **Settings → Environment Variables**
   - Settings 탭 클릭
   - 왼쪽 메뉴에서 "Environment Variables" 선택

3. **환경 변수 추가**
   ```
   Name: NEXT_PUBLIC_ADSENSE_ID
   Value: ca-pub-1636519993066011
   ```

4. **적용 환경 선택**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Save** 버튼 클릭

### 2. 재배포 (Redeploy)

환경 변수를 추가한 후 **반드시 재배포**해야 적용됩니다:

**방법 1: Vercel Dashboard에서 재배포**
1. Deployments 탭으로 이동
2. 최신 배포 (`efe23ed`) 선택
3. 오른쪽 상단 "..." 메뉴 클릭
4. **"Redeploy"** 선택
5. "Redeploy" 버튼 클릭

**방법 2: Git 커밋으로 재배포**
```bash
cd "C:\project\ai07_배포\GitHub새로클론_20250811\kpop-ranker"

# 빈 커밋으로 재배포 트리거
git commit --allow-empty -m "chore: Trigger redeploy for AdSense env var"
git push origin main
```

---

## 3. 배포 확인

재배포 완료 후 (1-2분):

1. **브라우저에서 확인**
   - www.kpopranker.com 접속
   - 개발자 도구 (F12) → Network 탭
   - 페이지 새로고침 (Ctrl+Shift+R)
   - `adsbygoogle.js` 검색

2. **HTML 소스 확인**
   - 페이지 우클릭 → "페이지 소스 보기"
   - `Ctrl+F` → "adsbygoogle" 검색
   - 다음 코드가 있어야 함:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1636519993066011" crossorigin="anonymous"></script>
   ```

---

## 트러블슈팅

### 재배포 후에도 스크립트가 로드되지 않는 경우

1. **브라우저 캐시 삭제**
   - Ctrl+Shift+Delete
   - 캐시된 이미지 및 파일 삭제
   - 하드 새로고침: Ctrl+Shift+R

2. **Vercel 빌드 로그 확인**
   - Deployments → 최신 배포 클릭
   - "Building" 로그 확인
   - 환경 변수가 빌드 시 주입되었는지 확인

3. **시크릿 모드에서 테스트**
   - Ctrl+Shift+N (Chrome)
   - 캐시 없이 깨끗한 상태에서 확인

---

## 환경 변수 확인 방법

Vercel 배포 후, 브라우저 콘솔에서 확인:
```javascript
// 브라우저 콘솔 (F12)에서 실행
console.log(process.env.NEXT_PUBLIC_ADSENSE_ID);
// 출력: ca-pub-1636519993066011
```

**주의**: `NEXT_PUBLIC_` 접두사가 없으면 클라이언트에서 접근 불가!

---

## 체크리스트

- [ ] Vercel Dashboard → Settings → Environment Variables 에서 `NEXT_PUBLIC_ADSENSE_ID` 추가
- [ ] Production, Preview, Development 모두 체크
- [ ] Save 버튼 클릭
- [ ] Redeploy 실행
- [ ] 브라우저에서 `adsbygoogle.js` 요청 확인
- [ ] HTML 소스에서 스크립트 태그 확인

---

**예상 소요 시간**: 5분 (환경 변수 설정 1분 + 재배포 2분 + 확인 2분)
