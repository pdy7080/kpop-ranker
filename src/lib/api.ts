import axios, { AxiosInstance } from 'axios';

// API URL 설정 - 백엔드 (포트 5000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

console.log('🔥 API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true  // 세션 쿠키 포함
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
    
    // 401 에러 시 로그인 페이지로 리다이렉트하지 않고 에러 반환
    if (error.response?.status === 401) {
      // 조용히 에러 반환 (리다이렉트 없음)
      return Promise.reject(new Error('Authentication required'));
    }
    
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
  
  getStatus: async () => {
    const response = await api.get('/api/auth/status');
    return response.data;
  },
  
  getUser: async () => {
    const response = await api.get('/api/auth/user');
    return response.data;
  },
  
  // OAuth 관련 함수들
  getGoogleOAuthUrl: async () => {
    try {
      const response = await api.get('/api/auth/oauth/google/url');
      return response.data;
    } catch (error) {
      console.warn('Google OAuth URL API 에러, 대체 방식 사용:', error);
      const CLIENT_ID = '665193635993-1m7ijedftmshe6ih769g2jkiuluti32m.apps.googleusercontent.com';
      const REDIRECT_URI = 'https://kpop-ranker.vercel.app/auth/callback';
      
      const auth_url = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
        
      return {
        success: true,
        url: auth_url,
        redirect_uri: REDIRECT_URI
      };
    }
  },
  
  getKakaoOAuthUrl: async () => {
    try {
      const response = await api.get('/api/auth/oauth/kakao/url');
      return response.data;
    } catch (error) {
      console.warn('Kakao OAuth URL API 에러, 대체 방식 사용:', error);
      const CLIENT_ID = 'fd87bbda53a9c6c6186a0a1544bbae66';
      const REDIRECT_URI = 'https://kpop-ranker.vercel.app/auth/callback';
      
      const auth_url = `https://kauth.kakao.com/oauth/authorize?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code`;
        
      return {
        success: true,
        url: auth_url,
        redirect_uri: REDIRECT_URI
      };
    }
  },
  
  handleGoogleCallback: async (code: string) => {
    const response = await api.post('/api/auth/oauth/google', { code });
    return response.data;
  },
  
  handleKakaoCallback: async (code: string) => {
    const response = await api.post('/api/auth/oauth/kakao', { code });
    return response.data;
  }
};

// Portfolio API - 수정된 버전
export const portfolioAPI = {
  get: async () => {
    try {
      const response = await api.get('/api/portfolio');
      return response.data;
    } catch (error) {
      console.error('Portfolio API error:', error);
      
      // 인증 에러 시 requireAuth 플래그 반환 (404 리다이렉트 방지)
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        return {
          success: false,
          requireAuth: true,
          items: [],
          message: 'Login required'
        };
      }
      
      throw error;
    }
  },
  
  add: async (artist: string, track: string) => {
    try {
      const response = await api.post('/api/portfolio/add', {
        artist,
        track
      });
      return response.data;
    } catch (error) {
      console.error('Portfolio add error:', error);
      
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        return {
          success: false,
          requireAuth: true,
          message: 'Login required'
        };
      }
      
      throw error;
    }
  },
  
  remove: async (itemId: string) => {
    try {
      const response = await api.delete(`/api/portfolio/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Portfolio remove error:', error);
      
      if (error.message === 'Authentication required' || error.response?.status === 401) {
        return {
          success: false,
          requireAuth: true,
          message: 'Login required'
        };
      }
      
      throw error;
    }
  },
  
  // 기존 호환성을 위한 함수들
  getPortfolio: async (email?: string) => {
    return portfolioAPI.get();
  },
  
  addTrack: async (artist: string, title: string) => {
    return portfolioAPI.add(artist, title);
  },
  
  removeTrack: async (artist: string, title: string) => {
    // ID 기반으로 변경되었으므로 임시로 에러 반환
    throw new Error('Use remove(itemId) instead');
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

// Trending API
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

// Artist API
export const artistAPI = {
  getDetails: async (name: string) => {
    try {
      const response = await api.get(`/api/artist/v13/${encodeURIComponent(name)}/complete`);
      return response.data;
    } catch (error) {
      console.warn('v13 API failed, falling back to v12:', error);
      const response = await api.get(`/api/artist/${encodeURIComponent(name)}/complete`);
      return response.data;
    }
  },
  
  invalidateCache: async (artistName?: string) => {
    const response = await api.post('/api/artist/v13/cache/invalidate', {
      artist: artistName
    });
    return response.data;
  },
  
  getPopular: async (limit: number = 20) => {
    const response = await api.get('/api/artist/v13/popular', {
      params: { limit }
    });
    return response.data;
  }
};

// Track API
export const trackAPI = {
  getDetails: async (artist: string, title: string) => {
    try {
      const response = await api.get(
        `/api/track/v16/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );
      return response.data;
    } catch (error) {
      console.warn('v16 API failed, falling back to v15:', error);
      const response = await api.get(
        `/api/track/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );
      return response.data;
    }
  },
  
  getTrackDetail: async (artist: string, title: string) => {
    return trackAPI.getDetails(artist, title);
  },
  
  getPopular: async (limit: number = 20) => {
    const response = await api.get('/api/track/v16/popular', {
      params: { limit }
    });
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

// Statistics API
export const statisticsAPI = {
  getStatistics: async () => {
    try {
      const response = await api.get('/api/statistics', {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Statistics API failed, using defaults:', error);
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

// Chart Individual API
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
