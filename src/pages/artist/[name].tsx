import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { artistAPI } from '@/lib/api';
import ArtistTop10Stats from '@/components/ArtistTop10Stats';
import NewsTab from '@/components/NewsTab';
import GoodsTab from '@/components/GoodsTab';
import { AIInsightsSection, EventsSection, NewsSection } from '@/components/AIInsightsSection';
import { 
  Music, TrendingUp, Award, Clock, BarChart3, 
  Globe, Play, Star, Activity, Disc, Mic,
  Calendar, Hash, Users, Zap, Trophy,
  ArrowUp, ArrowDown, Sparkles, Target,
  ChevronUp, ChevronDown, Eye, Heart, Flame,
  Newspaper, ShoppingBag
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Track {
  title?: string;
  track?: string;
  unified_track?: string;
  charts?: Record<string, number | string>;
  best_rank?: number;
  peak_position?: number;
  album_image?: string;
  image_url?: string;
  local_image?: string;
  trend_score?: number;
  created_at?: string;
  days_on_chart?: number;
  top10_count?: number;
  trend?: 'up' | 'down' | 'stable' | 'new';
  change?: string;
  is_rising?: boolean;
  is_new?: boolean;
  views?: string;
}

interface ArtistData {
  artist?: string;
  tracks?: Track[];
  stats?: {
    total_tracks?: number;
    active_tracks?: number;
    top10_hits?: number;
    best_peak?: number;
    success_rate?: number;
    trending_up?: number;
    trending_down?: number;
    longest_charting?: number;
    most_successful_track?: string;
    newest_entry?: string;
    chart_diversity?: number;
  };
  ai_data?: any;
}

// 조회수 포맷팅 함수
const formatViews = (views: string | number): string => {
  if (!views) return '';
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, '')) : views;
  if (isNaN(num)) return '';
  
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
};

// 차트 로고 정보
const getChartInfo = (chartName: string) => {
  const chartConfig: Record<string, { icon: string; name: string; bgColor: string }> = {
    melon: { icon: '🍈', name: 'Melon', bgColor: 'bg-green-600' },
    genie: { icon: '🧞', name: 'Genie', bgColor: 'bg-blue-600' },
    bugs: { icon: '🐛', name: 'Bugs', bgColor: 'bg-orange-500' },
    flo: { icon: '🌊', name: 'FLO', bgColor: 'bg-purple-500' },
    spotify: { icon: '🎧', name: 'Spotify', bgColor: 'bg-green-500' },
    apple_music: { icon: '🍎', name: 'Apple Music', bgColor: 'bg-gray-800' },
    youtube: { icon: '▶️', name: 'YouTube', bgColor: 'bg-red-500' },
    lastfm: { icon: '🎼', name: 'Last.fm', bgColor: 'bg-red-600' }
  };
  
  return chartConfig[chartName.toLowerCase()] || { 
    icon: '🎵', 
    name: chartName, 
    bgColor: 'bg-gray-600' 
  };
};

