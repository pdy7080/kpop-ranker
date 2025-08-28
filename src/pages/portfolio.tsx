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
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('analytics');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user_email');
      
      if (token && user) {
        setIsAuthenticated(true);
        fetchPortfolio();
      } else {
        const status = await authAPI.getStatus();
        setIsAuthenticated(status.authenticated);
        
        if (status.authenticated) {
          fetchPortfolio();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await portfolioAPI.get();
      console.log('Portfolio response:', response);
      
      if (response.requireAuth) {
        setIsAuthenticated(false);
        return;
      }
      
      if (response.success && response.items) {
        setPortfolioItems(response.items);
      } else {
        setPortfolioItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setPortfolioItems([]);
    }
  };

  const removeFromPortfolio = async (itemId: number) => {
    try {
      await portfolioAPI.remove(itemId.toString());
      setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500" />
        </div>
      </Layout>
    );
  }

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
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              로그인하기
            </button>
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
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioItems.slice(0, 6).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
                      onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                    >
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          artist={item.artist}
                          track={item.title}
                          width={60}
                          height={60}
                          className="rounded-lg"
                        />
                        <div className="flex-grow">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-purple-400">
                              {Object.keys(item.charts || {}).length} charts
                            </span>
                            {item.trend_score && (
                              <span className="text-xs text-green-400">
                                Score: {item.trend_score}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromPortfolio(item.id);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {portfolioItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                    className="bg-gray-800/50 backdrop-blur rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500 group"
                  >
                    <div className="relative mb-3">
                      <ImageWithFallback
                        artist={item.artist}
                        track={item.title}
                        width={200}
                        height={200}
                        className="rounded-lg w-full"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPortfolio(item.id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{Object.keys(item.charts || {}).length} charts</span>
                      {item.trend_score && (
                        <span className="text-sm font-bold text-purple-400">{item.trend_score}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {portfolioItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.title)}`)}
                    className="bg-gray-800/50 backdrop-blur rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer border border-gray-700 hover:border-purple-500"
                  >
                    <div className="flex items-center gap-4">
                      <ImageWithFallback
                        artist={item.artist}
                        track={item.title}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-gray-400">{item.artist}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Added {new Date(item.added_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1">
                            {Object.entries(item.charts || {}).slice(0, 3).map(([chart, rank]) => (
                              <span key={chart} className="text-xs px-2 py-1 bg-gray-700 rounded">
                                {chart}: #{rank}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        {item.trend_score && (
                          <div>
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              {item.trend_score}
                            </p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPortfolio(item.id);
                        }}
                        className="p-3 hover:bg-red-500/20 rounded-lg transition-all"
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
