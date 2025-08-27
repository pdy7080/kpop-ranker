// 트렌딩 탭 설계
export const TRENDING_TABS = {
  HOT: {
    id: 'hot',
    label: 'HOT 🔥',
    description: '지금 가장 뜨거운',
    query: 'hot',
    color: 'from-red-500 to-orange-500',
    info: '최근 24시간 급상승 트랙'
  },
  TOP100: {
    id: 'top100',
    label: 'TOP 100 👑',
    description: '종합 TOP 100',
    query: 'top',
    color: 'from-purple-500 to-pink-500',
    info: '모든 차트 종합 순위'
  },
  NEW: {
    id: 'new',
    label: 'NEW ✨',
    description: '최신 진입곡',
    query: 'new',
    color: 'from-blue-500 to-cyan-500',
    info: '이번 주 새로 진입한 곡'
  },
  RISING: {
    id: 'rising',
    label: 'RISING 📈',
    description: '순위 상승중',
    query: 'rising',
    color: 'from-green-500 to-emerald-500',
    info: '지속적으로 상승중인 트랙'
  }
};

// 트렌딩 상단 통계 재설계
export const TRENDING_STATS = {
  HOT_ARTIST: {
    label: '오늘의 아티스트',
    icon: '🎤',
    description: '가장 많은 곡이 차트인'
  },
  TOP_ENTRY: {
    label: '최고 진입',
    icon: '🚀',
    description: '이번 주 최고 순위 진입'
  },
  CHART_KILLER: {
    label: '올킬 임박',
    icon: '💯',
    description: '가장 많은 차트 1위'
  },
  WEEKLY_BEST: {
    label: '주간 베스트',
    icon: '🏆',
    description: '이번 주 최고 점수'
  }
};
