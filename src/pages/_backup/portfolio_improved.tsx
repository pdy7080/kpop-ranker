import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  FaBriefcase, FaChartLine, FaPlus, FaSignInAlt, 
  FaTrash, FaMusic, FaPlay, FaEye, FaExternalLinkAlt,
  FaCrown, FaHeart, FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface ChartData {
  rank: number;
  views_streams: string;
  album_image: string;
  image_quality: string;
  data_source: string;
  real_time: boolean;
}

interface PortfolioItem {
  id: number;
  artist: string;
  track: string;
  added_at: string;
  notes?: string;
  is_favorite?: boolean;
  
  // 🔥 실시간 차트 정보
  charts: Record<string, ChartData>;
  best_rank?: number | null;
  total_charts: number;
  found: boolean;
  
  // 🔥 앨범 이미지 정보
  album_image: string;
  image_quality: string;
  
  // 🔥 시스템 정보
  data_source: string;
  real_time_enabled: boolean;
  korean_support: boolean;
  perfect_system: boolean;
}

export default function ImprovedPortfolioPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/portfolio?user_id=demo_user`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data.items || []);
        
        console.log('🔥 개선된 포트폴리오 시스템 연결:', {
          count: data.count,
          perfect_system: data.perfect_system,
          real_time_rankings: data.real_time_rankings
        });
      } else {
        console.error('포트폴리오 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('포트폴리오 데이터 로드 실패:', error);
      toast.error('포트폴리오 데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setPortfolioItems(items => items.filter(item => item.id !== itemId));
        toast.success('💎 포트폴리오에서 제거되었습니다');
      } else {
        throw new Error('제거 실패');
      }
    } catch (error) {
      console.error('포트폴리오 아이템 제거 실패:', error);
      toast.error('제거에 실패했습니다');
    }
  };

  const handleDemoLogin = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'K-POP Fan',
          email: 'demo@kpopranker.com'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        // 🔥 로그인 성공 알림창 제거 (조용한 로그인)
        console.log('조용한 로그인 성공:', data);
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      // 🔥 로그인 실패 알림창도 제거 (조용한 처리)
      console.log('조용한 로그인 실패');
    }
  };

  // 🎯 곡 클릭 시 곡 상세 페이지로 이동
  const handleTrackClick = (artist: string, track: string) => {
    const searchQuery = `${artist} ${track}`;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // 🎯 개선된 앨범 이미지 컴포넌트
  const AlbumImage = ({ item }: { item: PortfolioItem }) => {
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState(item.album_image || `/api/album-image-v2/${item.artist}/${item.track}`);

    const handleImageError = () => {
      if (!imageError) {
        setImageError(true);
        // 🔥 폴백 이미지 URL 시도
        setImageUrl(`/api/album-image-v2/${item.artist}`);
      }
    };

    return (
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={`${item.artist} - ${item.track}`}
            width={64}
            height={64}
            className="object-cover w-full h-full"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
            {item.artist.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* 실시간 연동 표시 */}
        {item.real_time_enabled && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
        )}
      </div>
    );
  };

  // 🎯 개선된 차트 뱃지 (곡별로 독립적)
  const renderChartBadges = (item: PortfolioItem) => {
    if (!item.charts || Object.keys(item.charts).length === 0) {
      return (
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          📊 차트 미진입
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(item.charts).map(([chartName, chartData]) => (
          <div
            key={chartName}
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              chartData.rank <= 10 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                : chartData.rank <= 30
                ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                : chartData.rank <= 50
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {chartName.toUpperCase()} #{chartData.rank}
          </div>
        ))}
      </div>
    );
  };

  // 마운트되지 않았으면 로딩 표시
  if (!mounted) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-500">개선된 포트폴리오를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>💎 개선된 포트폴리오 - KPOP Ranker</title>
        <meta name="description" content="곡별 독립적인 차트 정보와 앨범 이미지가 포함된 개선된 K-POP 포트폴리오" />
      </Head>

      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <FaBriefcase className="w-8 h-8 mr-3 text-primary-500" />
                  💎 개선된 포트폴리오
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  각 곡별로 독립적인 차트 순위와 앨범 이미지를 확인하세요
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    🎵 곡별 독립 데이터
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    🖼️ 실제 앨범 커버
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    🔗 곡 상세 연결
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {!isLoggedIn && (
                  <button
                    onClick={handleDemoLogin}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaSignInAlt className="w-4 h-4 mr-2" />
                    조용한 로그인
                  </button>
                )}
                <Link
                  href="/search"
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  곡 추가하기
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 🎯 개선된 간단한 통계 (의미있는 데이터만) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">총 곡 수</p>
                    <p className="text-2xl font-bold">{portfolioItems.length}</p>
                  </div>
                  <FaMusic className="w-6 h-6 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">차트 진입</p>
                    <p className="text-2xl font-bold">
                      {portfolioItems.filter(item => item.total_charts > 0).length}
                    </p>
                  </div>
                  <FaChartLine className="w-6 h-6 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">1위 곡</p>
                    <p className="text-2xl font-bold">
                      {portfolioItems.filter(item => item.best_rank === 1).length}
                    </p>
                  </div>
                  <FaCrown className="w-6 h-6 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">TOP 10</p>
                    <p className="text-2xl font-bold">
                      {portfolioItems.filter(item => item.best_rank && item.best_rank <= 10).length}
                    </p>
                  </div>
                  <FaHeart className="w-6 h-6 opacity-80" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 🎯 개선된 포트폴리오 목록 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {portfolioItems.length === 0 ? (
              <div className="text-center py-12">
                <FaBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  포트폴리오가 비어있습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  관심있는 K-POP 트랙을 추가하고 각 곡의 차트 순위를 확인해보세요
                </p>
                <Link
                  href="/search"
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors inline-flex items-center"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  첫 번째 곡 추가하기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolioItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* 🎯 개선된 앨범 이미지 */}
                        <AlbumImage item={item} />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 
                                className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 transition-colors flex items-center"
                                onClick={() => handleTrackClick(item.artist, item.track)}
                              >
                                {item.artist} - {item.track}
                                <FaExternalLinkAlt className="w-3 h-3 ml-2 text-gray-400" />
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(item.added_at).toLocaleDateString('ko-KR')} 추가
                              </p>
                            </div>
                            
                            {/* 🎯 곡별 최고 순위 (의미있는 데이터) */}
                            <div className="text-right">
                              {item.best_rank ? (
                                <div className="flex items-center">
                                  <FaCrown className="w-4 h-4 text-yellow-500 mr-1" />
                                  <span className="font-bold text-yellow-600 text-lg">#{item.best_rank}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 font-medium">미진입</span>
                              )}
                              <p className="text-xs text-gray-500">{item.total_charts}개 차트</p>
                            </div>
                          </div>
                          
                          {/* 🎯 곡별 차트 뱃지 */}
                          <div className="mb-3">
                            {renderChartBadges(item)}
                          </div>
                          
                          {/* 메모 및 액션 버튼 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleTrackClick(item.artist, item.track)}
                                className="text-primary-600 hover:text-primary-700 transition-colors flex items-center text-sm"
                              >
                                <FaPlay className="w-3 h-3 mr-1" />
                                곡 상세보기
                              </button>
                              
                              {item.notes && (
                                <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {item.real_time_enabled && (
                                <span className="text-green-500 text-sm" title="실시간 연동">🔴 LIVE</span>
                              )}
                              
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                title="포트폴리오에서 제거"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </Layout>
    </>
  );
}