import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { artistAPI } from '@/lib/api';
import NewsTab from '@/components/NewsTab';
import GoodsTab from '@/components/GoodsTab';
import { 
  Music, TrendingUp, Award, Clock, BarChart3, 
  Globe, Play, Star, Activity, Disc, Mic,
  Calendar, Hash, Users, Zap, Trophy,
  ArrowUp, ArrowDown, Sparkles, Target,
  ChevronUp, ChevronDown, Eye, Heart, Flame,
  Newspaper, ShoppingBag, Crown
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

// AI 인사이트 - 글 형식
const AIInsightsSection = ({ artistName, stats }: { artistName: string; stats: any }) => {
  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        AI 분석가 리포트
      </h3>
      
      <div className="text-gray-300 leading-relaxed space-y-4">
        <p className="text-base">
          현재 <strong className="text-purple-400">{artistName}</strong>는 K-POP 시장에서 
          <strong className="text-yellow-400"> {stats.total_tracks || 0}개의 트랙</strong>을 통해 
          <strong className="text-blue-400"> {stats.active_charts || 0}개 차트</strong>에서 활동하고 있습니다.
        </p>
        
        <p className="text-base">
          최고 순위 <strong className="text-yellow-400">#{stats.best_peak || '-'}</strong>를 기록하며, 
          TOP 10 진입 성공률은 <strong className="text-green-400">{stats.success_rate || 0}%</strong>로 
          {(stats.success_rate || 0) > 70 ? '매우 우수한' : (stats.success_rate || 0) > 40 ? '양호한' : '안정적인'} 
          성과를 보이고 있습니다.
        </p>
        
        <p className="text-base">
          최장 차트인 기록인 <strong className="text-cyan-400">{stats.longest_charting || 0}일</strong>을 달성하여 
          지속적인 인기를 입증하고 있으며, 
          {(stats.top10_hits || 0) > 3 ? '추세는 상승세' : (stats.top10_hits || 0) > 1 ? '안정적 성장' : '성장 잠재 보유'}를 보여주고 있습니다.
        </p>
        
        <p className="text-base">
          차트 다양성 측면에서는 국내 주요 차트에서의 안정적 성과와 
          함께 글로벌 플랫폼 확장 가능성을 보여주며, 
          특히 <strong className="text-pink-400">{stats.most_successful_track || '대표곡'}</strong>을 통해 
          탄탄한 팬덤 기반을 구축하고 있습니다.
        </p>
        
        <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
          <p className="text-sm text-purple-200">
            💡 <strong>AI 분석 요약:</strong> {artistName}은(는) 
            {(stats.top10_hits || 0) > 2 ? '상위권 진입 능력이 입증된' : '성장 잠재력이 높은'} 
            아티스트로, 지속적인 차트 활동을 통해 
            {(stats.success_rate || 0) > 50 ? '안정적인 시장 지위를 확보' : '시장 진입을 확대'}하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ArtistPage() {
  const router = useRouter();
  const { artist } = router.query;
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trend' | 'rank' | 'date' | 'duration'>('trend');
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'news' | 'goods' | 'insights'>('overview');

  useEffect(() => {
    if (artist) {
      fetchArtistData();
    }
  }, [artist]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎭 Fetching artist data:', artist);
      
      const response = await artistAPI.getDetails(artist as string);
      
      console.log('📊 Artist response:', response);
      
      if (response) {
        setArtistData(response);
      } else {
        setError('Artist not found');
      }
    } catch (err) {
      console.error('❌ Failed to fetch artist data:', err);
      setError('Failed to load artist data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl"
          >
            <Disc className="w-16 h-16 text-purple-500" />
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error || !artistData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || 'Artist not found'}
            </h2>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const tracks = artistData.tracks || [];
  const stats = artistData.stats || {};

  // 아티스트 정보 생성
  const artistInfo = {
    name: artistData.artist || (artist as string),
    totalTracks: tracks.length,
    activeCharts: new Set(tracks.flatMap(track => Object.keys(track.charts || {}))).size,
    bestRanking: stats.best_peak || Math.min(...tracks.map(track => track.best_rank || track.peak_position || 100).filter(Boolean))
  };

  const bestTrack = tracks.length > 0 ? tracks[0] : null;

  // 차트 정보 생성
  const chartDominance = Object.entries(
    tracks.reduce((acc, track) => {
      Object.keys(track.charts || {}).forEach(chart => {
        acc[chart] = (acc[chart] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  ).map(([chart, count]) => ({
    name: chart,
    count,
    percentage: Math.round((count / tracks.length) * 100),
    info: getChartInfo(chart)
  })).sort((a, b) => b.count - a.count);

  // 트랙 정렬
  const sortedTracks = [...tracks].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        const aRank = a.best_rank || a.peak_position || 999;
        const bRank = b.best_rank || b.peak_position || 999;
        return aRank - bRank;
      case 'date':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'duration':
        return (b.days_on_chart || 0) - (a.days_on_chart || 0);
      case 'trend':
      default:
        return (b.trend_score || 0) - (a.trend_score || 0);
    }
  });

  // 차트 정보 렌더링
  const renderChartInfo = (charts: Record<string, number | string>) => {
    const chartEntries = Object.entries(charts).slice(0, 4);
    
    return (
      <div className="flex flex-wrap gap-2">
        {chartEntries.map(([chart, rank]) => {
          const info = getChartInfo(chart);
          const rankNum = typeof rank === 'string' ? parseInt(rank) || 0 : rank;
          
          return (
            <div
              key={chart}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${info.bgColor} text-white`}
            >
              <span>{info.icon}</span>
              <span>#{rankNum}</span>
            </div>
          );
        })}
        {Object.keys(charts).length > 4 && (
          <span className="text-xs text-gray-400">+{Object.keys(charts).length - 4}</span>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>{artistInfo.name} | KPOP Ranker</title>
        <meta name="description" content={`${artistInfo.name}의 차트 성과 및 트랙 정보`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            {bestTrack && (
              <ImageWithFallback
                artist={artistInfo.name}
                track={bestTrack.title}
                className="w-full h-full object-cover filter blur-3xl opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900" />
          </div>

          {/* Content - 중앙 정렬 */}
          <div className="relative container mx-auto px-4 py-20">
            <div className="text-center space-y-8">
              {/* Artist Image - 중앙 정렬 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl border-4 border-purple-500/30">
                    {bestTrack ? (
                      <ImageWithFallback
                        artist={artistInfo.name}
                        track={bestTrack.title}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Mic className="w-32 h-32 text-white/60" />
                      </div>
                    )}
                  </div>
                  {/* Crown */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <Crown className="w-16 h-16 text-yellow-400" />
                  </div>
                </div>
              </motion.div>

              {/* Artist Info - 중앙 정렬 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                  {artistInfo.name}
                </h1>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{artistInfo.totalTracks}</div>
                    <div className="text-sm text-gray-400">Total Tracks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{artistInfo.activeCharts}</div>
                    <div className="text-sm text-gray-400">Active Charts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {artistInfo.bestRanking ? `#${artistInfo.bestRanking}` : '-'}
                    </div>
                    <div className="text-sm text-gray-400">Best Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{stats.top10_hits || 0}</div>
                    <div className="text-sm text-gray-400">Top 10 Hits</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4">
          <div className="border-b border-gray-700 mb-8">
            <div className="flex flex-wrap gap-0 -mb-px">
              {[
                { id: 'overview', label: '개요', icon: Star },
                { id: 'tracks', label: '트랙', icon: Music },
                { id: 'news', label: '뉴스', icon: Newspaper },
                { id: 'goods', label: '굿즈', icon: ShoppingBag },
                { id: 'insights', label: 'AI 인사이트', icon: Sparkles }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                    activeTab === id
                      ? 'text-purple-400 border-purple-400'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-16"
              >
                {/* Top Tracks Preview */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">인기 트랙</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedTracks.slice(0, 6).map((track, idx) => (
                      <motion.div
                        key={track.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => router.push(`/track/${encodeURIComponent(artistInfo.name)}/${encodeURIComponent(track.title)}`)}
                        className="group bg-gray-800/50 backdrop-blur rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500"
                      >
                        <div className="flex gap-4 mb-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                            <ImageWithFallback
                              artist={artistInfo.name}
                              track={track.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-white mb-1 truncate group-hover:text-purple-300 transition-colors">
                              {track.title}
                            </h4>
                            {track.peak_position && (
                              <div className="text-yellow-400 text-sm font-medium">
                                최고 #{track.peak_position}
                              </div>
                            )}
                          </div>
                        </div>
                        {track.charts && Object.keys(track.charts).length > 0 && (
                          <div>{renderChartInfo(track.charts)}</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Chart Performance */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">차트별 활동 현황</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {chartDominance.map(chart => (
                      <div key={chart.name} className="text-center bg-gray-800/30 rounded-xl p-4 border border-gray-700">
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
              </motion.div>
            )}

            {/* Tracks Tab */}
            {activeTab === 'tracks' && (
              <motion.div
                key="tracks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 pb-16"
              >
                {/* Sort Controls */}
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">전체 트랙 ({tracks.length})</h3>
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

            {/* News Tab */}
            {activeTab === 'news' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pb-16"
              >
                <NewsTab artistName={artistInfo.name} />
              </motion.div>
            )}

            {/* Goods Tab */}
            {activeTab === 'goods' && (
              <motion.div
                key="goods"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pb-16"
              >
                <GoodsTab artistName={artistInfo.name} />
              </motion.div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 pb-16"
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
                          {stats.most_successful_track || bestTrack?.title || '-'}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
