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
  searchUnified: async (query: string) => {
    return safeApiCall(
      () => api.get('/api/search', { params: { q: query } }),
      { artists: [], tracks: [] }
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
    const response = await safeApiCall(
      () => api.get(`/api/artist/${encodeURIComponent(name)}/complete`),
      { artist_info: null, tracks: [] }
    );
    
    // 응답 형식 변환 (백엔드 호환성)
    if (response.artist_info) {
      return {
        artist: response.artist_info,
        tracks: response.tracks || []
      };
    }
    return response;
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
    const response = await safeApiCall(
      () => api.get('/api/trending', { params: { type, limit } }),
      { trending: [], tracks: [] }
    );
    
    // 백엔드 응답 형식 변환
    if (response.trending) {
      // trending 배열을 tracks 형식으로 변환
      return {
        tracks: response.trending.map((item: any) => ({
          id: item.id || Math.random(),
          artist: item.artist || item.unified_artist,
          title: item.track || item.unified_track || item.title,
          name: item.track || item.unified_track || item.title,
          rank: item.best_ranking || item.best_rank || 1,
          prev_rank: item.prev_rank,
          album_image: item.album_image || item.optimized_album_image,
          trending_score: item.trend_score || Math.round(item.avg_rank ? (100 - item.avg_rank) : 50),
          chart_scores: item.chart_scores || {},
          youtube_views: item.youtube_views,
          rank_change: item.rank_change,
        })),
        artists: []
      };
    }
    return response;
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
  // OAuth URLs
  getGoogleOAuthUrl: async () => {
    return safeApiCall(
      () => api.get('/api/auth/google/url'),
      { url: null, configured: false }
    );
  },
  getKakaoOAuthUrl: async () => {
    return safeApiCall(
      () => api.get('/api/auth/kakao/url'),
      { url: null, configured: false }
    );
  },
  // OAuth Callbacks
  googleCallback: async (code: string) => {
    return safeApiCall(
      () => api.post('/api/auth/google/callback', { code }),
      { success: false }
    );
  },
  kakaoCallback: async (code: string) => {
    return safeApiCall(
      () => api.post('/api/auth/kakao/callback', { code }),
      { success: false }
    );
  },
};

// 인사이트 API
export const insightsAPI = {
  getDaily: async () => {
    return safeApiCall(
      () => api.get('/api/insights/daily'),
      { 
        trends: [],
        market_analysis: '',
        recommendations: []
      }
    );
  },
  getRecommendations: async () => {
    return safeApiCall(
      () => api.get('/api/insights/recommendations'),
      { 
        artists_to_watch: [],
        trending_genres: [],
        investment_tips: []
      }
    );
  },
  getMarketPulse: async () => {
    return safeApiCall(
      () => api.get('/api/insights/market-pulse'),
      { 
        timestamp: new Date().toISOString(),
        active_artists: 0,
        trending_tracks: 0,
        market_sentiment: '',
        hot_topics: []
      }
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
    // Smart Image API 사용 (백엔드가 자동 매핑 처리)
    return `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getSmartImage: (artist: string, track: string) => {
    // 동일한 Smart Image API 사용
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

// 하위 호환성을 위한 alias exports
export const authApi = authAPI;  // authApi -> authAPI alias
export const insightsApi = insightsAPI;  // insightsApi -> insightsAPI alias
export const trendingAPI = trendingApi;  // trendingAPI -> trendingApi alias (역방향)
// searchAPI와 searchApi는 이미 위에 정의됨

export default api;
