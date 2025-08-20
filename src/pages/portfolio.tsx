/**
 * 🎯 포트폴리오 페이지 - 다국어 지원 버전
 * - 로그인 체크 및 에러 처리
 * - 포트폴리오 아이템 관리
 * - 차트 데이터 표시
 * - 다국어 지원 추가
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
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import LoginModal from '@/components/LoginModal';

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
  id: number;
  name: string;
  email?: string;
  role?: string;
  created_at?: string;
}

// ========================================
// 포트폴리오 페이지 컴포넌트
// ========================================

const PortfolioPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // API 호출
  const fetchPortfolio = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        setError(t('portfolio.login.required'));
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/portfolio/${userId}`, {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setItems(data.portfolio || []);
        setUserInfo(data.user);
      } else {
        setError(data.message || t('common.error'));
      }
    } catch (err) {
      console.error('포트폴리오 로드 실패:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 아이템 삭제
  const handleRemoveItem = async (itemId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const userId = localStorage.getItem('user_id');
      
      const response = await fetch(`${apiUrl}/api/portfolio/${userId}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId || '',
        },
      });

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast.success(t('toast.removed.portfolio'));
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (err) {
      console.error('아이템 삭제 실패:', err);
      toast.error(t('common.error'));
    }
  };

  // 데모 로그인
  const handleDemoLogin = async () => {
    const demoUserId = 'demo_' + Date.now();
    localStorage.setItem('user_id', demoUserId);
    localStorage.setItem('user_name', 'Demo User');
    setUserInfo({
      id: 0,
      name: 'Demo User',
      role: 'demo',
    });
    setError(null);
    setShowDemoModal(false);
    toast.success(t('login.demo.title'));
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchPortfolio();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading]);

  // 로딩 중
  if (authLoading || isLoading) {
    return (
      <Layout>
        <Head>
          <title>{t('portfolio.title')} - KPOP Ranker</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 로그인 필요
  if (!user) {
    return (
      <Layout>
        <Head>
          <title>{t('portfolio.title')} - KPOP Ranker</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
              <FaLock className="text-6xl text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('portfolio.login.required')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('portfolio.login.description').split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i === 0 && <br />}
                  </React.Fragment>
                ))}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaSignInAlt />
                  {t('portfolio.login.button')}
                </button>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                >
                  {t('portfolio.signup')}
                </button>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <p className="text-gray-500 text-sm mb-2">{t('portfolio.demo.text')}</p>
                  <button
                    onClick={handleDemoLogin}
                    className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                  >
                    {t('portfolio.demo.button')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </Layout>
    );
  }

  // 포트폴리오 비어있음
  if (items.length === 0) {
    return (
      <Layout>
        <Head>
          <title>{t('portfolio.title')} - KPOP Ranker</title>
        </Head>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('portfolio.title')}
            </h1>
            {userInfo && (
              <div className="flex items-center gap-2 text-gray-400">
                <FaUser />
                <span>{userInfo.name}</span>
              </div>
            )}
          </div>
          
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <FaBriefcase className="text-6xl text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">
                {t('portfolio.empty')}
              </h2>
              <p className="text-gray-500 mb-6">
                {t('portfolio.login.description').split('\n')[1]}
              </p>
              <Link
                href="/trending"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
              >
                <FaPlus />
                {t('trending.title')}
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 포트폴리오 아이템 표시
  return (
    <Layout>
      <Head>
        <title>{t('portfolio.title')} - KPOP Ranker</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('portfolio.title')}
            </h1>
            <p className="text-gray-400 mt-2">
              {items.length} {t('artist.tracks')}
            </p>
          </div>
          {userInfo && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-400">
                <FaUser />
                <span>{userInfo.name}</span>
              </div>
              {userInfo.role && (
                <p className="text-sm text-gray-500">{userInfo.role}</p>
              )}
            </div>
          )}
        </div>

        {/* 포트폴리오 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all group"
              >
                {/* 앨범 이미지 */}
                <div className="relative aspect-square">
                  <ImageWithFallback
                    src={item.album_image || ''}
                    alt={`${item.artist} - ${item.track}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Link
                        href={`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`}
                        className="flex items-center justify-center gap-2 py-2 px-4 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                      >
                        <FaPlay />
                        <span>{t('button.play')}</span>
                      </Link>
                    </div>
                  </div>
                  
                  {/* 베스트 랭크 */}
                  {item.best_rank && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-yellow-600 px-2 py-1 rounded-lg flex items-center gap-1">
                      <FaCrown className="text-xs" />
                      <span className="text-xs font-bold">#{item.best_rank}</span>
                    </div>
                  )}
                  
                  {/* 즐겨찾기 */}
                  {item.is_favorite && (
                    <div className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full">
                      <FaHeart className="text-xs text-white" />
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{item.track}</h3>
                  <p className="text-gray-400 text-sm truncate">{item.artist}</p>
                  
                  {/* 차트 정보 */}
                  {item.total_charts && item.total_charts > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <FaChartLine />
                      <span>{item.total_charts} charts</span>
                    </div>
                  )}
                  
                  {/* 트렌드 스코어 */}
                  {item.trend_score && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{t('trending.score')}</span>
                        <span className="text-purple-400 font-semibold">
                          {item.trend_score.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                          style={{ width: `${Math.min(item.trend_score, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 액션 버튼 */}
                  <div className="flex items-center justify-between mt-4">
                    <Link
                      href={`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`}
                      className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                    >
                      <FaExternalLinkAlt />
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default PortfolioPage;
