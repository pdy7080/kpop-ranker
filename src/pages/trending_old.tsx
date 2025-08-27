import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api_v12';
import TrendingCard from '@/components/TrendingCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaChartLine, FaGlobeAsia, FaFilter } from 'react-icons/fa';

interface TrendingItem {
  artist: string;
  track: string;
  album_image?: string;
  image_url?: string;
  score: number;
  charts: any;
  best_rank: number;
  chart_count: number;
}

export default function TrendingPage() {
  const router = useRouter();
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [filteredData, setFilteredData] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'domestic' | 'global'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'rank' | 'charts'>('score');

  useEffect(() => {
    fetchTrendingData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trendingData, filter, sortBy]);

  const fetchTrendingData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getTrending(100);
      if (response?.trending) {
        setTrendingData(response.trending);
      }
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trendingData];

    // Apply chart filter
    if (filter === 'domestic') {
      filtered = filtered.filter(item => 
        item.charts && (item.charts.MELON || item.charts.GENIE || item.charts.BUGS || item.charts.VIBE || item.charts.FLO)
      );
    } else if (filter === 'global') {
      filtered = filtered.filter(item => 
        item.charts && (item.charts.SPOTIFY || item.charts.YOUTUBE || item.charts.BILLBOARD)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return (a.best_rank || 999) - (b.best_rank || 999);
        case 'charts':
          return (b.chart_count || 0) - (a.chart_count || 0);
        case 'score':
        default:
          return (b.score || 0) - (a.score || 0);
      }
    });

    setFilteredData(filtered);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">Trending Charts</h1>
            <p className="text-gray-300">실시간 K-POP 인기 차트</p>
          </motion.div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4">
            {/* Chart Filter */}
            <div className="bg-black/20 backdrop-blur-md rounded-lg p-1 flex space-x-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaFire className="inline mr-2" />
                전체
              </button>
              <button
                onClick={() => setFilter('domestic')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'domestic' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                국내
              </button>
              <button
                onClick={() => setFilter('global')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'global' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaGlobeAsia className="inline mr-2" />
                글로벌
              </button>
            </div>

            {/* Sort Options */}
            <div className="bg-black/20 backdrop-blur-md rounded-lg p-1 flex space-x-1">
              <button
                onClick={() => setSortBy('score')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  sortBy === 'score' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaFilter className="inline mr-2" />
                스코어순
              </button>
              <button
                onClick={() => setSortBy('rank')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  sortBy === 'rank' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                순위순
              </button>
              <button
                onClick={() => setSortBy('charts')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  sortBy === 'charts' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                차트수순
              </button>
            </div>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <div className="mb-4 text-gray-300">
              총 {filteredData.length}개의 트랙
            </div>
          )}

          {/* Trending Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-64 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`${filter}-${sortBy}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredData.map((item, idx) => (
                  <motion.div
                    key={`${item.artist}-${item.track}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <TrendingCard
                      rank={idx + 1}
                      artist={item.artist}
                      track={item.track}
                      albumImage={item.image_url || item.album_image}
                      charts={item.charts}
                      score={item.score}
                      onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results */}
          {!isLoading && filteredData.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
