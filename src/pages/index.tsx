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
      const response = await trendingApi.getTrending(activeTab, 20);
      
      if (response?.tracks) {
        const formattedData = response.tracks.map((track: any, idx: number) => ({
          id: track.id || idx,
          rank: idx + 1,
          artist: track.artist,
          title: track.title || track.name,
          albumImage: track.album_image,
          change: track.rank_change || (track.prev_rank ? track.prev_rank - (idx + 1) : 0),
          views: track.youtube_views || Math.floor(Math.random() * 100000000),
          trendingScore: track.trending_score || Math.floor(Math.random() * 100),
          sparkData: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 1)
        }));
        
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
                    {tab === 'hot' && t('tab.hot')}
                    {tab === 'rising' && t('tab.rising')}
                    {tab === 'global' && t('tab.global')}
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <section className="px-4 md:px-8 pb-12 md:pb-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              
              {/* Chart Race */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 neon-text">{t('section.realtime')}</h2>
                {isLoading ? (
                  <div className="glass-card rounded-xl p-8 flex items-center justify-center h-96">
                    <WaveVisualizer isPlaying={true} />
                  </div>
                ) : (
                  <ChartRace data={trendingData} />
                )}
              </motion.div>

              {/* Bubble Visualization */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 neon-text">{t('section.bubble')}</h2>
                {!isLoading && bubbleData.length > 0 && (
                  <BubbleChart data={bubbleData} />
                )}
              </motion.div>

              {/* Trending Albums Grid */}
              <motion.div
                className="lg:col-span-2"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 neon-text">{t('section.trending')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
                  {trendingData.slice(0, 8).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1 * idx, type: "spring" }}
                      className="relative group cursor-pointer"
                      onClick={() => router.push(`/track/${item.artist}/${item.title}`)}
                    >
                      <div className="relative">
                        <Album3D 
                          src={item.albumImage || `${process.env.NEXT_PUBLIC_API_URL}/api/album-image-smart/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`} 
                          artist={item.artist}
                          title={item.title}
                        />
                        <div className="absolute top-2 right-2">
                          <TrendingFlame intensity={item.trendingScore} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <SparkLine data={item.sparkData} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Chart Update Status */}
              <motion.div
                className="lg:col-span-2"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 neon-text">{t('section.update')}</h2>
                <div className="glass-card rounded-xl p-6">
                  <ChartUpdateStatus />
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </MouseGradient>
    </Layout>
  );
}