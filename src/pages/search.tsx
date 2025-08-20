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
import { useTranslation } from '@/contexts/TranslationContext';

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
              
              <motion.div
                className="glass-card p-2 rounded-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <UnifiedSearch initialQuery={searchQuery} />
              </motion.div>

              {/* Filter Tabs */}
              {searchQuery && (
                <motion.div 
                  className="flex justify-center gap-4 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {(['all', 'artists', 'tracks'] as const).map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-6 py-2 rounded-full font-medium transition-all ${
                        filterType === type 
                          ? 'retro-border neon-glow' 
                          : 'glass-card hover:scale-105'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {type === 'all' && '전체'}
                      {type === 'artists' && '아티스트'}
                      {type === 'tracks' && '트랙'}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Search Results */}
          <section className="px-8 py-16">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <motion.div 
                  className="flex justify-center items-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="glass-card rounded-full p-8">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {/* Artists Section */}
                  {filteredResults.artists.length > 0 && (
                    <motion.div
                      key="artists"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="mb-12"
                    >
                      <h2 className="text-2xl font-bold mb-6 neon-text">
                        아티스트 ({filteredResults.artists.length})
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {filteredResults.artists.map((artist: any, idx: number) => (
                          <motion.div
                            key={artist.name}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group cursor-pointer"
                            onClick={() => router.push(`/artist/${artist.name}`)}
                            whileHover={{ y: -10 }}
                          >
                            <div className="glass-card rounded-xl p-4 hover:neon-glow transition-all">
                              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 mb-3 flex items-center justify-center">
                                <span className="text-3xl">🎤</span>
                              </div>
                              <h3 className="font-bold text-center truncate">{artist.name}</h3>
                              <p className="text-xs text-center opacity-70">
                                {artist.track_count || 0} 트랙
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Tracks Section */}
                  {filteredResults.tracks.length > 0 && (
                    <motion.div
                      key="tracks"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                    >
                      <h2 className="text-2xl font-bold mb-6 neon-text">
                        트랙 ({filteredResults.tracks.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResults.tracks.map((track: any, idx: number) => (
                          <motion.div
                            key={`${track.artist}-${track.title}`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="glass-card rounded-xl overflow-hidden hover:neon-glow transition-all">
                              <div 
                                className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600 cursor-pointer"
                                onClick={() => router.push(`/track/${track.artist}/${track.title}`)}
                              >
                                <img 
                                  src={track.album_image || `${process.env.NEXT_PUBLIC_API_URL}/api/album-image-smart/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.title)}`}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-sm opacity-90">클릭하여 상세보기</p>
                                  </div>
                                </div>
                                {track.rank && (
                                  <div className="absolute top-2 right-2">
                                    <TrendingFlame intensity={100 - track.rank} />
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 truncate">{track.title}</h3>
                                <p className="text-sm opacity-70 mb-3">{track.artist}</p>
                                {track.chart_positions && (
                                  <div className="flex gap-2 flex-wrap">
                                    {Object.entries(track.chart_positions).slice(0, 3).map(([chart, rank]) => (
                                      <span key={chart} className="text-xs px-2 py-1 rounded-full glass-card">
                                        {chart}: #{rank}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* No Results */}
                  {!isLoading && filteredResults.artists.length === 0 && filteredResults.tracks.length === 0 && searchQuery && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20"
                    >
                      <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">검색 결과가 없습니다</h3>
                        <p className="opacity-70">"{searchQuery}"에 대한 결과를 찾을 수 없습니다</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </section>
        </div>
      </MouseGradient>
    </Layout>
  );
}