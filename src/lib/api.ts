// API 라이브러리 - Vercel 배포용 (최종 수정)
// CORS 및 API 연동 문제 완전 해결

import axios from 'axios';

// API URL 설정 - 백엔드 확인
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.kpopranker.chargeapp.net';

console.log('API URL configured:', API_URL);

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CORS 인증 정보 포함
  withCredentials: false  // 일단 false로 설정 (쿠키 불필요)
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // CORS 에러 처리
      if (error.response.status === 0 || !error.response.status) {
        console.error('CORS Error detected. Check backend CORS settings.');
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 안전한 API 호출 헬퍼
const safeApiCall = async <T>(
  apiCall: () => Promise<any>,
  fallbackData: T
): Promise<T> => {
  try {
    const response = await apiCall();
    return response.data || response;
  } catch (error) {
    console.warn('API call failed, using fallback data:', error);
    return fallbackData;
  }
};

// Search API
export const searchApi = {
  search: async (artist: string, track: string): Promise<any> => {
    return safeApiCall(async () => {
      if (track && track.trim() !== '' && track !== artist) {
        return await api.get('/api/search2', {
          params: { artist, track }
        });
      } else {
        const query = track || artist;
        return await api.get('/api/search', {
          params: { q: query }
        });
      }
    }, { results: [], message: 'No results found' });
  },
  
  unifiedSearch: async (query: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/search', { params: { q: query } }),
      { results: [], message: 'No results found' }
    );
  },
  
  autocomplete: async (query: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/autocomplete/unified', { 
        params: { q: query, limit: 10 } 
      }),
      { suggestions: [] }
    );
  }
};

// Trending API
export const trendingApi = {
  getTrending: async (type: string = 'all', limit: number = 10): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/trending', { 
        params: { type, limit } 
      }),
      { 
        trending: [],
        message: 'No trending data available'
      }
    );
  }
};

// Artist API
export const artistApi = {
  getArtistComplete: async (artistName: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/artist/${encodeURIComponent(artistName)}/complete`),
      { 
        artist: artistName,
        tracks: [],
        stats: {},
        message: 'Artist data not found'
      }
    );
  },
  
  getArtistTracks: async (artistName: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/artist/${encodeURIComponent(artistName)}/tracks`),
      { tracks: [] }
    );
  }
};

// Chart API
export const chartApi = {
  getChartHistory: async (chart: string, artist: string, track: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/chart/history/${chart}/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`),
      { history: [], message: 'No history available' }
    );
  },
  
  getChartSummary: async (artist: string, track: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/charts/summary/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`),
      { summary: {}, charts: [] }
    );
  },
  
  getUpdateStatus: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/chart/update-status'),
      { status: 'unknown', last_update: null }
    );
  }
};

// Portfolio API
export const portfolioApi = {
  getPortfolio: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/portfolio'),
      { items: [] }
    );
  },
  
  addToPortfolio: async (item: any): Promise<any> => {
    return safeApiCall(
      async () => await api.post('/api/portfolio', item),
      { success: false, message: 'Failed to add' }
    );
  },
  
  removeFromPortfolio: async (id: string): Promise<any> => {
    return safeApiCall(
      async () => await api.delete(`/api/portfolio/${id}`),
      { success: false, message: 'Failed to remove' }
    );
  }
};

// Auth API
export const authApi = {
  demoLogin: async (name?: string, email?: string): Promise<any> => {
    return safeApiCall(
      async () => await api.post('/api/auth/demo-login', { 
        name: name || 'Demo User',
        email: email || 'demo@kpopranker.com'
      }),
      { success: false, message: 'Login failed' }
    );
  },
  
  logout: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.post('/api/auth/logout'),
      { success: true }
    );
  },
  
  getStatus: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/auth/status'),
      { authenticated: false }
    );
  },
  
  getUser: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/auth/user'),
      { user: null }
    );
  }
};

// Insights API
export const insightsApi = {
  getDaily: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/insights/daily'),
      { insights: [], date: new Date().toISOString() }
    );
  },
  
  getRecommendations: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/insights/recommendations'),
      { recommendations: [] }
    );
  },
  
  getMarketPulse: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/insights/market-pulse'),
      { pulse: {}, trends: [] }
    );
  }
};

// Image API
export const imageApi = {
  getAlbumImage: (artist: string, track: string): string => {
    // 직접 URL 생성 (API 호출 없이)
    return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  },
  
  checkImageStatus: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/images/check'),
      { status: 'unknown', count: 0 }
    );
  }
};

// Health Check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/health');
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Export default instance
export default api;
