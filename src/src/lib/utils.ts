/**
 * 유틸리티 함수 모음
 */

/**
 * 숫자를 천 단위로 포맷팅
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * 숫자를 한국 원화로 포맷팅
 */
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * 날짜를 상대적 시간으로 변환 (예: 3시간 전)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

/**
 * 날짜를 한국식으로 포맷팅
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 퍼센트 변화량 포맷팅
 */
export function formatPercentage(value: number, showSign: boolean = true): string {
  const formatted = Math.abs(value).toFixed(1);
  if (showSign && value > 0) {
    return `+${formatted}%`;
  } else if (value < 0) {
    return `-${formatted}%`;
  }
  return `${formatted}%`;
}

/**
 * 차트 이름을 한글로 변환
 */
export function getChartNameInKorean(chartName: string): string {
  const chartNames: Record<string, string> = {
    'Spotify': '스포티파이',
    'YouTube': '유튜브',
    'AppleMusic': '애플뮤직',
    'Melon': '멜론',
    'Genie': '지니',
    'Bugs': '벅스',
    'Vibe': '바이브',
    'Flo': '플로',
    'Shazam': '샤잠',
    'Billboard': '빌보드'
  };
  return chartNames[chartName] || chartName;
}

/**
 * 순위 변동 아이콘 생성
 */
export function getRankChangeIcon(change: number | null): string {
  if (change === null || change === 0) return '–';
  if (change > 0) return '▲';
  return '▼';
}

/**
 * 순위 변동 색상 클래스 반환
 */
export function getRankChangeColor(change: number | null): string {
  if (change === null || change === 0) return 'text-gray-400';
  if (change > 0) return 'text-green-400';
  return 'text-red-400';
}

/**
 * 차트 색상 반환
 */
export function getChartColor(chartName: string): string {
  const colors: Record<string, string> = {
    'Spotify': '#1DB954',
    'YouTube': '#FF0000',
    'AppleMusic': '#FA243C',
    'Melon': '#00CD3C',
    'Genie': '#0099FF',
    'Bugs': '#FF6600',
    'Vibe': '#FF5500',
    'Flo': '#3366FF',
    'Shazam': '#0088FF',
    'Billboard': '#000000'
  };
  return colors[chartName] || '#6B7280';
}

/**
 * 굿즈 카테고리 아이콘 반환
 */
export function getGoodsCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'album': '💿',
    'lightstick': '💡',
    'photobook': '📸',
    'clothing': '👕',
    'accessories': '💎',
    'stationery': '📝',
    'etc': '🎁'
  };
  return icons[category] || '📦';
}
