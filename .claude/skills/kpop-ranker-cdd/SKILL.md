# 🎵 K-POP Ranker CDD Skill

**버전:** 1.0  
**작성일:** 2025-10-24  
**목적:** K-POP Ranker v2 프로젝트 전용 CDD 자동화 스킬

---

## 📚 스킬 개요

이 스킬은 K-POP Ranker v2 프로젝트의 **Checkpoint-Driven Development (CDD)** 방법론을 자동화합니다.

### 핵심 기능
- ✅ Task 시작 자동화
- ✅ Git 커밋 자동화
- ✅ 진행 상황 추적
- ✅ 재시작 프롬프트 자동 생성
- ✅ 일일 보고서 생성

---

## 🎯 프로젝트 정보

### 기본 정보
```yaml
프로젝트명: K-POP Ranker v2
위치: C:\project\kpopranker-v2
Phase: 3 (배포 및 최적화)
개발 방식: CDD 2.0, 로컬 중심, GitHub 미사용
```

### 완료 현황
```yaml
Phase 1: 100% (코어 모듈)
  - Normalizer (정규화 시스템)
  - Matcher (매칭 시스템)
  - Crawler Base (크롤러 기반)
  - Pipeline (통합 파이프라인)

Phase 2: 100% (API + Frontend)
  - Epic 5: API Server (FastAPI 8개 엔드포인트)
  - Epic 6: Frontend (Next.js 3페이지, 20컴포넌트)

Phase 3: 0% (배포 및 최적화)
  - Task 5.1: 배포 시스템
  - Task 5.2: 성능 최적화
  - Task 5.3: 모니터링 시스템
```

---

## 🚀 사용 방법

### 1. 작업 시작
```
@kpop-ranker-cdd 오늘 작업을 시작해줘
```

**자동 실행:**
1. Git 상태 확인
2. 진행 중인 Task 로드
3. 프로젝트 현황 표시
4. 오늘 할 일 제안

---

### 2. Task 개발
```
@kpop-ranker-cdd Task 5.1을 개발해줘
```

**자동 실행:**
1. Task 5.1 스펙 로드
2. Git 브랜치 생성 (feature/task-5-1)
3. 파일 구조 생성
4. 개발 진행
5. 30분마다 자동 커밋
6. 완료 시 재시작 프롬프트 생성

---

### 3. Git 자동 커밋
```
@kpop-ranker-cdd 변경사항을 커밋해줘
```

**자동 실행:**
1. git status 확인
2. 변경된 파일 분석
3. 의미있는 커밋 메시지 생성
4. git add . && git commit
5. 커밋 결과 보고

---

### 4. 진행 상황 저장
```
@kpop-ranker-cdd 진행 상황을 저장해줘
```

**자동 실행:**
1. 현재 Task 진행률 계산
2. Memory에 저장
3. 개발연속성 문서 업데이트
4. 다음 작업 제안

---

### 5. 하루 마무리
```
@kpop-ranker-cdd 오늘 작업을 마무리해줘
```

**자동 실행:**
1. 미커밋 변경사항 커밋
2. 진행 상황 저장
3. 일일 보고서 생성
4. 내일 할 일 정리
5. Memory 업데이트

---

### 6. 재시작 프롬프트 생성
```
@kpop-ranker-cdd Task 5.1 재시작 프롬프트를 만들어줘
```

**자동 실행:**
1. Task 5.1 완료 내용 분석
2. CDD 표준 양식 적용
3. 자기 완결적 프롬프트 생성
4. restart_prompts/task_5_1.md 저장
5. 다음 Task 프롬프트 준비

---

## 📋 Task 목록 (Phase 3)

### Task 5.1: 배포 시스템
```yaml
목표: Vercel + PM2 배포 구축
시간: 2-3시간
우선순위: 🔥🔥🔥🔥🔥

체크리스트:
- [ ] Vercel 프론트엔드 배포
- [ ] PM2 백엔드 배포
- [ ] 도메인 연결 (kpopranker-v2.vercel.app)
- [ ] 환경 변수 설정
- [ ] CI/CD 파이프라인
```

### Task 5.2: 성능 최적화
```yaml
목표: < 100ms API, < 2초 페이지 로드
시간: 2-3시간
우선순위: 🔥🔥🔥🔥

체크리스트:
- [ ] API 캐싱 (Redis)
- [ ] CDN 설정 (이미지)
- [ ] 코드 스플리팅
- [ ] Gzip 압축
- [ ] 성능 벤치마크
```

### Task 5.3: 모니터링 시스템
```yaml
목표: 실시간 모니터링 & 알림
시간: 2-3시간
우선순위: 🔥🔥🔥

체크리스트:
- [ ] 로깅 시스템 (Winston)
- [ ] 에러 추적 (Sentry)
- [ ] 성능 모니터링
- [ ] 알림 시스템
- [ ] 대시보드
```

---

## 🔧 자동화 규칙

### Git 커밋 규칙
```
✅ 30분마다 자동 커밋
✅ 커밋 메시지 형식:
   "Task X.Y: [작업 내용] - [진행률]%"
   
예시:
- "Task 5.1: Vercel 배포 설정 추가 - 25%"
- "Task 5.1: PM2 설정 완료 - 50%"
- "Task 5.1: 배포 시스템 완성 - 100%"
```

### 파일 생성 규칙
```
✅ 모든 파일은 C:\project\kpopranker-v2 내에
✅ Task별 폴더 구조:
   - backend/ (백엔드 코드)
   - frontend/ (프론트엔드 코드)
   - docs/ (문서)
   - tests/ (테스트)
```

