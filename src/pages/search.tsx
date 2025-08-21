import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '@/lib/api';
import { 
  MouseGradient, 
  ParticleField,
  Album3D
} from '@/components/InteractiveComponents';
import {
  TrendingFlame,
  SparkLine
} from '@/components/DataVisualization';
import UnifiedSearch from '@/components/UnifiedSearch';
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

export default function SearchPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<any>({ artists: [], tracks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'artists' | 'tracks'>('all');

  useEffect(() => {
    const { q, artist, track } = router.query;
    const query = (track || artist || q || '') as string;
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [router.query]);

  const performSearch = async (query: string) => {
    if (!query) return;
    
    setIsLoading(true);
    try {
      const response = await searchApi.searchUnified(query);
      setSearchResults(response);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = {
    artists: filterType === 'tracks' ? [] : searchResults.artists || [],
    tracks: filterType === 'artists' ? [] : searchResults.tracks || []
  };

  return (
    <Layout>
      <Head>
        <title>검색 - {searchQuery || 'KPOP Ranker'}</title>
      </Head>

      <MouseGradient>
        <div className="min-h-screen bg-[#0A0A0F] text-white relative">
          <ParticleField />
          
          {/* Search Header */}
          <motion.section 
            className="relative py-16 px-8 border-b border-white/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-4xl mx-auto">
              <motion.h1 
                className="text-4xl font-bold mb-8 text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <span className="neon-text">검색</span>
              </motion.h1>
              
              {/* Search Bar */}
              <UnifiedSearch initialQuery={searchQuery} />
              
              {searchQuery && (
                <motion.p 
                  className="text-center mt-4 text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  "{searchQuery}" 검색 결과
                </motion.p>
              )}
            </div>
          </motion.section>

          {/* Filter Tabs */}
          {searchQuery && (
            <motion.div 
              className="flex justify-center gap-4 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {['all', 'artists', 'tracks'].map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-6 py-2 rounded-full transition-all ${
                    filterType === type
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {type === 'all' ? '전체' : type === 'artists' ? '아티스트' : '트랙'}
                  {type === 'artists' && ` (${searchResults.artists?.length || 0})`}
                  {type === 'tracks' && ` (${searchResults.tracks?.length || 0})`}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-20"
              >
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
              </motion.div>
            ) : (
              <motion.div 
                className="max-w-7xl mx-auto px-8 pb-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Artists Results */}
                {filteredResults.artists.length > 0 && (
                  <motion.section 
                    className="mb-12"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-pink-400">
                      아티스트 ({filteredResults.artists.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredResults.artists.map((artist: any, index: number) => (
                        <motion.div
                          key={artist.artist || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => router.push(`/artist/${encodeURIComponent(artist.artist)}`)}
                          className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
                        >
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {artist.artist}
                          </h3>
                          <p className="text-gray-400">
                            {artist.track_count} 곡
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Tracks Results */}
                {filteredResults.tracks.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-purple-400">
                      트랙 ({filteredResults.tracks.length})
                    </h2>
                    <div className="space-y-4">
                      {filteredResults.tracks.map((track: any, index: number) => (
                        <motion.div
                          key={`${track.artist}-${track.track}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                          className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20 flex items-center gap-4"
                        >
                          {/* 앨범 이미지 */}
                          <ImageWithFallback
                            src={track.album_image || track.optimized_album_image}
                            alt={`${track.artist} - ${track.track}`}
                            width={64}
                            height={64}
                            className="rounded-lg"
                          />
                          
                          {/* 트랙 정보 */}
                          <div className="flex-grow">
                            <h3 className="text-lg font-semibold text-white">
                              {track.track}
                            </h3>
                            <p className="text-gray-400">
                              {track.artist}
                            </p>
                            
                            {/* YouTube 조회수 표시 */}
                            {track.views_or_streams && track.views_or_streams !== '0' && (
                              <div className="flex items-center gap-2 mt-1">
                                <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                                </svg>
                                <span className="text-sm text-white/70">
                                  {formatViews(track.views_or_streams)} views
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* 차트 정보 */}
                          {track.chart_name && (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-xs text-white/80 border border-white/20">
                                {track.chart_name}
                              </span>
                              {track.rank_position && (
                                <span className="text-2xl font-bold text-white/50">
                                  #{track.rank_position}
                                </span>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* No Results */}
                {searchQuery && !isLoading && 
                 filteredResults.artists.length === 0 && 
                 filteredResults.tracks.length === 0 && (
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-2xl text-gray-400">
                      "{searchQuery}"에 대한 검색 결과가 없습니다.
                    </p>
                    <p className="text-gray-500 mt-4">
                      다른 검색어를 시도해보세요.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MouseGradient>
    </Layout>
  );
}
