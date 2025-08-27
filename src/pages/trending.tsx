import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { trendingApi } from '@/lib/api';
import ImageWithFallback from '@/components/ImageWithFallback';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import { TRENDING_TABS } from '@/constants/trendingConfig';
import { 
  TrendingUp, TrendingDown, Flame, Award, Clock, BarChart3,
  Music, Filter, ChevronRight, Sparkles, Star,
  Zap, Globe, Radio, Activity, Crown, Disc, Minus,
  Users, Rocket, Trophy
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
  trend?: 'up' | 'down' | 'same';
  change?: number;
  is_new?: boolean;
  weeks_on_chart?: number;
}

export default function TrendingPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrendingTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('hot');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [stats, setStats] = useState({
    hotArtist: '',
    topEntry: '',
    chartKiller: '',
    weeklyBest: 0
  });

  useEffect(() => {
    fetchTrending(filter);
    fetchStats();
  }, [filter]);

  const fetchTrending = async (type: string) => {
    try {
      setLoading(true);
      
      // 탭별 실제 API 호출
      const response = await fetch(`${API_URL}/api/trending/${type}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data?.trending) {
          const processedTracks = data.trending.map((track: any) => {
            let imageUrl = track.image_url;
            if (!imageUrl || !track.has_real_image) {
              imageUrl = `${API_URL}/api/album-image-smart/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`;
            }
            
            return {
              ...track,
              image_url: imageUrl
            };
          });
          
          setTracks(processedTracks);
        }
      } else {
        console.error('Failed to fetch trending');
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // 실제 통계 API 호출
      const response = await fetch(`${API_URL}/api/trending/stats`);
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          hotArtist: data.hot_artist_info || data.hot_artist || 'N/A',
          topEntry: data.top_entry || 'N/A',
          chartKiller: data.chart_killer || 'N/A',
          weeklyBest: data.weekly_best || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // 폴백 기본값
      setStats({
        hotArtist: 'Loading...',
        topEntry: 'Loading...',
        chartKiller: 'Loading...',
        weeklyBest: 0
      });
    }
  };

  const getTrendIcon = (trend?: string, change?: number) => {
    if (!trend) return <Minus className="w-4 h-4 text-gray-400" />;
    
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <TrendingUp className="w-4 h-4" />
          {change && <span className="text-xs font-bold">+{change}</span>}
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-400">
          <TrendingDown className="w-4 h-4" />
          {change && <span className="text-xs font-bold">-{change}</span>}
        </div>
      );
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const currentTab = Object.values(TRENDING_TABS).find(tab => tab.id === filter) || TRENDING_TABS.HOT;

  return (
    <Layout>
      <Head>
        <title>Trending - KPOP Ranker</title>
      </Head>

      <div className="min-h-screen bg-[#0A0A0F]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 bg-gradient-to-r ${currentTab.color} rounded-xl`}>
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{currentTab.label}</h1>
                <p className="text-gray-400">{currentTab.info}</p>
              </div>
            </div>
          </motion.div>

          {/* 팬 친화적 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">오늘 가장 HOT한 🔥</p>
                  <p className="text-2xl font-bold text-white">{stats.hotArtist}</p>
                  <p className="text-xs text-gray-500 mt-1">24시간 순위 상승폭</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">최고 진입 🚀</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {stats.topEntry}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">올킬 임박 💯</p>
                  <p className="text-2xl font-bold text-white">{stats.chartKiller}</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">주간 최고점 🏆</p>
                  <p className="text-2xl font-bold text-white">{stats.weeklyBest}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {Object.values(TRENDING_TABS).map(tab => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(tab.id)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
                    filter === tab.id 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {filter === tab.id && (
                    <motion.div
                      layoutId="activeFilter"
                      className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 glass rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white/20 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" />
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" />
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" />
                  <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white/20 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8"
                : "space-y-4 mt-8"
              }>
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="glass-card p-4 animate-pulse">
                    <div className="w-full aspect-square bg-white/10 rounded-xl mb-4" />
                    <div className="h-4 bg-white/10 rounded mb-2" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                ))}
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {tracks.map((track, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    whileHover={{ y: -8 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                    className="relative group cursor-pointer"
                  >
                    {/* NEW Badge */}
                    {track.is_new && (
                      <div className="absolute -top-2 -right-2 z-20 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                        <span className="text-xs font-bold text-white">NEW</span>
                      </div>
                    )}

                    <div className="relative glass-card overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                      {/* Rank Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center justify-center w-14 h-14 bg-black/70 backdrop-blur-xl rounded-xl border border-white/20">
                          <span className="text-xl font-black text-white">#{idx + 1}</span>
                        </div>
                      </div>

                      {/* Trend Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-2 bg-black/70 backdrop-blur-xl rounded-lg border border-white/20">
                          {getTrendIcon(track.trend, track.change)}
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                        <ImageWithFallback
                          src={track.image_url}
                          alt={track.track}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-white mb-1 truncate">{track.track}</h3>
                        <p className="text-sm text-gray-400 mb-3 truncate">{track.artist}</p>
                        
                        {/* Score & Charts */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-xl font-bold text-white">{track.score}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-sm">{track.chart_count} charts</span>
                          </div>
                        </div>
                        
                        {/* Chart Pills */}
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(track.charts || {}).slice(0, 3).map(([chart, rank]) => (
                            <ChartRankDisplay 
                              key={chart}
                              chartName={chart} 
                              rank={rank as number} 
                              displayType="badge"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div className="space-y-3 mt-8">
                {tracks.map((track, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    whileHover={{ x: 10 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                    className="glass-card p-4 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Trend */}
                      <div className="flex-shrink-0">
                        {getTrendIcon(track.trend, track.change)}
                      </div>

                      {/* Image */}
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          src={track.image_url}
                          alt={track.track}
                          width={64}
                          height={64}
                          className="rounded-lg"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-white truncate">{track.track}</h3>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>

                      {/* Charts */}
                      <div className="flex-shrink-0 hidden md:flex gap-2">
                        {Object.entries(track.charts || {}).slice(0, 4).map(([chart, rank]) => (
                          <ChartRankDisplay
                            key={chart}
                            chartName={chart}
                            rank={rank as number}
                            displayType="compact"
                          />
                        ))}
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-center">
                        <div className="flex items-center gap-1">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <span className="text-2xl font-bold text-white">{track.score}</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
