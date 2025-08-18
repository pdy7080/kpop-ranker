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
  HeatMap,
  TrendingFlame,
  LiveCounter
} from '@/components/DataVisualization';
import ChartUpdateStatus from '@/components/ChartUpdateStatus';

export default function TrendingPage() {
  const router = useRouter();
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [selectedChart, setSelectedChart] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(true);

  const charts = [
    { id: 'all', name: '통합', emoji: '🌏' },
    { id: 'melon', name: '멜론', emoji: '🍉' },
    { id: 'genie', name: '지니', emoji: '🧞' },
    { id: 'bugs', name: '벅스', emoji: '🐛' },
    { id: 'spotify', name: '스포티파이', emoji: '🎵' },
    { id: 'youtube', name: '유튜브', emoji: '📺' }
  ];

  useEffect(() => {
    fetchTrendingData();
  }, [selectedChart, timeRange]);

  const fetchTrendingData = async () => {
    setIsLoading(true);
    try {
      const response = await trendingApi.getTrending('hot', 50);
      
      if (response?.tracks) {
        const formattedData = response.tracks.map((track: any, idx: number) => ({
          id: track.id || idx,
          rank: idx + 1,
          artist: track.artist,
          title: track.title || track.name,
          albumImage: track.album_image,
          change: track.rank_change || 0,
          views: track.youtube_views || 0,
          trendingScore: track.trending_score || 0,
          chartPositions: track.chart_scores || {},
          sparkData: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1)
        }));
        
        setTrendingData(formattedData);
        
        // 차트별 데이터 생성
        const chartSpecificData: any = {};
        charts.forEach(chart => {
          if (chart.id !== 'all') {
            chartSpecificData[chart.id] = formattedData
              .filter((t: any) => t.chartPositions[chart.id])
              .sort((a: any, b: any) => (a.chartPositions[chart.id] || 999) - (b.chartPositions[chart.id] || 999));
          }
        });
        setChartData(chartSpecificData);
      }
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = selectedChart === 'all' ? trendingData : (chartData[selectedChart] || []);
  
  // 히트맵용 데이터 생성
  const heatmapData = Array.from({ length: 7 * 24 }, (_, i) => ({
    day: Math.floor(i / 24),
    hour: i % 24,
    rank: Math.floor(Math.random() * 100) + 1
  }));

  const stats = {
    totalTracks: displayData.length,
    avgViews: Math.floor(displayData.reduce((acc: number, t: any) => acc + t.views, 0) / displayData.length || 0),
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
            className="relative py-16 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.h1 
                className="text-6xl font-bold mb-4 text-center glitch"
                data-text="TRENDING"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
              >
                <span className="neon-text">TRENDING</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-center opacity-80 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                실시간 인기 차트 & 트렌드 분석
              </motion.p>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <LiveCounter value={stats.totalTracks} label="차트 진입곡" />
                <LiveCounter value={stats.avgViews} label="평균 조회수" />
                <LiveCounter value={8} label="모니터링 차트" />
              </motion.div>

              {/* Chart Selector */}
              <motion.div 
                className="flex justify-center gap-3 flex-wrap mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {charts.map((chart) => (
                  <motion.button
                    key={chart.id}
                    onClick={() => setSelectedChart(chart.id)}
                    className={`px-6 py-3 rounded-full font-medium transition-all ${
                      selectedChart === chart.id 
                        ? 'retro-border neon-glow scale-110' 
                        : 'glass-card hover:scale-105'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-2">{chart.emoji}</span>
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
                    className={`px-4 py-2 rounded-lg text-sm ${
                      timeRange === range 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'glass-card'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {range === 'today' && '오늘'}
                    {range === 'week' && '주간'}
                    {range === 'month' && '월간'}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Main Content */}
          <section className="px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <WaveVisualizer isPlaying={true} />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top 10 Chart Race */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="lg:col-span-2"
                  >
                    <h2 className="text-2xl font-bold mb-6 neon-text">
                      {selectedChart === 'all' ? '통합' : charts.find(c => c.id === selectedChart)?.name} TOP 10
                    </h2>
                    <ChartRace data={displayData.slice(0, 10)} />
                  </motion.div>

                  {/* Bubble Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 neon-text">조회수 분포</h2>
                    <BubbleChart data={displayData.slice(0, 20).map((d: any) => ({
                      ...d,
                      x: Math.random() * 800,
                      y: Math.random() * 600
                    }))} />
                  </motion.div>

                  {/* Heatmap */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <HeatMap data={heatmapData} />
                  </motion.div>

                  {/* Full Ranking List */}
                  <motion.div
                    className="lg:col-span-2"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 neon-text">전체 순위</h2>
                    <div className="glass-card rounded-xl p-6">
                      <div className="space-y-4">
                        {displayData.map((item: any, idx: number) => (
                          <motion.div
                            key={item.id}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 cursor-pointer transition-all group"
                            onClick={() => router.push(`/track/${item.artist}/${item.title}`)}
                            whileHover={{ x: 10 }}
                          >
                            <div className="text-2xl font-bold min-w-[3rem] neon-text">
                              #{item.rank}
                            </div>
                            
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                              {item.albumImage && (
                                <img src={item.albumImage} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{item.title}</h3>
                              <p className="opacity-70">{item.artist}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {item.change !== 0 && (
                                <div className={`font-bold ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}
                                </div>
                              )}
                              <TrendingFlame intensity={item.trendingScore} />
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <h2 className="text-2xl font-bold mb-6 neon-text">차트 업데이트 현황</h2>
                    <div className="glass-card rounded-xl p-6">
                      <ChartUpdateStatus />
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </section>
        </div>
      </MouseGradient>
    </Layout>
  );
}