import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import TrendingListV2 from '@/components/TrendingListV2';
import ChartIndividual from '@/components/ChartIndividual';
import { trendingApi, chartIndividualAPI } from '@/lib/api';
import { 
  TrendingUp, Grid3x3, List, Sparkles, Clock
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
  positions?: string;
}

interface ChartFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const chartFilters: ChartFilter[] = [
  { id: 'all', name: '통합', icon: '🌍', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'melon', name: 'Melon', icon: '🍈', color: 'bg-green-500' },
  { id: 'genie', name: 'Genie', icon: '🧞', color: 'bg-blue-500' },
  { id: 'bugs', name: 'Bugs', icon: '🐛', color: 'bg-red-500' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', color: 'bg-green-600' },
  // YouTube는 별도 구조로 일시 제외
  // { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' },
  { id: 'flo', name: 'FLO', icon: '🌊', color: 'bg-blue-600' },
  { id: 'apple_music', name: 'Apple Music', icon: '🍎', color: 'bg-gray-800' },
  { id: 'lastfm', name: 'Last.fm', icon: '🎵', color: 'bg-red-800' },
];

export default function TrendingPage() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<TrendingTrack[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  // 차트별 개별 데이터 상태
  const [chartData, setChartData] = useState<any>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchTrendingData();
  }, [limit]);

  const fetchTrendingData = async () => {
    try {
      setIsLoading(true);
      const data = await trendingApi.getTrending('hot', limit);
      
      if (data && data.trending) {
        setTrendingTracks(data.trending);
        setFilteredTracks(data.trending);
      }
    } catch (error) {
      console.error('트렌딩 데이터 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 차트별 개별 데이터 로딩 (최적화)
  const fetchChartData = async (chartName: string) => {
    if (chartName === 'all') return;
    
    try {
      setIsLoadingChart(true);
      // 타임아웃 30초로 증가 + 재시도 로직
      const data = await chartIndividualAPI.getChartLatest(chartName);
      
      if (data.success) {
        setChartData(data);
      } else {
        console.error(`${chartName} 차트 데이터 오류:`, data.error);
        setChartData({
          error: true,
          message: `${chartName} 차트 데이터를 불러올 수 없습니다.`
        });
      }
    } catch (error) {
      console.error(`${chartName} 차트 데이터 로딩 실패:`, error);
      
      // 간단한 재시도 (1번)
      if (error.code === 'ECONNABORTED') {
        console.log(`${chartName} 재시도 중...`);
        try {
          const retryData = await chartIndividualAPI.getChartLatest(chartName);
          if (retryData.success) {
            setChartData(retryData);
            return;
          }
        } catch (retryError) {
          console.error('재시도 실패:', retryError);
        }
      }
      
      setChartData({
        error: true,
        message: `${chartName} 차트를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.`
      });
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleTrackClick = (artist: string, track: string) => {
    // 트랙 상세페이지로 이동
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    router.push(`/track/${encodedArtist}/${encodedTrack}`);
  };

  const handleChartFilter = (chartId: string) => {
    setSelectedChart(chartId);
    
    if (chartId === 'all') {
      // 통합 차트 표시
      setFilteredTracks(trendingTracks);
      setChartData(null);
    } else {
      // 개별 차트 데이터 로딩
      fetchChartData(chartId);
    }
  };

  const loadMore = () => {
    setLimit(prev => prev + 20);
  };

  return (
    <Layout>
      <Head>
        <title>트렌딩 - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 트렌드 분석" />
        <meta property="og:title" content="KPOP Ranker - 실시간 트렌딩" />
        <meta property="og:description" content="8개 글로벌 차트의 실시간 K-POP 트렌드를 한눈에" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="container mx-auto px-4 py-8">
          {/* 페이지 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-pink-400" />
              <h1 className="text-4xl font-bold text-white">TRENDING</h1>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-gray-300 text-lg">실시간 K-POP 트렌드 분석</p>
            
            {/* LIVE 표시 */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">LIVE</span>
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">업데이트</span>
            </div>
          </motion.div>

          {/* 차트 필터 탭 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {chartFilters.map((filter, index) => (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleChartFilter(filter.id)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                    ${selectedChart === filter.id
                      ? `${filter.color} text-white scale-105 shadow-lg`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  <span className="mr-2">{filter.icon}</span>
                  {filter.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 뷰 모드 전환 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end mb-6"
          >
            <div className="flex bg-white/10 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* 컨텐츠 영역 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {selectedChart === 'all' ? (
              // 통합 차트 표시
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center min-h-96">
                    <div className="text-white text-xl">로딩 중...</div>
                  </div>
                ) : (
                  <TrendingListV2
                    tracks={filteredTracks}
                    viewMode={viewMode}
                    showLoadMore={trendingTracks.length >= limit}
                    onLoadMore={loadMore}
                    isLoading={false}
                  />
                )}
              </>
            ) : (
              // 개별 차트 표시
              <>
                {isLoadingChart ? (
                  <div className="flex justify-center items-center min-h-96">
                    <div className="text-white text-xl">차트 데이터 로딩 중...</div>
                  </div>
                ) : chartData ? (
                // 성공적으로 로드된 차트 데이터
                !chartData.error ? (
                <ChartIndividual
                  chartName={chartData.chart_name}
                  displayName={chartData.chart_display_name}
                  tracks={chartData.tracks}
                  lastUpdate={chartData.last_update}
                  isYoutube={chartData.is_youtube}
                  onTrackClick={handleTrackClick}  // 트랙 클릭 핸들러 추가
                />
              ) : (
                // 에러 내용 표시
                <div className="text-center py-12">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-red-400 mb-2">⚠️ 차트 로딩 오류</p>
                    <p className="text-white text-sm">{chartData.message}</p>
                    <button 
                      onClick={() => fetchChartData(selectedChart)}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              )
                ) : (
                  <div className="text-center text-white">
                    <p>차트 데이터를 불러올 수 없습니다.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
