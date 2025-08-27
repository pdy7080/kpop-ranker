import axios, { AxiosInstance } from 'axios';



// API URL 설정 - 백엔드 (포트 5000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false  // CORS 문제 해결을 위해 false로 변경
});

// API 호출 로깅 및 인증 헤더 추가
api.interceptors.request.use((config) => {
  // 인증 토큰 추가 (포트폴리오, 인증 관련 API만)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // 포트폴리오, 인증 관련 API에만 토큰 추가
  const authRequiredPaths = ['/api/portfolio', '/api/auth/user', '/api/auth/status', '/api/auth/logout'];
  const requiresAuth = authRequiredPaths.some(path => config.url?.includes(path));
  
  if (token && token !== 'session_only' && requiresAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    // 먼저 일반 검색 시도
    const searchResult = await safeApiCall(
      () => api.get('/api/search', { params: { q: query } }),
      { results: [] }
    );
    
    // 검색 결과가 없으면 트렌딩에서 필터링
    if (!searchResult.results || searchResult.results.length === 0) {
      const trendingResult = await safeApiCall(
        () => api.get('/api/trending', { params: { limit: 100 } }),
        { trending: [] }
      );
      
      if (trendingResult.trending) {
        const lowerQuery = query.toLowerCase();
        const filtered = trendingResult.trending.filter((item: any) => {
          const artist = (item.artist || '').toLowerCase();
          const track = (item.track || '').toLowerCase();
          return artist.includes(lowerQuery) || track.includes(lowerQuery);
        });
        
        return {
          results: filtered.map((item: any) => ({
            artist: item.artist,
            track: item.track,
            image_url: item.image_url,
            positions: Object.entries(item.charts || {})
              .map(([chart, rank]) => `${chart}:${rank}`)
              .join(', '),
            charts: item.charts || {},
            score: item.score || 0
          }))
        };
      }
    }
    
    return searchResult;
  },
  searchUnified: async (query: string) => {
    const response = await safeApiCall(
      () => api.get('/api/search', { params: { q: query } }),
      { results: [] }
    );
    
    // results를 artists와 tracks로 분리
    const artistsMap = new Map<string, any>();
    const tracks: any[] = [];
    
    if (response.results && Array.isArray(response.results)) {
      response.results.forEach((item: any) => {
        // 트랙 추가
        if (item.track) {
          tracks.push({
            artist: item.artist,
            artist_normalized: item.artist_normalized || item.artist,
            title: item.track,
            track: item.track,
            album_image: item.album_image || `/api/album-image-smart/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`,
            charts: item.charts || {},
            trend_score: item.trend_score || item.score || 0
          });
          
          // 트랙에서 아티스트 정보 추출
          const artistKey = item.artist_normalized || item.artist;
          if (!artistsMap.has(artistKey)) {
            artistsMap.set(artistKey, {
              name: item.artist,
              normalized: item.artist_normalized || item.artist,
              track_count: 1
            });
          } else {
            const artist = artistsMap.get(artistKey);
            artist.track_count++;
          }
        }
      });
    }
    
    // 아티스트 배열로 변환
    const artists = Array.from(artistsMap.values());
    
    return { artists: artists, tracks: tracks };
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
      () => api.get('/api/trending', { params: { limit } }),
      { trending: [], tracks: [] }
    );
    
    // 백엔드 응답 형식 변환 (v11 구조)
    if (response.trending && Array.isArray(response.trending)) {
      // trending 배열을 tracks 형식으로 변환
      return {
        tracks: response.trending.map((item: any, idx: number) => {
          return {
            id: item.id || idx,
            artist: item.artist || 'Unknown Artist',
            title: item.track || item.title || 'Unknown Track',
            name: item.track || item.title || 'Unknown Track',
            rank: idx + 1,  // 트렌딩 순위
            best_rank: item.best_rank || 1,
            chart_count: item.chart_count || 0,
            avg_rank: item.avg_rank || 50,
            charts: item.charts || {},  // 차트별 순위
            album_image: item.image_url || item.album_image || 
              `${API_URL}/api/album-image-smart/${encodeURIComponent(item.artist || 'Unknown')}/${encodeURIComponent(item.track || 'Unknown')}`,
            trending_score: item.score || item.trending_score || 50,
            has_real_image: item.has_real_image || false,
            youtube_views: item.youtube_views,
            rank_change: item.rank_change,
          };
        }),
        artists: [],
        image_stats: response.image_stats || {},
        total_count: response.total_count || response.trending.length
      };
    }
    
    // 이미 tracks 형식인 경우
    if (response.tracks) {
      // album_image URL 수정
      response.tracks = response.tracks.map((track: any) => {
        if (track.album_image && track.album_image.includes('/api/album-image-v2/')) {
          track.album_image = track.album_image.replace('/api/album-image-v2/', '/api/album-image-smart/');
        }
        return track;
      });
      return response;
    }
    
    return { tracks: [], artists: [] };
  },
};

