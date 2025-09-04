import React, { memo, useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Grid3x3, List, Sparkles, Clock, Filter
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 최적화된 API 클라이언트
const optimizedTrendingAPI = {
  async getTrending(limit = 50) {
    const startTime = Date.now();
    
    try {
      // 최적화된 캐시 API 사용
      const response = await fetch(`${API_URL}/cache/api/trending?limit=${limit}&fast=true`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const loadTime = Date.now() - startTime;
      
      return {
        trending: data.trending || [],
        loadTime,
        cached: data.cached || false,
        success: true
      };
      
    } catch (error) {
      console.error('Trending API error:', error);
      
      // 폴백: 기존 API 시도
      try {
        const fallbackResponse = await fetch(`${API_URL}/api/trending?limit=${limit}`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return {
            trending: fallbackData.trending || [],
            loadTime: Date.now() - startTime,
            cached: false,
            success: true,
            fallback: true
          };
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
      
      return {
        trending: [],
        loadTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }
};

// 최적화된 트랙 카드 컴포넌트
const OptimizedTrackCard = memo(({ 
  track, 
  index, 
  viewMode, 
  onClick 
}: {
  track: any;
  index: number;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 이미지 URL 최적화
  const imageUrl = useMemo(() => {
    if (track.has_real_image && track.image_url) {
      return track.image_url.startsWith('http') 
        ? track.image_url 
        : `${API_URL}${track.image_url}`;
    }
    return null;
  }, [track.has_real_image, track.image_url]);

  // 차트 정보 최적화
  const chartInfo = useMemo(() => {
    const chartColors: Record<string, string> = {
      melon: 'bg-green-500',
      genie: 'bg-blue-500', 
      bugs: 'bg-red-500',
      spotify: 'bg-green-600',
      flo: 'bg-blue-600',
      apple_music: 'bg-gray-800'
    };
    
    return Object.entries(track.charts || {})
      .slice(0, 4)
      .map(([chart, rank]) => ({
        chart,
        rank,
        color: chartColors[chart.toLowerCase()] || 'bg-gray-600'
      }));
  }, [track.charts]);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: Math.min(index * 0.02, 0.5) }}
        onClick={onClick}
        className="bg-gray-800/50 backdrop-blur rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500 flex items-center gap-4"
      >
        {/* 순위 */}
        <div className="text-2xl font-bold text-gray-400 w-8">
          #{index + 1}
        </div>

        {/* 이미지 */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={`${track.artist} - ${track.track}`}
              className={`w-full h-full object-cover transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading={index < 10 ? 'eager' : 'lazy'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xl">🎵</span>
            </div>
          )}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-600 animate-pulse" />
          )}
        </div>

        {/* 정보 */}
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-white truncate mb-1">
            {track.track}
          </h3>
          <p className="text-gray-300 text-sm truncate mb-2">
            {track.artist}
          </p>
          
          {/* 차트 배지 */}
          <div className="flex gap-1 flex-wrap">
            {chartInfo.map(({ chart, rank, color }) => (
              <span
                key={chart}
                className={`px-2 py-1 rounded-full text-xs font-medium ${color} text-white`}
              >
                {chart.toUpperCase()} #{rank}
              </span>
            ))}
          </div>
        </div>

        {/* 스코어 */}
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-bold text-purple-400">
            {Math.round(track.score || 0)}
          </div>
          <div className="text-xs text-gray-400">
            {track.chart_count}차트
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid 모드
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className="group bg-gray-800/50 backdrop-blur rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500 relative"
    >
      {/* 순위 배지 */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
        #{index + 1}
      </div>

      {/* 이미지 */}
      <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gray-700 relative">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`${track.artist} - ${track.track}`}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
            }`}
            loading={index < 8 ? 'eager' : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-4xl">🎵</span>
          </div>
        )}
        {!imageLoaded && !imageError && imageUrl && (
          <div className="absolute inset-0 bg-gray-600 animate-pulse" />
        )}
      </div>

      {/* 정보 */}
      <div className="space-y-2">
        <h3 className="font-bold text-white text-sm leading-tight group-hover:text-purple-300 transition-colors line-clamp-2">
          {track.track}
        </h3>
        <p className="text-gray-300 text-xs truncate">
          {track.artist}
        </p>
        
        {/* 차트 배지 */}
        <div className="flex gap-1 flex-wrap">
          {chartInfo.slice(0, 3).map(({ chart, rank, color }) => (
            <span
              key={chart}
              className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${color} text-white`}
            >
              #{rank}
            </span>
          ))}
          {chartInfo.length > 3 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
              +{chartInfo.length - 3}
            </span>
          )}
        </div>

        {/* 스코어 */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-purple-400">
            {Math.round(track.score || 0)}
          </span>
          <span className="text-xs text-gray-400">
            {track.chart_count}차트
          </span>
        </div>
      </div>
    </motion.div>
  );
});

// 가상 스크롤 컴포넌트 (간소화)
const VirtualizedList = memo(({ 
  tracks, 
  viewMode, 
  onTrackClick 
}: {
  tracks: any[];
  viewMode: 'grid' | 'list';
  onTrackClick: (artist: string, track: string) => void;
}) => {
  const [visibleCount, setVisibleCount] = useState(20);
  
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 20, tracks.length));
  }, [tracks.length]);

  const visibleTracks = useMemo(() => {
    return tracks.slice(0, visibleCount);
  }, [tracks, visibleCount]);

  return (
    <div>
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-2 lg:grid-cols-4 gap-4' 
        : 'space-y-4'
      }>
        {visibleTracks.map((track, idx) => (
          <OptimizedTrackCard
            key={`${track.artist}-${track.track}-${idx}`}
            track={track}
            index={idx}
            viewMode={viewMode}
            onClick={() => onTrackClick(track.artist, track.track)}
          />
        ))}
      </div>
      
      {/* Load More 버튼 */}
      {visibleCount < tracks.length && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            더 보기 ({tracks.length - visibleCount}개 남음)
          </button>
        </div>
      )}
    </div>
  );
});

// 메인 컴포넌트
export default function OptimizedTrendingPage() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [loadTime, setLoadTime] = useState(0);
  const [cached, setCached] = useState(false);

  const loadTrendingData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const result = await optimizedTrendingAPI.getTrending(50);
      
      setTrendingTracks(result.trending);
      setLoadTime(result.loadTime);
      setCached(result.cached);
      
      console.log(`🚀 Trending loaded: ${result.trending.length} tracks in ${result.loadTime}ms (cached: ${result.cached})`);
      
    } catch (error) {
      console.error('트렌딩 데이터 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTrackClick = useCallback((artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  }, [router]);

  useEffect(() => {
    loadTrendingData();
  }, [loadTrendingData]);

  return (
    <Layout>
      <Head>
        <title>트렌딩 - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 트렌드 분석 - 최적화됨" />
        <link rel="preconnect" href={API_URL} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="container mx-auto px-4 py-8">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-pink-400" />
              <h1 className="text-4xl font-bold text-white">TRENDING</h1>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-gray-300 text-lg">실시간 K-POP 트렌드 분석 ⚡</p>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-semibold">
                  {cached ? 'CACHED' : 'LIVE'}
                </span>
              </div>
              {loadTime > 0 && (
                <span className="text-gray-400 text-sm">
                  ⚡ {loadTime}ms
                </span>
              )}
            </div>
          </motion.div>

          {/* 뷰 모드 및 통계 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center mb-6"
          >
            <div className="text-white">
              <span className="text-lg font-semibold">
                {trendingTracks.length}개 트랙
              </span>
              {!isLoading && (
                <span className="text-gray-400 ml-2">
                  • 최적화 적용됨
                </span>
              )}
            </div>

            <div className="flex bg-white/10 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* 컨텐츠 영역 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center min-h-96">
                <div className="text-white text-xl flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  최적화된 데이터 로딩 중...
                </div>
              </div>
            ) : (
              <VirtualizedList
                tracks={trendingTracks}
                viewMode={viewMode}
                onTrackClick={handleTrackClick}
              />
            )}
          </motion.div>

          {/* 성능 정보 (개발 모드) */}
          {process.env.NODE_ENV === 'development' && loadTime > 0 && (
            <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg border border-purple-500/30">
              <div>로딩: {loadTime}ms</div>
              <div>트랙: {trendingTracks.length}개</div>
              <div>캐시: {cached ? '적용' : '미적용'}</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// CSS 추가
const additionalStyles = `
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

// 스타일 주입
if (typeof window !== 'undefined' && !document.getElementById('trending-optimized-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'trending-optimized-styles';
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}