export default function ArtistDetailPage() {
  const router = useRouter();
  const { name } = router.query;
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [comprehensiveData, setComprehensiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'news' | 'goods' | 'insights'>('overview');
  const [sortBy, setSortBy] = useState<'trend' | 'rank' | 'date' | 'duration'>('trend');

  useEffect(() => {
    if (name && typeof name === 'string') {
      fetchArtistData(name);
    }
  }, [name]);

  const fetchArtistData = async (artistName: string) => {
    try {
      setLoading(true);
      
      // 기본 아티스트 데이터
      const response = await artistAPI.getDetails(artistName);
      setArtistData(response);
      
      // 종합 정보는 선택적으로 로드
      try {
        const comprehensiveResponse = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/comprehensive`);
        if (comprehensiveResponse.ok) {
          const compData = await comprehensiveResponse.json();
          setComprehensiveData(compData);
        }
      } catch (e) {
        console.log('Comprehensive data not available');
      }
      
    } catch (err) {
      console.error('Failed to fetch artist:', err);
      setArtistData(null);
    } finally {
      setLoading(false);
    }
  };

  // Process artist info with real data
  const artistInfo = {
    name: artistData?.artist || name as string || 'Unknown',
    totalTracks: artistData?.stats?.total_tracks || 0,
    activeCharts: artistData?.stats?.chart_diversity || 0,
    bestRanking: artistData?.stats?.best_peak || null
  };

  // Process tracks with real data
  const tracks = (artistData?.tracks || []).map(track => {
    const trackTitle = track.title || track.track || track.unified_track || 'Unknown';
    
    let imageUrl = track.album_image || track.image_url || track.local_image;
    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('/'))) {
      imageUrl = `${API_URL}/api/album-image-smart/${encodeURIComponent(artistInfo.name)}/${encodeURIComponent(trackTitle)}`;
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = `${API_URL}${imageUrl}`;
    }
    
    return {
      ...track,
      title: trackTitle,
      album_image: imageUrl,
      charts: track.charts || {}
    };
  });

  // Sort tracks based on selected criteria
  const sortedTracks = [...tracks].sort((a, b) => {
    switch (sortBy) {
      case 'trend':
        return (b.trend_score || 0) - (a.trend_score || 0);
      case 'rank':
        const aRank = a.best_rank || a.peak_position || 999;
        const bRank = b.best_rank || b.peak_position || 999;
        return aRank - bRank;
      case 'date':
        if (a.is_new && !b.is_new) return -1;
        if (!a.is_new && b.is_new) return 1;
        return 0;
      case 'duration':
        return (b.days_on_chart || 0) - (a.days_on_chart || 0);
      default:
        return 0;
    }
  });

  // Real statistics from API
  const stats = artistData?.stats || {
    total_tracks: 0,
    active_tracks: 0,
    top10_hits: 0,
    best_peak: 999,
    success_rate: 0,
    trending_up: 0,
    trending_down: 0,
    longest_charting: 0,
    most_successful_track: null,
    newest_entry: null,
    chart_diversity: 0
  };

  // Chart dominance with real data - 새로운 차트 포함
  const chartDominance = ['melon', 'genie', 'bugs', 'flo', 'spotify', 'apple_music', 'youtube', 'lastfm'].map(chart => {
    const count = tracks.filter(t => t.charts && t.charts[chart] !== undefined).length;
    return {
      name: chart,
      count,
      percentage: tracks.length > 0 ? Math.round((count / tracks.length) * 100) : 0,
      info: getChartInfo(chart)
    };
  }).filter(c => c.count > 0);

  // 차트 정보 렌더링 함수
  const renderChartInfo = (charts: Record<string, number | string>) => {
    const entries = Object.entries(charts);
    const rankCharts = entries.filter(([chart, value]) => 
      chart !== 'youtube' && typeof value === 'number' && value > 0
    );
    const youtubeData = entries.find(([chart]) => chart === 'youtube');

    return (
      <div className="flex flex-wrap gap-1">
        {/* 순위 차트들 */}
        {rankCharts.slice(0, 3).map(([chart, rank]) => (
          <ChartRankDisplay
            key={chart}
            chartName={chart}
            rank={rank as number}
            displayType="badge"
          />
        ))}
        
        {/* YouTube 조회수 */}
        {youtubeData && youtubeData[1] && (
          <div className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
            <Play className="w-3 h-3" />
            {formatViews(youtubeData[1])}
          </div>
        )}
        
        {rankCharts.length > 3 && (
          <span className="text-xs text-gray-400">+{rankCharts.length - 3}</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Disc className="w-16 h-16 text-purple-500" />
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!artistData) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="text-center">
            <Music className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl text-white mb-4">아티스트를 찾을 수 없습니다</h1>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{artistInfo.name} - KPOP Ranker</title>
        <meta name="description" content={`${artistInfo.name}의 차트 순위 및 트랙 정보 - K-POP 아티스트 상세 페이지`} />
      </Head>

      <div className="min-h-screen bg-[#0A0A0F] text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Artist Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Hero Section */}
            <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
              
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                >
                  <Mic className="w-16 h-16 text-white" />
                </motion.div>
                
                <div className="flex-grow text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{artistInfo.name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300">
                    <span className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {stats.total_tracks} 트랙
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {stats.active_tracks} 현재 활동
                    </span>
                    {stats.best_peak && stats.best_peak <= 10 && (
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        최고 {stats.best_peak}위
                      </span>
                    )}
                    {stats.top10_hits && stats.top10_hits > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        TOP 10 {stats.top10_hits}회
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {([
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'tracks', label: `Tracks (${tracks.length})`, icon: Music },
                { key: 'news', label: '뉴스', icon: Newspaper },
                { key: 'goods', label: '굿즈', icon: ShoppingBag },
                { key: 'insights', label: 'Insights', icon: Zap }
              ] as const).map(tab => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-6 py-3 rounded-xl transition-all whitespace-nowrap font-medium ${
                    activeTab === tab.key 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeArtistTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* 통계 카드들 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: '총 트랙 수', value: stats.total_tracks, icon: Music, color: 'from-blue-500 to-blue-600' },
                    { label: 'TOP 10 진입', value: `${stats.top10_hits}회`, icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
                    { label: '차트 다양성', value: `${stats.chart_diversity}개`, icon: Globe, color: 'from-green-500 to-green-600' },
                    { label: '성공률', value: `${stats.success_rate}%`, icon: Target, color: 'from-purple-500 to-purple-600' }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700"
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} mb-2`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* TOP 10 진입 통계 컴포넌트 */}
                <ArtistTop10Stats artistName={artistInfo.name} />

                {/* Chart Performance */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    차트별 성과 분석
                  </h3>
                  <div className="space-y-4">
                    {chartDominance.map(chart => (
                      <div key={chart.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm flex items-center gap-2">
                            <span className="text-lg">{chart.info.icon}</span>
                            <span className="font-medium">{chart.info.name}</span>
                          </span>
                          <span className="text-sm text-gray-400">
                            {chart.count}곡 ({chart.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${chart.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`${chart.info.bgColor} h-3 rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tracks' && (
              <motion.div
                key="tracks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Sort Options */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold">전체 트랙</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="trend">트렌드 순</option>
                    <option value="rank">최고 순위</option>
                    <option value="date">최신 순</option>
                    <option value="duration">차트 기간</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedTracks.map((track, idx) => (
                    <motion.div
                      key={`${track.title}-${idx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => router.push(`/track/${encodeURIComponent(artistInfo.name)}/${encodeURIComponent(track.title)}`)}
                      className="group bg-gray-800/50 backdrop-blur rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                            <ImageWithFallback
                              artist={artistInfo.name}
                              track={track.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-semibold text-white mb-1 flex items-center gap-2 group-hover:text-purple-300 transition-colors">
                            <span className="truncate">{track.title}</span>
                            {track.is_new && (
                              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            )}
                          </h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {track.peak_position && (
                                <span className="text-yellow-400 font-medium">
                                  최고 #{track.peak_position}
                                </span>
                              )}
                              {track.days_on_chart && track.days_on_chart > 0 && (
                                <span>
                                  {track.days_on_chart}일간
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Chart Ranks */}
                      {track.charts && Object.keys(track.charts).length > 0 && (
                        <div className="mb-3">
                          {renderChartInfo(track.charts)}
                        </div>
                      )}

                      {/* Score */}
                      {track.trend_score && (
                        <div className="pt-3 border-t border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">트렌드 스코어</span>
                            <span className="text-lg font-bold text-purple-400">
                              {Math.round(track.trend_score)}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {tracks.length === 0 && (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">이 아티스트의 트랙 정보가 없습니다.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 뉴스 탭 */}
            {activeTab === 'news' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <NewsTab artistName={artistInfo.name} />
              </motion.div>
            )}

            {/* 굿즈 탭 */}
            {activeTab === 'goods' && (
              <motion.div
                key="goods"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GoodsTab artistName={artistInfo.name} />
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Performance Metrics & AI Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      성과 지표
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">대표곡</span>
                        <span className="font-bold text-right max-w-[60%] truncate">
                          {stats.most_successful_track || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">최고 순위</span>
                        <span className="font-bold text-yellow-400">
                          #{stats.best_peak || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TOP 10 진입</span>
                        <span className="font-bold text-purple-400">
                          {stats.top10_hits || 0}회
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">차트 성공률</span>
                        <span className="font-bold text-green-400">
                          {stats.success_rate || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">최장 차트인</span>
                        <span className="font-bold">
                          {stats.longest_charting || 0}일
                        </span>
                      </div>
                    </div>
                  </div>

                  <AIInsightsSection 
                    artistName={artistInfo.name}
                    stats={stats}
                  />
                </div>

                {/* Chart Performance Summary */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    차트별 활동 현황
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {chartDominance.map(chart => (
                      <div key={chart.name} className="text-center">
                        <div className={`text-3xl mb-2 ${chart.info.bgColor} rounded-lg p-3 inline-block`}>
                          {chart.info.icon}
                        </div>
                        <p className="text-2xl font-bold text-white">{chart.count}</p>
                        <p className="text-sm font-medium text-gray-300">{chart.info.name}</p>
                        <p className="text-xs text-purple-400">{chart.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events & News Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EventsSection comprehensiveData={comprehensiveData} />
                  <NewsSection comprehensiveData={comprehensiveData} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
