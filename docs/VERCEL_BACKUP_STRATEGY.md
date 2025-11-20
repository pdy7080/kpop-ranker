# Vercel 배포 백업 및 복구 전략

## 목적
Google AdSense 통합 등 중요한 변경사항을 배포하기 전에 기존 배포 버전을 백업하여, 문제 발생 시 신속하게 이전 버전으로 복구할 수 있도록 합니다.

---

## 1. Vercel 배포 백업 방법

### 방법 1: Git 태그를 통한 백업 (권장)

#### 1.1 현재 상태 태그 생성
```bash
cd C:\project\kpopranker

# 현재 커밋에 백업 태그 생성
git tag -a v2.0.0-pre-adsense -m "Backup before Google AdSense integration"

# 태그를 원격 저장소에 푸시
git push origin v2.0.0-pre-adsense
```

#### 1.2 백업 확인
```bash
# 로컬 태그 확인
git tag -l

# 태그된 커밋 정보 확인
git show v2.0.0-pre-adsense
```

#### 장점
- Git 히스토리에 영구 보존
- 간단한 명령어로 특정 시점으로 복구 가능
- Vercel은 Git 저장소의 모든 커밋/태그에서 배포 가능

---

### 방법 2: Vercel 배포 스냅샷 활용

Vercel은 모든 배포 기록을 자동으로 보관합니다.

#### 2.1 현재 프로덕션 배포 URL 확인
1. Vercel Dashboard 접속: https://vercel.com/dashboard
2. 프로젝트 선택 (kpop-ranker-v2)
3. "Deployments" 탭에서 현재 프로덕션 배포 확인
4. 배포 URL 복사 (예: `kpop-ranker-v2-abc123.vercel.app`)

#### 2.2 배포 정보 문서화
```bash
# 배포 정보를 파일로 저장
echo "Production Deployment (Pre-AdSense)" > deployment_backup.txt
echo "Date: $(date)" >> deployment_backup.txt
echo "Git Commit: $(git rev-parse HEAD)" >> deployment_backup.txt
echo "Git Branch: $(git branch --show-current)" >> deployment_backup.txt
echo "Vercel URL: [복사한 URL]" >> deployment_backup.txt
```

#### 장점
- Vercel UI에서 원클릭으로 이전 배포로 롤백 가능
- 배포 히스토리 자동 보관 (무제한)

---

### 방법 3: 로컬 소스 코드 백업

#### 3.1 전체 프로젝트 백업
```bash
cd C:\project

# 날짜 포함 백업 폴더 생성
$backup_date = Get-Date -Format "yyyyMMdd_HHmmss"
$backup_path = "kpopranker_backup_$backup_date"

# 프로젝트 전체 복사 (node_modules 제외)
robocopy kpopranker $backup_path /E /XD node_modules .next .git

# 백업 완료 확인
dir $backup_path
```

#### 3.2 압축 백업 (옵션)
```bash
# PowerShell에서 ZIP 압축
Compress-Archive -Path "kpopranker_backup_*" -DestinationPath "kpopranker_backup_$backup_date.zip"
```

#### 장점
- 완전한 오프라인 백업
- Git 외부에 독립적인 백업본 유지

---

## 2. 복구 전략

### 시나리오 1: Git 태그로 복구

AdSense 통합 후 문제가 발생한 경우:

```bash
cd C:\project\kpopranker

# 1. 현재 변경사항 임시 저장 (필요 시)
git stash save "AdSense integration - rollback"

# 2. 백업 태그로 체크아웃
git checkout v2.0.0-pre-adsense

# 3. 새 브랜치 생성 (옵션)
git checkout -b rollback-from-adsense

# 4. Vercel에 강제 푸시
git push origin rollback-from-adsense --force
```

Vercel은 자동으로 새 커밋을 감지하고 배포를 시작합니다.

---

### 시나리오 2: Vercel Dashboard에서 복구

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - 프로젝트: kpop-ranker-v2

2. **Deployments 탭 이동**
   - 모든 배포 기록 확인
   - "Pre-AdSense" 배포 찾기 (deployment_backup.txt 참고)

