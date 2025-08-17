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
      status: error.response?.status,
      data: error.response?.data,
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

// 트렌딩 API (별도 export)
export const trendingApi = {
  getTrending: async (type = 'hot', limit = 10) => {
    return safeApiCall(
      () => api.get('/api/trending', { params: { type, limit } }),
      { tracks: [], artists: [] }
    );
  },
};

// 검색 API (별도 export)
export const searchApi = searchAPI;

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
  // 데모 로그인 (alias)
  demoLogin: async (name: string, email?: string) => {
    return safeApiCall(
      () => api.post('/api/auth/demo-login', { name, email }),
      { success: false }
    );
  },
  logout: async () => {
    return safeApiCall(
      () => api.post('/api/auth/logout'),
      { success: false }
    );
  },
  getStatus: async () => {
    return safeApiCall(
      () => api.get('/api/auth/status'),
      { authenticated: false }
    );
  },
  getUser: async () => {
    return safeApiCall(
      () => api.get('/api/auth/user'),
      { user: null }
    );
  },
};

// 인사이트 API
export const insightsAPI = {
  getDaily: async () => {
    return safeApiCall(
      () => api.get('/api/insights/daily'),
      { insights: [] }
    );
  },
  getRecommendations: async () => {
    return safeApiCall(
      () => api.get('/api/insights/recommendations'),
      { recommendations: [] }
    );
  },
  getMarketPulse: async () => {
    return safeApiCall(
      () => api.get('/api/insights/market-pulse'),
      { pulse: null }
    );
  },
  getArtistInsights: async (name: string) => {
    return safeApiCall(
      () => api.get(`/api/insights/artist/${encodeURIComponent(name)}`),
      { insights: null }
    );
  },
};

// 이미지 API
export const imageAPI = {
  getAlbumImage: (artist: string, track: string) => {
    // 직접 URL 반환 (img src에 사용)
    return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getSmartImage: (artist: string, track: string) => {
    // 스마트 이미지 API
    return `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  checkImages: async () => {
    return safeApiCall(
      () => api.get('/api/images/check'),
      { status: 'unknown' }
    );
  },
};

// 뉴스 API
export const newsAPI = {
  getLatest: async (limit = 10) => {
    return safeApiCall(
      () => api.get('/api/news', { params: { limit } }),
      { news: [] }
    );
  },
  getByArtist: async (artist: string) => {
    return safeApiCall(
      () => api.get('/api/news/artist', { params: { artist } }),
      { news: [] }
    );
  },
};

// 굿즈 API
export const goodsAPI = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/api/goods'),
      { goods: [] }
    );
  },
  getByArtist: async (artist: string) => {
    return safeApiCall(
      () => api.get('/api/goods/artist', { params: { artist } }),
      { goods: [] }
    );
  },
};

// 스케줄러 API
export const schedulerAPI = {
  getStatus: async () => {
    return safeApiCall(
      () => api.get('/api/scheduler/status'),
      { status: 'unknown' }
    );
  },
  triggerCrawl: async () => {
    return safeApiCall(
      () => api.post('/api/scheduler/crawl'),
      { success: false }
    );
  },
};

export default api;
