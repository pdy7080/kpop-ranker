// API 설정 - CORS 문제 해결을 위한 프록시 사용

const isDevelopment = process.env.NODE_ENV === 'development';

// 프록시를 통한 API 호출 (CORS 우회)
export const API_BASE = '';  // 프록시 사용 시 빈 문자열

// API 엔드포인트들
export const API_ENDPOINTS = {
  // 검색
  search: '/api/search',
  search2: '/api/search2',
  autocomplete: '/api/autocomplete/unified',
  
  // 트렌딩
  trending: '/api/trending',
  
  // 아티스트
  artist: (name: string) => `/api/artist/${encodeURIComponent(name)}/complete`,
  artistTracks: (name: string) => `/api/artist/${encodeURIComponent(name)}/tracks`,
  
  // 이미지 - 한글 파라미터 인코딩 필수!
  albumImage: (artist: string, track: string) => 
    `/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`,
  
  // 포트폴리오
  portfolio: '/api/portfolio',
  
  // 인증
  auth: {
    login: '/api/auth/demo-login',
    logout: '/api/auth/logout',
    status: '/api/auth/status',
    user: '/api/auth/user'
  },
  
  // 차트
  chartHistory: (chart: string, artist: string, track: string) => 
    `/api/chart/history/${chart}/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`,
  chartSummary: (artist: string, track: string) => 
    `/api/charts/summary/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`,
  chartUpdateStatus: '/api/chart/update-status',
  
  // 인사이트
  insights: {
    daily: '/api/insights/daily',
    marketPulse: '/api/insights/market-pulse',
    recommendations: '/api/insights/recommendations',
    artist: (name: string) => `/api/insights/artist/${encodeURIComponent(name)}`
  },
  
  // 뉴스/굿즈
  news: '/api/news',
  goods: '/api/goods'
};

// API 호출 헬퍼 함수
export async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',  // 쿠키 포함
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// 이미지 URL 생성 함수 (한글 인코딩 처리)
export function getImageUrl(artist: string, track: string): string {
  // 한글 파라미터 인코딩
  const encodedArtist = encodeURIComponent(artist);
  const encodedTrack = encodeURIComponent(track);
  
  // 프록시를 통한 이미지 URL
  return `${API_BASE}/api/album-image-v2/${encodedArtist}/${encodedTrack}`;
}

export default {
  API_BASE,
  API_ENDPOINTS,
  apiCall,
  getImageUrl
};
