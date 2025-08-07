/**
 * 🌍 API 설정 - 환경별 자동 URL 관리
 * 
 * 개발환경: http://localhost:5000
 * 프로덕션: https://api.kpopranker.chargeapp.net
 */

export const API_CONFIG = {
  // ✅ 환경별 자동 설정 (배포 준비 완료)
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.kpopranker.chargeapp.net'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // 개발/프로덕션 환경 감지
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};

// API URL 생성 헬퍼 함수들
export const apiUrls = {
  // 앨범 이미지 API - v2로 변경 (완전 작동)
  albumImage: (artist: string, track?: string) => {
    const safeArtist = encodeURIComponent(artist);
    if (track) {
      const safeTrack = encodeURIComponent(track);
      return `${API_CONFIG.BASE_URL}/api/album-image-v2/${safeArtist}/${safeTrack}`;
    }
    return `${API_CONFIG.BASE_URL}/api/album-image-v2/${safeArtist}`;
  },
  
  // 정적 파일 URL
  staticFile: (path: string) => {
    // path가 /static/으로 시작하면 그대로, 아니면 /static/ 추가
    const cleanPath = path.startsWith('/static/') ? path : `/static/${path}`;
    return `${API_CONFIG.BASE_URL}${cleanPath}`;
  },
  
  // 기본 이미지 URL
  defaultImage: (initial: string = 'default') => {
    return `${API_CONFIG.BASE_URL}/static/default_images/${initial}.jpg`;
  },
  
  // 기타 API 엔드포인트들
  search: (query: string) => `${API_CONFIG.BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
  trending: () => `${API_CONFIG.BASE_URL}/api/trending`,
  portfolio: () => `${API_CONFIG.BASE_URL}/api/portfolio`,
  artistDetail: (artist: string) => `${API_CONFIG.BASE_URL}/api/artist/${encodeURIComponent(artist)}/complete`,
  artistComplete: `${API_CONFIG.BASE_URL}/api/artist`
};

// 디버그 정보 (개발환경에서만)
if (API_CONFIG.IS_DEVELOPMENT) {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  });
}

export default API_CONFIG;
