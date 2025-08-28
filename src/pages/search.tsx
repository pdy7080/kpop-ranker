import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '@/components/ImageWithFallback';
import UnifiedSearch from '@/components/UnifiedSearch';
import { searchAPI } from '@/lib/api';
import { 
  Search, Music, User, Disc, Filter, Grid, List,
  TrendingUp, Clock, Award, Play, ChevronRight,
  Sparkles, Star
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SearchResult {
  artist: string;
  track: string;
  image_url?: string;
  positions?: string;
  score?: number;
  charts?: Record<string, number>;
}

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'rank' | 'artist'>('relevance');
  const [filterChart, setFilterChart] = useState('all');

  useEffect(() => {
    if (q) {
      performSearch();
    }
  }, [q]);

  const performSearch = async () => {
    if (!q) return;
    
    try {
      setIsLoading(true);
      const response = await searchAPI.search(q as string);
      
      if (response?.results) {
        setResults(response.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedResults = () => {
    let sorted = [...results];
    
    // Filter by chart if needed
    if (filterChart !== 'all') {
      sorted = sorted.filter(r => {
        if (r.positions) {
          return r.positions.includes(filterChart);
        }
        if (r.charts) {
          return r.charts[filterChart] !== undefined;
        }
        return false;
      });
    }
    
    // Sort
    switch (sortBy) {
      case 'rank':
        sorted.sort((a, b) => {
          const rankA = Math.min(...Object.values(a.charts || {}).filter(v => typeof v === 'number') as number[]) || 999;
          const rankB = Math.min(...Object.values(b.charts || {}).filter(v => typeof v === 'number') as number[]) || 999;
          return rankA - rankB;
        });
        break;
      case 'artist':
        sorted.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      default:
        sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    
    return sorted;
  };

  const sortedResults = getSortedResults();

  return (
    <Layout>
      <Head>
        <title>{q ? `"${q}" 검색 결과` : '검색'} - KPOP Ranker</title>
        <meta name="description" content="KPOP Ranker 검색 결과" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900">
        {/* Search Header */}
        <section className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative container mx-auto px-4 py-12">
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <UnifiedSearch defaultValue={q as string} />
            </div>

            {/* Search Info */}
            {q && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <span className="text-gray-400">검색:</span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 
                               bg-clip-text text-transparent">
                    "{q}"
                  </span>
                </h1>
                <p className="text-gray-400">
                  {sortedResults.length}개의 결과를 찾았습니다
                </p>
              </motion.div>
            )}

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-center gap-4"
            >
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">정렬:</span>
                <div className="flex gap-2">
                  {[
                    { value: 'relevance', label: '관련도' },
                    { value: 'rank', label: '순위' },
                    { value: 'artist', label: '아티스트' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode */}
              <div className="flex gap-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Chart Filter Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-2 mt-6"
            >
              {['all', 'melon', 'genie', 'bugs', 'spotify', 'youtube'].map(chart => (
                <button
                  key={chart}
                  onClick={() => setFilterChart(chart)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    filterChart === chart
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {chart === 'all' ? '전체' : chart.toUpperCase()}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="container mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Search className="w-12 h-12 text-purple-500" />
              </motion.div>
            </div>
          ) : sortedResults.length > 0 ? (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                  {sortedResults.map((result, index) => (
                    <SearchResultCard
                      key={`${result.artist}-${result.track}-${index}`}
                      result={result}
                      index={index}
                      onClick={() => router.push(`/track/${encodeURIComponent(result.artist)}/${encodeURIComponent(result.track)}`)}
                    />
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
                  {sortedResults.map((result, index) => (
                    <SearchResultListItem
                      key={`${result.artist}-${result.track}-${index}`}
                      result={result}
                      index={index}
                      onClick={() => router.push(`/track/${encodeURIComponent(result.artist)}/${encodeURIComponent(result.track)}`)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          ) : q && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">검색 결과가 없습니다</h2>
              <p className="text-gray-400 mb-8">다른 검색어로 시도해보세요</p>
              
              {/* Search Suggestions */}
              <div className="max-w-md mx-auto">
                <p className="text-sm text-gray-500 mb-4">추천 검색어:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['BLACKPINK', 'BTS', 'NewJeans', 'Stray Kids', 'SEVENTEEN'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => router.push(`/search?q=${suggestion}`)}
                      className="px-4 py-2 bg-white/10 text-gray-300 rounded-full 
                               hover:bg-white/20 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">무엇을 찾고 계신가요?</h2>
              <p className="text-gray-400">아티스트, 트랙명으로 검색해보세요</p>
            </motion.div>
          )}
        </section>
      </div>

      <style jsx global>{`
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
function SearchResultCard({ 
  result, 
  index, 
  onClick 
}: { 
  result: SearchResult; 
  index: number; 
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      whileHover={{ y: -8, scale: 1.05 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {/* Album Art */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
          <ImageWithFallback
            artist={result.artist}
            track={result.track}
            className="w-full h-full object-cover transition-transform duration-500 
                     group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Score Badge */}
          {result.score && result.score > 80 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r 
                          from-purple-500 to-pink-500 rounded-full">
              <Star className="w-3 h-3 text-white inline mr-1" />
              <span className="text-xs text-white font-bold">{result.score}</span>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="px-1">
          <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{result.track}</h3>
          <p className="text-gray-400 text-xs line-clamp-1">{result.artist}</p>
          
          {/* Chart Positions */}
          {result.positions && (
            <div className="mt-2 text-xs text-gray-500 line-clamp-1">
              {result.positions}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// List Item Component
function SearchResultListItem({ 
  result, 
  index, 
  onClick 
}: { 
  result: SearchResult; 
  index: number; 
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.01 }}
      className="glass-card p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Album Art */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <ImageWithFallback
            artist={result.artist}
            track={result.track}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                        flex items-center justify-center transition-opacity">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{result.track}</h3>
          <p className="text-gray-400 text-sm truncate">{result.artist}</p>
        </div>
        
        {/* Score/Positions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {result.score && (
            <div className="text-center">
              <div className="text-xl font-bold text-white">{result.score}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          )}
          {result.positions && (
            <div className="text-sm text-gray-400">
              {result.positions.split(',').slice(0, 2).join(', ')}
            </div>
          )}
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
