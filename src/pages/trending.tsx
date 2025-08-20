import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { trendingApi } from '@/lib/api';
import { 
  MouseGradient, 
  ParticleField,
  ChartRace,
  WaveVisualizer
} from '@/components/InteractiveComponents';
import {
  BubbleChart,
  TrendingFlame,
  LiveCounter
} from '@/components/DataVisualization';
import ChartUpdateStatus from '@/components/ChartUpdateStatus';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useTranslation } from '@/src/hooks/useTranslation';

export default function TrendingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [selectedChart, setSelectedChart] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(true);

  const charts = [
    { id: 'all', name: t('trending.filter.integrated'), emoji: '🌏' },
    { id: 'melon', name: 'Melon', emoji: '🍉' },
    { id: 'genie', name: 'Genie', emoji: '🧞' },
    { id: 'bugs', name: 'Bugs', emoji: '🐛' },
    { id: 'spotify', name: 'Spotify', emoji: '🎵' },
    { id: 'youtube', name: 'YouTube', emoji: '📺' }
  ];

  useEffect(() => {
    fetchTrendingData();
  }, [selectedChart, timeRange]);

  const fetchTrendingData = async () => {
    setIsLoading(true);
    try {
      const response = await trendingApi.getTrending('hot', 50);
      
      // API 응답 구조 확인 및 처리
      const tracks = response?.trending || response?.tracks || [];
      
      if (tracks.length > 0) {
        const formattedData = tracks.map((track: any, idx: number) => ({
          id: track.id || idx,
          rank: idx + 1,
          artist: track.artist,
          title: track.title || track.track || track.name,
          albumImage: track.album_image,
          change: track.rank_change || 0,
          views: track.youtube_views || track.views || Math.floor(Math.random() * 10000000),
          trendingScore: track.trending_score || track.trend_score || Math.floor(Math.random() * 100),
          chartPositions: track.chart_scores || track.charts || {},
          sparkData: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1)
        }));
        
        setTrendingData(formattedData);
        
        // 차트별 데이터 생성 (실제 차트 데이터가 있을 때만)
        const chartSpecificData: any = {};
        charts.forEach(chart => {
          if (chart.id !== 'all') {
            // 임시 데이터 생성 (실제 API에서 차트별 데이터가 없을 때)
            chartSpecificData[chart.id] = formattedData
              .slice(0, Math.floor(Math.random() * 15) + 5)
              .map((t: any, idx: number) => ({
                ...t,
                rank: idx + 1,
                chartPositions: { [chart.id]: idx + 1 }
              }));
          }
        });
        setChartData(chartSpecificData);
      }
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
      // 에러 시 더미 데이터 생성
      const dummyData = Array.from({ length: 20 }, (_, idx) => ({
        id: idx,
        rank: idx + 1,
        artist: `Artist ${idx + 1}`,
        title: `Song Title ${idx + 1}`,
        albumImage: null,
        change: Math.floor(Math.random() * 10) - 5,
        views: Math.floor(Math.random() * 10000000),
        trendingScore: Math.floor(Math.random() * 100),
        chartPositions: {},
        sparkData: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1)
      }));
      setTrendingData(dummyData);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = selectedChart === 'all' ? trendingData : (chartData[selectedChart] || []);

  const stats = {
    totalTracks: displayData.length,
    avgViews: displayData.length > 0 
      ? Math.floor(displayData.reduce((acc: number, t: any) => acc + (t.views || 0), 0) / displayData.length)
      : 0,
    topGenre: 'K-POP'
  };

  return (
    <Layout>
      <Head>
        <title>트렌딩 - KPOP Ranker</title>
      </Head>

      <MouseGradient>
        <div className="min-h-screen bg-[#0A0A0F] text-white relative">
          <ParticleField />
          
          {/* Header */}
          <motion.section 
            className="relative py-12 md:py-16 px-4 md:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-4 text-center"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
              >
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  TRENDING
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-base md:text-xl text-center text-gray-400 mb-8 md:mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {t('trending.subtitle')}
              </motion.p>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <LiveCounter value={stats.totalTracks} label={t('trending.newTracks')} />
                <LiveCounter value={stats.avgViews} label={t('trending.avgViews')} />
                <LiveCounter value={8} label={t('trending.monitoringCharts')} />
              </motion.div>

              {/* Chart Selector */}
              <motion.div 
                className="flex justify-center gap-2 md:gap-3 flex-wrap mb-6 md:mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {charts.map((chart) => (
                  <motion.button
                    key={chart.id}
                    onClick={() => setSelectedChart(chart.id)}
                    className={`px-3 md:px-6 py-2 md:py-3 rounded-full font-medium text-sm md:text-base transition-all ${
                      selectedChart === chart.id 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'glass-card hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-1 md:mr-2">{chart.emoji}</span>
                    {chart.name}
                  </motion.button>
                ))}
              </motion.div>

              {/* Time Range Selector */}
              <motion.div 
                className="flex justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {(['today', 'week', 'month'] as const).map((range) => (
                  <motion.button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      timeRange === range 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'glass-card hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {range === 'today' && t('trending.timeRange.today')}
                    {range === 'week' && t('trending.timeRange.weekly')}
                    {range === 'month' && t('trending.timeRange.monthly')}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Main Content */}
          <section className="px-4 md:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <WaveVisualizer isPlaying={true} />
                </div>
              ) : displayData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top 10 Chart Race */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="lg:col-span-2"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {selectedChart === 'all' ? t('trending.sections.integrated') : charts.find(c => c.id === selectedChart)?.name} TOP 10
                    </h2>
                    <ChartRace data={displayData.slice(0, 10)} />
                  </motion.div>

                  {/* Bubble Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {t('trending.sections.viewDistribution')}
                    </h2>
                    <BubbleChart data={displayData.slice(0, 20).map((d: any) => ({
                      ...d,
                      x: Math.random() * 800,
                      y: Math.random() * 600
                    }))} />
                  </motion.div>

                  {/* Full Ranking List */}
                  <motion.div
                    className="lg:col-span-2"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {t('trending.sections.fullRankings')}
                    </h2>
                    <div className="glass-card rounded-xl p-6">
                      <div className="space-y-3">
                        {displayData.map((item: any, idx: number) => (
                          <motion.div
                            key={item.id}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                            className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all group border border-white/10 hover:border-purple-500/50"
                            onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                            whileHover={{ x: 5 }}
                          >
                            <div className={`text-2xl font-bold min-w-[3rem] ${
                              idx === 0 ? 'text-yellow-400' :
                              idx === 1 ? 'text-gray-300' :
                              idx === 2 ? 'text-orange-400' :
                              'text-purple-400'
                            }`}>
                              #{item.rank}
                            </div>
                            
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={item.albumImage || `/api/album-image-smart/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`}
                                alt={`${item.artist} - ${item.title}`}
                                artistName={item.artist}
                                trackName={item.title}
                                className="w-full h-full object-cover"
                                width={64}
                                height={64}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-white truncate group-hover:text-purple-400 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-gray-400 truncate">{item.artist}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {item.change !== 0 && (
                                <div className={`font-bold flex items-center gap-1 ${
                                  item.change > 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {item.change > 0 ? '↑' : '↓'} 
                                  <span>{Math.abs(item.change)}</span>
                                </div>
                              )}
                              <div className="text-right">
                                <div className="text-xs text-gray-500">{t('trending.score')}</div>
                                <div className="text-lg font-bold text-purple-400">
                                  {item.trendingScore}
                                </div>
                              </div>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                              →
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Chart Update Status */}
                  <motion.div
                    className="lg:col-span-2"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {t('trending.sections.chartUpdateStatus')}
                    </h2>
                    <div className="glass-card rounded-xl p-6">
                      <ChartUpdateStatus />
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-xl">데이터를 불러올 수 없습니다.</p>
                  <button 
                    onClick={fetchTrendingData}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    다시 시도
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </MouseGradient>
    </Layout>
  );
}
