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

// 차트 필터 정의 - Apple Music, Last.fm 추가
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
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' },
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

// 최적화된 트랙 카드 컴포넌트 (기존 로직 유지)
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
  
  // 이미지 URL 생성
  const imageUrl = useMemo(() => {
    if (track.image_url) return track.image_url;
    const encodedArtist = encodeURIComponent(track.artist);
    const encodedTrack = encodeURIComponent(track.track);
    return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  }, [track]);

  const renderChartBadge = (chartName: string, rank: number | string) => {
    const chartConfig: Record<string, { color: string; icon: string }> = {
      melon: { color: 'bg-green-600', icon: '🍈' },
      genie: { color: 'bg-blue-600', icon: '🧞' },
      bugs: { color: 'bg-orange-500', icon: '🐛' },
      flo: { color: 'bg-purple-500', icon: '🌊' },
      spotify: { color: 'bg-green-500', icon: '🎧' },
      youtube: { color: 'bg-red-500', icon: '📺' },
      apple_music: { color: 'bg-gray-800', icon: '🍎' },
      lastfm: { color: 'bg-red-800', icon: '🎵' }
    };
    
    const config = chartConfig[chartName] || { color: 'bg-gray-600', icon: '🎵' };
    
    return (
      <div className={`${config.color} text-white px-2 py-0.5 rounded text-xs flex items-center gap-0.5`}>
        <span>{config.icon}</span>
        <span>#{rank}</span>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
        onClick={onClick}
        className="flex items-center gap-4 p-3 bg-white/5 backdrop-blur rounded-lg cursor-pointer hover:bg-white/10 transition-all border border-white/10"
      >
        <div className="text-2xl font-bold text-purple-400 w-10 text-center">
          {index + 1}
        </div>
        
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0">
          {!imageError ? (
            <img 
              src={imageUrl}
              alt={track.track}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ display: imageLoaded || imageError ? 'block' : 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xl">
              🎵
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-semibold text-white truncate">{track.track}</h3>
          <p className="text-sm text-gray-300 truncate">{track.artist}</p>
        </div>
        
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {track.charts && Object.entries(track.charts)
            .filter(([_, rank]) => rank && rank !== '-')
            .slice(0, 3)
            .map(([chart, rank]) => renderChartBadge(chart, rank as number))}
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-yellow-400">
            {Math.round(track.score || 0)}
          </div>
          <div className="text-xs text-gray-400">점수</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur rounded-xl p-4 cursor-pointer hover:from-white/15 hover:to-white/10 transition-all border border-white/20"
    >
      <div className="relative mb-3">
        <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
          {!imageError ? (
            <img 
              src={imageUrl}
              alt={track.track}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ display: imageLoaded || imageError ? 'block' : 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl">
              🎵
            </div>
          )}
        </div>
        
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white px-2 py-1 rounded-full text-sm font-bold">
          #{index + 1}
        </div>
      </div>
      
      <h3 className="font-bold text-white mb-1 truncate">{track.track}</h3>
      <p className="text-sm text-gray-300 mb-2 truncate">{track.artist}</p>
      
      <div className="flex flex-wrap gap-1 mb-2 min-h-[28px]">
        {track.charts && Object.entries(track.charts)
          .filter(([_, rank]) => rank && rank !== '-')
          .slice(0, 3)
          .map(([chart, rank]) => renderChartBadge(chart, rank as number))}
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-white/10">
        <span className="text-xs text-gray-400">스코어</span>
        <span className="text-lg font-bold text-yellow-400">
          {Math.round(track.score || 0)}
        </span>
      </div>
    </motion.div>
  );
});

export default function TrendingPage() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [loadTime, setLoadTime] = useState(0);
  const [cached, setCached] = useState(false);
  
  // 차트별 개별 데이터 상태
  const [chartData, setChartData] = useState<any>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchTrendingData();
  }, [limit]);

  // 차트 선택 변경 시 처리
  useEffect(() => {
    if (selectedChart !== 'all') {
      fetchChartData(selectedChart);
    } else {
      setChartData(null);
    }
  }, [selectedChart]);

  const fetchTrendingData = async () => {
    try {
      setIsLoading(true);
      const data = await optimizedTrendingAPI.getTrending(limit);
      
      if (data.success && data.trending) {
        setTrendingTracks(data.trending);
        setLoadTime(data.loadTime);
        setCached(data.cached);
      }
    } catch (error) {
      console.error('트렌딩 데이터 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 차트별 개별 데이터 로딩
  const fetchChartData = async (chartName: string) => {
    if (chartName === 'all') return;
    
    try {
      setIsLoadingChart(true);
      setChartData(null);
      
      const data = await chartIndividualAPI.getChartLatest(chartName);
      
      if (data.success) {
        setChartData(data);
      } else {
        console.error(`${chartName} 차트 데이터 오류:`, data.error);
        setChartData({
          error: true,
          message: `${chartName} 차트 데이터를 불러올 수 없습니다.`
        });
      }
    } catch (error) {
      console.error(`${chartName} 차트 데이터 로딩 실패:`, error);
      setChartData({
        error: true,
        message: '차트 데이터 로딩 중 오류가 발생했습니다.'
      });
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  const handleChartTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  const filteredTracks = useMemo(() => {
    if (selectedChart === 'all') return trendingTracks;
    return trendingTracks.filter(track => track.charts && track.charts[selectedChart]);
  }, [trendingTracks, selectedChart]);

  return (
    <Layout>
      <Head>
        <title>실시간 트렌딩 차트 | KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 트렌딩 차트 - 모든 음원 사이트 통합 랭킹" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
        {/* Header Section */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <TrendingUp className="w-10 h-10 text-purple-400" />
              실시간 트렌딩 차트
            </h1>
            <p className="text-gray-300">
              모든 음원 사이트의 실시간 인기 차트를 한눈에
            </p>
            {loadTime > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                로딩 시간: {loadTime}ms {cached && '(캐시됨)'}
              </p>
            )}
          </motion.div>

          {/* Chart Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {chartFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedChart(filter.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedChart === filter.id
                    ? `${filter.color} text-white shadow-lg scale-105`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.name}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          {selectedChart === 'all' && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-purple-500"
              >
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
                <option value="100">Top 100</option>
              </select>
            </div>
          )}

          {/* Content Area */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-purple-400" />
              </motion.div>
            </div>
          ) : selectedChart !== 'all' && chartData ? (
            // 개별 차트 데이터 표시
            isLoadingChart ? (
              <div className="flex items-center justify-center h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </motion.div>
              </div>
            ) : chartData.error ? (
              <div className="text-center py-12">
                <p className="text-red-400">{chartData.message}</p>
              </div>
            ) : (
              <ChartIndividual
                chartName={chartData.chart_name}
                displayName={chartData.chart_display_name}
                tracks={chartData.tracks || []}
                lastUpdate={chartData.last_update}
                isYoutube={chartData.is_youtube}
                onTrackClick={handleChartTrackClick}
              />
            )
          ) : (
            // 통합 트렌딩 데이터 표시
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "space-y-3"
            }>
              {filteredTracks.map((track, index) => (
                <OptimizedTrackCard
                  key={`${track.artist}-${track.track}-${index}`}
                  track={track}
                  index={index}
                  viewMode={viewMode}
                  onClick={() => handleTrackClick(track.artist, track.track)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
