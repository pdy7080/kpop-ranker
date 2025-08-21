import axios from 'axios';

// 🔧 FastComet 배포 환경 최적화된 API 설정

// API URL 설정
const getApiUrl = () => {
  // 환경 변수 확인
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // 개발 환경
  if (process.env.NODE_ENV === 'development') {
    return apiUrl || 'http://localhost:5000';
  }
  
  // 프로덕션 환경
  return apiUrl || 'https://api.kpopranker.chargeapp.net';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CORS는 서버에서 처리하므로 withCredentials만 설정
  withCredentials: false
});

// ❌ 제거: Access-Control-Allow-Origin 헤더는 클라이언트가 보내면 안됨!
// 이 헤더는 서버가 응답에 포함시켜야 합니다.

// 요청 인터셉터 - 인증 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 개선
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        message: error.response.data?.message || error.response.statusText,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Network Error:', {
        message: error.message,
        url: error.config?.url
      });
    } else {
      console.error('Request Error:', error.message);
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

// Search API - 배포 환경 최적화
export const searchApi = {
  search: async (artist: string, track: string): Promise<any> => {
    return safeApiCall(async () => {
      if (track && track.trim() !== '' && track !== artist) {
        // 트랙 지정 검색 - 아티스트와 트랙이 다를 때만
        return await api.get('/api/search2', {
          params: { artist, track }
        });
      } else {
        // 통합 검색 - 아티스트나 트랙명으로 검색
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
  },

  getArtistNews: async (artist: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/artist/${encodeURIComponent(artist)}/news`),
      { news: [] }
    );
  },

  getArtistGoods: async (artist: string): Promise<any> => {
    return safeApiCall(
      async () => await api.get(`/api/artist/${encodeURIComponent(artist)}/goods`),
      { goods: [] }
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

  // OAuth URL 가져오기
  getGoogleOAuthUrl: async (): Promise<any> => {
    try {
      const response = await api.get('/api/auth/oauth/google/url');
      return response;
    } catch (error) {
      console.error('Google OAuth URL error:', error);
      return { data: { success: false, url: '', configured: false } };
    }
  },

  getKakaoOAuthUrl: async (): Promise<any> => {
    try {
      const response = await api.get('/api/auth/oauth/kakao/url');
      return response;
    } catch (error) {
      console.error('Kakao OAuth URL error:', error);
      return { data: { success: false, url: '', configured: false } };
    }
  },

  // OAuth 콜백 처리
  googleCallback: async (code: string): Promise<any> => {
    try {
      console.log('🟢 Calling google OAuth callback API...');
      const response = await api.post('/api/auth/oauth/google/callback', { code });
      console.log('🟡 OAuth API Response:', {
        success: response?.data?.success,
        hasToken: !!response?.data?.token,
        hasUser: !!response?.data?.user,
        fullResponse: response?.data
      });
      return response;
    } catch (error) {
      console.error('🔴 Google OAuth API error:', error);
      throw error;
    }
  },

  kakaoCallback: async (code: string): Promise<any> => {
    try {
      console.log('🟢 Calling kakao OAuth callback API...');
      const response = await api.post('/api/auth/oauth/kakao/callback', { code });
      console.log('🟡 OAuth API Response:', {
        success: response?.data?.success,
        hasToken: !!response?.data?.token,
        hasUser: !!response?.data?.user
      });
      return response;
    } catch (error) {
      console.error('🔴 Kakao OAuth API error:', error);
      throw error;
    }
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

export default api;
