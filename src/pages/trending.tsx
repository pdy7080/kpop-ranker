import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '@/components/ImageWithFallback';
import { 
  TrendingUp, Filter, Crown, Flame, Star, Music,
  Play, Heart, Eye, Clock, Award, ArrowUp, ArrowDown,
  Sparkles, Globe, Radio, BarChart3
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  artist: string;
  track: string;
  charts: Record<string, number>;
  best_rank: number;
  chart_count: number;
  score: number;
}

// Chart 설정
const CHART_CONFIG = {
  all: { name: '전체', icon: '🌍', color: 'from-purple-500 to-pink-500' },
  melon: { name: 'Melon', icon: '🍈', color: 'from-green-400 to-green-600' },
  genie: { name: 'Genie', icon: '🧞', color: 'from-blue-400 to-blue-600' },
  bugs: { name: 'Bugs', icon: '🐛', color: 'from-orange-400 to-orange-600' },
  spotify: { name: 'Spotify', icon: '🎧', color: 'from-green-500 to-green-700' },
  youtube: { name: 'YouTube', icon: '📺', color: 'from-red-500 to-red-700' },
  flo: { name: 'FLO', icon: '🌊', color: 'from-purple-400 to-purple-600' },
  vibe: { name: 'Vibe', icon: '💜', color: 'from-pink-400 to-pink-600' }
};

export default function TrendingRedesign() {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrendingTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTrendingData();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [selectedChart, tracks]);

  const fetchTrendingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/trending?limit=100`);
      const data = await response.json();
      
      if (data?.trending) {
        setTracks(data.trending);
        setFilteredTracks(data.trending);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTracks = () => {
    if (selectedChart === 'all') {
      setFilteredTracks(tracks);
    } else {
      const filtered = tracks.filter(t => t.charts[selectedChart] !== undefined);
      setFilteredTracks(filtered);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Trending - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 트렌딩 차트" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900">
        {/* Header Section */}
        <section className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 via-pink-800/20 to-blue-800/20 animate-gradient" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full filter blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative container mx-auto px-4 py-16">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 
                             bg-clip-text text-transparent">
                  TRENDING NOW
                </span>
              </h1>
              <p className="text-xl text-gray-300">실시간 K-POP 차트 트렌드</p>
              
              {/* Live Stats */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{filteredTracks.length}</div>
                  <div className="text-sm text-gray-400">Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">LIVE</div>
                  <div className="text-sm text-gray-400">Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">8</div>
                  <div className="text-sm text-gray-400">Charts</div>
                </div>
              </div>
            </motion.div>

            {/* Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8"
            >
              {/* Chart Filters */}
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(CHART_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedChart(key)}
                    className={`px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105
                              ${selectedChart === key 
                                ? `bg-gradient-to-r ${config.color} text-white shadow-lg` 
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                  >
                    <span className="mr-2">{config.icon}</span>
                    {config.name}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-white/10 rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-full transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-full transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 pb-16">
          {!isLoading ? (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                  {filteredTracks.map((track, index) => (
                    <TrackCard key={`${track.artist}-${track.track}`} track={track} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {filteredTracks.map((track, index) => (
                    <TrackListItem key={`${track.artist}-${track.track}`} track={track} index={index} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Music className="w-12 h-12 text-purple-500" />
              </motion.div>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { transform: translateX(0%); }
          50% { transform: translateX(-100%); }
        }
        .animate-gradient {
          background-size: 200%;
          animation: gradient 15s ease infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </Layout>
  );
}

// Grid Card Component
function TrackCard({ track, index }: { track: TrendingTrack; index: number }) {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      whileHover={{ y: -8, scale: 1.05 }}
      className="group cursor-pointer"
      onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
    >
      <div className="relative">
        {/* Album Art */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
          <ImageWithFallback
            artist={track.artist}
            track={track.track}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full 
                          flex items-center justify-center"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </motion.div>
            </div>
          </div>
          
          {/* Rank Badge */}
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full backdrop-blur-sm
                        ${index < 3 ? 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80' : 'bg-black/60'}`}>
            <span className="text-white font-bold text-sm">#{index + 1}</span>
          </div>
          
          {/* Chart Count Badge */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500/80 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">{track.chart_count} Charts</span>
          </div>
        </div>
        
        {/* Info */}
        <div className="px-1">
          <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{track.track}</h3>
          <p className="text-gray-400 text-xs line-clamp-1 mb-2">{track.artist}</p>
          
          {/* Best Rank */}
          <div className="flex items-center gap-2">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-gray-300">Best #{track.best_rank}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// List Item Component
function TrackListItem({ track, index }: { track: TrendingTrack; index: number }) {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.01 }}
      className="glass-card p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
      onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`text-center min-w-[50px] ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
          <div className="text-2xl font-bold">{index + 1}</div>
        </div>
        
        {/* Album Art */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <ImageWithFallback
            artist={track.artist}
            track={track.track}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                        flex items-center justify-center transition-opacity">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{track.track}</h3>
          <p className="text-gray-400 text-sm truncate">{track.artist}</p>
        </div>
        
        {/* Charts */}
        <div className="hidden md:flex gap-2 flex-shrink-0">
          {Object.entries(track.charts)
            .filter(([chart]) => chart !== 'youtube')
            .slice(0, 3)
            .map(([chart, rank]) => (
              <div key={chart} className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {CHART_CONFIG[chart as keyof typeof CHART_CONFIG]?.icon}
                </div>
                <div className="text-sm font-bold text-white">#{rank}</div>
              </div>
            ))}
        </div>
        
        {/* Best Rank */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Award className="w-5 h-5 text-yellow-500" />
          <span className="text-white font-bold">#{track.best_rank}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Trophy Icon Component
function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
