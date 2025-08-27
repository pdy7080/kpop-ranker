// API 호출 임시 패치 (v11 호환)
export const quickFix = {
  // 트렌딩 데이터를 검색 결과로 변환
  convertTrendingToSearch: (trendingData: any) => {
    if (!trendingData || !trendingData.trending) return [];
    
    return trendingData.trending.map((item: any) => ({
      artist: item.artist,
      track: item.track,
      image_url: item.image_url,
      positions: Object.entries(item.charts || {})
        .map(([chart, rank]) => `${chart}:${rank}`)
        .join(', '),
      charts: item.charts || {},
      score: item.score || 0
    }));
  },
  
  // 이미지 URL 수정
  fixImageUrl: (url: string) => {
    if (!url) return '/placeholder.svg';
    
    // album-image-v2를 album-image-smart로 변경
    if (url.includes('/api/album-image-v2/')) {
      return url.replace('/api/album-image-v2/', '/api/album-image-smart/');
    }
    
    // 이미 https URL인 경우 그대로 사용
    if (url.startsWith('https://')) {
      return url;
    }
    
    return url;
  },
  
  // 차트 데이터 정규화
  normalizeChartData: (charts: any) => {
    if (!charts) return {};
    
    // 차트명 소문자로 통일
    const normalized: Record<string, number> = {};
    Object.entries(charts).forEach(([chart, rank]) => {
      normalized[chart.toLowerCase()] = rank as number;
    });
    
    return normalized;
  }
};
