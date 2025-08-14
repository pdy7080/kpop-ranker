import axios from 'axios';

// API URL 설정 - 백엔드 (포트 5000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// API 호출 로깅
api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// 응답 로깅 및 에러 처리
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// 안전한 API 호출 함수
const safeApiCall = async (apiCall: () => Promise<any>, fallbackData: any = {}) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.error('API call failed, using fallback data:', error);
    return fallbackData;
  }
};

// 검색 API
export const searchAPI = {
  search: async (query: string) => {
    return safeApiCall(
      () => api.get('/api/search', { params: { q: query } }),
      { results: [] }
    );
  },
  autocomplete: async (query: string, limit = 10) => {
    return safeApiCall(
      () => api.get('/api/autocomplete/unified', { params: { q: query, limit } }),
      { suggestions: [] }
    );
  },
};

// searchApi alias (호환성을 위해)
export const searchApi = searchAPI;

// 아티스트 API  
export const artistAPI = {
  getDetails: async (name: string) => {
    return safeApiCall(
      () => api.get(`/api/artist/${encodeURIComponent(name)}/complete`),
      { artist: null, tracks: [] }
    );
  },
  getTracks: async (artist: string) => {
    return safeApiCall(
      () => api.get('/api/artist/tracks', { params: { artist } }),
      { tracks: [] }
    );
  },
};

// 차트 API
export const chartAPI = {
  getTrending: async (type = 'hot', limit = 10) => {
    return safeApiCall(
      () => api.get('/api/trending', { params: { type, limit } }),
      { tracks: [], artists: [] }
    );
  },
  getHistory: async (chart: string, artist: string, track: string) => {
    return safeApiCall(
      () => api.get(`/api/chart/history/${chart}/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`),
      { history: [] }
    );
  },
  getSummary: async (artist: string, track: string) => {
    return safeApiCall(
      () => api.get(`/api/charts/summary/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`),
      { summary: {} }
    );
  },
  getUpdateStatus: async () => {
    return safeApiCall(
      () => api.get('/api/chart/update-status'),
      { status: null }
    );
  },
};

// alias for compatibility (소문자 버전)
export const trendingApi = chartAPI;
export const chartApi = chartAPI;
export const authApi = authAPI;
export const searchApi = searchAPI;
export const artistApi = artistAPI;
export const portfolioApi = portfolioAPI;
export const imageApi = imageAPI;

// 포트폴리오 API
export const portfolioAPI = {
  get: async () => {
    return safeApiCall(
      () => api.get('/api/portfolio'),
      { items: [] }
    );
  },
  add: async (item: any) => {
    return safeApiCall(
      () => api.post('/api/portfolio', item),
      { success: false }
    );
  },
  remove: async (id: string) => {
    return safeApiCall(
      () => api.delete(`/api/portfolio/${id}`),
      { success: false }
    );
  },
};

// 인증 API
export const authAPI = {
  login: async (credentials: any) => {
    return safeApiCall(
      () => api.post('/api/auth/demo-login', credentials),
      { success: false }
    );
  },
  logout: async () => {
    return safeApiCall(
      () => api.post('/api/auth/logout'),
      { success: false }
    );
  },
  status: async () => {
    return safeApiCall(
      () => api.get('/api/auth/status'),
      { authenticated: false }
    );
  },
};

// 이미지 API
export const imageAPI = {
  getAlbumImageUrl: (artist: string, track: string) => {
    return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getSmartImageUrl: (artist: string, track: string) => {
    return `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
};

// Convenience functions
export const searchArtistTracks = artistAPI.getTracks;
export const getArtistDetails = artistAPI.getDetails;
export const getTrending = chartAPI.getTrending;
export const getChartHistory = chartAPI.getHistory;
export const getChartSummary = chartAPI.getSummary;
export const getPortfolio = portfolioAPI.get;
export const addToPortfolio = portfolioAPI.add;
export const removeFromPortfolio = portfolioAPI.remove;
export const login = authAPI.login;
export const logout = authAPI.logout;
export const checkAuthStatus = authAPI.status;
export const getAlbumImageUrl = imageAPI.getAlbumImageUrl;
export const getSmartImageUrl = imageAPI.getSmartImageUrl;
export const getUpdateStatus = chartAPI.getUpdateStatus;

export default api;
