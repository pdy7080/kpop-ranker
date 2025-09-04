import React, { memo, useState, useCallback, useMemo } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Grid3x3, List, Sparkles, Clock, Filter
} from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

interface TrendingProps {
  initialTrending: any[];
  chartData: Record<string, any[]>;
  lastUpdated: string;
}

// 차트 필터 정의
const chartFilters = [
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

// ISR - 빌드 시점 + 주기적 재생성
export const getStaticProps: GetStaticProps<TrendingProps> = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // 병렬로 모든 차트 데이터 페치
    const [trendingRes, ...chartResponses] = await Promise.all([
      fetch(`${API_URL}/cache/api/trending?limit=100&fast=true`).catch(() => 
        fetch(`${API_URL}/api/trending?limit=100`)
      ),
      ...chartFilters.slice(1).map(chart => 
        fetch(`${API_URL}/api/chart/${chart.id}?limit=50`).catch(() => null)
      )
    ]);
    
    const trendingData = await trendingRes.json();
    
    // 차트별 데이터 수집
    const chartData: Record<string, any[]> = {
      all: trendingData.trending || []
    };
    
    for (let i = 0; i < chartResponses.length; i++) {
      const chartId = chartFilters[i + 1].id;
      if (chartResponses[i]) {
        try {
          const data = await chartResponses[i].json();
          chartData[chartId] = data.tracks || [];
        } catch {
          chartData[chartId] = [];
        }
      } else {
        chartData[chartId] = [];
      }
    }
    
    return {
      props: {
        initialTrending: trendingData.trending || [],
        chartData,
        lastUpdated: new Date().toISOString()
      },
      // 1분마다 재생성
      revalidate: 60
    };
  } catch (error) {
    console.error('ISR Error:', error);
    
    return {
      props: {
        initialTrending: [],
        chartData: { all: [] },
        lastUpdated: new Date().toISOString()
      },
      revalidate: 30 // 에러 시 30초 후 재시도
    };
  }
};

// 최적화된 트랙 카드
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
  const getTrendIcon = () => {
    if (track.trend === 'up' || track.is_rising) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
    if (track.trend === 'new' || track.is_new) {
      return <Sparkles className="w-4 h-4 text-yellow-400" />;
    }
    return null;
  };
  
  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return Math.round(score);
  };
  
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        onClick={onClick}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center space-x-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-12 text-center">
            <span className="text-2xl font-bold text-purple-400">
              {index + 1}
            </span>
          </div>
          
          {/* Album Image with Lazy Loading */}
          <div className="flex-shrink-0">
            <OptimizedImage
              src={track.image_url || track.album_image || ''}
              alt={`${track.artist} - ${track.track}`}
              artist={track.artist}
              track={track.track}
              width={60}
              height={60}
              className="rounded-lg"
              priority={index < 5}
            />
          </div>
          
          {/* Track Info */}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-purple-400 transition-colors">
              {track.track || track.title || track.unified_track}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {track.artist || track.unified_artist}
            </p>
          </div>
          
          {/* Charts */}
          <div className="hidden md:flex items-center space-x-2">
            {Object.entries(track.charts || {}).slice(0, 3).map(([chart, rank]) => (
              <span key={chart} className="px-2 py-1 bg-gray-700/50 rounded text-xs">
                {chart}: #{rank}
              </span>
            ))}
          </div>
          
          {/* Score & Trend */}
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className="text-sm font-medium text-gray-300">
              {formatScore(track.score || 0)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group relative"
    >
      {/* Rank Badge */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
        <span className="text-sm font-bold text-purple-400">#{index + 1}</span>
      </div>
      
      {/* Trend Icon */}
      {getTrendIcon() && (
        <div className="absolute top-2 right-2 z-10">
          {getTrendIcon()}
        </div>
      )}
      
      {/* Album Image with Lazy Loading */}
      <div className="aspect-square">
        <OptimizedImage
          src={track.image_url || track.album_image || ''}
          alt={`${track.artist} - ${track.track}`}
          artist={track.artist}
          track={track.track}
          width={300}
          height={300}
          className="w-full h-full object-cover"
          priority={index < 10}
        />
      </div>
      
      {/* Track Info */}
      <div className="p-4">
        <h3 className="font-semibold truncate group-hover:text-purple-400 transition-colors">
          {track.track || track.title || track.unified_track}
        </h3>
        <p className="text-sm text-gray-400 truncate mt-1">
          {track.artist || track.unified_artist}
        </p>
        
        {/* Score */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Score</span>
          <span className="text-sm font-medium text-purple-400">
            {formatScore(track.score || 0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

OptimizedTrackCard.displayName = 'OptimizedTrackCard';

const TrendingPage: React.FC<TrendingProps> = ({ 
  initialTrending, 
  chartData, 
  lastUpdated 
}) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChart, setSelectedChart] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter tracks based on selected chart and search
  const filteredTracks = useMemo(() => {
    let tracks = selectedChart === 'all' ? initialTrending : (chartData[selectedChart] || []);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      tracks = tracks.filter(track => 
        track.artist?.toLowerCase().includes(term) ||
        track.track?.toLowerCase().includes(term) ||
        track.title?.toLowerCase().includes(term)
      );
    }
    
    return tracks;
  }, [initialTrending, chartData, selectedChart, searchTerm]);
  
  const handleTrackClick = useCallback((track: any) => {
    const artist = encodeURIComponent(track.artist || track.unified_artist);
    const title = encodeURIComponent(track.track || track.title || track.unified_track);
    router.push(`/track/${artist}/${title}`);
  }, [router]);
  
  return (
    <Layout>
      <Head>
        <title>트렌딩 - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 인기 차트 및 트렌딩 음악" />
      </Head>
      
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                실시간 트렌딩
              </span>
            </h1>
            <p className="text-gray-400">
              전 세계 K-POP 차트 실시간 인기 순위
            </p>
          </motion.div>
          
          {/* Controls */}
          <div className="mb-6 space-y-4">
            {/* Chart Filters */}
            <div className="flex flex-wrap gap-2">
              {chartFilters.map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
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
            
            {/* Search & View Toggle */}
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="아티스트 또는 트랙 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow max-w-md px-4 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600' : 'bg-gray-800'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600' : 'bg-gray-800'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-400">
            {filteredTracks.length}개 트랙 • 마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
          </div>
          
          {/* Tracks Grid/List */}
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
                onClick={() => handleTrackClick(track)}
              />
            ))}
          </div>
          
          {/* Empty State */}
          {filteredTracks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default memo(TrendingPage);