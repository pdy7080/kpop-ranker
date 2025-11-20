"""
상태 복원 도구
대화 시작 시 이전 상태를 빠르게 확인
"""
import json
from pathlib import Path
from datetime import datetime

def restore_state():
    """
    저장된 상태를 불러와서 화면에 표시
    
    사용법:
        python .dev/restore_state.py
    """
    checkpoint_dir = Path(__file__).parent / "checkpoints"
    latest_file = checkpoint_dir / "latest.json"
    
    if not latest_file.exists():
        print("❌ 저장된 상태가 없습니다.")
        print("💡 Tip: python .dev/save_state.py \"메시지\" 로 상태를 저장하세요.")
        return None
    
    # 저장된 상태 불러오기
    with open(latest_file, "r", encoding="utf-8") as f:
        state = json.load(f)
    
    # 화면에 표시
    print("=" * 60)
    print("🔄 이전 개발 상태 복원")
    print("=" * 60)
    print()
    
    # 시간 경과 계산
    saved_time = datetime.fromisoformat(state["timestamp"])
    elapsed = datetime.now() - saved_time
    hours = int(elapsed.total_seconds() // 3600)
    minutes = int((elapsed.total_seconds() % 3600) // 60)
    
    print(f"⏰ 저장 시간: {saved_time:%Y-%m-%d %H:%M:%S}")
    print(f"⏱️  경과 시간: {hours}시간 {minutes}분 전")
    print()
    
    print("📝 마지막 메시지:")
    print(f"   {state['message']}")
    print()
    
    print("📍 작업 위치:")
    print(f"   {state['location']}")
    print()
    
    # CURRENT_STATE.md도 읽어서 표시
    current_state_file = Path(__file__).parent / "CURRENT_STATE.md"
    if current_state_file.exists():
        print("📄 현재 상태 파일:")
        print(f"   {current_state_file}")
        print()
        print("🎯 다음 단계:")
        print("   1. .dev/CURRENT_STATE.md 파일을 확인하세요")
        print("   2. 메모리 MCP로 추가 컨텍스트 확인:")
        print("      memory:search_nodes('current_task')")
        print("   3. 즉시 개발 시작!")
    
    print()
    print("=" * 60)
    
    return state

if __name__ == "__main__":
    restore_state()
