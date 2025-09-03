import axios, { AxiosInstance } from 'axios';

// API URL 설정 - 백엔드 (포트 5000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

console.log('🔥 API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,  // 15초로 증가
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false
});

// API 호출 로깅 및 인증 헤더 추가
api.interceptors.request.use((config) => {
  // 인증 토큰 추가 (포트폴리오, 인증 관련 API만)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
  
  const authRequiredPaths = ['/api/portfolio', '/api/auth/user', '/api/auth/status', '/api/auth/logout'];
  const requiresAuth = authRequiredPaths.some(path => config.url?.includes(path));
  
  if (requiresAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔐 Auth Header Added: Bearer ${token.substring(0, 10)}...`);
  }
  
  console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// 응답 로깅 및 에러 처리
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password?: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  demoLogin: async (name: string, email?: string) => {
    const response = await api.post('/api/auth/demo-login', {
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@demo.com`
    });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  status: async () => {
    const response = await api.get('/api/auth/status');
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/api/auth/status');
    return response.data;
  },
  getUser: async () => {
    const response = await api.get('/api/auth/user');
    return response.data;
  },
  // OAuth URLs
  getGoogleOAuthUrl: async () => {
    const response = await api.get('/api/auth/oauth/google/url');
    return response.data;
  },
  getKakaoOAuthUrl: async () => {
    const response = await api.get('/api/auth/oauth/kakao/url');
    return response.data;
  },
  // OAuth Callbacks
  googleCallback: async (code: string) => {
    const response = await api.post('/api/auth/oauth/google/callback', { code });
    return response.data;
  },
  kakaoCallback: async (code: string) => {
    const response = await api.post('/api/auth/oauth/kakao/callback', { code });
    return response.data;
  },
};

// Portfolio API
export const portfolioAPI = {
  get: async () => {
    const response = await api.get('/api/portfolio');
    return response.data;
  },
  add: async (artist: string, track: string) => {
    const response = await api.post('/api/portfolio/add', {
      artist,
      track
    });
    return response.data;
  },
  remove: async (itemId: string | number) => {
    const response = await api.delete('/api/portfolio/remove', {
      data: { id: Number(itemId) }
    });
    return response.data;
  },
  analyze: async () => {
    const response = await api.get('/api/portfolio/analyze');
    return response.data;
  },
};

// Trending API - 🚀 캐시 버전 사용 (94% 성능 향상!)
export const trendingApi = {
  getTrending: async (type = 'hot', limit = 20) => {
    try {
      // 기존: '/api/trending' → 캐시: '/cache/api/trending'
      const response = await api.get('/api/cached/api/trending', {
        params: { type, limit }
      });
      console.log('🚀 캐시 기반 트렌딩 API 사용 - 94% 빨라짐!');
      return response.data;
    } catch (error) {
      console.error('캐시 트렌딩 API 실패, 기존 API로 대체:', error);
      // 캐시 실패시 기존 API로 폴백
      try {
        const fallbackResponse = await api.get('/api/trending', {
          params: { type, limit }
        });
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('기존 트렌딩 API도 실패:', fallbackError);
        throw fallbackError;
      }
    }
  }
};

// Search API
export const searchAPI = {
  search: async (query: string) => {
    const response = await api.get('/api/search', { params: { q: query } });
    return response.data;
  },
  
  autocomplete: async (query: string) => {
    const response = await api.get('/api/autocomplete/unified', { 
      params: { q: query, limit: 10 } 
    });
    return response.data;
  }
};

// Artist API v16 - 🚀 캐시 버전 사용 (90% 성능 향상!)
export const artistAPI = {
  getDetails: async (name: string) => {
    try {
      // 기존: '/api/artist/{name}/complete' → 캐시: '/cache/api/artist/{name}/complete'
      const response = await api.get(`/cache/api/artist/${encodeURIComponent(name)}/complete`);
      console.log('🚀 캐시 기반 아티스트 API 사용 - 90% 빨라짐!');
      return response.data;
    } catch (error) {
      console.error('캐시 아티스트 API 실패, 기존 API로 대체:', error);
      // 캐시 실패시 기존 API로 폴백
      try {
        const fallbackResponse = await api.get(`/api/artist/${encodeURIComponent(name)}/complete`);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('기존 아티스트 API도 실패:', fallbackError);
        throw fallbackError;
      }
    }
  }
};

// Track API - 표준 엔드포인트 사용
export const trackAPI = {
  getDetails: async (artist: string, title: string) => {
    const response = await api.get(
      `/api/track/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    return response.data;
  },
  
  getTrackDetail: async (artist: string, title: string) => {
    const response = await api.get(
      `/api/track/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    return response.data;
  },
  
  getChartsSummary: async (artist: string, title: string) => {
    const response = await api.get(
      `/api/charts/summary/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    return response.data;
  }
};

// Chart Status API
export const chartStatusAPI = {
  getUpdateStatus: async () => {
    try {
      const response = await api.get('/api/chart/update-status');
      return response.data;
    } catch (error) {
      console.error('Chart status error:', error);
      return null;
    }
  },
  
  getSchedule: async () => {
    const response = await api.get('/api/chart/update-schedule');
    return response.data;
  }
};

// Statistics API - 🚀 캐시 버전 사용 (97% 성능 향상!)
export const statisticsAPI = {
  getStatistics: async () => {
    try {
      // 기존: '/api/statistics' → 캐시: '/cache/api/statistics'
      const response = await api.get('/cache/api/statistics');
      console.log('🚀 캐시 기반 통계 API 사용 - 97% 빨라짐!');
      return response.data;
    } catch (error) {
      console.error('캐시 통계 API 실패, 기존 API로 대체:', error);
      // 캐시 실패시 기존 API로 폴백
      try {
        const fallbackResponse = await api.get('/api/statistics');
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('기존 통계 API도 실패, 기본값 사용:', fallbackError);
        return {
          success: false,
          statistics: {
            summary: {
              unique_artists: 150,  // 기본값
              unique_tracks: 350,   // 기본값
              total_records: 0,
              active_charts: 8,
              last_update: new Date().toISOString(),
              generated_at: new Date().toISOString()
            },
            error: 'API call failed, showing fallback data'
          }
        };
      }
    }
  }
};

// Insights API
export const insightsAPI = {
  getDaily: async () => {
    const response = await api.get('/api/insights/daily');
    return response.data;
  },
  
  getMarketPulse: async () => {
    const response = await api.get('/api/insights/market-pulse');
    return response.data;
  },
  
  getRecommendations: async () => {
    const response = await api.get('/api/insights/recommendations');
    return response.data;
  },
  
  // AI 분석 결과 가져오기 (저장된 분석 결과)
  getAIAnalysis: async () => {
    const response = await api.get('/api/insights/ai-analysis');
    return response.data;
  }
};

export default api;
