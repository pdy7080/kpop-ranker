import React, { memo, useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Grid3x3, List, Sparkles, Clock, Filter
} from 'lucide-react';
import { trendingApi, chartIndividualAPI } from '@/lib/api';
import ChartIndividual from '@/components/ChartIndividual';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 차트 필터 정의 - YouTube 제거, Apple Music, Last.fm 추가
interface ChartFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const chartFilters: ChartFilter[] = [
  { id: 'all', name: '통합', icon: '🌍', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'melon', name: 'Melon', icon: '🍈', color: 'bg-green-500' },
  { id: 'genie', name: 'Genie', icon: '🧞', color: 'bg-blue-500' },
  { id: 'bugs', name: 'Bugs', icon: '🐛', color: 'bg-red-500' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', color: 'bg-green-600' },
  { id: 'flo', name: 'FLO', icon: '🌊', color: 'bg-blue-600' },
  // YouTube 제거됨
  { id: 'apple_music', name: 'Apple Music', icon: '🍎', color: 'bg-gray-800' },
  { id: 'lastfm', name: 'Last.fm', icon: '🎵', color: 'bg-red-800' },
];

// 최적화된 API 클라이언트 (기존 로직 유지)
const optimizedTrendingAPI = {
  async getTrending(limit = 50) {
    const startTime = Date.now();
    
    try {
      // 최적화된 캐시 API 사용 (기존 성능 유지)
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

// 최적화된 트랙 카드 컴포넌트 - 모바일 반응형 개선
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
  
  const imageUrl = useMemo(() => {
    if (track.image_url) return track.image_url;
    if (track.album_image) return track.album_image;
    const encodedArtist = encodeURIComponent(track.artist || track.unified_artist || '');
    const encodedTrack = encodeURIComponent(track.track || track.title || track.unified_track || '');
    return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  }, [track]);
  
  const getTrendIcon = () => {
    if (track.trend === 'up' || track.is_rising) {
      return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />;
    }
    if (track.trend === 'new' || track.is_new) {
      return <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />;
    }
    return null;
  };
  
  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return Math.round(score);
  };
  
  // 리스트 뷰 - 모바일 최적화
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        onClick={onClick}
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Rank - 모바일에서 더 작게 */}
          <div className="flex-shrink-0 w-8 sm:w-12 text-center">
            <span className="text-lg sm:text-2xl font-bold text-purple-400">
              {index + 1}
            </span>
          </div>
          
          {/* Album Image - 모바일 크기 조정 */}
          <div className="flex-shrink-0">
            <div className="relative w-12 h-12 sm:w-[60px] sm:h-[60px]">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-700 animate-pulse rounded" />
              )}
              <img
                src={imageError ? '/images/default-album.svg' : imageUrl}
                alt={`${track.artist} - ${track.track}`}
                className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                loading={index > 5 ? "lazy" : "eager"}
              />
            </div>
          </div>
          
          {/* Track Info - 모바일 텍스트 크기 조정 */}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-sm sm:text-lg truncate group-hover:text-purple-400 transition-colors">
              {track.track || track.title || track.unified_track}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 truncate">
              {track.artist || track.unified_artist}
            </p>
          </div>
          
          {/* Charts - 모바일에서 숨김 */}
          <div className="hidden md:flex items-center space-x-2">
            {Object.entries(track.charts || {}).slice(0, 3).map(([chart, rank]) => (
              <span key={chart} className="px-2 py-1 bg-gray-700/50 rounded text-xs">
                {chart}: #{rank}
              </span>
            ))}
          </div>
          
          {/* Score & Trend - 모바일 크기 조정 */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {getTrendIcon()}
            <span className="text-xs sm:text-sm font-medium text-gray-300">
              {formatScore(track.score || 0)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // 그리드 뷰 - 모바일 최적화
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group relative"
    >
      {/* Rank Badge */}
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-black/70 backdrop-blur-sm rounded px-1 sm:px-2 py-0.5 sm:py-1">
        <span className="text-xs sm:text-sm font-bold text-purple-400">#{index + 1}</span>
      </div>
      
      {/* Trend Icon */}
      {getTrendIcon() && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
          {getTrendIcon()}
        </div>
      )}
      
      {/* Album Image - 모바일 최적화 */}
      <div className="aspect-square">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}
        <img
          src={imageError ? '/images/default-album.svg' : imageUrl}
          alt={`${track.artist} - ${track.track}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading={index > 10 ? "lazy" : "eager"}
        />
      </div>
      
      {/* Track Info - 모바일 패딩 및 텍스트 크기 조정 */}
      <div className="p-2 sm:p-4">
        <h3 className="font-semibold text-xs sm:text-base truncate group-hover:text-purple-400 transition-colors">
          {track.track || track.title || track.unified_track}
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 truncate mt-0.5 sm:mt-1">
          {track.artist || track.unified_artist}
        </p>
        
        {/* Score - 모바일 크기 조정 */}
        <div className="mt-1 sm:mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Score</span>
          <span className="text-xs sm:text-sm font-medium text-purple-400">
            {formatScore(track.score || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

OptimizedTrackCard.displayName = 'OptimizedTrackCard';

// 메인 컴포넌트
const TrendingPage = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChart, setSelectedChart] = useState('all');
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadTime, setLoadTime] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  
  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    // 트렌딩 데이터 로드
    const result = await optimizedTrendingAPI.getTrending(50);
    
    if (result.success && result.trending) {
      setTrendingData(result.trending);
      setChartData({ all: result.trending });
      setLoadTime(result.loadTime || 0);
      setLastUpdate(new Date());
    }
    
    // 개별 차트 데이터 로드 (선택시)
    if (selectedChart !== 'all') {
      try {
        const chartResult = await chartIndividualAPI.getChartData(selectedChart);
        if (chartResult.tracks) {
          setChartData(prev => ({ ...prev, [selectedChart]: chartResult.tracks }));
        }
      } catch (error) {
        console.error('Chart data load error:', error);
      }
    }
    
    setLoading(false);
  };
  
  // 필터된 트랙
  const filteredTracks = useMemo(() => {
    let tracks = selectedChart === 'all' 
      ? trendingData 
      : (chartData[selectedChart] || []);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      tracks = tracks.filter(track => 
        track.artist?.toLowerCase().includes(term) ||
        track.track?.toLowerCase().includes(term) ||
        track.title?.toLowerCase().includes(term) ||
        track.unified_artist?.toLowerCase().includes(term) ||
        track.unified_track?.toLowerCase().includes(term)
      );
    }
    
    return tracks;
  }, [trendingData, chartData, selectedChart, searchTerm]);
  
  const handleTrackClick = useCallback((track: any) => {
    const artist = encodeURIComponent(track.artist || track.unified_artist);
    const title = encodeURIComponent(track.track || track.title || track.unified_track);
    router.push(`/track/${artist}/${title}`);
  }, [router]);
  
  const handleChartChange = async (chartId: string) => {
    setSelectedChart(chartId);
    
    // 개별 차트 데이터 로드 (캐시되지 않은 경우)
    if (chartId !== 'all' && !chartData[chartId]) {
      setLoading(true);
      try {
        const result = await chartIndividualAPI.getChartData(chartId);
        if (result.tracks) {
          setChartData(prev => ({ ...prev, [chartId]: result.tracks }));
        }
      } catch (error) {
        console.error('Chart data load error:', error);
      }
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>트렌딩 - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 인기 차트 및 트렌딩 음악" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header - 모바일 최적화 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                실시간 트렌딩
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              전 세계 K-POP 차트 실시간 인기 순위
            </p>
          </motion.div>
          
          {/* Controls - 모바일 반응형 */}
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            {/* Chart Filters - 모바일 스크롤 */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {chartFilters.map((chart) => (
                  <button
                    key={chart.id}
                    onClick={() => handleChartChange(chart.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-sm sm:text-base whitespace-nowrap ${
                      selectedChart === chart.id
                        ? chart.color + ' text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-1">{chart.icon}</span>
                    {chart.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Search & View Toggle - 모바일 반응형 */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 rounded-lg text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600' : 'bg-gray-800'}`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded ${viewMode === 'list' ? 'bg-purple-600' : 'bg-gray-800'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Count - 모바일 텍스트 크기 */}
          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-400">
            {filteredTracks.length}개 트랙 • 마지막 업데이트: {lastUpdate.toLocaleString('ko-KR')}
            {loadTime > 0 && <span className="ml-2">({loadTime}ms)</span>}
          </div>
          
          {/* Loading State */}
          {loading ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4"
                : "space-y-2 sm:space-y-3"
            }>
              {[...Array(10)].map((_, i) => (
                <div key={i} className={
                  viewMode === 'grid' 
                    ? "aspect-square bg-gray-800 rounded-lg animate-pulse" 
                    : "h-16 sm:h-20 bg-gray-800 rounded-lg animate-pulse"
                } />
              ))}
            </div>
          ) : (
            /* Tracks Grid/List - 모바일 그리드 조정 */
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4"
                : "space-y-2 sm:space-y-3"
            }>
              {filteredTracks.map((track, index) => (
                <OptimizedTrackCard
                  key={`${track.artist}-${track.track}-${index}`}
                  track={track}
                  index={index}
                  viewMode={viewMode}
                  onClick={() => handleTrackClick(track)}
                />
              ))}
            </div>
          )}
          
          {/* Empty State - 모바일 텍스트 크기 */}
          {!loading && filteredTracks.length === 0 && (
            <div className="text-center py-10 sm:py-20">
              <p className="text-gray-400 text-sm sm:text-lg">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default memo(TrendingPage);