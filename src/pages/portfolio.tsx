import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  FaBriefcase, FaChartLine, FaPlus, FaSignInAlt, 
  FaTrash, FaMusic, FaPlay, FaExternalLinkAlt,
  FaCrown, FaHeart
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
  charts?: {
    [key: string]: ChartData;
  };
}

export default function PortfolioPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
    if (mounted) {
      fetchPortfolio();
    }
  }, [mounted]);

  const checkAuthStatus = () => {
    // 간단한 로컬 스토리지 체크 (데모용)
    const demoUser = localStorage.getItem('demo_user');
    setIsLoggedIn(!!demoUser);
  };

  const fetchPortfolio = async () => {
    if (!mounted) return;
    
    setIsLoading(true);
    try {
      const API_CONFIG = {
        BASE_URL: process.env.NODE_ENV === 'production' 
          ? 'https://api.kpopranker.chargeapp.net'
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      };
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    // 데모 로그인
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'demo_user',
      name: 'K-POP 팬',
      email: 'demo@kpopranker.com'
    }));
    setIsLoggedIn(true);
    setShowLoginModal(false);
    toast.success('로그인 완료!');
    fetchPortfolio();
  };

  const removeFromPortfolio = async (id: number) => {
    if (!mounted) return;
    
    try {
      const API_CONFIG = {
        BASE_URL: process.env.NODE_ENV === 'production' 
          ? 'https://api.kpopranker.chargeapp.net'
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      };
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/portfolio/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPortfolioItems(prev => prev.filter(item => item.id !== id));
        toast.success('포트폴리오에서 삭제했습니다');
      }
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다');
    }
  };

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

  return (
    <Layout>
      <Head>
        <title>포트폴리오 | K-POP Ranker</title>
        <meta name="description" content="내가 관심있는 K-POP 트랙들의 차트 순위를 한 곳에서 모니터링하세요." />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FaBriefcase className="text-purple-600" />
                  My 포트폴리오
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  관심있는 K-POP 트랙들의 실시간 차트 순위를 추적하세요
                </p>
              </div>
              
              {!isLoggedIn ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  <FaSignInAlt />
                  로그인
                </button>
              ) : (
                <Link 
                  href="/search"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  <FaPlus />
                  트랙 추가
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 로그인 모달 */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">데모 로그인</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  포트폴리오 기능을 체험해보세요
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  데모 계정으로 로그인
                </button>
                
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 컨텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isLoggedIn ? (
            /* 로그인 안내 */
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaBriefcase className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  포트폴리오 기능을 사용해보세요
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  좋아하는 K-POP 트랙들을 저장하고<br />
                  실시간 차트 순위 변화를 추적할 수 있어요
                </p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium text-lg"
                >
                  <FaSignInAlt />
                  체험해보기
                </button>
              </div>
            </div>
          ) : isLoading ? (
            /* 로딩 */
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">포트폴리오를 불러오는 중...</p>
            </div>
          ) : portfolioItems.length === 0 ? (
            /* 빈 포트폴리오 */
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaMusic className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  아직 추가된 트랙이 없어요
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  좋아하는 K-POP 트랙을 검색해서 포트폴리오에 추가해보세요
                </p>
                <Link 
                  href="/search"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium text-lg"
                >
                  <FaPlus />
                  첫 트랙 추가하기
                </Link>
              </div>
            </div>
          ) : (
            /* 포트폴리오 목록 */
            <div className="grid gap-6">
              {portfolioItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {item.charts && Object.values(item.charts)[0]?.album_image ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <Image
                            src={Object.values(item.charts)[0].album_image}
                            alt={`${item.artist} - ${item.track}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <FaMusic className="w-8 h-8 text-white" />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.track}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <FaCrown className="w-4 h-4 text-yellow-500" />
                          {item.artist}
                        </p>
                        {item.is_favorite && (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full mt-1">
                            <FaHeart />
                            즐겨찾기
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`}
                        className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        title="상세 보기"
                      >
                        <FaExternalLinkAlt />
                      </Link>
                      <button
                        onClick={() => removeFromPortfolio(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="삭제"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  {/* 차트 순위 정보 */}
                  {item.charts && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {Object.entries(item.charts).map(([chartName, chartData]) => (
                        <div key={chartName} className="text-center">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {chartName}
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            #{chartData.rank || '-'}
                          </div>
                          {chartData.real_time && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
