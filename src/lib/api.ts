import axios from 'axios';

// 🔧 FastComet 배포 환경 최적화된 API 설정
// CORS 문제 해결 - 클라이언트는 CORS 헤더를 보내면 안됨!

// 🔥 API URL 설정
const getApiUrl = () => {
  // 환경 변수 확인
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // 개발 환경
  if (process.env.NODE_ENV === 'development') {
    return apiUrl || 'http://localhost:5000';
  }
  
  // 프로덕션 환경
  return apiUrl || 'https://api.kpopranker.chargeapp.net';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CORS는 서버가 처리 - 클라이언트는 설정 불필요
  withCredentials: true  // 쿠키/세션 지원
});

// ❌ 삭제: 클라이언트는 CORS 헤더를 보내면 안됨!
// api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

// 요청 인터셉터 - 인증 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // 디버깅용 로그
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    // 성공 응답
    return response;
  },
  (error) => {
    // 에러 로깅
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API 메서드 export
export default api;

// 개별 API 함수들
export const searchAPI = {
  // 통합 검색
  search: (query: string) => 
    api.get('/api/search', { params: { q: query } }),
  
  // 정밀 검색
  searchV2: (artist: string, track: string) =>
    api.get('/api/search2', { params: { artist, track } }),
  
  // 자동완성
  autocomplete: (query: string, limit = 10) =>
    api.get('/api/autocomplete/unified', { params: { q: query, limit } })
};

export const trendingAPI = {
  // 트렌딩 조회
  getTrending: (type = 'hot', limit = 10) =>
    api.get('/api/trending', { params: { type, limit } }),
  
  // 아티스트 트랙 조회
  getArtistTracks: (artist: string) =>
    api.get('/api/artist/tracks', { params: { artist } })
};

export const portfolioAPI = {
  // 포트폴리오 조회
  getPortfolio: () =>
    api.get('/api/portfolio'),
  
  // 포트폴리오 추가
  addToPortfolio: (data: any) =>
    api.post('/api/portfolio', data),
  
  // 포트폴리오 삭제
  removeFromPortfolio: (id: number) =>
    api.delete(`/api/portfolio/${id}`)
};

export const authAPI = {
  // 데모 로그인
  demoLogin: (data: { name: string; email: string }) =>
    api.post('/api/auth/demo-login', data),
  
  // 로그아웃
  logout: () =>
    api.post('/api/auth/logout'),
  
  // 상태 확인
  getStatus: () =>
    api.get('/api/auth/status'),
  
  // 사용자 정보
  getUser: () =>
    api.get('/api/auth/user')
};

export const artistAPI = {
  // 아티스트 상세 정보
  getArtistComplete: (name: string) =>
    api.get(`/api/artist/${name}/complete`),
  
  // 아티스트 트랙 목록
  getArtistTracks: (name: string) =>
    api.get(`/api/artist/${name}/tracks`)
};

export const chartAPI = {
  // 차트 히스토리
  getChartHistory: (chart: string, artist: string, track: string) =>
    api.get(`/api/chart/history/${chart}/${artist}/${track}`),
  
  // 차트 요약
  getChartSummary: (artist: string, track: string) =>
    api.get(`/api/charts/summary/${artist}/${track}`),
  
  // 업데이트 상태
  getUpdateStatus: () =>
    api.get('/api/chart/update-status'),
  
  // 차트 목록
  getChartList: () =>
    api.get('/api/charts/list')
};

export const insightAPI = {
  // 일일 인사이트
  getDailyInsights: () =>
    api.get('/api/insights/daily'),
  
  // 시장 동향
  getMarketPulse: () =>
    api.get('/api/insights/market-pulse'),
  
  // 추천
  getRecommendations: () =>
    api.get('/api/insights/recommendations'),
  
  // 아티스트 인사이트
  getArtistInsights: (name: string) =>
    api.get(`/api/insights/artist/${name}`)
};

// 이미지 URL 생성 함수
export const getAlbumImageUrl = (artist: string, track: string) => {
  return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
};

// API URL export (디버깅용)
export { API_URL };
