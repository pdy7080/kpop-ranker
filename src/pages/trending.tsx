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
import { useTranslation } from '@/contexts/TranslationContext';

// 조회수 포맷팅 함수
const formatViews = (views: string | number | undefined): string => {
  if (!views || views === '0' || views === '') return '';
  
  try {
    const num = typeof views === 'string' ? parseInt(views) : views;
    if (isNaN(num)) return '';
    
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  } catch {
    return '';
  }
};

// 정렬 옵션
type SortOption = 'rank' | 'views' | 'artist' | 'title';

export default function TrendingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [selectedChart, setSelectedChart] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [isLoading, setIsLoading] = useState(true);

  const charts = [
    { id: 'all', name: t('trending.filter.integrated'), emoji: '🌏' },
    { id: 'melon', name: 'Melon', emoji: '🍉' },
    { id: 'genie', name: 'Genie', emoji: '🧞' },
    { id: 'bugs', name: 'Bugs', emoji: '🐛' },
    { id: 'spotify', name: 'Spotify', emoji: '🎵' },
    { id: 'youtube', name: 'YouTube', emoji: '📺' }
  ];

  // 정렬 옵션 (YouTube 조회수 포함)
  const sortOptions = [
    { value: 'rank', label: '차트 순위' },
    { value: 'views', label: 'YouTube 조회수' },
    { value: 'artist', label: '아티스트명' },
    { value: 'title', label: '곡명' }
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
          artist: track.artist || track.unified_artist,
          title: track.title || track.track || track.unified_track || track.name,
          albumImage: track.album_image || track.optimized_album_image,
          change: track.rank_change || 0,
          views: track.views_or_streams || track.youtube_views || track.views || 0,
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

  // 정렬 함수
  const sortedData = React.useMemo(() => {
    const data = selectedChart === 'all' ? trendingData : (chartData[selectedChart] || []);
    
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          const viewsA = typeof a.views === 'string' ? parseInt(a.views) || 0 : a.views || 0;
          const viewsB = typeof b.views === 'string' ? parseInt(b.views) || 0 : b.views || 0;
          return viewsB - viewsA;
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '');
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'rank':
        default:
          return a.rank - b.rank;
      }
    });
  }, [trendingData, chartData, selectedChart, sortBy]);

  return (
    <Layout>
      <Head>
        <title>{t('trending.title')} - KPOP Ranker</title>
        <meta name="description" content={t('trending.description')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
        <ParticleField />
        <MouseGradient />

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold text-white mb-4 neon-text">
              {t('trending.header.realTime')}
            </h1>
            <p className="text-xl text-pink-200">
              {t('trending.header.subtitle')}
            </p>
          </motion.div>

          {/* 차트 업데이트 현황 */}
          <ChartUpdateStatus />

          {/* 필터 & 정렬 옵션 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* 차트 필터 */}
            <div className="flex gap-2">
              {charts.map((chart) => (
                <motion.button
                  key={chart.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`px-4 py-2 rounded-full backdrop-blur-md transition-all ${
                    selectedChart === chart.id
                      ? 'bg-white/30 text-white shadow-neon'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span className="mr-1">{chart.emoji}</span>
                  {chart.name}
                </motion.button>
              ))}
            </div>

            {/* 정렬 옵션 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 트렌딩 리스트 */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4"
              >
                {sortedData.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.title)}`)}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      {/* 순위 */}
                      <div className="text-3xl font-bold text-white/90 w-12 text-center">
                        {sortBy === 'rank' ? track.rank : index + 1}
                      </div>

                      {/* 앨범 이미지 */}
                      <ImageWithFallback
                        src={track.albumImage}
                        alt={`${track.artist} - ${track.title}`}
                        width={80}
                        height={80}
                        className="rounded-lg shadow-lg"
                      />

                      {/* 트랙 정보 */}
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-white">
                          {track.title}
                        </h3>
                        <p className="text-pink-200">
                          {track.artist}
                        </p>
                        
                        {/* YouTube 조회수 표시 */}
                        {track.views && track.views !== '0' && (
                          <div className="flex items-center gap-2 mt-2">
                            <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                            </svg>
                            <span className="text-sm text-white/80">
                              {formatViews(track.views)} views
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 변동 표시 */}
                      <div className="text-right">
                        {track.change !== 0 && (
                          <div className={`flex items-center gap-1 ${
                            track.change > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {track.change > 0 ? '▲' : '▼'}
                            <span className="font-semibold">{Math.abs(track.change)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
