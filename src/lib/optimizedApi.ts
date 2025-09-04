/**
 * 최적화된 아티스트 API 클라이언트
 * - 캐싱 지원
 * - 페이지네이션
 * - 에러 핸들링 개선
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 클라이언트 사이드 캐시
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5분

interface CacheEntry {
  data: any;
  timestamp: number;
}

const isValidCache = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

const getCachedData = (key: string): any | null => {
  const entry = cache.get(key);
  if (entry && isValidCache(entry)) {
    return entry.data;
  }
  cache.delete(key);
  return null;
};

const setCacheData = (key: string, data: any): void => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// 성능 모니터링
const performanceLog = (operation: string, startTime: number) => {
  const duration = Date.now() - startTime;
  console.log(`🚀 ${operation}: ${duration}ms`);
  return duration;
};

export const optimizedArtistAPI = {
  // 아티스트 요약 정보 (빠른 로딩)
  async getSummary(artistName: string) {
    const startTime = Date.now();
    const cacheKey = `artist_summary_${artistName}`;
    
    // 캐시 확인
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      performanceLog(`Artist Summary (Cached) - ${artistName}`, startTime);
      return { ...cachedData, cached: true };
    }

    try {
      const response = await axios.get(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/summary`);
      const data = response.data;
      
      if (data.success) {
        setCacheData(cacheKey, data);
        performanceLog(`Artist Summary - ${artistName}`, startTime);
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch artist summary');
      }
    } catch (error) {
      console.error('❌ Artist Summary Error:', error);
      performanceLog(`Artist Summary Error - ${artistName}`, startTime);
      throw error;
    }
  },

  // 아티스트 트랙 목록 (페이지네이션)
  async getTracks(artistName: string, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'trend'
    } = options as any;
    
    const startTime = Date.now();
    const cacheKey = `artist_tracks_${artistName}_${page}_${limit}_${sort}`;
    
    // 캐시 확인
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      performanceLog(`Artist Tracks (Cached) - ${artistName}`, startTime);
      return { ...cachedData, cached: true };
    }

    try {
      const response = await axios.get(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/tracks`, {
        params: { page, limit, sort }
      });
      const data = response.data;
      
      if (data.success) {
        setCacheData(cacheKey, data);
        performanceLog(`Artist Tracks - ${artistName}`, startTime);
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch artist tracks');
      }
    } catch (error) {
      console.error('❌ Artist Tracks Error:', error);
      performanceLog(`Artist Tracks Error - ${artistName}`, startTime);
      throw error;
    }
  },

  // 전체 아티스트 정보 (기존 호환성)
  async getComplete(artistName: string) {
    const startTime = Date.now();
    
    try {
      // 요약 정보와 첫 페이지 트랙을 동시 요청
      const [summaryPromise, tracksPromise] = await Promise.all([
        this.getSummary(artistName),
        this.getTracks(artistName, { page: 1, limit: 10 })
      ]);

      const summary = await summaryPromise;
      const tracks = await tracksPromise;

      const completeData = {
        success: true,
        artist: summary.artist,
        tracks: tracks.tracks || [],
        total_tracks: summary.total_tracks,
        active_charts: summary.active_charts,
        best_ranking: summary.best_rank,
        stats: {
          total_tracks: summary.total_tracks,
          best_rank: summary.best_rank,
          active_charts: summary.active_charts,
          popularity: summary.stats?.popularity || 0,
          success_rate: summary.stats?.success_rate || 0
        }
      };

      performanceLog(`Artist Complete - ${artistName}`, startTime);
      return completeData;

    } catch (error) {
      console.error('❌ Artist Complete Error:', error);
      performanceLog(`Artist Complete Error - ${artistName}`, startTime);
      throw error;
    }
  },

  // 캐시 관리
  clearCache(artistName?: string) {
    if (artistName) {
      // 특정 아티스트 캐시만 삭제
      const keysToDelete = Array.from(cache.keys()).filter(key => 
        key.includes(artistName)
      );
      keysToDelete.forEach(key => cache.delete(key));
    } else {
      // 전체 캐시 삭제
      cache.clear();
    }
  },

  // 캐시 통계
  getCacheStats() {
    const now = Date.now();
    const validEntries = Array.from(cache.values()).filter(entry => 
      isValidCache(entry as CacheEntry)
    );
    
    return {
      total: cache.size,
      valid: validEntries.length,
      hitRatio: cache.size > 0 ? ((validEntries.length / cache.size) * 100).toFixed(1) + '%' : '0%'
    };
  },

  // 프리로드 (백그라운드에서 데이터 미리 로드)
  async preload(artistName: string) {
    try {
      // 백그라운드에서 데이터 로드 (에러 무시)
      Promise.all([
        this.getSummary(artistName).catch(() => {}),
        this.getTracks(artistName, { page: 1, limit: 10 }).catch(() => {})
      ]);
    } catch (error) {
      // 프리로드 에러는 무시
    }
  }
};

// React Hook for optimized artist data
export const useOptimizedArtist = (artistName: string) => {
  const [summary, setSummary] = React.useState(null);
  const [tracks, setTracks] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!artistName) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 요약 정보 먼저 로드 (빠른 응답)
        const summaryData = await optimizedArtistAPI.getSummary(artistName);
        setSummary(summaryData);
        
        // 트랙 정보는 백그라운드에서 로드
        setTimeout(async () => {
          try {
            const tracksData = await optimizedArtistAPI.getTracks(artistName);
            setTracks(tracksData);
          } catch (tracksError) {
            console.warn('Tracks loading failed:', tracksError);
          }
        }, 100);

      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [artistName]);

  return { summary, tracks, loading, error };
};

export default optimizedArtistAPI;