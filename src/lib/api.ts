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
  remove: async (artist: string, track: string) => {
    const response = await api.delete('/api/portfolio/remove', {
      data: { artist, track }
    });
    return response.data;
  },
  analyze: async () => {
    const response = await api.get('/api/portfolio/analyze');
    return response.data;
  },
};

// Trending API - 표준 엔드포인트 사용
export const trendingApi = {
  getTrending: async (type = 'hot', limit = 20) => {
    try {
      const response = await api.get('/api/trending', {
        params: { type, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Trending API error:', error);
      throw error;
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

// Artist API v16 - 차트 독립성 및 AI 인사이트
export const artistAPI = {
  getDetails: async (name: string) => {
    const response = await api.get(`/api/artist/${encodeURIComponent(name)}/complete`);
    return response.data;
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

// Statistics API - 정제된 통계 데이터
export const statisticsAPI = {
  getStatistics: async () => {
    try {
      const response = await api.get('/api/statistics');
      return response.data;
    } catch (error) {
      console.error('Statistics API error:', error);
      return {
        success: false,
        statistics: {
          summary: {
            unique_artists: 150,  // 실제 예상값
            unique_tracks: 350,   // 실제 예상값
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
