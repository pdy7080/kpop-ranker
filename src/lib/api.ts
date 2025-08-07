// API 라이브러리 - Vercel 배포용
// CORS 문제 해결 버전

import axios from 'axios';

// API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.kpopranker.chargeapp.net';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 기존 코드와 호환되도록 개별 export
export const searchApi = {
  search: (query: string) => 
    api.get('/api/search', { params: { q: query } }),
  searchV2: (artist: string, track: string) =>
    api.get('/api/search2', { params: { artist, track } }),
  autocomplete: (query: string, limit = 10) =>
    api.get('/api/autocomplete/unified', { params: { q: query, limit } })
};

export const trendingApi = {
  getTrending: (type = 'hot', limit = 10) =>
    api.get('/api/trending', { params: { type, limit } }),
  getArtistTracks: (artist: string) =>
    api.get('/api/artist/tracks', { params: { artist } })
};

export const portfolioApi = {
  getPortfolio: () =>
    api.get('/api/portfolio'),
  addToPortfolio: (data: any) =>
    api.post('/api/portfolio', data),
  removeFromPortfolio: (id: number) =>
    api.delete(`/api/portfolio/${id}`)
};

export const authApi = {
  demoLogin: (data: { name: string; email: string }) =>
    api.post('/api/auth/demo-login', data),
  logout: () =>
    api.post('/api/auth/logout'),
  getStatus: () =>
    api.get('/api/auth/status'),
  getUser: () =>
    api.get('/api/auth/user')
};

export const artistApi = {
  getArtistComplete: (name: string) =>
    api.get(`/api/artist/${name}/complete`),
  getArtistTracks: (name: string) =>
    api.get(`/api/artist/${name}/tracks`)
};

export const chartApi = {
  getChartHistory: (chart: string, artist: string, track: string) =>
    api.get(`/api/chart/history/${chart}/${artist}/${track}`),
  getChartSummary: (artist: string, track: string) =>
    api.get(`/api/charts/summary/${artist}/${track}`),
  getUpdateStatus: () =>
    api.get('/api/chart/update-status'),
  getChartList: () =>
    api.get('/api/charts/list')
};

export const insightApi = {
  getDailyInsights: () =>
    api.get('/api/insights/daily'),
  getMarketPulse: () =>
    api.get('/api/insights/market-pulse'),
  getRecommendations: () =>
    api.get('/api/insights/recommendations'),
  getArtistInsights: (name: string) =>
    api.get(`/api/insights/artist/${name}`)
};

// 이미지 URL 생성 함수
export const getAlbumImageUrl = (artist: string, track: string) => {
  return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
};

// 기본 export
export default api;

// API URL export
export { API_URL };
