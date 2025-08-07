// API 라이브러리 - Vercel 배포용
// CORS 문제 해결 + 모든 API export 포함

import axios from 'axios';

// API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.kpopranker.chargeapp.net';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 기본 export
export default api;

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
      { trending: [] }
    );
  }
};

// Artist API
export const artistApi = {
  getArtistComplete: async (artist: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/artist/${encodeURIComponent(artist)}/complete`),
      null
    );
  },

  getArtistTracks: async (artist: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/artist/tracks`, { 
        params: { artist } 
      }),
      { tracks: [] }
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
      { success: false }
    );
  },

  removeFromPortfolio: async (id: string): Promise<any> => {
    return safeApiCall(
      async () => await api.delete(`/api/portfolio/${id}`),
      { success: false }
    );
  }
};

// Auth API
export const authApi = {
  demoLogin: async (name: string): Promise<any> => {
    return safeApiCall(
      async () => await api.post('/api/auth/demo-login', { name }),
      { success: false }
    );
  },

  logout: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.post('/api/auth/logout'),
      { success: false }
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

// Chart API
export const chartApi = {
  getChartHistory: async (chart: string, artist: string, track: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/chart/history/${chart}/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`),
      { history: [] }
    );
  },

  getChartSummary: async (artist: string, track: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/charts/summary/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`),
      { summary: {} }
    );
  },

  getUpdateStatus: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/chart/update-status'),
      { status: {} }
    );
  }
};

// Insights API
export const insightsApi = {
  getDaily: async (): Promise<any> => {
    return safeApiCall(
      async () => await api.get('/api/insights/daily'),
      { insights: [] }
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
      { pulse: {} }
    );
  }
};

// Track API
export const trackApi = {
  getTrackDetail: async (artist: string, track: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`),
      null
    );
  }
};

// News API
export const newsApi = {
  getNews: async (query?: string): Promise<any> => {
    const params = query ? { q: query } : {};
    return safeApiCall(
      async () => await api.get('/api/news', { params }),
      { news: [] }
    );
  }
};

// Goods API
export const goodsApi = {
  getGoods: async (artist?: string): Promise<any> => {
    const params = artist ? { artist } : {};
    return safeApiCall(
      async () => await api.get('/api/goods', { params }),
      { goods: [] }
    );
  }
};

// AI Match API
export const aiMatchApi = {
  getArtistMatch: async (artist: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/ai-match/artist/${encodeURIComponent(artist)}`),
      { match: null }
    );
  }
};

// 이미지 URL 생성 함수
export const getAlbumImageUrl = (artist: string, track: string) => {
  return `${API_URL}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
};

// API URL export (디버깅용)
export { API_URL };
