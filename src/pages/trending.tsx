import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { trendingApi } from '@/lib/api';
import ImageWithFallback from '@/components/ImageWithFallback';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import { 
  TrendingUp, TrendingDown, Flame, Award, Clock, BarChart3,
  Music, Filter, ChevronRight, Sparkles, Star,
  Zap, Globe, Radio, Activity, Crown, Disc, Minus,
  Users, Rocket, Trophy, Play, Eye, ArrowUp, ArrowDown,
  Calendar, Hash, AlertCircle, Info
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  rank: number;
  artist: string;
  track: string;
  charts: Record<string, number>;
  chart_positions: Record<string, { rank: number; updated: string }>;
  best_rank: number;
  chart_count: number;
  avg_rank: number;
  score: number;
  trend_score: number;
  image_url?: string;
  views?: string;
  last_updated: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  is_rising: boolean;
  is_falling: boolean;
}

interface ChartIndependenceInfo {
  charts_updated_independently: number;
  chart_updates: Record<string, { last_update: string; track_count: number }>;
  methodology: string;
}

interface TrendingResponse {
  trending: TrendingTrack[];
  meta: {
    total_found: number;
    limit: number;
    type: string;
    chart_filter?: string;
    timestamp: string;
  };
  chart_independence: ChartIndependenceInfo;
}

// 차트 설정
const CHART_CONFIG = {
  melon: { name: 'Melon', color: '#00CD3C', icon: '🍈' },
  genie: { name: 'Genie', color: '#1E40AF', icon: '🧞' },
  bugs: { name: 'Bugs', color: '#F97316', icon: '🐛' },
  flo: { name: 'FLO', color: '#AA40FC', icon: '🌊' },
  vibe: { name: 'Vibe', color: '#EC4899', icon: '💖' },
  spotify: { name: 'Spotify', color: '#1DB954', icon: '🎧' },
  youtube: { name: 'YouTube', color: '#FF0000', icon: '▶️' },
  billboard: { name: 'Billboard', color: '#1F2937', icon: '🏆' }
};

const formatViews = (views: string | number): string => {
  if (!views) return '';
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, '')) : views;
  if (isNaN(num)) return '';
  
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
};

const TrendIndicator = ({ trend, change }: { trend: string; change: number }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center text-green-600 text-sm font-medium">
        <ArrowUp className="w-4 h-4 mr-1" />
        +{Math.abs(change).toFixed(1)}
      </div>
    );
  } else if (trend === 'down') {
    return (
      <div className="flex items-center text-red-600 text-sm font-medium">
        <ArrowDown className="w-4 h-4 mr-1" />
        -{Math.abs(change).toFixed(1)}
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <Minus className="w-4 h-4 mr-1" />
        0
      </div>
    );
  }
};

export default function TrendingPageV16() {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrendingTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('hot');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [chartIndependence, setChartIndependence] = useState<ChartIndependenceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrending(filter);
  }, [filter]);

  const fetchTrending = async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching trending data:', type);
      
      const response = await fetch(`${API_URL}/api/trending?limit=50&type=${type}`);
      
      if (response.ok) {
        const data: TrendingResponse = await response.json();
        
        console.log('Trending API response:', data);
        
        if (data?.trending) {
          setTracks(data.trending);
          setChartIndependence(data.chart_independence);
        } else {
          setError('트렌딩 데이터를 불러올 수 없습니다.');
        }
      } else {
        console.error('API 호출 실패:', response.status, response.statusText);
        setError('API 호출에 실패했습니다.');
      }
    } catch (error) {
      console.error('트렌딩 데이터 불러오기 실패:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (artist: string, track: string) => {
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    router.push(`/track/${encodedArtist}/${encodedTrack}`);
  };

  const handleArtistClick = (artist: string) => {
    const encodedArtist = encodeURIComponent(artist);
    router.push(`/artist/${encodedArtist}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">트렌딩 데이터를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">데이터 로드 실패</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchTrending(filter)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>실시간 트렌딩 차트 | KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 트렌딩 차트 - 각 차트별 독립 업데이트" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 flex items-center justify-center">
                <Flame className="mr-4 h-12 w-12" />
                실시간 트렌딩
              </h1>
              <p className="text-xl opacity-90 mb-8">
                전 세계 K-POP 팬들이 지금 듣고 있는 음악
              </p>
              
              {/* Chart Independence Info */}
              {chartIndependence && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-4xl mx-auto">
                  <div className="flex items-center justify-center mb-2">
                    <Info className="mr-2 h-5 w-5" />
                    <span className="font-medium">차트 독립성 보장</span>
                  </div>
                  <p className="text-sm opacity-90">
                    {chartIndependence.charts_updated_independently}개 차트가 개별적으로 업데이트되어 
                    진실성 있는 트렌딩 정보를 제공합니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'hot', label: '핫 트렌딩', icon: Flame },
                  { key: 'rising', label: '상승세', icon: TrendingUp },
                  { key: 'new', label: '신규 진입', icon: Sparkles },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">보기:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <Music className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {tracks.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {tracks.map((track, index) => (
                <motion.div
                  key={`${track.artist}-${track.track}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4'
                  }`}
                  onClick={() => handleTrackClick(track.artist, track.track)}
                >
                  {/* Rank Badge */}
                  <div className={`absolute ${viewMode === 'grid' ? 'top-4 left-4' : 'left-4'} 
                    bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full 
                    ${viewMode === 'grid' ? 'w-10 h-10' : 'w-8 h-8'} 
                    flex items-center justify-center font-bold text-lg z-10`}>
                    {track.rank || index + 1}
                  </div>

                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="relative mb-4">
                        <div className="w-full h-48 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            artist={track.artist}
                            track={track.track}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Trend Indicator */}
                        <div className="absolute top-2 right-2">
                          <TrendIndicator trend={track.trend} change={track.change} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
                            {track.track}
                          </h3>
                          <p 
                            className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArtistClick(track.artist);
                            }}
                          >
                            {track.artist}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center text-blue-600">
                            <Trophy className="mr-1 h-4 w-4" />
                            최고 #{track.best_rank}
                          </div>
                          <div className="flex items-center text-green-600">
                            <BarChart3 className="mr-1 h-4 w-4" />
                            {track.chart_count}개 차트
                          </div>
                        </div>

                        {/* Views */}
                        {track.views && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Eye className="mr-1 h-4 w-4" />
                            {formatViews(track.views)}
                          </div>
                        )}

                        {/* Chart Positions */}
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(track.charts).slice(0, 4).map(([chart, rank]) => {
                            const config = CHART_CONFIG[chart as keyof typeof CHART_CONFIG];
                            return (
                              <span
                                key={chart}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: config?.color || '#666' }}
                              >
                                {config?.icon} #{rank}
                              </span>
                            );
                          })}
                          {Object.keys(track.charts).length > 4 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{Object.keys(track.charts).length - 4}개 더
                            </span>
                          )}
                        </div>

                        {/* Trend Score */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-purple-600">
                            트렌드 점수: {track.trend_score}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(track.last_updated).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            artist={track.artist}
                            track={track.track}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {track.track}
                        </h3>
                        <p className="text-gray-600 truncate">{track.artist}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-blue-600">#{track.best_rank}</span>
                          <span className="text-sm text-green-600">{track.chart_count}개 차트</span>
                          <TrendIndicator trend={track.trend} change={track.change} />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-600 mb-1">
                          {track.trend_score}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(track.last_updated).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Music className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">트렌딩 데이터가 없습니다</h2>
              <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
