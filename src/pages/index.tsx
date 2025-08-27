import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { trendingApi, chartStatusAPI } from '@/lib/api';
import ImageWithFallback from '@/components/ImageWithFallback';
import UnifiedSearch from '@/components/UnifiedSearch';
import { ChartLogos, getChartLogo } from '@/utils/chartLogos';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import ChartUpdateStatus from '@/components/ChartUpdateStatus';
import { 
  TrendingUp, Music, Award, Flame, ChevronRight,
  Activity, Sparkles, BarChart3, Globe, Star,
  Zap, Users, Radio, Headphones, Crown, Play,
  Clock, Heart
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
  local_image?: string;
  has_real_image?: boolean;
}

export default function Home() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [topTracks, setTopTracks] = useState<TrendingTrack[]>([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    totalCharts: 8,
    lastUpdated: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'top'>('hot');

  useEffect(() => {
    setMounted(true);
    fetchData();
    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // HOT 트렌딩 가져오기
      const hotResponse = await trendingApi.getTrending('hot', 20);
      console.log('Hot trending response:', hotResponse);
      
      if (hotResponse?.trending && Array.isArray(hotResponse.trending)) {
        // 이미지 URL 처리
        const processedTracks = hotResponse.trending.map((track: any) => {
          let imageUrl = track.image_url;
          
          // 이미지가 없거나 has_real_image가 false인 경우 Smart API 사용
          if (!imageUrl || !track.has_real_image) {
            imageUrl = `${API_URL}/api/album-image-smart/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`;
          } else if (!imageUrl.startsWith('http')) {
            imageUrl = imageUrl.startsWith('/') ? `${API_URL}${imageUrl}` : imageUrl;
          }
          
          return {
            ...track,
            image_url: imageUrl
          };
        });
        
        setTrendingTracks(processedTracks.slice(0, 12));
        setTopTracks(processedTracks.slice(0, 3)); // TOP 3 저장
      }
      
      // TOP 트렌딩도 가져오기 (옵션)
      try {
        const topResponse = await trendingApi.getTrending('top', 3);
        if (topResponse?.trending && topResponse.trending.length > 0) {
          const processedTop = topResponse.trending.map((track: any) => {
            let imageUrl = track.image_url;
            if (!imageUrl || !track.has_real_image) {
              imageUrl = `${API_URL}/api/album-image-smart/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`;
            }
            return { ...track, image_url: imageUrl };
          });
          setTopTracks(processedTop);
        }
      } catch (err) {
        console.log('Top trending fetch optional:', err);
      }
      
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // 먼저 통계 API 호출 시도
      try {
        const statsResponse = await fetch(`${API_URL}/api/stats/overview`);
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats({
            totalTracks: data.unique_tracks || 0,
            totalArtists: data.unique_artists || 0,
            totalCharts: data.active_charts || 8,
            lastUpdated: data.last_updated || new Date().toISOString()
          });
          return;
        }
      } catch (e) {
        console.log('Stats API not available, falling back');
      }
      
      // 폴백: 기존 차트 업데이트 API
      const response = await chartStatusAPI.getUpdateStatus();
      if (response) {
        setStats({
          totalTracks: response.total_tracks || 0,
          totalArtists: response.total_artists || 0,
          totalCharts: response.charts?.length || 8,
          lastUpdated: response.last_updated || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트 통합 플랫폼</title>
      </Head>

      <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse delay-2000" />
        </div>

        {/* Hero Section with Top 3 */}
        <div className="relative">
          <div className="container mx-auto px-4 py-12">
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="inline-block mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-2xl opacity-50" />
                  <h1 className="relative text-5xl md:text-6xl font-black">
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      KPOP
                    </span>
                    <span className="text-white ml-3">RANKER</span>
                  </h1>
                </div>
              </motion.div>
              
              <p className="text-lg md:text-xl text-gray-400 font-light">
                전 세계 K-POP 차트를 한눈에
              </p>
              
              {/* Live Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 mt-3"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-sm">LIVE - 실시간 업데이트 중</span>
              </motion.div>
            </motion.div>

            {/* TOP 3 Hero Cards - 대형 앨범 이미지 */}
            {!isLoading && topTracks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {topTracks.map((track, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                      className="relative group cursor-pointer"
                    >
                      {/* Rank Badge */}
                      <div className="absolute -top-4 -right-4 z-20">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-2xl
                          ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                            idx === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                            'bg-gradient-to-r from-orange-600 to-orange-700 text-white'}`}>
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Card with Large Image */}
                      <div className="relative overflow-hidden rounded-2xl glass-card border border-white/10 group-hover:border-purple-500/50 transition-all">
                        {/* Large Album Image */}
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                          <ImageWithFallback
                            src={track.image_url}
                            alt={track.track}
                            width={500}
                            height={500}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />
                          
                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.div
                              initial={{ scale: 0 }}
                              whileHover={{ scale: 1.1 }}
                              className="p-5 bg-white/20 backdrop-blur-xl rounded-full"
                            >
                              <Play className="w-10 h-10 text-white fill-white" />
                            </motion.div>
                          </div>

                          {/* Track Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                              {track.track}
                            </h3>
                            <p className="text-lg text-gray-200 drop-shadow-lg">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="p-4 bg-black/40 backdrop-blur">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-yellow-400" />
                              <span className="text-2xl font-bold text-white">{track.score}</span>
                            </div>
                            <div className="flex gap-1">
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search with Glass Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl" />
                <div className="relative glass-card p-2">
                  <UnifiedSearch />
                </div>
              </div>
            </motion.div>

            {/* Chart Update Status - 차트 업데이트 현황 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <ChartUpdateStatus className="max-w-5xl mx-auto" />
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {[
                { icon: Music, label: '총 트랙', value: stats.totalTracks.toLocaleString(), color: 'from-purple-500 to-purple-600' },
                { icon: Users, label: '아티스트', value: stats.totalArtists.toLocaleString(), color: 'from-pink-500 to-pink-600' },
                { icon: BarChart3, label: '차트', value: `${stats.totalCharts}개`, color: 'from-blue-500 to-blue-600' },
                { icon: Activity, label: '업데이트', value: '실시간', color: 'from-green-500 to-green-600' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                    style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                  />
                  <div className="relative glass-card p-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">HOT TRENDING</h2>
                  <p className="text-gray-400">실시간 인기 급상승 트랙</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/trending')}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
              >
                <span className="text-white">전체보기</span>
                <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Trending Tracks Grid with Album Images */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, idx) => (
                  <div key={idx} className="glass-card p-3 animate-pulse">
                    <div className="aspect-square bg-white/10 rounded-lg mb-3" />
                    <div className="h-4 bg-white/10 rounded mb-2" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {trendingTracks.map((track, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ y: -8 }}
                    onHoverStart={() => setHoveredCard(idx)}
                    onHoverEnd={() => setHoveredCard(null)}
                    onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                    className="relative group cursor-pointer"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl blur-xl transition-opacity duration-300 ${hoveredCard === idx ? 'opacity-100' : 'opacity-0'}`} />
                    
                    {/* Card Content */}
                    <div className="relative glass-card p-3 overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <div className="flex items-center justify-center w-8 h-8 bg-black/60 backdrop-blur-xl rounded-lg border border-white/20">
                          <span className="text-xs font-bold text-white">#{idx + 1}</span>
                        </div>
                      </div>

                      {/* Album Image - Main Focus */}
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/50 to-pink-900/50 mb-3">
                        <ImageWithFallback
                          src={track.image_url}
                          alt={track.track}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-3 bg-white/20 backdrop-blur-xl rounded-full">
                            <Headphones className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {/* Score Badge */}
                        <div className="absolute bottom-2 right-2">
                          <div className="px-2 py-1 bg-black/60 backdrop-blur-xl rounded-lg border border-white/20">
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs font-bold text-white">{track.score}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Track Info */}
                      <div>
                        <h3 className="font-bold text-sm text-white mb-0.5 truncate">
                          {track.track}
                        </h3>
                        <p className="text-gray-400 text-xs truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Features Section with Images */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Globe,
                  title: '글로벌 차트 통합',
                  description: '멜론, 지니, 벅스, 스포티파이 등 8개 차트 실시간 모니터링',
                  gradient: 'from-blue-600 to-cyan-600'
                },
                {
                  icon: Crown,
                  title: '스마트 랭킹 시스템',
                  description: 'AI 기반 트렌드 분석과 종합 스코어링 알고리즘',
                  gradient: 'from-purple-600 to-pink-600'
                },
                {
                  icon: Radio,
                  title: '실시간 업데이트',
                  description: '매시간 자동 크롤링으로 최신 차트 정보 제공',
                  gradient: 'from-green-600 to-emerald-600'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                  <div className="relative glass-card p-8 h-full border border-white/10 hover:border-white/20 transition-all">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}