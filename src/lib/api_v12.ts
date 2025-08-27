// api_v12.ts - 백엔드 v8.0과 호환되는 API 클라이언트
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API 요청: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API 에러: ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

interface SearchResult {
  artist: string;
  track: string;
  rank?: number;
  album_image?: string;
  chart?: string;
}

interface TrendingTrack {
  artist: string;
  track?: string;
  title?: string;
  album_image?: string;
  trending_score?: number;
  rank?: number;
  charts?: any;
}

const apiClient = {
  // 검색
  search: async (query: string) => {
    const response = await api.get('/api/search', {
      params: { q: query }
    });
    return response.data;
  },

  // 자동완성
  autocomplete: async (query: string) => {
    const response = await api.get('/api/autocomplete', {
      params: { q: query, limit: 10 }
    });
    return response.data;
  },

  // 트렌딩
  getTrending: async (limit: number = 20) => {
    try {
      const response = await api.get('/api/trending', {
        params: { limit }
      });
      
      // 응답 데이터 정규화
      if (response.data) {
        // tracks 배열이 있는지 확인
        const tracks = response.data.tracks || response.data.trending || response.data.items || [];
        
        return {
          tracks: tracks.map((track: any) => ({
            ...track,
            title: track.title || track.track || track.name,
            album_image: track.album_image || track.image_url || track.optimized_album_image
          }))
        };
      }
      
      return { tracks: [] };
    } catch (error) {
      console.error('Trending API error:', error);
      return { tracks: [] };
    }
  },

  // 아티스트 정보 - 여러 엔드포인트 시도
  getArtistComplete: async (artist: string) => {
    try {
      // 먼저 /complete 엔드포인트 시도
      try {
        const response = await api.get(`/api/artist/${encodeURIComponent(artist)}/complete`);
        return response.data;
      } catch (e) {
        console.log('complete 엔드포인트 실패, 기본 엔드포인트 시도');
      }
      
      // 기본 엔드포인트 시도
      const response = await api.get(`/api/artist/${encodeURIComponent(artist)}`);
      return response.data;
    } catch (error) {
      console.error('Artist API error:', error);
      
      // 검색 API로 폴백
      const searchResponse = await api.get('/api/search', {
        params: { q: artist, type: 'artist' }
      });
      
      if (searchResponse.data?.results?.length > 0) {
        // 검색 결과를 아티스트 데이터 형식으로 변환
        const tracks = searchResponse.data.results;
        const charts: any = {};
        
        tracks.forEach((track: any) => {
          if (track.chart) {
            if (!charts[track.chart]) {
              charts[track.chart] = [];
            }
            charts[track.chart].push(track);
          }
        });
        
        return {
          artist: artist,
          unique_tracks: tracks.length,
          charts: charts,
          best_ranks: {},
          tracks: tracks
        };
      }
      
      throw error;
    }
  },

  // 트랙 상세 - 여러 엔드포인트 시도
  getTrackDetail: async (artist: string, track: string) => {
    try {
      // 먼저 /detail 엔드포인트 시도
      try {
        const response = await api.get(`/api/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}/detail`);
        return response.data;
      } catch (e) {
        console.log('detail 엔드포인트 실패, 기본 엔드포인트 시도');
      }
      
      // 기본 엔드포인트 시도
      const response = await api.get(`/api/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
      return response.data;
    } catch (error) {
      console.error('Track API error:', error);
      
      // 검색 API로 폴백
      const searchResponse = await api.get('/api/search', {
        params: { q: `${artist} ${track}` }
      });
      
      if (searchResponse.data?.results?.length > 0) {
        const result = searchResponse.data.results[0];
        return {
          artist: artist,
          track: track,
          album_image: result.album_image,
          charts: { [result.chart || 'unknown']: [result] },
          current_ranks: { [result.chart || 'unknown']: result.rank },
          best_ranks: { [result.chart || 'unknown']: result.rank }
        };
      }
      
      throw error;
    }
  },

  // 차트 업데이트 상태
  getChartUpdateStatus: async () => {
    const response = await api.get('/api/chart/update-status');
    return response.data;
  },

  // 포트폴리오
  getPortfolio: async (userId: string) => {
    const response = await api.get(`/api/portfolio/${userId}`);
    return response.data;
  },

  // 인증
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
};

export default apiClient;