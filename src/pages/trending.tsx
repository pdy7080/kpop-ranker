import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import TrendingListV2 from '@/components/TrendingListV2';
import { trendingApi } from '@/lib/api';
import { 
  TrendingUp, Grid3x3, List, Sparkles
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
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' },
  { id: 'flo', name: 'FLO', icon: '🌊', color: 'bg-blue-600' },
  { id: 'vibe', name: 'Vibe', icon: '💜', color: 'bg-purple-600' },
];

export default function TrendingPage() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<TrendingTrack[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchTrendingData();
  }, [limit]);

  useEffect(() => {
    filterTracks();
  }, [selectedChart, trendingTracks]);

  const fetchTrendingData = async () => {
    try {
      setIsLoading(true);
      // 성능 최적화: 이미지 프리로드 파라미터 추가
      const response = await fetch(`${API_URL}/api/trending?limit=${limit}&preload_images=true`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Trending data:', data);
        
        if (data?.trending && Array.isArray(data.trending)) {
          const processedTracks = data.trending.map((track: any) => {
            let imageUrl = track.image_url;
            
            // 최적화: 더 빠른 이미지 API 사용
            if (!imageUrl || !track.has_real_image) {
              imageUrl = `${API_URL}/api/track-image-detail/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`;
            } else if (!imageUrl.startsWith('http')) {
              imageUrl = imageUrl.startsWith('/') ? `${API_URL}${imageUrl}` : imageUrl;
            }
            
            return {
              ...track,
              image_url: imageUrl
            };
          });
          
          // 지연된 이미지 프리로드 (스크롤 성능 개선)
          setTimeout(() => {
            processedTracks.forEach((track, index) => {
              if (index < 20) { // 첫 20개 이미지 프리로드
                const img = new Image();
                img.src = track.image_url;
                // 캐시에 저장하기 위해 로드 후 즉시 해제하지 않음
              }
            });
          }, 100); // 100ms 후 백그라운드에서 프리로드
          
          setTrendingTracks(processedTracks);
          setFilteredTracks(processedTracks);
        }
      }
    } catch (error) {
      console.error('Error fetching trending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTracks = () => {
    if (selectedChart === 'all') {
      setFilteredTracks(trendingTracks);
    } else {
      const filtered = trendingTracks.filter(track => {
        return track.charts && Object.keys(track.charts).some(
          chart => chart.toLowerCase() === selectedChart.toLowerCase()
        );
      });
      setFilteredTracks(filtered);
    }
  };

  return (
    <Layout>
      <Head>
        <title>TRENDING - KPOP Ranker</title>
        <meta name="description" content="실시간 K-POP 트렌딩 차트" />
      </Head>

      {/* Hero Header - Simplified */}
      <section className="relative py-8 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8" />
                TRENDING
              </span>
            </h1>
            <p className="text-sm text-gray-400">실시간 K-POP 트렌드 분석</p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-8 mb-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{filteredTracks.length}</div>
              <div className="text-xs text-gray-400">트랙</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                LIVE
              </div>
              <div className="text-xs text-gray-400">업데이트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">8</div>
              <div className="text-xs text-gray-400">차트</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Controls */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Chart Filters */}
          <div className="flex gap-2 flex-wrap justify-center">
            {chartFilters.map((chart) => (
              <motion.button
                key={chart.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedChart(chart.id)}
                className={`
                  px-3 py-1.5 rounded-lg font-medium text-sm transition-all
                  ${selectedChart === chart.id
                    ? `${chart.color} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600'
                  }
                `}
              >
                <span className="mr-1">{chart.icon}</span>
                {chart.name}
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                px-3 py-1.5 rounded-md transition-all flex items-center gap-2 text-sm
                ${viewMode === 'grid'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <Grid3x3 className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`
                px-3 py-1.5 rounded-md transition-all flex items-center gap-2 text-sm
                ${viewMode === 'list'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </section>

      {/* Trending List */}
      <section className="container mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <TrendingListV2 
            tracks={filteredTracks}
            selectedChart={selectedChart}
            viewMode={viewMode}
          />
        )}

        {/* Load More */}
        {!isLoading && filteredTracks.length >= limit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setLimit(limit + 50)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              더 보기 (+50)
            </button>
          </motion.div>
        )}
      </section>
    </Layout>
  );
}
