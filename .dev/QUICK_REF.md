# ⚡ 빠른 참조 카드 (Quick Reference)

**용도:** 항상 열어두고 필요할 때 참조

---

## 🚀 개발 시작 루틴 (1분)

```bash
# 1. 작업 디렉토리 이동
cd C:\project\kpopranker-v2

# 2. 상태 복원
python .dev\restore_state.py

# 3. 현재 상태 확인
# .dev\CURRENT_STATE.md 읽기

# 4. 메모리 확인 (클로드에게)
"memory:search_nodes('current_task')로 이전 상태 확인해줘"

# 5. 개발 시작!
```

---

## ⏰ 30분 체크포인트 (30초)

```
✅ 완료: [뭐했나?]
🎯 다음: [뭐할 건가?]
⚠️ 이슈: [막힌 거?]

# 메모리 업데이트 (클로드에게)
"30분 체크포인트 저장해줘"
```

---

## 💾 대화 종료 루틴 (1분)

```bash
# 1. 상태 저장
python .dev\save_state.py "현재 작업 내용 한 줄 요약"

# 2. CURRENT_STATE.md 업데이트
# 정확한 재시작 지점 기록

# 3. 메모리 저장 (클로드에게)
"지금까지 작업 메모리에 저장하고 CURRENT_STATE.md 업데이트해줘"

# 끝!
```

---

## 🧪 테스트 명령어

```bash
# 단일 파일 테스트
python -m pytest tests/unit/test_[이름].py -v

# 전체 단위 테스트
python -m pytest tests/unit/ -v

# 특정 테스트만
python -m pytest tests/unit/test_[이름].py::test_[함수명] -v

# Coverage 포함
python -m pytest tests/unit/ --cov=packages --cov-report=term-missing
```

---

## 📁 MCP 파일 명령어

```
# 파일 생성
filesystem:write_file
path: C:\project\kpopranker-v2\[경로]
content: [내용]

# 파일 읽기
filesystem:read_text_file
path: C:\project\kpopranker-v2\[경로]

# 디렉토리 생성
filesystem:create_directory
path: C:\project\kpopranker-v2\[경로]

# 디렉토리 목록
filesystem:list_directory
path: C:\project\kpopranker-v2\[경로]
```

---

## 🧠 메모리 MCP 명령어

```
# 검색
memory:search_nodes("current_task")
memory:search_nodes("recent_decisions")

# 추가
memory:add_observations([{
    "entityName": "current_task",
    "contents": ["진행률: 60%", "현재: 테스트 작성"]
}])

# 생성
memory:create_entities([{
    "name": "Task_2_4",
    "entityType": "development_task",
    "observations": ["Task 2.4 시작", "별칭 관리 구현"]
}])
```

---

## 🐛 문제 해결

### 테스트 실패
```
1. 에러 메시지 정확히 읽기
2. import 경로 확인
3. 파일 위치 확인
4. Python 환경 확인
```

### 대화창 끊김
```
1. restore_state.py 실행
2. CURRENT_STATE.md 확인
3. 메모리 검색
4. 즉시 재시작!
```

### 컨텍스트 손실
```
1. "이전 작업 메모리에서 찾아줘"
2. CURRENT_STATE.md의 "중요 결정사항" 확인
3. 필요시 이전 체크포인트 확인
```

---

## 📊 핵심 파일 위치

```
프로젝트 루트: C:\project\kpopranker-v2\

상태 관리:
├── .dev\CURRENT_STATE.md      ← 현재 상태
├── .dev\NEXT_TASK.md           ← 다음 할 일
├── .dev\QUICK_REF.md           ← 이 파일
└── .dev\checkpoints\           ← 체크포인트들

핵심 문서:
├── DEVELOPMENT_RECOVERY_PLAN.md ← 전체 계획
├── TASK_TRACKER_v2.md           ← Task 목록
└── PROJECT_GUIDELINES.md        ← 개발 가이드

코드:
├── packages\core\               ← 핵심 모듈
└── tests\unit\                  ← 테스트
```

---

## ⚡ 긴급 상황

### 프로젝트 완전 혼란 (SOS)
```
1. DEVELOPMENT_RECOVERY_PLAN.md 읽기
2. .dev\CURRENT_STATE.md 초기화
3. 메모리 검색: memory:search_nodes("current_task")
4. 가장 최근 체크포인트 확인
5. 처음부터 다시 시작 (30분 소요)
```

### 성능 저하 느낌
```
✅ 체크리스트:
□ 30분 규칙 지키고 있나?
□ CURRENT_STATE.md 업데이트하나?
□ 메모리 MCP 활용하나?
□ 문서 3개만 참조하나?

→ 안 되면 DEVELOPMENT_RECOVERY_PLAN.md 다시 읽기
```

---

## 💡 성공 공식

```
🔥 생산성 = (간단한 프로세스) × (지속적 실행)

핵심 3가지:
1. 30분마다 체크포인트
2. CURRENT_STATE.md 항상 최신
3. 메모리 MCP 적극 활용

이것만 지키면 → 대화창 끊겨도 3분 내 복구!
```

---

## 📞 추가 도움

```
상세 가이드: DEVELOPMENT_RECOVERY_PLAN.md
전체 Task: TASK_TRACKER_v2.md
프로젝트 구조: PROJECT_GUIDELINES.md
```

---

**💪 당신은 할 수 있습니다!**

간단하게 유지하고, 30분 규칙만 지키면  
대화창 길이 문제는 더 이상 문제가 아닙니다!

---

**최종 업데이트:** 2025-10-27  
**버전:** v1.0  
**상태:** ✅ 즉시 사용 가능
