import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioAPI, authAPI } from '@/lib/api';
import ImageWithFallback from '@/components/ImageWithFallback';
import PortfolioAnalytics from '@/components/Analytics/PortfolioAnalytics';
import { 
  Briefcase, TrendingUp, Award, BarChart3, 
  Plus, Trash2, Share2, Download, LogIn,
  Music, Star, Activity, Globe
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';

interface PortfolioItem {
  id: number;
  artist: string;
  title: string;
  album_image?: string;
  charts?: Record<string, number>;
  added_at: string;
  trend_score?: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('analytics');

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchPortfolio();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await portfolioAPI.get();
      console.log('Portfolio response:', response);
      
      if (response.requireAuth) {
        console.log('Portfolio requires authentication');
        return;
      }
      
      if (response.success && response.items) {
        setPortfolioItems(response.items);
      } else {
        setPortfolioItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setError('포트폴리오를 불러오는데 실패했습니다.');
      setPortfolioItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromPortfolio = async (itemId: number) => {
    try {
      console.log('포트폴리오에서 제거 시도:', itemId);
      
      const response = await portfolioAPI.remove(itemId.toString());
      
      if (response.requireAuth) {
        console.log('Authentication required for portfolio removal');
        alert('로그인이 필요합니다.');
        return;
      }
      
      if (response.success) {
        setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
        console.log('포트폴리오에서 성공적으로 제거됨');
      } else {
        console.error('포트폴리오 제거 실패:', response);
        setError(response.error || '항목 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      setError('항목 삭제에 실패했습니다.');
    }
  };

  const exportPortfolio = () => {
    const data = JSON.stringify(portfolioItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpop-portfolio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const sharePortfolio = () => {
    const shareUrl = `${window.location.origin}/shared/${btoa(JSON.stringify(portfolioItems.map(i => i.id)))}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Portfolio link copied to clipboard!');
  };

  // 인증 로딩 중
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500" />
        </div>
      </Layout>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <LogIn className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">로그인이 필요합니다</h1>
            <p className="text-gray-400 mb-6">
              포트폴리오 기능을 사용하려면 먼저 로그인해주세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                메인 페이지로 가기
              </button>
              <p className="text-sm text-gray-500">
                메인 페이지에서 로그인하실 수 있습니다.
              </p>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={fetchPortfolio}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                다시 시도
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                메인 페이지로 가기
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>My Portfolio - KPOP Ranker</title>
      </Head>

      <div className="min-h-screen bg-[#0A0A0F] text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My K-POP Portfolio
              </span>
            </h1>
            <p className="text-gray-400">내가 좋아하는 K-POP 트랙들을 관리해보세요</p>
            {user && (
              <p className="text-sm text-purple-300 mt-2">
                {user.name}님의 포트폴리오
              </p>
            )}
          </motion.div>

          {/* Stats */}
          {portfolioItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{portfolioItems.length}</div>
                <div className="text-xs text-gray-400">Total Tracks</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {[...new Set(portfolioItems.map(item => item.artist))].length}
                </div>
                <div className="text-xs text-gray-400">Artists</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {portfolioItems.reduce((sum, item) => sum + Object.keys(item.charts || {}).length, 0)}
                </div>
                <div className="text-xs text-gray-400">Chart Entries</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {Math.round(portfolioItems.reduce((sum, item) => sum + (item.trend_score || 0), 0) / portfolioItems.length) || 0}
                </div>
                <div className="text-xs text-gray-400">Avg Score</div>
              </div>
            </motion.div>
          )}

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'analytics' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                List View
              </button>
            </div>

            {portfolioItems.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={sharePortfolio}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={exportPortfolio}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {portfolioItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Briefcase className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-400 mb-2">포트폴리오가 비어있습니다</h2>
                <p className="text-gray-500 mb-6">좋아하는 K-POP 트랙을 추가해보세요!</p>
                <button
                  onClick={() => router.push('/trending')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  트렌딩 차트 보기
                </button>
              </motion.div>
            ) : viewMode === 'analytics' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PortfolioAnalytics portfolioItems={portfolioItems} />
                
                {/* Quick Overview */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">얼마 전에 추가한 곡들</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.slice(0, 6).map((item, idx) => (
                      <motion.div
                        key={`analytics-preview-${item.id}-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:bg-gray-800/70 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group"
                        onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                      >
                        <div className="flex flex-col gap-3">
                          {/* 이미지 영역 */}
                          <div className="relative">
                            <ImageWithFallback
                              artist={item.artist}
                              track={item.title}
                              className="w-full aspect-square rounded-lg object-cover"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromPortfolio(item.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500/80 rounded-full transition-all duration-200 opacity-80 hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                          
                          {/* 텍스트 영역 */}
                          <div className="flex-grow min-h-0">
                            <h4 className="font-semibold text-white truncate text-sm leading-tight">{item.title}</h4>
                            <p className="text-xs text-gray-400 truncate mt-1">{item.artist}</p>
                            
                            {/* 차트 정보 */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                                {Object.keys(item.charts || {}).length}개 차트
                              </span>
                              {item.trend_score && (
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                                  점수: {item.trend_score}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              >
                {portfolioItems.map((item, idx) => (
                  <motion.div
                    key={`grid-${item.id}-${idx}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer border border-gray-700/50 hover:border-purple-500/50 group hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="relative mb-3">
                      <ImageWithFallback
                        artist={item.artist}
                        track={item.title}
                        className="rounded-lg w-full aspect-square object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPortfolio(item.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full transition-all duration-200 hover:bg-red-500/80 opacity-80 hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white text-sm truncate leading-tight">{item.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{item.artist}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                          {Object.keys(item.charts || {}).length}개
                        </span>
                        {item.trend_score && (
                          <span className="text-xs font-bold text-green-400">{item.trend_score}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {portfolioItems.map((item, idx) => (
                  <motion.div
                    key={`list-${item.id}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          artist={item.artist}
                          track={item.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                        <p className="text-gray-400 truncate">{item.artist}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-gray-500">
                            추가일: {new Date(item.added_at).toLocaleDateString('ko-KR')}
                          </span>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(item.charts || {}).slice(0, 3).map(([chart, rank], chartIdx) => (
                              <span key={`${item.id}-${chart}-${chartIdx}`} className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                                {chart}: #{rank}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {item.trend_score && (
                        <div className="text-center flex-shrink-0">
                          <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {item.trend_score}
                          </p>
                          <p className="text-xs text-gray-500">점수</p>
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPortfolio(item.id);
                        }}
                        className="p-3 hover:bg-red-500/20 rounded-lg transition-all duration-200 flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
