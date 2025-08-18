import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MouseGradient, 
  ParticleField,
  WaveVisualizer
} from '@/components/InteractiveComponents';
import {
  TrendingFlame,
  SparkLine,
  LiveCounter,
  HeatMap
} from '@/components/DataVisualization';
import { FaPlay, FaSpotify, FaYoutube, FaApple, FaChartLine, FaClock, FaFire, FaGlobeAsia } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';
import axios from 'axios';

interface TrackData {
  track_info: {
    artist: string;
    title: string;
    album: string;
    release_date: string;
    genre: string;
    duration?: string;
  };
  current_positions: Record<string, number>;
  history: Array<{
    date: string;
    rank: number;
    change: number;
  }>;
  youtube_data?: {
    views: number;
    likes: number;
    comments: number;
    daily_views: number;
  };
  streaming_links?: Record<string, string>;
}

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, track } = router.query;
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'history'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (artist && track) {
      fetchTrackData(artist as string, track as string);
    }
  }, [artist, track]);

  const fetchTrackData = async (artistName: string, trackName: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/track/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`
      );
      setTrackData(response.data);
    } catch (error) {
      console.error('Failed to fetch track data:', error);
      // Mock data for demo
      setTrackData({
        track_info: {
          artist: artistName,
          title: trackName,
          album: trackName,
          release_date: '2024-01-01',
          genre: 'K-POP',
          duration: '3:25'
        },
        current_positions: {
          melon: 1,
          genie: 2,
          bugs: 1,
          spotify: 15,
          youtube: 8
        },
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          rank: Math.floor(Math.random() * 20) + 1,
          change: Math.floor(Math.random() * 10) - 5
        })),
        youtube_data: {
          views: 120000000,
          likes: 2500000,
          comments: 180000,
          daily_views: 500000
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartIcons: Record<string, JSX.Element> = {
    melon: <span>🍉</span>,
    genie: <span>🧞</span>,
    bugs: <span>🐛</span>,
    spotify: <FaSpotify />,
    youtube: <FaYoutube />,
    vibe: <span>💜</span>,
    flo: <span>🌊</span>,
    billboard: <span>📊</span>
  };

  const chartColors: Record<string, string> = {
    melon: 'from-green-500 to-green-600',
    genie: 'from-blue-500 to-blue-600',
    bugs: 'from-orange-500 to-orange-600',
    spotify: 'from-green-400 to-green-500',
    youtube: 'from-red-500 to-red-600',
    vibe: 'from-purple-500 to-purple-600',
    flo: 'from-cyan-500 to-cyan-600',
    billboard: 'from-yellow-500 to-yellow-600'
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

  if (!trackData) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="text-white text-xl">트랙을 찾을 수 없습니다</div>
        </div>
      </Layout>
    );
  }

  const albumImageUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/album-image-smart/${encodeURIComponent(artist as string)}/${encodeURIComponent(track as string)}`;

  return (
    <Layout>
      <Head>
        <title>{trackData.track_info.title} - {trackData.track_info.artist} | KPOP Ranker</title>
      </Head>

      <MouseGradient>
        <div className="min-h-screen bg-[#0A0A0F] text-white relative">
          <ParticleField />
          
          {/* Hero Section */}
          <motion.section 
            className="relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-pink-900/20 to-[#0A0A0F]" />
            
            <div className="relative z-10 px-8 py-16">
              <div className="max-w-7xl mx-auto">
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {/* Album Art */}
                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative w-full max-w-md mx-auto">
                      <div className="aspect-square rounded-2xl overflow-hidden glass-card p-1">
                        <img 
                          src={albumImageUrl}
                          alt={trackData.track_info.title}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Play Button Overlay */}
                      <motion.button
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsPlaying(!isPlaying)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
                          <FaPlay className="text-3xl text-white ml-1" />
                        </div>
                      </motion.button>
                      
                      {/* Glow Effect */}
                      <motion.div 
                        className="absolute -inset-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-30 blur-3xl -z-10"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                    </div>

                    {/* Wave Visualizer */}
                    {isPlaying && (
                      <div className="mt-8">
                        <WaveVisualizer isPlaying={isPlaying} />
                      </div>
                    )}
                  </motion.div>

                  {/* Track Info */}
                  <div>
                    <motion.h1 
                      className="text-5xl font-bold mb-4 glitch"
                      data-text={trackData.track_info.title}
                      initial={{ x: -50 }}
                      animate={{ x: 0 }}
                    >
                      <span className="neon-text">{trackData.track_info.title}</span>
                    </motion.h1>
                    
                    <motion.h2 
                      className="text-3xl mb-6 opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 0.8 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => router.push(`/artist/${trackData.track_info.artist}`)}
                    >
                      {trackData.track_info.artist}
                    </motion.h2>

                    {/* Meta Info */}
                    <motion.div 
                      className="flex flex-wrap gap-4 mb-8"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="px-4 py-2 rounded-full glass-card text-sm">
                        💿 {trackData.track_info.album}
                      </span>
                      <span className="px-4 py-2 rounded-full glass-card text-sm">
                        <FaClock className="inline mr-2" />
                        {trackData.track_info.release_date}
                      </span>
                      {trackData.track_info.duration && (
                        <span className="px-4 py-2 rounded-full glass-card text-sm">
                          ⏱️ {trackData.track_info.duration}
                        </span>
                      )}
                      <span className="px-4 py-2 rounded-full glass-card text-sm">
                        🎵 {trackData.track_info.genre}
                      </span>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                      className="grid grid-cols-2 gap-4 mb-8"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {trackData.youtube_data && (
                        <>
                          <LiveCounter 
                            value={trackData.youtube_data.views} 
                            label="YouTube 조회수" 
                          />
                          <LiveCounter 
                            value={trackData.youtube_data.likes} 
                            label="좋아요" 
                          />
                        </>
                      )}
                    </motion.div>

                    {/* Streaming Links */}
                    <motion.div 
                      className="flex flex-wrap gap-3"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.button
                        className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center gap-2 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaSpotify /> Spotify
                      </motion.button>
                      <motion.button
                        className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center gap-2 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaYoutube /> YouTube
                      </motion.button>
                      <motion.button
                        className="px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-800 flex items-center gap-2 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaApple /> Apple Music
                      </motion.button>
                      <motion.button
                        className="px-6 py-3 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center gap-2 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <SiYoutubemusic /> YT Music
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Tabs */}
          <section className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-lg border-y border-white/10">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="flex gap-6">
                {(['overview', 'charts', 'history'] as const).map((tab) => (
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
                    {tab === 'charts' && '🏆 차트'}
                    {tab === 'history' && '📈 히스토리'}
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
                    {/* Current Chart Positions */}
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">현재 차트 순위</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(trackData.current_positions).map(([chart, rank], idx) => (
                          <motion.div
                            key={chart}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.05, type: "spring" }}
                            className={`p-4 rounded-xl bg-gradient-to-r ${chartColors[chart] || 'from-gray-500 to-gray-600'} bg-opacity-20`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{chartIcons[chart]}</span>
                                <span className="font-medium capitalize">{chart}</span>
                              </div>
                              <div className="text-2xl font-bold">
                                #{rank}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* YouTube Stats */}
                    {trackData.youtube_data && (
                      <div className="glass-card rounded-2xl p-6">
                        <h2 className="text-2xl font-bold mb-6 neon-text">YouTube 통계</h2>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="opacity-70">총 조회수</span>
                            <span className="text-2xl font-bold">
                              {(trackData.youtube_data.views / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="opacity-70">좋아요</span>
                            <span className="text-xl font-bold">
                              {(trackData.youtube_data.likes / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="opacity-70">댓글</span>
                            <span className="text-xl font-bold">
                              {(trackData.youtube_data.comments / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="opacity-70">일일 조회수</span>
                            <span className="text-xl font-bold">
                              {(trackData.youtube_data.daily_views / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trending Score */}
                    <div className="glass-card rounded-2xl p-6 lg:col-span-2">
                      <h2 className="text-2xl font-bold mb-6 neon-text">트렌딩 스코어</h2>
                      <div className="flex items-center justify-center">
                        <TrendingFlame intensity={85} />
                        <div className="ml-8">
                          <div className="text-5xl font-bold neon-text">85°</div>
                          <div className="text-sm opacity-70 mt-2">매우 뜨거움 🔥</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Charts Tab */}
                {activeTab === 'charts' && (
                  <motion.div
                    key="charts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">차트별 상세 순위</h2>
                      <div className="space-y-4">
                        {Object.entries(trackData.current_positions).map(([chart, rank], idx) => (
                          <motion.div
                            key={chart}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-6 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${chartColors[chart]} flex items-center justify-center text-3xl`}>
                                  {chartIcons[chart]}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold capitalize">{chart}</h3>
                                  <p className="text-sm opacity-70">실시간 차트</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-bold neon-text">#{rank}</div>
                                <div className="text-sm opacity-70 mt-1">
                                  {rank <= 10 ? '🔥 TOP 10' : rank <= 50 ? '📈 상위권' : '📊 차트인'}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Rank History Chart */}
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">순위 변동 히스토리</h2>
                      <div className="h-64 flex items-end gap-2">
                        {trackData.history.slice(0, 30).reverse().map((item, idx) => (
                          <motion.div
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg relative group"
                            initial={{ height: 0 }}
                            animate={{ height: `${100 - (item.rank * 3)}%` }}
                            transition={{ delay: idx * 0.02 }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
                              #{item.rank} ({item.date})
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-4 text-center text-sm opacity-70">최근 30일 순위 변동</div>
                    </div>

                    {/* Detailed History */}
                    <div className="glass-card rounded-2xl p-6">
                      <h2 className="text-2xl font-bold mb-6 neon-text">상세 히스토리</h2>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {trackData.history.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-sm opacity-70">{item.date}</div>
                              <div className="text-2xl font-bold">#{item.rank}</div>
                            </div>
                            {item.change !== 0 && (
                              <div className={`font-bold ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}
                              </div>
                            )}
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