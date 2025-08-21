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
});

// API 호출 로깅
api.interceptors.request.use((config) => {
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
    return safeApiCall(
      () => api.get('/api/search', { params: { q: query } }),
      { results: [] }
    );
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
      () => api.get('/api/trending', { params: { type, limit } }),
      { trending: [], tracks: [] }
    );
    
    // 백엔드 응답 형식 변환
    if (response.trending && Array.isArray(response.trending)) {
      // trending 배열을 tracks 형식으로 변환
      return {
        tracks: response.trending.map((item: any) => {
          // album_image URL 수정 - album-image-v2를 album-image-smart로 변경
          let albumImage = item.album_image || item.optimized_album_image;
          if (albumImage && albumImage.includes('/api/album-image-v2/')) {
            albumImage = albumImage.replace('/api/album-image-v2/', '/api/album-image-smart/');
          }
          
          return {
            id: item.id || Math.random(),
            artist: item.artist || item.unified_artist || 'Unknown Artist',
            title: item.track || item.unified_track || item.title || 'Unknown Track',
            name: item.track || item.unified_track || item.title || 'Unknown Track',
            rank: item.best_ranking || item.best_rank || 1,
            prev_rank: item.prev_rank,
            album_image: albumImage || 
              `${API_URL}/api/album-image-smart/${encodeURIComponent(item.artist || item.unified_artist || 'Unknown')}/${encodeURIComponent(item.track || item.unified_track || item.title || 'Unknown')}`,
            trending_score: item.trend_score || Math.round(item.avg_rank ? (100 - item.avg_rank) : 50),
            chart_scores: item.chart_scores || {},
            youtube_views: item.youtube_views,
            rank_change: item.rank_change,
          };
        }),
        artists: []
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
    // album-image-v2 사용 (백엔드가 모든 경로 지원)
    return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getAlbumImageUrl: (artist: string, track: string) => {
    // album-image-v2 사용 (백엔드가 모든 경로 지원)
    return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getSmartImage: (artist: string, track: string) => {
    // smart도 지원하지만 v2가 더 안정적
    return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  getSmartImageUrl: (artist: string, track: string) => {
    // smart도 지원하지만 v2가 더 안정적
    return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
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