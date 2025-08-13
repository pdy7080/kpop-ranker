import axios from 'axios';

// 🔧 FastComet 배포 환경 최적화된 API 설정
// 시니어 개발자 Claude - 배포 문제 해결

// 🔥 API URL 설정 - 백엔드 refactored 버전 (포트 5000)
const getApiUrl = () => {
  // 환경 변수 확인
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // 개발 환경 - main.py 사용 (포트 5000)
  if (process.env.NODE_ENV === 'development') {
    return apiUrl || 'http://localhost:5000';  // main.py 기본 포트
  }
  
  // 프로덕션 환경 - 백엔드 서버 직접 연결
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
});

// 프로덕션 환경에서 CORS 처리
if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
  api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
}

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
  // autocomplete 메서드 추가 (호환성을 위해)
  autocomplete: async (query: string) => {
    return safeApiCall(async () => {
      return await api.get('/api/autocomplete/unified', {
        params: { q: query }
      });
    }, { suggestions: [] });
  },
  
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
    }, { results: [], message: '검색 결과를 불러올 수 없습니다.' });
  },
  
  searchByArtist: async (artist: string): Promise<any> => {
    return safeApiCall(async () => {
      // 🔥 통합 검색 API 사용 (곡명도 검색 가능)
      return await api.get('/api/search', {
        params: { q: artist }
      });
    }, { results: [], message: '검색 결과를 불러올 수 없습니다.' });
  },
  
  // 🔥 새로운 곡명 검색 함수
  searchByTrack: async (track: string): Promise<any> => {
    return safeApiCall(async () => {
      return await api.get('/api/search', {
        params: { q: track }
      });
    }, { results: [], message: '검색 결과를 불러올 수 없습니다.' });
  },
  
  getArtistTracks: async (artist: string): Promise<any> => {
    return safeApiCall(async () => {
      return await api.get('/api/artist/tracks', {
        params: { artist }
      });
    }, { tracks: [], message: '아티스트 트랙을 불러올 수 없습니다.' });
  }
};

// Autocomplete API
export const autocompleteApi = {
  complete: async (query: string) => {
    return safeApiCall(async () => {
      return await api.get('/api/autocomplete/unified', {
        params: { q: query }
      });
    }, { suggestions: [] });
  }
};

// Trending API
export const trendingApi = {
  getTrending: async (type: 'rising' | 'hot' | 'new' = 'hot', limit?: number) => {
    return safeApiCall(async () => {
      return await api.get('/api/trending', {
        params: { type, limit }
      });
    }, { tracks: [], artists: [] });
  }
};

// Portfolio API
export const portfolioApi = {
  getPortfolio: async () => {
    try {
      const response = await api.get('/api/portfolio');
      return response;
    } catch (error) {
      console.warn('Portfolio API failed:', error);
      return { data: { items: [] } };
    }
  },
  
  addToPortfolio: async (data: { artist: string; track: string }) => {
    try {
      const response = await api.post('/api/portfolio', data);
      return response;
    } catch (error) {
      console.warn('Add to portfolio failed:', error);
      throw error;
    }
  },
  
  removeFromPortfolio: async (id: number) => {
    try {
      const response = await api.delete(`/api/portfolio/${id}`);
      return response;
    } catch (error) {
      console.warn('Remove from portfolio failed:', error);
      throw error;
    }
  }
};

