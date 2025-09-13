import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Grid3x3, List, Sparkles, Play
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 차트 필터 정의
const chartFilters = [
  { id: 'all', name: '통합', icon: '🌍', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'melon', name: 'Melon', icon: '🍈', color: 'bg-green-500' },
  { id: 'genie', name: 'Genie', icon: '🧞', color: 'bg-blue-500' },
  { id: 'bugs', name: 'Bugs', icon: '🐛', color: 'bg-red-500' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', color: 'bg-green-600' },
  { id: 'flo', name: 'FLO', icon: '🌊', color: 'bg-blue-600' },
  { id: 'apple_music', name: 'Apple Music', icon: '🍎', color: 'bg-gray-800' },
  { id: 'lastfm', name: 'Last.fm', icon: '📻', color: 'bg-red-800' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' },
];

// 트랙 카드 컴포넌트
const TrackCard = memo(({ 
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
  const [imageError, setImageError] = useState(false);
  
  // 이미지 URL 처리
  const imageUrl = useMemo(() => {
    if (imageError) {
      return '/images/default-album.svg';
    }
    
    if (track.image_url) {
      if (track.image_url.startsWith('http')) {
        return track.image_url;
      }
      if (track.image_url.startsWith('/')) {
        return `${API_URL}${track.image_url}`;
      }
    }
    
    const artist = track.artist || track.unified_artist || '';
    const title = track.track || track.title || track.unified_track || '';
    
    if (!artist || !title) {
      return '/images/default-album.svg';
    }
    
    const encodedArtist = encodeURIComponent(artist.replace(/\//g, ''));
    const encodedTitle = encodeURIComponent(title.replace(/\//g, ''));
    
    return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTitle}`;
  }, [track, imageError]);
  
  const handleImageError = () => {
    console.log(`이미지 로드 실패: ${track.artist} - ${track.track}`);
    setImageError(true);
  };
  
  const formatScore = (score: number) => {
    if (!score) return '0';
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return Math.round(score).toString();
  };
  
  // 리스트 뷰
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
        onClick={onClick}
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex-shrink-0 w-8 sm:w-12 text-center">
            <span className="text-lg sm:text-2xl font-bold text-purple-400">
              {index + 1}
            </span>
          </div>
          
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
            <img
              src={imageUrl}
              alt={`${track.artist} - ${track.track}`}
              onError={handleImageError}
              className="w-full h-full object-cover rounded-md sm:rounded-lg"
            />
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-white text-sm sm:text-base truncate">
              {track.track}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm truncate">
              {track.artist}
            </p>
            
            {/* YouTube 조회수 표시 */}
            {track.youtube_views && (
              <div className="flex items-center gap-1 mt-1">
                <Play className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-400 font-medium">
                  {track.youtube_views}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 text-right">
            <div className="text-xs sm:text-sm text-purple-400 font-bold">
              {formatScore(track.score)}점
            </div>
            <div className="text-xs text-gray-500">
              {track.chart_count}개 차트
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // 그리드 뷰
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
    >
      <div className="relative aspect-square mb-3">
        <img
          src={imageUrl}
          alt={`${track.artist} - ${track.track}`}
          onError={handleImageError}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded">
          #{index + 1}
        </div>
        {track.best_rank <= 3 && (
          <div className="absolute top-2 right-2">
            <span className="text-lg sm:text-xl">
              {track.best_rank === 1 ? '🥇' : track.best_rank === 2 ? '🥈' : '🥉'}
            </span>
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-white text-sm sm:text-base truncate mb-1">
        {track.track}
      </h3>
      <p className="text-gray-400 text-xs sm:text-sm truncate mb-2">
        {track.artist}
      </p>
      
      {/* YouTube 조회수 표시 */}
      {track.youtube_views && (
        <div className="flex items-center gap-1 mb-2">
          <Play className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-400 font-medium">
            {track.youtube_views}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-purple-400 font-bold">
          {formatScore(track.score)}점
        </span>
        <span className="text-gray-500">
          {track.chart_count}개 차트
        </span>
      </div>
      
      <div className="mt-2 flex flex-wrap gap-1">
        {Object.entries(track.charts || {}).slice(0, 3).map(([chart, rank]: [string, any]) => (
          <span
            key={chart}
            className="text-xs px-2 py-0.5 bg-gray-700/50 rounded-full text-gray-300"
          >
            {chart}: #{rank}
          </span>
        ))}
        {Object.keys(track.charts || {}).length > 3 && (
          <span className="text-xs px-2 py-0.5 bg-gray-700/50 rounded-full text-gray-400">
            +{Object.keys(track.charts).length - 3}
          </span>
        )}
      </div>
    </motion.div>
  );
});

TrackCard.displayName = 'TrackCard';

export default function TrendingPage() {
  const router = useRouter();
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/trending?limit=50`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('트렌딩 데이터:', data);
      
      if (data.trending && Array.isArray(data.trending)) {
        setTrendingData(data.trending);
        setFilteredData(data.trending);
      } else {
        setTrendingData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('트렌딩 데이터 로드 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
      setTrendingData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // 차트 필터링
  useEffect(() => {
    if (selectedChart === 'all') {
      setFilteredData(trendingData);
    } else {
      const filtered = trendingData.filter(track => {
        const charts = track.charts || {};
        return Object.keys(charts).includes(selectedChart);
      });
      setFilteredData(filtered);
    }
  }, [selectedChart, trendingData]);

  const handleTrackClick = useCallback((track: any) => {
    const artist = encodeURIComponent(track.artist);
    const title = encodeURIComponent(track.track);
    router.push(`/track/${artist}/${title}`);
  }, [router]);

  return (
    <Layout>
      <Head>
        <title>트렌딩 - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 트렌딩 차트" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* 헤더 */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              실시간 트렌딩
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              여러 차트에서 인기 있는 K-POP 트랙
            </p>
          </div>

          {/* 필터 & 뷰 모드 */}
          <div className="mb-4 sm:mb-6 space-y-4">
            {/* 차트 필터 */}
            <div className="flex flex-wrap gap-2">
              {chartFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedChart(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    selectedChart === filter.id
                      ? filter.color + ' text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-1">{filter.icon}</span>
                  {filter.name}
                </button>
              ))}
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {filteredData.length}개 트랙
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-purple-400">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center text-red-400 py-8">
              {error}
            </div>
          )}

          {/* 트렌딩 리스트 */}
          {!loading && !error && (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'
                : 'space-y-2 sm:space-y-3'
            }>
              {filteredData.map((track, index) => (
                <TrackCard
                  key={`${track.artist}-${track.track}`}
                  track={track}
                  index={index}
                  viewMode={viewMode}
                  onClick={() => handleTrackClick(track)}
                />
              ))}
            </div>
          )}

          {/* 데이터 없음 */}
          {!loading && !error && filteredData.length === 0 && (
            <div className="text-center text-gray-400 py-16">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>트렌딩 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
