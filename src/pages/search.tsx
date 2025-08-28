import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '@/components/ImageWithFallback';
import UnifiedSearch from '@/components/UnifiedSearch';
import { searchAPI } from '@/lib/api';
import { 
  Search, Music, Grid, List, Play, ChevronRight,
  Sparkles, Star
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SearchResult {
  artist: string;
  track: string;
  image_url?: string;
  positions?: string;
  score?: number;
  charts?: Record<string, number>;
}

export default function SearchPageFixed() {
  const router = useRouter();
  const { t } = useTranslation();
  const { q } = router.query;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  return (
    <Layout>
      <Head>
        <title>{q ? `"${q}" 검색 결과` : '검색'} - KPOP Ranker</title>
        <meta name="description" content="KPOP Ranker 검색 결과" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        
        {/* Search Header */}
        <section className="pt-20 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
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
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    "{q}"
                  </span>
                </h1>
                <p className="text-gray-300">
                  {results.length}개의 결과를 찾았습니다
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Search className="w-12 h-12 text-purple-400 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              
              /* 안전한 그리드 렌더링 */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {results.map((result, index) => (
                  <motion.div
                    key={`${result.artist}-${result.track}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-slate-800/50 rounded-2xl p-4 hover:bg-slate-700/60 transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/track/${encodeURIComponent(result.artist)}/${encodeURIComponent(result.track)}`)}
                  >
                    
                    {/* 이미지 */}
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                      <ImageWithFallback
                        artist={result.artist}
                        track={result.track}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform rounded-full"
                      />
                      
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* 정보 */}
                    <h3 className="font-bold text-white text-sm mb-1 truncate group-hover:text-purple-300">
                      {result.track}
                    </h3>
                    <p className="text-gray-300 text-xs truncate mb-2">
                      {result.artist}
                    </p>
                    
                    {/* 차트 정보 - 안전하게 렌더링 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.charts && typeof result.charts === 'object' && 
                        Object.entries(result.charts).slice(0, 3).map(([chart, rank]) => (
                          <span
                            key={chart}
                            className="px-2 py-1 bg-slate-700/80 text-white text-xs rounded-md"
                          >
                            {chart.toUpperCase()} #{String(rank)}
                          </span>
                        ))
                      }
                      {result.positions && (
                        <div className="text-xs text-gray-500 truncate">
                          {String(result.positions)}
                        </div>
                      )}
                    </div>
                    
                    {/* 스코어 */}
                    {result.score && (
                      <div className="text-center">
                        <span className="text-sm font-bold text-purple-400">
                          {Math.round(result.score)}점
                        </span>
                      </div>
                    )}
                    
                  </motion.div>
                ))}
              </div>
              
            ) : q ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">검색 결과가 없습니다</h2>
                <p className="text-gray-400">다른 검색어로 시도해보세요</p>
              </div>
            ) : (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">무엇을 찾고 계신가요?</h2>
                <p className="text-gray-300">아티스트, 트랙명으로 검색해보세요</p>
              </div>
            )}
            
          </div>
        </section>
        
      </div>
    </Layout>
  );
}