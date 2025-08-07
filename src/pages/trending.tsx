import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from '@/hooks/useRouter';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { FaFire, FaTrophy, FaMusic, FaChartLine, FaSearch, FaPlay, FaHeart } from 'react-icons/fa';
import AlbumImage from '@/components/AlbumImage';

interface TrendingItem {
  artist: string;
  track: string;
  album_image?: string;
  trend_score: number;
  rank: number;
  chart_count: number;
  best_rank: number;
}

/**
 * 🔥 트렌딩 페이지 - 클라이언트 사이드 렌더링 버전
 */
export default function TrendingPage() {
  const router = useRouter();
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 클라이언트 사이드에서 데이터 가져오기
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/trending?limit=20`);
        
        if (!response.ok) {
          throw new Error(`API 응답 오류: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔥 트렌딩 API 응답:', data);
        
        // 백엔드 API 응답을 프론트엔드 형식으로 변환
        const tracks = data.tracks || data.trending || [];
        const initialData: TrendingItem[] = tracks.map((item: any, index: number) => ({
          artist: item.artist,
          track: item.track,
          album_image: item.album_image || '',
          trend_score: item.trend_score || 0,
          rank: index + 1,
          chart_count: item.chart_count || 0,
          best_rank: item.best_rank || item.best_ranking || 0
        }));

        console.log('✅ 변환된 트렌딩 데이터:', initialData.length, '개');
        setTrendingData(initialData);
      } catch (error) {
        console.error('❌ 트렌딩 데이터 로드 실패:', error);
        setTrendingData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  const handleItemClick = (artist: string, track?: string) => {
    if (track) {
      // ✅ 곡 상세 페이지로 직접 이동
      router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
    } else {
      // ✅ 아티스트만 있는 경우 아티스트 상세 페이지로 이동
      router.push(`/artist/${encodeURIComponent(artist)}`);
    }
  };

  const handleAddToPortfolio = async (artist: string, track: string, e?: React.MouseEvent) => {
    // 이벤트 전파 방지
    e?.stopPropagation();
    alert(`"${artist} - ${track}"을 포트폴리오에 추가합니다! (곧 구현 예정)`);
  };

  // API URL 생성 헬퍼 함수 (원래 상태)
  const getAlbumImageUrl = (artist: string, track?: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (track) {
      return `${apiUrl}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
    }
    return `${apiUrl}/api/album-image-v2/${encodeURIComponent(artist)}`;
  };

  return (
    <>
      <Head>
        <title>트렌딩 - KPOP FANfolio</title>
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FaFire className="w-8 h-8 mr-3 text-orange-500" />
              트렌딩
            </h1>
            <p className="text-gray-600">실시간 K-POP 트렌드와 팬덤 파워를 확인하세요</p>
          </motion.div>

          {/* 로딩 상태 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="ml-4 text-gray-600">트렌딩 데이터를 불러오는 중...</p>
            </div>
          ) : trendingData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">트렌딩 데이터를 찾을 수 없습니다.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <>
              {/* 🔥 팬덤 파워 점수 설명 */}
              <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center mb-4">
              <FaTrophy className="w-6 h-6 mr-2 text-yellow-500" />
              <h3 className="text-lg font-bold text-blue-900">🏆 팬덤 파워 점수 계산법</h3>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="text-center mb-3">
                <div className="text-xl font-bold text-blue-700">트렌드 점수 = 순위 점수 + 차트 보너스</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-semibold text-green-800 mb-1">📊 순위 점수</div>
                  <div className="text-green-700">51 - 평균순위 (1위=50점, 50위=1점)</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-semibold text-purple-800 mb-1">🎯 차트 보너스</div>
                  <div className="text-purple-700">진입 차트 수 × 10점 (최대 50점)</div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-sm text-gray-700">
                <div className="font-semibold mb-1">📝 예시:</div>
                <div>3개 차트 평균 10위 = (51-10) + (3×10) = <span className="font-bold text-orange-600">71점</span></div>
                <div className="mt-2 text-xs text-gray-600">
                  ※ 조건: 2개 이상 차트 진입 + 50위 이내 • 1순위: 차트 수 → 2순위: 평균 순위
                </div>
              </div>
            </div>
          </motion.div>

          {/* 🏆 TOP 3 - 대형 앨범 이미지로 강조 표시 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8 border border-yellow-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <FaTrophy className="w-6 h-6 mr-2 text-yellow-500" />
                🏆 TOP 3 팬덤 파워
              </h2>
              <span className="text-sm text-gray-500">실시간 업데이트</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingData.slice(0, 3).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* 순위 배지 */}
                  <div className="flex justify-center mb-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : ''}
                      ${index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : ''}
                      ${index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : ''}
                    `}>
                      {item.rank}
                    </div>
                  </div>

                  {/* 앨범 이미지 (대형) - 원래 상태로 복원 */}
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item.artist, item.track);
                      }}
                    >
                      <img 
                        src={getAlbumImageUrl(item.artist, item.track)}
                        alt={item.track}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = getAlbumImageUrl(item.artist);
                        }}
                      />
                    </div>
                  </div>

                  {/* 트랙 정보 */}
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-gray-900 mb-1">{item.track}</h3>
                    <p className="text-gray-600 text-sm">{item.artist}</p>
                  </div>

                  {/* 트렌드 점수 */}
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {item.trend_score.toFixed(1)}점
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.chart_count}개 차트 • 최고 {item.best_rank}위
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item.artist, item.track);
                      }}
                      className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                    >
                      차트 보기
                    </button>
                    <button
                      onClick={(e) => handleAddToPortfolio(item.artist, item.track, e)}
                      className="bg-pink-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-pink-700 transition-colors"
                    >
                      💎
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 더 많은 트렌딩 곡들 */}
          {trendingData.length > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaMusic className="w-6 h-6 mr-2 text-blue-500" />
                더 많은 트렌딩 곡들
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingData.slice(3).map((item, index) => (
                  <div
                    key={index + 3}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleItemClick(item.artist, item.track)}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <img 
                          src={getAlbumImageUrl(item.artist, item.track)}
                          alt={item.track}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = getAlbumImageUrl(item.artist);
                          }}
                        />
                      </div>
                      <div className="text-sm font-semibold truncate">{item.artist}</div>
                      <div className="text-xs text-gray-500 truncate">{item.track}</div>
                      <div className="text-xs font-bold text-primary-600">#{item.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
            </>
          )}

          {/* 데이터 정보 */}
          {!isLoading && trendingData.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>총 {trendingData.length}개 트렌딩 곡 • 실시간 업데이트</p>
              <p className="mt-1">💎 담기 버튼을 눌러 관심 곡을 포트폴리오에 추가하세요!</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