// Auth API - OAuth 기능 추가
export const authApi = {
  // OAuth URL 가져오기
  getGoogleOAuthUrl: async () => {
    try {
      const response = await api.get('/api/auth/oauth/google/url');
      return response;
    } catch (error) {
      console.warn('Failed to get Google OAuth URL:', error);
      throw error;
    }
  },
  
  getKakaoOAuthUrl: async () => {
    try {
      const response = await api.get('/api/auth/oauth/kakao/url');
      return response;
    } catch (error) {
      console.warn('Failed to get Kakao OAuth URL:', error);
      throw error;
    }
  },
  
  // OAuth 콜백 처리
  googleCallback: async (code: string) => {
    try {
      const response = await api.post('/api/auth/oauth/google/callback', { code });
      return response;
    } catch (error) {
      console.warn('Google OAuth callback failed:', error);
      throw error;
    }
  },
  
  kakaoCallback: async (code: string) => {
    try {
      const response = await api.post('/api/auth/oauth/kakao/callback', { code });
      return response;
    } catch (error) {
      console.warn('Kakao OAuth callback failed:', error);
      throw error;
    }
  },
  
  // OAuth 설정 확인 (디버깅용)
  checkOAuthConfig: async () => {
    try {
      const response = await api.get('/api/auth/oauth/config');
      return response;
    } catch (error) {
      console.warn('Failed to check OAuth config:', error);
      return { data: { config: {} } };
    }
  },
  
  demoLogin: async (name: string = 'Demo User', email: string = 'demo@kpopranker.com') => {
    try {
      const response = await api.post('/api/auth/demo-login', { name, email });
      return response;
    } catch (error) {
      console.warn('Demo login failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout', {});
      return response;
    } catch (error) {
      console.warn('Logout failed:', error);
      throw error;
    }
  },
  
  getStatus: async () => {
    return safeApiCall(async () => {
      return await api.get('/api/auth/status');
    }, { authenticated: false, user: null });
  },
  
  login: async (provider: string, code?: string) => {
    try {
      const response = await api.post('/api/auth/login', { provider, code });
      return response;
    } catch (error) {
      console.warn('Login failed:', error);
      throw error;
    }
  },
  
  getUser: async () => {
    return safeApiCall(async () => {
      return await api.get('/api/auth/user');
    }, { user: null });
  }
};

// Chart API
export const chartApi = {
  getUpdateStatus: async () => {
    return safeApiCall(async () => {
      return await api.get('/api/chart/update-status');
    }, { status: 'unknown', charts: [] });
  },
  
  getHistory: async (chart: string, artist: string, track: string, days: number = 30) => {
    return safeApiCall(async () => {
      const encodedArtist = encodeURIComponent(artist);
      const encodedTrack = encodeURIComponent(track);
      return await api.get(`/api/chart/history/${chart}/${encodedArtist}/${encodedTrack}?days=${days}`);
    }, { history: [], message: '차트 히스토리를 불러올 수 없습니다.' });
  },
  
  getSummary: async (artist: string, track: string) => {
    return safeApiCall(async () => {
      const encodedArtist = encodeURIComponent(artist);
      const encodedTrack = encodeURIComponent(track);
      return await api.get(`/api/charts/summary/${encodedArtist}/${encodedTrack}`);
    }, { charts: {}, summary: '차트 요약을 불러올 수 없습니다.' });
  }
};

// Insights API - AI 분석 기능
export const insightsApi = {
  getDailyInsights: async () => {
    return safeApiCall(async () => {
      return await api.get('/api/insights/daily');
    }, { 
      data: {
        trends: [],
        market_analysis: '현재 분석 중입니다.',
        recommendations: ['데이터를 수집하는 중입니다.']
      }
    });
  },
  
  getMarketPulse: async () => {
    return safeApiCall(async () => {
      return await api.get('/api/insights/market-pulse');
    }, { 
      data: {
        timestamp: new Date().toISOString(),
        active_artists: 0,
        trending_tracks: 0,
        market_sentiment: 'neutral',
        hot_topics: []
      }
    });
  },
  
  getRecommendations: async () => {
    return safeApiCall(async () => {
      return await api.get('/api/insights/recommendations');
    }, { 
      data: {
        artists_to_watch: [],
        trending_genres: [],
        investment_tips: ['곧 업데이트 예정입니다.']
      }
    });
  }
};

// 개발 환경 체크 함수
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// API 상태 체크 함수
export const checkApiStatus = async () => {
  try {
    const response = await api.get('/');
    return { status: 'ok', data: response.data };
  } catch (error) {
    return { status: 'error', error: error };
  }
};


export default api;