3. **롤백 실행**
   - 해당 배포의 "..." 메뉴 클릭
   - "Promote to Production" 선택
   - 확인

**결과**: 1-2분 내에 이전 버전으로 자동 복구

---

### 시나리오 3: 로컬 백업에서 복구

```bash
cd C:\project

# 1. 현재 kpopranker 폴더를 임시 이름으로 변경
ren kpopranker kpopranker_failed

# 2. 백업 폴더 복원
robocopy kpopranker_backup_[날짜] kpopranker /E

# 3. node_modules 재설치
cd kpopranker
npm install

# 4. Git 상태 확인 후 푸시
git status
git push origin master
```

---

## 3. 권장 백업 워크플로우

### AdSense 통합 전 체크리스트

```bash
# Step 1: 현재 상태 커밋
cd C:\project\kpopranker
git add .
git commit -m "Pre-AdSense integration backup"

# Step 2: Git 태그 생성
git tag -a v2.0.0-pre-adsense -m "Backup before Google AdSense integration ($(date))"
git push origin v2.0.0-pre-adsense
git push origin master

# Step 3: Vercel 프로덕션 URL 기록
echo "Production URL before AdSense:" > BACKUP_INFO.txt
echo "$(date)" >> BACKUP_INFO.txt
echo "Commit: $(git rev-parse HEAD)" >> BACKUP_INFO.txt
echo "Vercel Dashboard: https://vercel.com/dashboard" >> BACKUP_INFO.txt

# Step 4: 로컬 백업 (옵션)
cd C:\project
$backup_date = Get-Date -Format "yyyyMMdd_HHmmss"
robocopy kpopranker "kpopranker_backup_$backup_date" /E /XD node_modules .next .git
```

---

## 4. 복구 테스트 계획

### 안전한 테스트 방법

1. **Preview 브랜치 활용**
   ```bash
   # AdSense 통합을 별도 브랜치에서 작업
   git checkout -b feature/google-adsense

   # 변경사항 커밋 및 푸시
   git add .
   git commit -m "Add Google AdSense integration"
   git push origin feature/google-adsense
   ```

2. **Vercel Preview 배포 확인**
   - Vercel이 자동으로 Preview URL 생성
   - Preview URL에서 AdSense 정상 작동 확인
   - 문제 없으면 master 브랜치에 병합

3. **점진적 롤아웃**
   ```bash
   # Preview 테스트 통과 후 master에 병합
   git checkout master
   git merge feature/google-adsense
   git push origin master
   ```

---

## 5. 비상 연락망 및 에스컬레이션

### 문제 발생 시 우선순위

1. **즉시 롤백** (5분 내)
   - Vercel Dashboard → "Promote to Production" (이전 배포)

2. **원인 분석** (30분 내)
   - Vercel 배포 로그 확인
   - 브라우저 콘솔 에러 확인
   - 백엔드 API 연결 상태 확인

3. **수정 및 재배포** (1시간 내)
   - 로컬에서 문제 수정
   - Preview 브랜치에서 재테스트
   - 검증 완료 후 프로덕션 배포

---

## 6. 백업 보관 정책

### Git 태그
- **보관 기간**: 영구 (삭제하지 않음)
- **명명 규칙**: `v[version]-[description]`
  - 예: `v2.0.0-pre-adsense`, `v2.1.0-stable`

### Vercel 배포
- **자동 보관**: Vercel이 모든 배포 기록 보관
- **수동 관리**: 중요한 배포는 deployment_backup.txt에 기록

### 로컬 백업
- **보관 기간**: 최소 1개월
- **위치**: `C:\project\kpopranker_backup_*`
- **정리 주기**: 월 1회 (오래된 백업 삭제)

---

## 7. 참고 자료

### Vercel 공식 문서
- Deployments: https://vercel.com/docs/concepts/deployments/overview
- Rollbacks: https://vercel.com/docs/concepts/deployments/rollbacks

### Git 태그 관리
- Git Tagging: https://git-scm.com/book/en/v2/Git-Basics-Tagging

---

**작성일**: 2025-11-17
**버전**: 1.0
**담당자**: Senior Developer