// 검색 API (별도 export)
export const searchApi = searchAPI;

// 차트 API
export const chartAPI = {
  getTrending: async (type = 'hot', limit = 10) => {
    // trendingApi.getTrending과 동일
    return trendingApi.getTrending(type, limit);
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
  status: async () => {
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
      () => api.get('/api/auth/oauth/google/url'),
      { url: null, configured: false }
    );
  },
  getKakaoOAuthUrl: async () => {
    return safeApiCall(
      () => api.get('/api/auth/oauth/kakao/url'),
      { url: null, configured: false }
    );
  },
  // OAuth Callbacks
  googleCallback: async (code: string) => {
    return safeApiCall(
      () => api.post('/api/auth/oauth/google/callback', { code }),
      { success: false }
    );
  },
  kakaoCallback: async (code: string) => {
    return safeApiCall(
      () => api.post('/api/auth/oauth/kakao/callback', { code }),
      { success: false }
    );
  },
};



// 이미지 API
export const imageAPI = {
  getAlbumImage: (artist: string, track: string) => {
    // album-image-smart 사용 (백엔드 지원 경로)
    return `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getAlbumImageUrl: (artist: string, track: string) => {
    // album-image-smart 사용 (백엔드 지원 경로)
    return `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getSmartImage: (artist: string, track: string) => {
    // smart 경로 사용
    return `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getSmartImageUrl: (artist: string, track: string) => {
    // smart 경로 사용
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

// Insights API
export const insightsAPI = {
  getDaily: async () => {
    return safeApiCall(
      () => api.get('/api/insights/daily'),
      { 
        insights: {
          new_entries: [],
          big_movers: [],
          chart_leaders: [],
          summary: { total_new_entries: 0, total_movers: 0, active_charts: 0 }
        }
      }
    );
  },
  getMarketPulse: async () => {
    return safeApiCall(
      () => api.get('/api/insights/market-pulse'),
      {
        market_pulse: {
          genre_distribution: {},
          label_distribution: [],
          weekly_trend: [],
          market_summary: {}
        }
      }
    );
  },
  getRecommendations: async () => {
    return safeApiCall(
      () => api.get('/api/insights/recommendations'),
      {
        recommendations: {
          artists_to_watch: [],
          hidden_gems: [],
          comeback_predictions: [],
          recommendation_summary: {}
        }
      }
    );
  },
  // AI 분석 기능 (OpenAI GPT-4)
  getAIAnalysis: async (type: 'general' | 'market' | 'prediction' = 'general', days: number = 7) => {
    return safeApiCall(
      () => api.post('/api/insights/ai-analysis', { type, days }),
      {
        ai_analysis: null,
        model: null,
        timestamp: null
      }
    );
  },
  getAIMarketPrediction: async () => {
    return safeApiCall(
      () => api.get('/api/insights/ai-market-prediction'),
      {
        prediction: null,
        confidence: 'medium',
        timestamp: null
      }
    );
  },
  getAIRecommendations: async (preferences?: string) => {
    return safeApiCall(
      () => api.get('/api/insights/ai-recommendations', { 
        params: preferences ? { preferences } : {} 
      }),
      {
        recommendations: [],
        ai_powered: false,
        timestamp: null
      }
    );
  },
};

// 하위 호환성을 위한 alias exports
export const authApi = authAPI;  
export const insightsApi = insightsAPI;  
export const trendingAPI = trendingApi;  
export const artistApi = artistAPI;
export const portfolioApi = portfolioAPI;
export const imageApi = imageAPI;
export const chartApi = chartAPI;

// Convenience functions (백업 버전 호환)
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

// API 객체에 insights 추가
(api as any).insights = insightsAPI;

export default api;