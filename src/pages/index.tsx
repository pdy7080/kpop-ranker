import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '@/components/ImageWithFallback';
import UnifiedSearch from '@/components/UnifiedSearch';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import { 
  Crown, Trophy, TrendingUp, Music, Star, Sparkles,
  Play, Heart, Eye, BarChart3, Globe, Users, Disc
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
}

// 차트 색상 매핑
const chartColors = {
  melon: '#00CD3C',
  genie: '#00A8E6',
  bugs: '#FF6B00',
  spotify: '#1DB954',
  youtube: '#FF0000',
  flo: '#AA40FC',
  vibe: '#EC4899',
  billboard: '#1F2937'
};

export default function Home() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    fetchTrendingData();
    const interval = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/trending?limit=30`);
      const data = await response.json();
      
      if (data?.trending) {
        setTrendingTracks(data.trending);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const topTracks = trendingTracks.slice(0, 3);
  const hotTracks = trendingTracks.slice(3, 15);
  const risingTracks = trendingTracks.slice(15, 27);

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - Global K-POP Chart Platform</title>
        <meta name="description" content="실시간 K-POP 차트 통합 플랫폼 - 전 세계 음원 차트를 한눈에" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        {/* Hero Section - 대형 비주얼 */}
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          {/* Background Hero Images */}
          <AnimatePresence mode="wait">
            {topTracks.length > 0 && (
              <motion.div
                key={activeHero}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <ImageWithFallback
                  artist={topTracks[activeHero]?.artist || ''}
                  track={topTracks[activeHero]?.track || ''}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col justify-center items-center px-4">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              {/* Logo */}
              <div className="mb-6">
                <h1 className="text-6xl md:text-7xl font-black">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 
                               bg-clip-text text-transparent drop-shadow-2xl">
                    KPOP RANKER
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mt-2 font-light">
                  Global K-POP Chart Platform
                </p>
              </div>

              {/* Live Indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-sm font-medium">LIVE TRACKING</span>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <UnifiedSearch />
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-8 text-center"
            >
              <div className="glass-card px-6 py-3 rounded-full">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-xs text-gray-400">Charts</div>
              </div>
              <div className="glass-card px-6 py-3 rounded-full">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-gray-400">Updates</div>
              </div>
              <div className="glass-card px-6 py-3 rounded-full">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-gray-400">Artists</div>
              </div>
            </motion.div>
          </div>

          {/* Hero Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveHero(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeHero === idx ? 'w-8 bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </section>

        {/* TOP 3 Championship - 포디움 스타일 */}
        {!isLoading && topTracks.length > 0 && (
          <section className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 
                               bg-clip-text text-transparent">
                    TODAY'S CHAMPIONS
                  </span>
                </h2>
                <p className="text-gray-400">가장 핫한 K-POP 트랙</p>
              </div>

              {/* Podium Style Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* 2nd Place */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="md:mt-8"
                >
                  <ChampionCard track={topTracks[1]} rank={2} />
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <ChampionCard track={topTracks[0]} rank={1} />
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="md:mt-16"
                >
                  <ChampionCard track={topTracks[2]} rank={3} />
                </motion.div>
              </div>
            </motion.div>
          </section>
        )}

        {/* HOT TRACKS - Magazine Grid */}
        {!isLoading && hotTracks.length > 0 && (
          <section className="container mx-auto px-4 py-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                HOT TRACKS
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotTracks.map((track, idx) => (
                <motion.div
                  key={`${track.artist}-${track.track}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <ImageWithFallback
                      artist={track.artist}
                      track={track.track}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <Play className="w-12 h-12 text-white mb-2" />
                      </div>
                    </div>
                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-white font-bold text-sm">#{idx + 4}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{track.track}</h3>
                    <p className="text-gray-400 text-xs line-clamp-1">{track.artist}</p>
                    <div className="flex gap-1 mt-2">
                      {Object.entries(track.charts)
                        .filter(([chart]) => chart !== 'youtube')
                        .slice(0, 3)
                        .map(([chart, rank]) => (
                          <span
                            key={chart}
                            className="px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${chartColors[chart as keyof typeof chartColors]}20`,
                              color: chartColors[chart as keyof typeof chartColors]
                            }}
                          >
                            {chart} #{rank}
                          </span>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* RISING STARS - Horizontal Scroll */}
        {!isLoading && risingTracks.length > 0 && (
          <section className="py-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  RISING STARS
                </h2>
              </div>

              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {risingTracks.map((track, idx) => (
                    <motion.div
                      key={`${track.artist}-${track.track}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="w-48 flex-shrink-0 cursor-pointer"
                      onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                    >
                      <div className="glass-card p-4 rounded-xl hover:bg-white/10 transition-all">
                        <div className="aspect-square rounded-lg overflow-hidden mb-3">
                          <ImageWithFallback
                            artist={track.artist}
                            track={track.track}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{track.track}</h4>
                        <p className="text-gray-400 text-xs line-clamp-1 mb-2">{track.artist}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Trophy className="w-3 h-3" />
                          <span>Best #{track.best_rank}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Disc className="w-12 h-12 text-purple-500" />
            </motion.div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </Layout>
  );
}

// Champion Card Component
function ChampionCard({ track, rank }: { track: TrendingTrack; rank: number }) {
  const router = useRouter();
  
  const getRankStyle = () => {
    switch(rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  const getRankSize = () => {
    switch(rank) {
      case 1: return 'h-80';
      case 2: return 'h-72';
      case 3: return 'h-64';
      default: return 'h-60';
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer ${rank === 1 ? 'transform scale-110' : ''}`}
      onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
    >
      {/* Rank Medal */}
      <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 
                      w-16 h-16 bg-gradient-to-br ${getRankStyle()} 
                      rounded-full flex items-center justify-center shadow-2xl
                      ${rank === 1 ? 'w-20 h-20' : ''}`}>
        <span className="text-white font-black text-2xl">{rank}</span>
      </div>

      {/* Card */}
      <div className={`glass-card ${getRankSize()} rounded-2xl overflow-hidden 
                      transform transition-all hover:scale-105`}>
        {/* Album Art */}
        <div className="relative h-2/3">
          <ImageWithFallback
            artist={track.artist}
            track={track.track}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 
                        group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full 
                          flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-lg line-clamp-1">{track.track}</h3>
          <p className="text-gray-300 text-sm mb-2">{track.artist}</p>
          
          {/* Charts */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(track.charts)
              .filter(([chart]) => chart !== 'youtube')
              .slice(0, 3)
              .map(([chart, rank]) => (
                <span
                  key={chart}
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white"
                >
                  {chart} #{rank}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Crown for #1 */}
      {rank === 1 && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
        </div>
      )}
    </div>
  );
}
