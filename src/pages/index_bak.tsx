import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { trendingApi } from '@/lib/api';
import { useTranslation } from '@/contexts/TranslationContext';
import { 
  MouseGradient, 
  ParticleField, 
  ChartRace, 
  Album3D,
  WaveVisualizer 
} from '@/components/InteractiveComponents';
import {
  BubbleChart,
  TrendingFlame,
  LiveCounter,
  SparkLine
} from '@/components/DataVisualization';
import ChartUpdateStatus from '@/components/ChartUpdateStatus';
import UnifiedSearch from '@/components/UnifiedSearch';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [bubbleData, setBubbleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hot' | 'rising' | 'global'>('hot');

  useEffect(() => {
    fetchTrendingData();
  }, [activeTab]);

  const fetchTrendingData = async () => {
    setIsLoading(true);
    try {
      const response = await trendingApi.getTrending('hot', 20);
      console.log('Trending API Response:', response); // 디버깅용
      
      // API 응답 구조 수정: trendingApi가 이미 tracks로 변환함
      if (response?.tracks && Array.isArray(response.tracks)) {
        const formattedData = response.tracks.map((track: any, idx: number) => ({
          id: track.id || idx,
          rank: track.rank || idx + 1,
          artist: track.artist,
          title: track.title || track.name,
          albumImage: track.album_image,
          charts: track.charts || {},
          chartCount: track.chart_count || Object.keys(track.charts || {}).length,
          bestRank: track.best_rank || 1,
          change: track.rank_change || 0,
          views: track.youtube_views || 0,
          trendingScore: track.trending_score || track.score || 50,
          sparkData: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 1),
          hasRealImage: track.has_real_image || false
        }));
        
        console.log('Formatted Data:', formattedData); // 디버깅용
        
        setTrendingData(formattedData.slice(0, 10));
        setBubbleData(formattedData.map((d: any) => ({
          ...d,
          x: Math.random() * 800,
          y: Math.random() * 600
        })));
      }
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트</title>
      </Head>

      <MouseGradient>
        <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
          <ParticleField />
          
          {/* Hero Section with Glitch Effect */}
          <motion.section 
            className="relative py-12 md:py-20 px-4 md:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="max-w-7xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 glitch"
                data-text="KPOP RANKER"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <span className="neon-text">KPOP RANKER</span>
              </motion.h1>
              
              <motion.p 
                className="text-base md:text-xl opacity-80 mb-8 md:mb-12 px-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t('main.title')}
              </motion.p>

              {/* Search Bar with Glassmorphism */}
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="glass-card p-2 rounded-2xl">
                  <UnifiedSearch />
                </div>
              </motion.div>

              {/* Live Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <LiveCounter value={822} label={t('main.stats.albums')} />
                <LiveCounter value={135} label={t('main.stats.artists')} />
                <LiveCounter value={8} label={t('main.stats.charts')} />
              </motion.div>
            </div>
          </motion.section>

          {/* Tab Navigation */}
          <section className="px-4 md:px-8 mb-6 md:mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
                {(['hot', 'rising', 'global'] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 md:px-8 py-2 md:py-3 rounded-full font-medium md:font-bold transition-all text-sm md:text-base ${
                      activeTab === tab 
                        ? 'retro-border neon-glow' 
                        : 'glass-card hover:scale-105'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab === 'hot' && '🔥 인기'}
                    {tab === 'rising' && '📈 급상승'}
                    {tab === 'global' && '🌍 글로벌'}
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* Charts Grid */}
          <section className="px-4 md:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Chart */}
                <motion.div 
                  className="glass-card p-6 rounded-2xl"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <TrendingFlame />
                    실시간 차트
                  </h2>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-4">
                          <div className="w-12 h-12 bg-gray-700 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : trendingData.length > 0 ? (
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {trendingData.slice(0, 5).map((item, index) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition cursor-pointer"
                            onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                          >
                            <div className="text-2xl font-bold w-12 text-center">
                              {item.rank}
                            </div>
                            {/* 앨범 이미지 추가 */}
                            <div className="w-12 h-12 rounded overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex-shrink-0">
                              {item.albumImage && (
                                <img 
                                  src={item.albumImage} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{item.title}</div>
                              <div className="text-sm opacity-70">{item.artist}</div>
                              {/* 차트별 순위 표시 */}
                              {Object.keys(item.charts).length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {Object.entries(item.charts).slice(0, 3).map(([chart, rank]) => (
                                    <span key={chart} className="text-xs px-2 py-0.5 bg-white/10 rounded">
                                      {chart.toUpperCase()} #{rank}
                                    </span>
                                  ))}
                                  {Object.keys(item.charts).length > 3 && (
                                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded">
                                      +{Object.keys(item.charts).length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <SparkLine data={item.sparkData} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-8 opacity-50">
                      데이터를 불러오는 중입니다...
                    </div>
                  )}
                </motion.div>

                {/* Bubble Chart */}
                <motion.div 
                  className="glass-card p-6 rounded-2xl"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <h2 className="text-2xl font-bold mb-6">버블 차트</h2>
                  <div className="h-[400px] relative">
                    <BubbleChart data={bubbleData} />
                  </div>
                </motion.div>

                {/* Trending Artists */}
                <motion.div 
                  className="glass-card p-6 rounded-2xl"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <h2 className="text-2xl font-bold mb-6">트렌딩</h2>
                  {trendingData.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {trendingData.slice(0, 4).map((item, index) => (
                        <motion.div
                          key={item.id}
                          className="relative group cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => router.push(`/artist/${encodeURIComponent(item.artist)}`)}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                            {item.albumImage && (
                              <img 
                                src={item.albumImage} 
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          <div className="mt-2">
                            <div className="font-semibold text-sm truncate">{item.artist}</div>
                            <div className="text-xs opacity-70 truncate">{item.title}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 opacity-50">
                      데이터를 불러오는 중입니다...
                    </div>
                  )}
                </motion.div>

                {/* Chart Update Status */}
                <motion.div 
                  className="glass-card p-6 rounded-2xl"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <ChartUpdateStatus />
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </MouseGradient>
    </Layout>
  );
}