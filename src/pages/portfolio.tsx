/**
 * 🎯 포트폴리오 페이지 - 완전 복원 버전
 * - 로그인 체크 및 에러 처리
 * - 포트폴리오 아이템 관리
 * - 차트 데이터 표시
 */
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBriefcase, FaChartLine, FaPlus, FaSignInAlt, 
  FaTrash, FaMusic, FaPlay, FaExternalLinkAlt,
  FaCrown, FaHeart, FaUser, FaLock
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ========================================
// 타입 정의
// ========================================

interface PortfolioItem {
  id: number;
  artist: string;
  artist_normalized?: string;
  track: string;
  added_at: string;
  notes?: string;
  is_favorite?: boolean;
  
  // 차트 정보
  charts?: Record<string, {
    rank: number;
    views?: string;
    last_updated?: string;
  }>;
  best_rank?: number | null;
  total_charts?: number;
  
  // 앨범 이미지
  album_image?: string;
  
  // 트렌드 스코어
  trend_score?: number;
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
}

// ========================================
// 메인 컴포넌트
// ========================================

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 로그인 상태 확인
  const checkLoginStatus = async () => {
    try {
      // 로컬 스토리지에서 토큰 확인
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('user_id');
      
      if (token && userId) {
        setIsLoggedIn(true);
        setUserInfo({
          id: userId,
          email: localStorage.getItem('user_email') || 'user@example.com',
          name: localStorage.getItem('user_name') || 'User'
        });
        await loadPortfolioData(userId);
      } else {
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  };

  // 포트폴리오 데이터 로드
  const loadPortfolioData = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/portfolio?user_id=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data.items || []);
      } else if (response.status === 401) {
        // 인증 실패
        setIsLoggedIn(false);
        localStorage.clear();
      } else {
        // 포트폴리오가 비어있거나 다른 오류
        setPortfolioItems([]);
      }
    } catch (error) {
      console.error('포트폴리오 데이터 로드 실패:', error);
      setError('포트폴리오를 불러오는데 실패했습니다');
      setPortfolioItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 포트폴리오 아이템 제거
  const handleRemoveItem = async (itemId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        setPortfolioItems(items => items.filter(item => item.id !== itemId));
        toast.success('포트폴리오에서 제거되었습니다');
      } else {
        throw new Error('제거 실패');
      }
    } catch (error) {
      console.error('포트폴리오 아이템 제거 실패:', error);
      toast.error('제거에 실패했습니다');
    }
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async (itemId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const item = portfolioItems.find(i => i.id === itemId);
      
      const response = await fetch(`${apiUrl}/api/portfolio/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          is_favorite: !item?.is_favorite
        })
      });
      
      if (response.ok) {
        setPortfolioItems(items =>
          items.map(item =>
            item.id === itemId
              ? { ...item, is_favorite: !item.is_favorite }
              : item
          )
        );
        toast.success(item?.is_favorite ? '즐겨찾기에서 제거되었습니다' : '즐겨찾기에 추가되었습니다');
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      toast.error('작업에 실패했습니다');
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">포트폴리오를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <Layout>
        <Head>
          <title>포트폴리오 - KPOP Ranker</title>
        </Head>
        
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
          <div className="max-w-md w-full mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaLock className="text-3xl text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                로그인이 필요합니다
              </h2>
              
              <p className="text-gray-600 mb-8">
                포트폴리오 기능을 사용하려면 로그인해주세요.
                <br />
                나만의 K-POP 차트를 관리할 수 있습니다.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaSignInAlt />
                  로그인
                </button>
                
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  회원가입
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Demo 계정으로 체험하기
                </p>
                <button
                  onClick={async () => {
                    // Demo 로그인 처리
                    localStorage.setItem('auth_token', 'demo_token');
                    localStorage.setItem('user_id', 'demo_user');
                    localStorage.setItem('user_email', 'demo@example.com');
                    localStorage.setItem('user_name', 'Demo User');
                    
                    setIsLoggedIn(true);
                    setUserInfo({
                      id: 'demo_user',
                      email: 'demo@example.com',
                      name: 'Demo User'
                    });
                    
                    await loadPortfolioData('demo_user');
                    toast.success('Demo 계정으로 로그인했습니다');
                  }}
                  className="mt-2 text-purple-600 hover:text-purple-700 underline text-sm"
                >
                  Demo로 시작하기
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  // 포트폴리오 메인 화면
  return (
    <Layout>
      <Head>
        <title>내 포트폴리오 - KPOP Ranker</title>
        <meta name="description" content="나만의 K-POP 차트 포트폴리오" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <FaBriefcase />
                  내 포트폴리오
                </h1>
                <p className="opacity-90">
                  {userInfo?.name || userInfo?.email}님의 K-POP 컬렉션
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{portfolioItems.length}</div>
                  <div className="text-sm opacity-90">트랙</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {portfolioItems.filter(item => item.is_favorite).length}
                  </div>
                  <div className="text-sm opacity-90">즐겨찾기</div>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    setIsLoggedIn(false);
                    router.push('/');
                    toast.success('로그아웃되었습니다');
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="container mx-auto px-4 py-8">
          {portfolioItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FaMusic className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                포트폴리오가 비어있습니다
              </h2>
              <p className="text-gray-600 mb-6">
                좋아하는 K-POP 트랙을 추가해보세요!
              </p>
              <button
                onClick={() => router.push('/trending')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <FaPlus />
                트렌딩 차트 보러가기
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {portfolioItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        {/* 앨범 이미지 */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={item.album_image || `/api/album-image-smart/${encodeURIComponent(item.artist_normalized || item.artist)}/${encodeURIComponent(item.track)}`}
                            alt={item.track}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* 트랙 정보 */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 
                                className="text-lg font-bold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors"
                                onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`)}
                              >
                                {item.track}
                              </h3>
                              <p 
                                className="text-gray-600 hover:text-purple-600 cursor-pointer transition-colors"
                                onClick={() => router.push(`/artist/${encodeURIComponent(item.artist)}`)}
                              >
                                {item.artist}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>추가일: {new Date(item.added_at).toLocaleDateString('ko-KR')}</span>
                                {item.best_rank && (
                                  <span className="flex items-center gap-1">
                                    <FaTrophy className="text-yellow-500" />
                                    최고 #{item.best_rank}
                                  </span>
                                )}
                                {item.trend_score && (
                                  <span className="flex items-center gap-1">
                                    <FaChartLine className="text-purple-500" />
                                    {item.trend_score}°
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleFavorite(item.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  item.is_favorite
                                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                              >
                                <FaHeart className={item.is_favorite ? 'fill-current' : ''} />
                              </button>
                              
                              <button
                                onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <FaPlay />
                              </button>
                              
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          {/* 메모 */}
                          {item.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
