"""
간단한 상태 저장 도구
대화 종료 시 현재 상태를 빠르게 저장
"""
import json
from datetime import datetime
from pathlib import Path

def save_state(message: str = ""):
    """
    현재 상태를 빠르게 저장
    
    사용법:
        python .dev/save_state.py "Task 2.4 진행 중, 50% 완성"
    """
    checkpoint_dir = Path(__file__).parent / "checkpoints"
    checkpoint_dir.mkdir(exist_ok=True)
    
    # 현재 상태 저장
    state = {
        "timestamp": datetime.now().isoformat(),
        "message": message,
        "location": Path.cwd().as_posix()
    }
    
    # latest.json에 저장 (가장 최근 상태)
    latest_file = checkpoint_dir / "latest.json"
    with open(latest_file, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    
    # 타임스탬프 파일에도 저장 (히스토리)
    timestamp_file = checkpoint_dir / f"state_{datetime.now():%Y%m%d_%H%M%S}.json"
    with open(timestamp_file, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    
    print(f"✅ 상태 저장 완료!")
    print(f"📝 메시지: {message}")
    print(f"📍 위치: {latest_file}")
    print(f"📚 히스토리: {timestamp_file}")
    
    return state

if __name__ == "__main__":
    import sys
    message = sys.argv[1] if len(sys.argv) > 1 else "상태 저장"
    save_state(message)
