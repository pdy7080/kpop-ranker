import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import SmartSearchBox from '@/components/SmartSearchBox';
import AlbumImage from '@/components/AlbumImage';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaMusic } from 'react-icons/fa';

export default function SearchPage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedArtist, setSearchedArtist] = useState('');
  const [searchedTrack, setSearchedTrack] = useState('');
  const [noResults, setNoResults] = useState(false);

  // 🎯 극단적으로 단순한 검색
  const performSearch = async () => {
    // URL에서 검색어 가져오기 (q, artist, track 모두 지원)
    const { q, artist, track } = router.query;
    
    // 검색어 결정 - 단순하게!
    let searchQuery = '';
    if (track) {
      searchQuery = track as string;
    } else if (artist) {
      searchQuery = artist as string;
    } else if (q) {
      searchQuery = q as string;
    }
    
    if (!searchQuery) {
      setNoResults(true);
      return;
    }

    setIsLoading(true);
    setNoResults(false);

    try {
      // 🔥 백엔드가 모든 것을 처리 - 우리는 그냥 보내기만!
      const params = new URLSearchParams();
      if (track) params.append('track', track as string);
      if (artist) params.append('artist', artist as string);
      if (q) params.append('q', q as string);
      
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        // 백엔드가 통합된 artist/track 정보를 줌
        setSearchedArtist(data.artist || '');
        setSearchedTrack(data.track || '');
      } else {
        setSearchResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      toast.error('검색 중 오류가 발생했습니다');
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // URL 변경시 검색 실행
  useEffect(() => {
    performSearch();
  }, [router.query]);

  return (
    <Layout>
      <Head>
        <title>검색 결과 | K-POP Ranker</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">검색 결과</h1>
              <SmartSearchBox />
            </div>
            
            {/* 검색어 표시 - 백엔드가 준 통합된 정보 */}
            {(searchedArtist || searchedTrack) && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <FaMusic className="text-purple-500" />
                {searchedArtist && <span className="font-medium">{searchedArtist}</span>}
                {searchedTrack && (
                  <>
                    {searchedArtist && <span>-</span>}
                    <span className="font-medium">{searchedTrack}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">검색 중...</p>
            </div>
          ) : noResults ? (
            <div className="text-center py-12">
              <p className="text-gray-600">검색 결과가 없습니다.</p>
              <p className="mt-2 text-sm text-gray-500">다른 검색어로 시도해보세요.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {searchResults.map((chartData, index) => (
                <motion.div
                  key={`${chartData.chart}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3">
                      <h3 className="text-white font-semibold text-lg">{chartData.chart}</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {chartData.tracks && chartData.tracks.map((track: any, trackIndex: number) => (
                          <div key={trackIndex} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            {/* 앨범 이미지 - 백엔드가 100% 보장 */}
                            <div className="flex-shrink-0">
                              <AlbumImage
                                src={track.album_image}
                                alt={`${track.artist} - ${track.track}`}
                                size="sm"
                                artist={track.artist}
                                track={track.track}
                              />
                            </div>
                            
                            {/* 트랙 정보 */}
                            <div className="flex-grow">
                              <div className="font-medium text-gray-900">{track.track}</div>
                              <div className="text-sm text-gray-600">{track.artist}</div>
                              {track.views && (
                                <div className="text-xs text-gray-500 mt-1">{track.views}</div>
                              )}
                            </div>
                            
                            {/* 순위 */}
                            {track.rank && (
                              <div className="flex-shrink-0">
                                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                  #{track.rank}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
