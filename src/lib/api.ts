import axios, { AxiosInstance } from 'axios';

// API URL 설정 - 백엔드 (포트 5000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

console.log('🔥 API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,  // 30초로 증가 (캐시 제거로 인한 안정성 확보)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false
});

// API 호출 로깅
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const authRequiredPaths = ['/api/portfolio', '/api/auth/user', '/api/auth/status', '/api/auth/logout'];
  const requiresAuth = authRequiredPaths.some(path => config.url?.includes(path));
  
  if (requiresAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  status: async () => {
    const response = await api.get('/api/auth/status');
    return response.data;
  },
  
  getUser: async () => {
    const response = await api.get('/api/auth/user');
    return response.data;
  }
};

// Portfolio API
export const portfolioAPI = {
  getPortfolio: async (email?: string) => {
    const userEmail = email || localStorage.getItem('user_email');
    if (!userEmail) throw new Error('User email not found');
    
    const response = await api.get(`/api/portfolio/${encodeURIComponent(userEmail)}`);
    return response.data;
  },
  
  addTrack: async (artist: string, title: string) => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) throw new Error('User not authenticated');
    
    const response = await api.post('/api/portfolio/add', {
      user_email: userEmail,
      artist,
      title
    });
    return response.data;
  },
  
  removeTrack: async (artist: string, title: string) => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) throw new Error('User not authenticated');
    
    const response = await api.post('/api/portfolio/remove', {
      user_email: userEmail,
      artist,
      title
    });
    return response.data;
  }
};

// Search API
export const searchAPI = {
  search: async (query: string, type: 'all' | 'artist' | 'track' = 'all', limit: number = 20) => {
    const response = await api.get('/api/search', {
      params: { q: query, type, limit }
    });
    return response.data;
  },
  
  autocomplete: async (query: string, limit: number = 10) => {
    const response = await api.get('/api/autocomplete/unified', {
      params: { q: query, limit }
    });
    return response.data;
  }
};

// Trending API - 캐시 제거, 직접 호출만
export const trendingApi = {
  getTrending: async (limit: number = 20) => {
    const response = await api.get('/api/trending', {
      params: { limit }
    });
    return response.data;
  },
  
  getArtistRanking: async (limit: number = 50) => {
    const response = await api.get('/api/artists/ranking', {
      params: { limit }
    });
    return response.data;
  }
};

// Artist API - 캐시 완전 제거
export const artistAPI = {
  getDetails: async (name: string) => {
    // 캐시 API 제거, 직접 호출만
    const response = await api.get(`/api/artist/${encodeURIComponent(name)}/complete`);
    return response.data;
  }
};

// Track API
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

// Statistics API - 캐시 제거, 간소화
export const statisticsAPI = {
  getStatistics: async () => {
    try {
      const response = await api.get('/api/statistics', {
        timeout: 5000  // 통계는 5초 제한
      });
      return response.data;
    } catch (error) {
      console.error('Statistics API failed, using defaults:', error);
      // 기본값 반환 (메인페이지 블로킹 방지)
      return {
        success: false,
        statistics: {
          summary: {
            unique_artists: 300,
            unique_tracks: 800,
            total_records: 0,
            active_charts: 8,
            last_update: new Date().toISOString()
          }
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
  
  getAIAnalysis: async () => {
    const response = await api.get('/api/insights/ai-analysis');
    return response.data;
  }
};

// Chart Individual API - 캐시 제거
export const chartIndividualAPI = {
  getChartLatest: async (chartName: string) => {
    const response = await api.get(`/api/chart/${chartName}/latest`);
    return response.data;
  },
  
  getChartsList: async () => {
    const response = await api.get('/api/charts/list');
    return response.data;
  },
  
  getChartsStatus: async () => {
    const response = await api.get('/api/charts/status');
    return response.data;
  }
};

export default api;