### CDD 프롬프트 규칙
```
✅ 완전 자기 완결적
✅ CDD 2.0 설명 포함
✅ Task 스펙 완전 포함
✅ 실행 단계 명확
✅ 3분 만에 온보딩 가능
```

---

## 📊 진행 상황 추적

### 현재 상태
```yaml
Phase: 3
Epic: 7 (배포)
Task: 5.1 (대기 중)
진행률: 0%
```

### 자동 업데이트
```
✅ Task 시작 시 → Memory 업데이트
✅ 25%마다 → 개발연속성 문서 업데이트
✅ Task 완료 시 → 재시작 프롬프트 생성
✅ 하루 종료 시 → 일일 보고서 생성
```

---

## 🎯 품질 기준

### 코드 품질
```python
# ✅ Docstring 필수
def deploy_to_vercel(project_path: str) -> bool:
    """
    Vercel에 프로젝트를 배포합니다.
    
    Args:
        project_path: 프로젝트 경로
        
    Returns:
        배포 성공 여부
    """
    pass

# ✅ 타입 힌트 사용
from typing import List, Dict, Optional

# ✅ Task ID 명시
# 📦 Task 5.1: Vercel 배포 설정
```

### 테스트 품질
```
✅ 90%+ 커버리지
✅ pytest 통과
✅ 단위 + 통합 테스트
✅ 엣지 케이스 커버
```

### CDD 품질
```
✅ Git 커밋 (30분마다)
✅ 진행 상황 저장 (Memory)
✅ 재시작 프롬프트 생성
✅ 자기 완결적 프롬프트
```

---

## 🚨 금지 사항

### ❌ GitHub 관련
```
❌ GitHub에 푸시 금지
❌ GitHub 토큰 사용 금지
❌ 온라인 저장소 연결 금지
```

### ❌ 보안
```
❌ API 키 하드코딩 금지
❌ .env 파일 Git 커밋 금지
❌ 민감한 정보 로그 출력 금지
```

### ❌ 파일 시스템
```
❌ C:\project 외부 파일 생성 금지
❌ 시스템 폴더 수정 금지
❌ 중요 파일 삭제 전 백업 필수
```

---

## 📚 참고 문서

### 핵심 문서
```
✅ README.md - 프로젝트 소개
✅ CDD_DEVELOPMENT_PLAN.md - 개발 계획
✅ TASK_TRACKER_v2.md - Task 스펙
✅ PROJECT_GUIDELINES.md - 가이드라인
```

### CDD 문서
```
✅ restart_prompts/ - 재시작 프롬프트
✅ checkpoints/ - 체크포인트
✅ 개발연속성_진행상황_*.md - 진행 상황
```

---

## 🔄 워크플로우 예시

### 일일 루틴
```
1. "오늘 작업을 시작해줘"
   → Git 상태 + 진행 현황 + 할 일

2. "Task 5.1을 개발해줘"
   → 브랜치 생성 + 개발 + 자동 커밋

3. "진행 상황을 저장해줘"
   → Memory + 문서 업데이트

4. "오늘 작업을 마무리해줘"
   → 커밋 + 보고서 + 내일 계획
```

### Task 개발 루틴
```
1. Task 스펙 로드
2. Git 브랜치 생성
3. 파일 구조 생성
4. 코드 개발 (30분마다 커밋)
5. 테스트 작성
6. Task 완료
7. 재시작 프롬프트 생성
```

---

## 💡 팁 & 트릭

### 빠른 명령어
```
"5.1 시작" → Task 5.1 시작
"커밋" → Git 커밋
"상태" → 프로젝트 현황
"저장" → 진행 상황 저장
"마무리" → 하루 마무리
```

### Memory 활용
```
"Task 5.1 진행 중"을 기억해줘
"다음은 PM2 설정"을 기억해줘
"내일 할 일: Vercel 도메인 연결"
```

### 자동화 활용
```
"30분마다 커밋하면서 개발해줘"
"1시간마다 진행 상황 저장해줘"
"작업 완료 시 자동으로 프롬프트 생성해줘"
```

---

## 🎊 사용 시나리오

### 시나리오 1: 새 Task 시작
```
User: @kpop-ranker-cdd Task 5.1을 시작해줘

Claude:
✅ Task 5.1 스펙 로드
✅ Git 브랜치 생성 (feature/task-5-1)
✅ 파일 구조 준비
✅ 개발 시작!

Task 5.1: 배포 시스템 구축
목표: Vercel + PM2 배포
예상 시간: 2-3시간

Step 1: Vercel 프론트엔드 배포...
```

### 시나리오 2: 개발 중 커밋
```
User: @kpop-ranker-cdd 커밋해줘

Claude:
✅ 변경된 파일 분석
✅ 커밋 메시지 생성
✅ Git 커밋 실행

Committed: "Task 5.1: Vercel 배포 설정 추가 - 25%"
- frontend/vercel.json (신규)
- frontend/package.json (수정)
```

### 시나리오 3: 하루 마무리
```
User: @kpop-ranker-cdd 오늘 작업을 마무리해줘

Claude:
✅ 미커밋 변경사항 커밋
✅ Task 5.1 진행률: 50%
✅ 일일 보고서 생성
✅ Memory 업데이트

[일일 보고서]
- Task: 5.1 배포 시스템
- 진행: 50% (Vercel 완료, PM2 남음)
- 커밋: 5개
- 내일: PM2 설정 + 테스트
```

---

## 🚀 즉시 사용 가능!

이 스킬을 활성화하면:
- ✅ Task 자동화
- ✅ Git 자동 관리
- ✅ 진행 상황 자동 추적
- ✅ CDD 완전 자동화

**생산성 3배 향상!** 🎉

---

**작성자:** AI 개발팀  
**버전:** 1.0  
**상태:** ✅ 즉시 사용 가능
