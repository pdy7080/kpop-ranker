import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MouseGradient, 
  ParticleField,
} from '@/components/InteractiveComponents';
import UnifiedSearch from '@/components/UnifiedSearch';
import ImageWithFallback from '@/components/ImageWithFallback';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import { useTranslation } from '@/contexts/TranslationContext';
import { Search, Music, Users, Play, Eye, Star } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 조회수 포맷팅 함수
const formatViews = (views: string | number): string => {
  if (!views) return '';
  
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, '')) : views;
  if (isNaN(num)) return '';
  
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
};

// 차트별 색상
const CHART_COLORS: { [key: string]: string } = {
  melon: 'from-green-600 to-green-400',
  genie: 'from-blue-600 to-blue-400',
  bugs: 'from-orange-500 to-orange-300',
  flo: 'from-purple-500 to-purple-300',
  spotify: 'from-green-500 to-green-300',
  apple_music: 'from-gray-800 to-gray-600',
  youtube: 'from-red-500 to-red-300',
  lastfm: 'from-red-600 to-red-400'
};

interface SearchResult {
  artist: string;
  track: string;
  positions?: string;
  score?: number;
  image_url?: string;
}

export default function SearchPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
      const response = await axios.get(`${API_URL}/api/search`, {
        params: { q: query }
      });
      
      console.log('🔍 검색 API 응답:', response.data);
      
      // 검색 결과를 정리
      const results = (response.data.results || []).map((item: any) => ({
        ...item,
        // positions 문자열을 파싱해서 차트 정보 추출
        chartData: parsePositions(item.positions)
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // positions 문자열 파싱 (예: "melon:2,genie:13,bugs:3")
  const parsePositions = (positions?: string): Record<string, number | string> => {
    if (!positions) return {};
    
    const charts: Record<string, number | string> = {};
    const pairs = positions.split(',');
    
    pairs.forEach(pair => {
      const [chart, value] = pair.split(':');
      if (chart && value) {
        // YouTube는 조회수로 처리
        if (chart.toLowerCase() === 'youtube') {
          charts[chart.toLowerCase()] = value;
        } else {
          const rank = parseInt(value);
          if (!isNaN(rank)) {
            charts[chart.toLowerCase()] = rank;
          }
        }
      }
    });
    
    return charts;
  };

  // 결과를 아티스트와 트랙으로 분류
  const artistsMap = new Map<string, any>();
  const tracks: any[] = [];

  searchResults.forEach((item: any) => {
    if (item.track) {
      tracks.push(item);
      
      // 아티스트 정보 추출
      const artistKey = item.artist;
      if (!artistsMap.has(artistKey)) {
        artistsMap.set(artistKey, {
          artist: item.artist,
          track_count: 1,
          total_score: item.score || 0,
          image_url: item.image_url
        });
      } else {
        const artist = artistsMap.get(artistKey);
        artist.track_count++;
        artist.total_score += (item.score || 0);
      }
    }
  });

  const artists = Array.from(artistsMap.values());

  // 필터링
  let filteredTracks = tracks;
  let filteredArtists = artists;

  if (filterType === 'tracks') {
    filteredArtists = [];
  } else if (filterType === 'artists') {
    filteredTracks = [];
  }

  // 차트 정보 렌더링
  const renderChartInfo = (chartData: Record<string, number | string>) => {
    const entries = Object.entries(chartData);
    if (entries.length === 0) return null;

    const rankCharts = entries.filter(([chart, value]) => 
      chart !== 'youtube' && typeof value === 'number'
    );
    const youtubeData = entries.find(([chart]) => chart === 'youtube');

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {/* 순위 차트들 */}
        {rankCharts.slice(0, 4).map(([chart, rank]) => (
          <ChartRankDisplay
            key={chart}
            chartName={chart}
            rank={rank as number}
            displayType="badge"
          />
        ))}
        
        {/* YouTube 조회수 */}
        {youtubeData && youtubeData[1] && (
          <div className="px-3 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
            <Play className="w-3 h-3" />
            {formatViews(youtubeData[1])}
          </div>
        )}
        
        {rankCharts.length > 4 && (
          <span className="text-xs text-gray-400 flex items-center">
            +{rankCharts.length - 4}개 더
          </span>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>검색 - {searchQuery || 'KPOP Ranker'}</title>
        <meta name="description" content={`${searchQuery} 검색 결과 - K-POP 아티스트와 트랙을 찾아보세요`} />
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
              <motion.div
                className="flex items-center justify-center gap-3 mb-8"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Search className="w-8 h-8 text-purple-400" />
                <h1 className="text-4xl font-bold">
                  <span className="neon-text">검색</span>
                </h1>
              </motion.div>
              
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
              {[
                { type: 'all', label: '전체', count: artists.length + tracks.length },
                { type: 'artists', label: '아티스트', count: artists.length },
                { type: 'tracks', label: '트랙', count: tracks.length }
              ].map(({ type, label, count }) => (
                <motion.button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
                    filterType === type
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filterType === type && (
                    <motion.div
                      layoutId="activeSearchFilter"
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    {type === 'artists' && <Users className="w-4 h-4" />}
                    {type === 'tracks' && <Music className="w-4 h-4" />}
                    {label} ({count})
                  </span>
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
                {filteredArtists.length > 0 && (
                  <motion.section 
                    className="mb-12"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Users className="w-6 h-6 text-pink-400" />
                      <h2 className="text-2xl font-bold text-pink-400">
                        아티스트 ({filteredArtists.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredArtists.map((artist: any, index: number) => (
                        <motion.div
                          key={artist.artist || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          onClick={() => router.push(`/artist/${encodeURIComponent(artist.artist)}`)}
                          className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all cursor-pointer border border-white/20 hover:border-pink-500/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-500">
                              <ImageWithFallback
                                artist={artist.artist}
                                track=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-pink-300 transition-colors">
                                {artist.artist}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>{artist.track_count} 곡</span>
                                {artist.total_score > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    <span>{Math.round(artist.total_score)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Tracks Results */}
                {filteredTracks.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Music className="w-6 h-6 text-purple-400" />
                      <h2 className="text-2xl font-bold text-purple-400">
                        트랙 ({filteredTracks.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTracks.map((track: any, index: number) => (
                        <motion.div
                          key={`${track.artist}-${track.track}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                          className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all cursor-pointer border border-white/20 hover:border-purple-500/50"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                                <ImageWithFallback
                                  artist={track.artist}
                                  track={track.track}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors truncate">
                                {track.track}
                              </h3>
                              <p className="text-gray-400 mb-3 truncate">{track.artist}</p>
                              
                              {/* 스코어 */}
                              {track.score && (
                                <div className="flex items-center gap-1 mb-3">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-yellow-400 font-bold">
                                    {Math.round(track.score)}
                                  </span>
                                </div>
                              )}
                              
                              {/* 차트 순위 */}
                              {track.chartData && Object.keys(track.chartData).length > 0 && (
                                <div className="space-y-2">
                                  {renderChartInfo(track.chartData)}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* No Results */}
                {!isLoading && searchQuery && searchResults.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">
                      "{searchQuery}"에 대한 검색 결과가 없습니다.
                    </p>
                    <p className="text-gray-500">
                      다른 키워드로 검색해보세요.
                    </p>
                  </motion.div>
                )}

                {/* Empty State */}
                {!searchQuery && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Search className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      K-POP 음악을 검색해보세요
                    </h3>
                    <p className="text-gray-500">
                      아티스트명이나 곡명을 입력하면 관련 정보를 찾을 수 있습니다.
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
