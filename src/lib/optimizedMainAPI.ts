/**
 * 최적화된 메인페이지 API 클라이언트
 * - 병렬 API 호출
 * - 클라이언트 캐싱
 * - 성능 모니터링
 */

import axios from 'axios';
import { useState, useEffect, useCallback, useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 클라이언트 캐시
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5분

interface CacheEntry {
  data: any;
  timestamp: number;
}

const getCachedData = (key: string) => {
  const entry = apiCache.get(key) as CacheEntry;
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  apiCache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any) => {
  apiCache.set(key, { data, timestamp: Date.now() });
};

// 성능 최적화된 API 클라이언트
export const optimizedMainAPI = {
  // 병렬 데이터 로딩
  async loadMainPageData(options = {}) {
    const { fastMode = true, limit = 10 } = options as any;
    
    const cacheKey = `main_data_${fastMode}_${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const startTime = Date.now();

    try {
      // 병렬 API 호출
      const [trendingResponse, statsResponse] = await Promise.all([
        // 최적화된 트렌딩 API 사용
        axios.get(`${API_URL}/api/trending/optimized`, {
          params: { limit, fast: fastMode },
          timeout: 10000
        }),
        
        // 캐시된 통계 API 사용
        axios.get(`${API_URL}/api/main/stats`, {
          timeout: 5000
        })
      ]);

      const result = {
        trending: trendingResponse.data.trending || [],
        stats: {
          totalTracks: statsResponse.data.total_tracks || 0,
          totalArtists: statsResponse.data.total_artists || 0,
          activeCharts: statsResponse.data.active_charts || 8,
          lastUpdate: statsResponse.data.last_update || ''
        },
        loadTime: Date.now() - startTime,
        cached: false
      };

      setCachedData(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Main page data loading failed:', error);
      
      // 에러 시 기본값 반환
      return {
        trending: [],
        stats: {
          totalTracks: 350,
          totalArtists: 150,
          activeCharts: 8,
          lastUpdate: ''
        },
        loadTime: Date.now() - startTime,
        error: error.message
      };
    }
  },

  // 이미지 프리로딩 최적화
  preloadImages(tracks: any[], priority = 5) {
    const highPriorityTracks = tracks.slice(0, priority);
    
    highPriorityTracks.forEach((track, index) => {
      const img = new Image();
      
      // 이미지 우선순위 설정
      if (index < 3) {
        img.loading = 'eager';
      } else {
        img.loading = 'lazy';
      }
      
      if (track.has_real_image && track.image_url) {
        img.src = track.image_url.startsWith('http') 
          ? track.image_url 
          : `${API_URL}${track.image_url}`;
      }
    });
  }
};

// React Hook - 최적화된 메인페이지 데이터
export const useOptimizedMainPage = (options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await optimizedMainAPI.loadMainPageData(options);
      
      // 이미지 프리로딩 (백그라운드)
      if (result.trending?.length > 0) {
        setTimeout(() => {
          optimizedMainAPI.preloadImages(result.trending, 5);
        }, 100);
      }

      setData(result);
    } catch (err) {
      setError(err);
      console.error('Main page hook error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    reload: loadData,
    fromCache: data?.fromCache || false
  };
};

// 컴포넌트 최적화 유틸
export const MainPageUtils = {
  // 이미지 URL 최적화
  optimizeImageUrl: (track: any) => {
    if (!track) return null;
    
    if (track.has_real_image && track.image_url) {
      return track.image_url.startsWith('http') 
        ? track.image_url 
        : `${API_URL}${track.image_url}`;
    }
    
    return null;
  },

  // 스코어 포맷팅
  formatScore: (score: number) => {
    return Math.round(score);
  },

  // 차트 순위 포맷팅
  formatChartRanks: (charts: Record<string, number>) => {
    return Object.entries(charts)
      .slice(0, 4) // 상위 4개만 표시
      .map(([chart, rank]) => ({ chart, rank }));
  }
};

export default optimizedMainAPI;