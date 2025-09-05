import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Grid3x3, List, Sparkles
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 차트 필터 정의 - YouTube 제거
const chartFilters = [
  { id: 'all', name: '통합', icon: '🌍', color: 'bg-gradient-to-r from-purple-500 to-pink-500', updateTime: '' },
  { id: 'melon', name: 'Melon', icon: '🍈', color: 'bg-green-500', updateTime: '' },
  { id: 'genie', name: 'Genie', icon: '🧞', color: 'bg-blue-500', updateTime: '' },
  { id: 'bugs', name: 'Bugs', icon: '🐛', color: 'bg-red-500', updateTime: '' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', color: 'bg-green-600', updateTime: '' },
  { id: 'flo', name: 'FLO', icon: '🌊', color: 'bg-blue-600', updateTime: '' },
  { id: 'apple_music', name: 'Apple Music', icon: '🍎', color: 'bg-gray-800', updateTime: '' },
  { id: 'lastfm', name: 'Last.fm', icon: '🎵', color: 'bg-red-800', updateTime: '' },
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
  
  // 이미지 URL 처리 - 백엔드 API 직접 호출
  const imageUrl = useMemo(() => {
    // 1. 이미 전체 URL이 있으면 사용
    if (track.image_url && track.image_url.startsWith('http')) {
      return track.image_url;
    }
    
    // 2. 상대경로면 백엔드 URL 추가
    if (track.image_url && track.image_url.startsWith('/')) {
      // /api/album-image-smart/... 형태면 백엔드 URL 붙이기
      if (track.image_url.includes('/api/')) {
        return `${API_URL}${track.image_url}`;
      }
      // /static/... 형태면 백엔드 URL 붙이기
      return `${API_URL}${track.image_url}`;
    }
    
    // 3. 이미지 URL이 없으면 스마트 API 호출
    const artist = track.artist || track.unified_artist || '';
    const title = track.track || track.title || track.unified_track || '';
    
    if (!artist || !title) {
      return '/images/default-album.svg';
    }
    
    // URL 인코딩 (슬래시 제거)
    const encodedArtist = encodeURIComponent(artist.replace(/\//g, ''));
    const encodedTitle = encodeURIComponent(title.replace(/\//g, ''));
    
    // 백엔드 API 전체 URL
    return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTitle}`;
  }, [track]);
  
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
          
          <div className="flex-shrink-0">
            <div className="relative w-12 h-12 sm:w-[60px] sm:h-[60px] bg-gray-700 rounded overflow-hidden">
              {!imageError ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-sm sm:text-lg text-white truncate group-hover:text-purple-400 transition-colors">
              {track.track || track.title || track.unified_track || 'Unknown'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 truncate">
              {track.artist || track.unified_artist || 'Unknown Artist'}
            </p>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-xs sm:text-sm font-medium text-gray-300">
              {formatScore(track.score)}
            </span>
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
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group relative"
    >
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-black/90 backdrop-blur-sm rounded px-1.5 sm:px-2 py-0.5 sm:py-1">
        <span className="text-xs sm:text-sm font-bold text-white">#{index + 1}</span>
      </div>
      
      <div className="aspect-square relative bg-gray-700">
        {!imageError ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="bg-gray-900/95 backdrop-blur-sm p-2 sm:p-3">
        <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-purple-400 transition-colors">
          {track.track || track.title || track.unified_track || 'Unknown'}
        </h3>
        <p className="text-xs text-gray-300 truncate mt-0.5">
          {track.artist || track.unified_artist || 'Unknown Artist'}
        </p>
        
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-gray-400">Score</span>
          <span className="text-xs sm:text-sm font-medium text-purple-400">
            {formatScore(track.score)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

TrackCard.displayName = 'TrackCard';

// 메인 트렌딩 페이지
const TrendingPage = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedChart, setSelectedChart] = useState('all');
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [chartUpdateTimes, setChartUpdateTimes] = useState<Record<string, string>>({});
  
  useEffect(() => {
    loadTrendingData();
    loadChartUpdateStatus();
  }, []);
  
  const loadChartUpdateStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chart/update-status`);
      if (response.ok) {
        const data = await response.json();
        const updates: Record<string, string> = {};
        
        if (data.charts) {
          data.charts.forEach((chart: any) => {
            if (chart.last_update) {
              const date = new Date(chart.last_update);
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              updates[chart.chart_name] = `${month}/${day} ${hours}:${minutes}`;
            }
          });
        }
        
        setChartUpdateTimes(updates);
      }
    } catch (error) {
      console.error('Failed to load update status:', error);
    }
  };
  
  const loadTrendingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/trending?limit=50`);
      if (response.ok) {
        const data = await response.json();
        let trending = data.trending || [];
        
        // 이미지 URL 수정
        trending = trending.map((track: any) => {
          if (track.image_url && track.image_url.startsWith('/api/')) {
            return {
              ...track,
              image_url: `${API_URL}${track.image_url}`
            };
          }
          return track;
        });
        
        setTrendingData(trending);
        setChartData({ all: trending });
      }
    } catch (error) {
      console.error('Trending load error:', error);
      setTrendingData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadChartData = async (chartId: string) => {
    if (chartId === 'all' || chartData[chartId]) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/chart/${chartId}/latest`);
      if (response.ok) {
        const data = await response.json();
        let tracks = (data.tracks || []).map((track: any, idx: number) => {
          // 이미지 URL 수정
          if (track.image_url && track.image_url.startsWith('/api/')) {
            track.image_url = `${API_URL}${track.image_url}`;
          }
          
          return {
            ...track,
            rank_position: idx + 1,
            score: (51 - (idx + 1)) * 10
          };
        });
        
        setChartData(prev => ({ ...prev, [chartId]: tracks }));
      }
    } catch (error) {
      console.error(`Chart ${chartId} load error:`, error);
      setChartData(prev => ({ ...prev, [chartId]: [] }));
    } finally {
      setLoading(false);
    }
  };
  
  const filteredTracks = useMemo(() => {
    let tracks = selectedChart === 'all' 
      ? trendingData 
      : (chartData[selectedChart] || []);
    
    // 검색 기능 제거
    
    return tracks;
  }, [trendingData, chartData, selectedChart]);
  
  const handleTrackClick = useCallback((track: any) => {
    const artist = encodeURIComponent(track.artist || track.unified_artist || '');
    const title = encodeURIComponent(track.track || track.title || track.unified_track || '');
    if (artist && title) {
      router.push(`/track/${artist}/${title}`);
    }
  }, [router]);
  
  const handleChartChange = async (chartId: string) => {
    setSelectedChart(chartId);
    await loadChartData(chartId);
  };
  
  return (
    <Layout>
      <Head>
        <title>트렌딩 - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 인기 차트" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                실시간 트렌딩
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              전 세계 K-POP 차트 실시간 인기 순위
              {selectedChart !== 'all' && chartUpdateTimes[selectedChart] && (
                <span className="ml-2 text-xs text-purple-400">
                  (업데이트: {chartUpdateTimes[selectedChart]})
                </span>
              )}
            </p>
          </div>
          
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
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
                    <span>{chart.name}</span>
                    {chartUpdateTimes[chart.id] && (
                      <span className="ml-1 text-xs opacity-80">
                        ({chartUpdateTimes[chart.id].split(' ')[1]})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600' : 'bg-gray-800'}`}
                >
                  <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded ${viewMode === 'list' ? 'bg-purple-600' : 'bg-gray-800'}`}
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-400">
            {filteredTracks.length}개 트랙
          </div>
          
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
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4"
                : "space-y-2 sm:space-y-3"
            }>
              {filteredTracks.map((track, index) => (
                <TrackCard
                  key={`${track.artist}-${track.track}-${index}`}
                  track={track}
                  index={index}
                  viewMode={viewMode}
                  onClick={() => handleTrackClick(track)}
                />
              ))}
            </div>
          )}
          
          {!loading && filteredTracks.length === 0 && (
            <div className="text-center py-10 sm:py-20">
              <p className="text-gray-400 text-sm sm:text-lg">
                검색 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default memo(TrendingPage);