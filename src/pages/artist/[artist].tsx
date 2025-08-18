import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MouseGradient, 
  ParticleField,
  Album3D,
  WaveVisualizer
} from '@/components/InteractiveComponents';
import {
  TrendingFlame,
  SparkLine,
  LiveCounter,
  HeatMap
} from '@/components/DataVisualization';
import { artistAPI } from '@/lib/api';
import { FaTrophy, FaMusic, FaGlobeAsia, FaFire, FaChartLine, FaClock, FaSpotify, FaYoutube } from 'react-icons/fa';
import { SiMelonmusic, SiYoutubemusic } from 'react-icons/si';

interface Track {
  name: string;
  album_image: string;
  charts: any;
  trend_score: number;
  youtube_views?: number;
  release_date?: string;
}

interface ArtistData {
  artist: {
    name: string;
    korean_name?: string;
    profile_image?: string;
    debut_date?: string;
    agency?: string;
    members?: string[];
  };
  tracks: Track[];
  stats?: {
    total_tracks: number;
    chart_appearances: number;
    best_rank: number;
    avg_rank: number;
  };
}

export default function ArtistDetailPage() {
  const router = useRouter();
  const { artist } = router.query;
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'analytics'>('overview');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (artist) {
      fetchArtistData(artist as string);
    }
  }, [artist]);

  const fetchArtistData = async (artistName: string) => {
    setIsLoading(true);
    try {
      const response = await artistAPI.getDetails(artistName);
      
      // 통계 데이터 생성
      const stats = {
        total_tracks: response.tracks?.length || 0,
        chart_appearances: response.tracks?.filter((t: any) => t.charts?.melon?.in_chart).length || 0,
        best_rank: Math.min(...(response.tracks?.map((t: any) => t.charts?.melon?.rank || 100) || [100])),
        avg_rank: Math.round(
          response.tracks?.reduce((acc: number, t: any) => acc + (t.charts?.melon?.rank || 0), 0) / 
          (response.tracks?.length || 1)
        )
      };
      
      setArtistData({
        ...response,
        stats
      });
      
      if (response.tracks?.length > 0) {
        setSelectedTrack(response.tracks[0]);
      }
    } catch (error) {
      console.error('Failed to fetch artist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartColors: Record<string, string> = {
    melon: 'from-green-500 to-green-600',
    genie: 'from-blue-500 to-blue-600',
    bugs: 'from-orange-500 to-orange-600',
    spotify: 'from-green-400 to-green-500',
    youtube: 'from-red-500 to-red-600',
  };

  // 히트맵 데이터 생성
  const generateHeatmapData = () => {
    if (!artistData?.tracks) return [];
    
    const data = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        data.push({
          day,
          hour,
          rank: Math.floor(Math.random() * 100) + 1
        });
      }
    }
    return data;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <WaveVisualizer isPlaying={true} />
        </div>
      </Layout>
    );
  }

  if (!artistData) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="text-white text-xl">아티스트를 찾을 수 없습니다</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{artistData.artist.name} - KPOP Ranker</title>
      </Head>

      <MouseGradient>
        <div className="min-h-screen bg-[#0A0A0F] text-white relative">
          <ParticleField />
          
          {/* Hero Section */}
          <motion.section 
            className="relative h-[500px] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-pink-900/30 to-[#0A0A0F]" />
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
            </div>

            <div className="relative z-10 h-full flex items-center px-8">
              <div className="max-w-7xl mx-auto w-full">
                <motion.div 
                  className="flex flex-col md:flex-row items-center gap-12"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Artist Image */}
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 p-1">
                      <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                        <span className="text-8xl">🎤</span>
                      </div>
                    </div>
                    <motion.div 
                      className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-50 blur-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Artist Info */}
                  <div className="flex-1 text-center md:text-left">
                    <motion.h1 
                      className="text-6xl font-bold mb-4 glitch"
                      data-text={artistData.artist.name}
                      initial={{ x: -50 }}
                      animate={{ x: 0 }}
                    >
                      <span className="neon-text">{artistData.artist.name}</span>
                    </motion.h1>
                    
                    {artistData.artist.korean_name && (
                      <motion.p 
                        className="text-2xl mb-6 opacity-80"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {artistData.artist.korean_name}
                      </motion.p>
                    )}

                    {/* Stats */}
                    <motion.div 
                      className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <LiveCounter value={artistData.stats?.total_tracks || 0} label="총 트랙" />
                      <LiveCounter value={artistData.stats?.chart_appearances || 0} label="차트 진입" />
                      <LiveCounter value={artistData.stats?.best_rank || 0} label="최고 순위" />
                      <LiveCounter value={artistData.stats?.avg_rank || 0} label="평균 순위" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Tabs */}
          <section className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="flex gap-6">
                {(['overview', 'tracks', 'analytics'] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-full font-medium transition-all ${
                      activeTab === tab 
                        ? 'retro-border neon-glow' 
                        : 'glass-card hover:scale-105'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab === 'overview' && '📊 개요'}
                    {tab === 'tracks' && '🎵 트랙'}
                    {tab === 'analytics' && '📈 분석'}
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="px-8 py-16">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Top Tracks */}
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">인기 트랙</h2>
                      <div className="space-y-4">
                        {artistData.tracks.slice(0, 5).map((track, idx) => (
                          <motion.div
                            key={track.name}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 cursor-pointer group"
                            onClick={() => router.push(`/track/${artistData.artist.name}/${track.name}`)}
                            whileHover={{ x: 10 }}
                          >
                            <div className="text-2xl font-bold neon-text">
                              {idx + 1}
                            </div>
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <img 
                                src={track.album_image || '/placeholder.jpg'} 
                                alt={track.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold">{track.name}</h3>
                              <div className="flex gap-2 mt-1">
                                {track.charts?.melon?.in_chart && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20">
                                    멜론 #{track.charts.melon.rank}
                                  </span>
                                )}
                                {track.charts?.spotify?.in_chart && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-400/20">
                                    스포티파이
                                  </span>
                                )}
                              </div>
                            </div>
                            <TrendingFlame intensity={track.trend_score || 50} />
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              →
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Chart Positions */}
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">차트 현황</h2>
                      <div className="space-y-4">
                        {Object.entries(chartColors).map(([chart, gradient], idx) => {
                          const chartData = artistData.tracks[0]?.charts?.[chart];
                          const isInChart = chartData?.in_chart;
                          
                          return (
                            <motion.div
                              key={chart}
                              initial={{ x: 50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`p-4 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-20`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {chart === 'spotify' && <FaSpotify className="text-2xl" />}
                                  {chart === 'youtube' && <FaYoutube className="text-2xl" />}
                                  {chart === 'melon' && <span className="text-2xl">🍉</span>}
                                  {chart === 'genie' && <span className="text-2xl">🧞</span>}
                                  {chart === 'bugs' && <span className="text-2xl">🐛</span>}
                                  <span className="font-bold capitalize">{chart}</span>
                                </div>
                                {isInChart ? (
                                  <div className="text-right">
                                    <div className="text-2xl font-bold">#{chartData.rank}</div>
                                    {chartData.views_or_streams && (
                                      <div className="text-xs opacity-70">{chartData.views_or_streams}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm opacity-50">차트 아웃</span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent Activity Heatmap */}
                    <div className="lg:col-span-2">
                      <HeatMap data={generateHeatmapData()} />
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
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artistData.tracks.map((track, idx) => (
                        <motion.div
                          key={track.name}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: idx * 0.05, type: "spring" }}
                          className="group cursor-pointer"
                          onClick={() => router.push(`/track/${artistData.artist.name}/${track.name}`)}
                        >
                          <Album3D 
                            src={track.album_image || '/placeholder.jpg'}
                            artist={artistData.artist.name}
                            title={track.name}
                          />
                          <div className="mt-4 text-center">
                            <h3 className="font-bold text-lg">{track.name}</h3>
                            {track.release_date && (
                              <p className="text-sm opacity-70 mt-1">
                                <FaClock className="inline mr-1" />
                                {track.release_date}
                              </p>
                            )}
                            <div className="flex justify-center gap-2 mt-2">
                              {track.charts?.melon?.in_chart && (
                                <span className="text-xs px-2 py-1 rounded-full glass-card">
                                  멜론 #{track.charts.melon.rank}
                                </span>
                              )}
                              {track.youtube_views && (
                                <span className="text-xs px-2 py-1 rounded-full glass-card">
                                  {Math.floor(track.youtube_views / 1000000)}M 뷰
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Performance Metrics */}
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">퍼포먼스 지표</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold neon-text mb-2">
                            {artistData.stats?.best_rank || '-'}
                          </div>
                          <div className="text-sm opacity-70">최고 순위</div>
                          <div className="mt-4">
                            <SparkLine data={Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1)} />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-5xl font-bold neon-text mb-2">
                            {artistData.stats?.chart_appearances || 0}
                          </div>
                          <div className="text-sm opacity-70">차트 진입 횟수</div>
                          <div className="mt-4">
                            <SparkLine data={Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1)} />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-5xl font-bold neon-text mb-2">
                            {artistData.stats?.avg_rank || '-'}
                          </div>
                          <div className="text-sm opacity-70">평균 순위</div>
                          <div className="mt-4">
                            <SparkLine data={Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1)} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Track Performance Comparison */}
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">트랙별 성과</h2>
                      <div className="space-y-3">
                        {artistData.tracks.slice(0, 10).map((track, idx) => (
                          <motion.div
                            key={track.name}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-4"
                          >
                            <div className="w-32 truncate font-medium">{track.name}</div>
                            <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${track.trend_score || 50}%` }}
                                transition={{ delay: idx * 0.05 + 0.3, duration: 0.5 }}
                              />
                            </div>
                            <div className="text-sm font-bold neon-text">
                              {track.trend_score || 50}%
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </MouseGradient>
    </Layout>
  );
}