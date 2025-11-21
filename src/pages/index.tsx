import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '@/components/ImageWithFallback';
import UnifiedSearch from '@/components/UnifiedSearch';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import PromoCarousel from '@/components/promo/PromoCarousel';
import AdUnit from '@/components/AdSense/AdUnit';
import InFeedAd from '@/components/AdSense/InFeedAd';
import { AdCard } from '@/components/AdSense/AdSenseScript';
import { TrendingUp, Music, Award, Flame, Play, Crown, Zap, BarChart3, Globe, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

// 간단한 API 데이터 로더
async function loadTrendingData(): Promise<TrendingTrack[]> {
  console.log('🚀 트렌딩 데이터 로딩 시작...');

  try {
    const response = await fetch(`${API_URL}/api/trending?limit=20`, {
      cache: 'no-store' // 항상 최신 데이터
    });

    if (!response.ok) {
      throw new Error(`API 응답 에러: ${response.status}`);
    }

    const data = await response.json();

    if (data?.trending) {
      console.log('✅ 트렌딩 데이터 로딩 성공:', data.trending.length, '개');
      return data.trending;
    }

    return [];
  } catch (error) {
    console.error('❌ 트렌딩 데이터 로딩 실패:', error);
    return [];
  }
}

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

// 스켈레톤 로딩 컴포넌트
const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`glass-card overflow-hidden animate-pulse ${className}`}>
    <div className="w-full h-64 bg-gray-700"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-700 rounded w-12"></div>
        <div className="h-6 bg-gray-700 rounded w-12"></div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      console.log('🚀 메인 페이지 로딩 시작');
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await loadTrendingData();

        if (data.length > 0) {
          // 이미지 URL을 절대 경로로 변환
          const dataWithAbsoluteUrls = data.map(track => ({
            ...track,
            image_url: track.image_url?.startsWith('/')
              ? `${API_URL}${track.image_url}`
              : track.image_url
          }));

          setTrendingTracks(dataWithAbsoluteUrls);
          console.log('✅ 로딩 완료:', dataWithAbsoluteUrls.length, '개');
        } else {
          setLoadError('데이터를 불러올 수 없습니다.');
          console.log('⚠️ 데이터 없음');
        }
      } catch (error) {
        setLoadError('데이터 로딩 중 오류가 발생했습니다.');
        console.error('❌ 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트</title>
        <meta name="description" content="전 세계 K-POP 차트를 실시간으로 모니터링하는 플랫폼" />
      </Head>

      <div className="min-h-screen bg-[#050507]">
        {/* 즉시 표시되는 정적 헤더 */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-black text-white mb-3">
              <span className="gradient-text">KPOP</span> RANKER
            </h1>
            <p className="text-lg text-gray-400 mb-4">전 세계 K-POP 차트를 한눈에</p>
            
            {/* 실시간 통계 카드 (즉시 표시) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="glass-card p-4"
              >
                <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-gray-400">개 차트</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="glass-card p-4"
              >
                <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">실시간</p>
                <p className="text-sm text-gray-400">모니터링</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="glass-card p-4"
              >
                <TrendingUp className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {trendingTracks.length || '20'}
                </p>
                <p className="text-sm text-gray-400">트렌딩</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="glass-card p-4"
              >
                <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {isLoading ? '...' : '<1'}
                </p>
                <p className="text-sm text-gray-400">초 로딩</p>
              </motion.div>
            </div>
          </motion.div>

          {/* 검색 (즉시 표시) */}
          <div className="max-w-2xl mx-auto mb-12">
            <UnifiedSearch />
          </div>

          {/* 광고 1: 검색 섹션 하단 */}
          <AdCard className="max-w-4xl mx-auto mb-12" showLabel={false}>
            <AdUnit
              adSlot="2277062593"
              adFormat="auto"
              fullWidthResponsive={true}
              className="text-center"
            />
          </AdCard>

          {/* TOP 3 섹션 - 더 크게 표시 */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-top3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-2">
                  <Crown className="w-10 h-10 text-yellow-500" />
                  TOP 3
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[0, 1, 2].map((idx) => (
                    <SkeletonCard key={idx} />
                  ))}
                </div>
              </motion.div>
            ) : (
              trendingTracks.length > 0 && (
                <motion.div
                  key="loaded-top3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-16"
                >
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-2">
                    <Crown className="w-10 h-10 text-yellow-500" />
                    TOP 3
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {trendingTracks.slice(0, 3).map((track, idx) => (
                      <motion.div
                        key={`${track.artist}-${track.track}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card overflow-hidden hover:shadow-2xl hover:shadow-purple-600/20 transition-all cursor-pointer group relative"
                        onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                      >
                        {/* 순위 뱃지 */}
                        <div className="relative">
                          <div className={`absolute top-3 left-3 z-10 w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl
                            ${idx === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-yellow-500/50' : 
                              idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-400/50' :
                              'bg-gradient-to-r from-orange-600 to-orange-700 shadow-orange-600/50'} text-white shadow-lg`}>
                            {idx + 1}
                          </div>
                          
                          {/* Play 버튼 오버레이 */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                          </div>
                          
                          <div className="w-full h-64 overflow-hidden">
                            <ImageWithFallback
                              artist={track.artist}
                              track={track.track}
                              src={track.image_url}
                              imageSize="large"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="font-bold text-white text-xl truncate group-hover:text-purple-400 transition-colors">
                            {track.track}
                          </h3>
                          <p className="text-gray-400 text-lg truncate mb-4">{track.artist}</p>
                          
                          {/* 차트 순위들 */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(track.charts)
                              .filter(([chart, rank]) => chart !== 'youtube' && typeof rank === 'number')
                              .slice(0, 4)
                              .map(([chart, rank]) => (
                                <ChartRankDisplay
                                  key={chart}
                                  chartName={chart}
                                  rank={rank as number}
                                  displayType="badge"
                                />
                              ))}
                          </div>
                          
                          {/* 스코어 */}
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <span className="text-gray-300 font-medium">스코어: {Math.round(track.score)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* 광고 2: TOP 3와 HOT TRACKS 사이 - 인피드 광고 */}
          <AdCard className="max-w-4xl mx-auto mb-12">
            <InFeedAd
              adSlot="9510778686"
              adLayoutKey="-fb+5w+4e-db+86"
              className="w-full min-h-[100px]"
            />
          </AdCard>

          {/* HOT TRACKS 섹션 - 이미지 크기 증가 */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-hot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center justify-center gap-2">
                  <Flame className="w-8 h-8 text-orange-500" />
                  HOT TRACKS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 16 }, (_, idx) => (
                    <div key={idx} className="glass-card overflow-hidden animate-pulse">
                      <div className="w-full aspect-square bg-gray-700"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              trendingTracks.length > 3 && (
                <motion.div
                  key="loaded-hot"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-8 flex items-center justify-center gap-2">
                    <Flame className="w-8 h-8 text-orange-500" />
                    HOT TRACKS
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    {trendingTracks.slice(3, 19).map((track, idx) => (
                      <motion.div
                        key={`${track.artist}-${track.track}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ delay: idx * 0.02 }}
                        className="glass-card overflow-hidden hover:bg-white/5 hover:shadow-lg hover:shadow-purple-600/10 transition-all cursor-pointer group"
                        onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center z-10">
                            <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                          </div>
                          <div className="w-full aspect-square overflow-hidden">
                            <ImageWithFallback
                              artist={track.artist}
                              track={track.track}
                              src={track.image_url}
                              imageSize="large"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-white text-sm truncate group-hover:text-purple-400 transition-colors">
                            {track.track}
                          </h4>
                          <p className="text-gray-400 text-xs truncate mb-3">{track.artist}</p>
                          
                          {/* 베스트 랭크와 차트 수 */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-300 font-medium">#{track.best_rank}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-300 font-medium">{track.chart_count}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* 광고 3: HOT TRACKS 하단 */}
          <AdCard className="max-w-4xl mx-auto my-12" showLabel={false}>
            <AdUnit
              adSlot="6884615340"
              adFormat="auto"
              fullWidthResponsive={true}
              className="text-center"
            />
          </AdCard>

          {/* 에러 메시지 표시 */}
          {loadError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto my-8 glass-card p-6 text-center"
            >
              <p className="text-red-400 mb-2">⚠️ {loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </motion.div>
          )}

          {/* K-POP Partners Carousel - 푸터 바로 위 */}
          <PromoCarousel />
        </div>
      </div>
    </Layout>
  );
}
