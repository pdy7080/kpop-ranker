import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { artistAPI } from '@/lib/api';
import { ChartLogos, getChartLogo } from '@/utils/chartLogos';
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
  charts?: Record<string, number>;
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
      
      // 종합 정보는 선택적으로 로드 (없어도 에러 무시)
      try {
        const comprehensiveResponse = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/comprehensive`);
        if (comprehensiveResponse.ok) {
          const compData = await comprehensiveResponse.json();
          setComprehensiveData(compData);
        }
      } catch (e) {
        // comprehensive API는 optional
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

  // Chart dominance with real data
  const chartDominance = ['melon', 'genie', 'bugs', 'spotify', 'youtube', 'vibe', 'flo'].map(chart => {
    const count = tracks.filter(t => t.charts && t.charts[chart] !== undefined).length;
    return {
      name: chart,
      count,
      percentage: tracks.length > 0 ? Math.round((count / tracks.length) * 100) : 0
    };
  }).filter(c => c.count > 0);

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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
              
              <div className="relative flex items-center gap-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                >
                  <Mic className="w-16 h-16 text-white" />
                </motion.div>
                
                <div className="flex-grow">
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{artistInfo.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-300">
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
                        <Award className="w-4 h-4 text-yellow-500" />
                        최고 {stats.best_peak}위
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs - 뉴스/굿즈 탭 분리 */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {(['overview', 'tracks', 'news', 'goods', 'insights'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab === 'overview' && <>Overview</>}
                    {tab === 'tracks' && <><Music className="w-4 h-4" />Tracks ({tracks.length})</>}
                    {tab === 'news' && <><Newspaper className="w-4 h-4" />뉴스</>}
                    {tab === 'goods' && <><ShoppingBag className="w-4 h-4" />굿즈</>}
                    {tab === 'insights' && <>Insights</>}
                  </span>
                </button>
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
                {/* TOP 10 진입 통계 컴포넌트 추가 */}
                <ArtistTop10Stats artistName={artistInfo.name} />

                {/* Chart Performance */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    차트별 성과
                  </h3>
                  <div className="space-y-4">
                    {chartDominance.map(chart => {
                      const logo = getChartLogo(chart.name);
                      return (
                        <div key={chart.name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm capitalize flex items-center gap-2">
                              <span>{logo.icon}</span>
                              {chart.name}
                            </span>
                            <span className="text-sm text-gray-400">
                              {chart.count}곡 ({chart.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${chart.percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
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
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-bold">All Tracks</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                  >
                    <option value="trend">트렌드 순</option>
                    <option value="rank">최고 순위</option>
                    <option value="date">최신 순</option>
                    <option value="duration">차트 기간</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedTracks.map((track, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(`/track/${encodeURIComponent(artistInfo.name)}/${encodeURIComponent(track.title)}`)}
                      className="bg-gray-800/50 backdrop-blur rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500"
                    >
                      <div className="flex gap-4">
                        <ImageWithFallback
                          src={track.album_image}
                          alt={track.title}
                          width={80}
                          height={80}
                          className="rounded-lg"
                        />
                        <div className="flex-grow">
                          <h3 className="font-semibold mb-1 flex items-center gap-2">
                            {track.title}
                            {track.is_new && (
                              <Sparkles className="w-4 h-4 text-blue-400" />
                            )}
                          </h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              {track.peak_position && (
                                <span className="text-purple-400">
                                  Peak #{track.peak_position}
                                </span>
                              )}
                              {track.days_on_chart && track.days_on_chart > 0 && (
                                <span className="text-gray-400">
                                  {track.days_on_chart}일
                                </span>
                              )}
                            </div>
                            {Object.entries(track.charts).slice(0, 3).map(([chart, rank]) => {
                              const logo = getChartLogo(chart);
                              return (
                                <div key={chart} className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <span>{logo.icon}</span>
                                    <span className="capitalize">{chart}</span>
                                  </span>
                                  <span className="text-purple-400">#{rank}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {track.trend_score && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Score</span>
                            <span className="text-lg font-bold text-purple-400">{track.trend_score}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
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
                {/* Real Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">최고 성과</span>
                        <span className="font-bold">
                          {stats.most_successful_track || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">최고 순위</span>
                        <span className="font-bold">#{stats.best_peak || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TOP 10 진입</span>
                        <span className="font-bold">{stats.top10_hits || 0}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">성공률</span>
                        <span className="font-bold">{stats.success_rate || 0}%</span>
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
                  <h3 className="text-lg font-bold mb-4">차트별 활동 현황</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {chartDominance.map(chart => {
                      const logo = getChartLogo(chart.name);
                      return (
                        <div key={chart.name} className="text-center">
                          <div className={`text-3xl mb-2 ${logo.bgColor} rounded-lg p-3 inline-block`}>
                            {logo.icon}
                          </div>
                          <p className="text-2xl font-bold">{chart.count}</p>
                          <p className="text-xs text-gray-400 capitalize">{chart.name}</p>
                          <p className="text-xs text-purple-400">{chart.percentage}%</p>
                        </div>
                      );
                    })}
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
