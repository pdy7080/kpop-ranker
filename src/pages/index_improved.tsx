import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { trendingApi, chartAPI } from '@/lib/api';
import ImageWithFallback from '@/components/ImageWithFallback';
import { 
  TrendingUp, Music, Globe, Award, Activity, 
  ChevronRight, Sparkles, Flame
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  rank: number;
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number>;
  image_url?: string;
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    totalCharts: 8,
    lastUpdate: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 트렌딩 데이터
      const trendingResponse = await trendingApi.getTrending('hot', 5);
      if (trendingResponse?.trending) {
        setTrendingTracks(trendingResponse.trending.slice(0, 5));
      }

      // 차트 상태
      const statusResponse = await chartAPI.getUpdateStatus();
      if (statusResponse?.charts) {
        const totalTracks = statusResponse.charts.reduce((sum: number, chart: any) => 
          sum + (chart.track_count || 0), 0);
        
        setStats({
          totalTracks,
          totalArtists: 135, // 실제 데이터로 교체 필요
          totalCharts: statusResponse.charts.length || 8,
          lastUpdate: new Date().toLocaleTimeString('ko-KR')
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트 통합 플랫폼</title>
        <meta name="description" content="전 세계 K-POP 차트를 한눈에. 실시간 순위, 트렌드 분석, 아티스트 정보를 제공합니다." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E] text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
          
          {/* Animated Background */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight 
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.h1 
                className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%'] 
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                KPOP RANKER
              </motion.h1>
              <p className="text-xl text-gray-300">전 세계 K-POP 차트를 한눈에</p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="아티스트, 트랙 검색..."
                  className="w-full px-6 py-4 pr-12 rounded-full bg-gray-800/50 backdrop-blur-md border border-gray-700 focus:border-purple-500 focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:scale-110 transition-transform"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.form>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto"
            >
              <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 text-center border border-gray-700">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-purple-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stats.totalTracks.toLocaleString()}
                </motion.div>
                <p className="text-sm text-gray-400">트랙</p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 text-center border border-gray-700">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-pink-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {stats.totalArtists}
                </motion.div>
                <p className="text-sm text-gray-400">아티스트</p>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 text-center border border-gray-700">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-blue-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  {stats.totalCharts}
                </motion.div>
                <p className="text-sm text-gray-400">차트</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                실시간 트렌딩
              </h2>
              <button
                onClick={() => router.push('/trending')}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                전체보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-800/30 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTracks.map((track, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                    className="bg-gray-800/30 backdrop-blur rounded-xl p-4 hover:bg-gray-800/50 transition-all cursor-pointer border border-gray-700 hover:border-purple-500"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <span className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {track.rank}
                        </span>
                        <ImageWithFallback
                          src={track.image_url || `/api/album-image-smart/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`}
                          alt={`${track.artist} - ${track.track}`}
                          width={64}
                          height={64}
                          className="rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.track}</h3>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                            Score: {track.score}
                          </span>
                          {Object.keys(track.charts).length > 0 && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                              {Object.keys(track.charts).length} 차트
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* Quick Links */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/trending')}
              className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl text-center hover:shadow-xl transition-all"
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">트렌딩</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/search')}
              className="bg-gradient-to-br from-pink-600 to-pink-800 p-6 rounded-xl text-center hover:shadow-xl transition-all"
            >
              <Music className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">검색</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/portfolio')}
              className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-center hover:shadow-xl transition-all"
            >
              <Award className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">포트폴리오</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl text-center hover:shadow-xl transition-all"
            >
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">실시간</p>
              <span className="text-xs text-green-300 mt-1 block">
                {stats.lastUpdate}
              </span>
            </motion.button>
          </div>
        </section>
      </div>
    </Layout>
  );
}