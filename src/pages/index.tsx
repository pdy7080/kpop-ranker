import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '@/components/ImageWithFallback';
import UnifiedSearch from '@/components/UnifiedSearch';
import ChartRankDisplay from '@/components/ChartRankDisplay';
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

interface StaticData {
  meta: {
    generated_at: string;
    trending_count: number;
    active_charts: number;
  };
  trending: TrendingTrack[];
  stats: {
    total_tracks: number;
    active_charts: number;
    last_updated: string;
  };
}

// 하이브리드 데이터 로더
class HybridDataLoader {
  private static instance: HybridDataLoader;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

  static getInstance(): HybridDataLoader {
    if (!HybridDataLoader.instance) {
      HybridDataLoader.instance = new HybridDataLoader();
    }
    return HybridDataLoader.instance;
  }

  async loadTrendingData(): Promise<TrendingTrack[]> {
    console.log('🚀 하이브리드 로딩 시작...');
    
    try {
      // 1단계: 정적 데이터 즉시 로딩 (0.1초)
      const staticData = await this.loadStaticData();
      if (staticData && staticData.trending) {
        console.log('⚡ 정적 데이터 로딩 성공:', staticData.trending.length, '개');
        
        // 백그라운드에서 최신 데이터 확인
        setTimeout(() => this.updateInBackground(), 500);
        
        return staticData.trending;
      }
    } catch (error) {
      console.log('⚠️ 정적 데이터 실패, API 폴백...');
    }

    // 2단계: API 폴백 (1초)
    return await this.loadApiData();
  }

  private async loadStaticData(): Promise<StaticData | null> {
    try {
      // 로컬 정적 파일 시도
      const response = await fetch('/static_data/hybrid_data.json', {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 정적 데이터 로딩 성공');
        return data;
      }
    } catch (error) {
      console.log('정적 데이터 로딩 실패:', error);
    }
    
    return null;
  }

  private async loadApiData(): Promise<TrendingTrack[]> {
    try {
      const response = await fetch(`${API_URL}/api/trending?limit=20`);
      const data = await response.json();
      
      if (data?.trending) {
        console.log('✅ API 데이터 로딩 성공:', data.trending.length, '개');
        return data.trending;
      }
    } catch (error) {
      console.error('❌ API 데이터 로딩 실패:', error);
    }
    
    return [];
  }

  private async updateInBackground(): Promise<void> {
    try {
      const latestData = await this.loadApiData();
      if (latestData.length > 0) {
        // 기존 정적 데이터와 병합하여 image_url 보존
        window.dispatchEvent(new CustomEvent('hybridUpdate', { 
          detail: { trending: latestData, preserveImages: true } 
        }));
      }
    } catch (error) {
      console.log('백그라운드 업데이트 실패:', error);
    }
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
  <div className={`bg-gray-800 rounded-xl overflow-hidden animate-pulse ${className}`}>
    <div className="w-full h-48 bg-gray-700"></div>
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

export default function HybridHome() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'static' | 'api' | 'complete'>('static');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 최신 trendingTracks 값을 참조하기 위한 useRef (dependency 루프 방지)
  const trendingTracksRef = useRef<TrendingTrack[]>([]);
  
  // trendingTracks가 변경될 때마다 ref 업데이트
  useEffect(() => {
    trendingTracksRef.current = trendingTracks;
  }, [trendingTracks]);

  // 하이브리드 데이터 로딩
  const loadHybridData = useCallback(async () => {
    console.log('🚀 하이브리드 메인 페이지 로딩 시작');
    setLoadingStage('static');
    
    const loader = HybridDataLoader.getInstance();
    const data = await loader.loadTrendingData();
    
    if (data.length > 0) {
      setTrendingTracks(data);
      setIsLoading(false);
      setLoadingStage('complete');
      console.log('✅ 하이브리드 로딩 완료:', data.length, '개');
    } else {
      setIsLoading(false);
      setLoadingStage('complete');
      console.log('⚠️ 데이터 없음');
    }
  }, []);

  // 백그라운드 업데이트 리스너 (dependency 없음 - 무한루프 방지)
  const handleBackgroundUpdate = useCallback((event: CustomEvent) => {
    const newData = event.detail.trending;
    const preserveImages = event.detail.preserveImages;
    
    if (newData && newData.length > 0) {
      console.log('🔄 백그라운드 업데이트 감지');
      setIsUpdating(true);
      
      setTimeout(() => {
        // ref를 사용하여 최신 데이터 참조 (dependency 루프 방지)
        const currentTracks = trendingTracksRef.current;
        
        // 이미지 데이터 보존 처리
        if (preserveImages && currentTracks.length > 0) {
          const mergedData = newData.map((newTrack: TrendingTrack) => {
            // 기존 데이터에서 이미지 URL 찾기
            const existingTrack = currentTracks.find(
              track => track.artist === newTrack.artist && track.track === newTrack.track
            );
            
            return {
              ...newTrack,
              // 기존 image_url이 있으면 보존, 없으면 새 데이터 사용
              image_url: existingTrack?.image_url || newTrack.image_url
            };
          });
          setTrendingTracks(mergedData);
        } else {
          setTrendingTracks(newData);
        }
        
        setIsUpdating(false);
        console.log('✅ 백그라운드 업데이트 완료');
      }, 300);
    }
  }, []); // 빈 dependency 배열 - 무한루프 방지

  useEffect(() => {
    loadHybridData();
    
    // 백그라운드 업데이트 이벤트 리스너
    window.addEventListener('hybridUpdate', handleBackgroundUpdate as EventListener);
    
    return () => {
      window.removeEventListener('hybridUpdate', handleBackgroundUpdate as EventListener);
    };
  }, [loadHybridData, handleBackgroundUpdate]);

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트 (하이브리드)</title>
        <meta name="description" content="전 세계 K-POP 차트를 실시간으로 모니터링하는 하이브리드 플랫폼" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* 즉시 표시되는 정적 헤더 */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-black text-white mb-3">
              <span className="text-indigo-400">KPOP</span> RANKER
              {isUpdating && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block ml-3"
                >
                  <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
                </motion.span>
              )}
            </h1>
            <p className="text-lg text-gray-400 mb-4">전 세계 K-POP 차트를 한눈에</p>
            
            {/* 실시간 통계 카드 (즉시 표시) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg p-4"
              >
                <BarChart3 className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-gray-400">개 차트</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg p-4"
              >
                <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">실시간</p>
                <p className="text-sm text-gray-400">모니터링</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg p-4"
              >
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {trendingTracks.length || '20'}
                </p>
                <p className="text-sm text-gray-400">트렌딩</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg p-4"
              >
                <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {loadingStage === 'complete' ? '0.3' : '...'}
                </p>
                <p className="text-sm text-gray-400">초 로딩</p>
              </motion.div>
            </div>
          </motion.div>

          {/* 검색 (즉시 표시) */}
          <div className="max-w-2xl mx-auto mb-12">
            <UnifiedSearch />
          </div>

          {/* TOP 3 섹션 */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-top3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  TOP 3
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                  className="mb-12"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    TOP 3
                    {isUpdating && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5 text-yellow-400" />
                      </motion.div>
                    )}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {trendingTracks.slice(0, 3).map((track, idx) => (
                      <motion.div
                        key={`${track.artist}-${track.track}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
                        onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                      >
                        {/* 순위 뱃지 */}
                        <div className="relative">
                          <div className={`absolute top-2 left-2 z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                            ${idx === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                              idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                              'bg-gradient-to-r from-orange-600 to-orange-700'} text-white shadow-lg`}>
                            {idx + 1}
                          </div>
                          
                          {/* Play 버튼 오버레이 */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          
                          <ImageWithFallback
                            artist={track.artist}
                            track={track.track}
                            src={track.image_url}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-white text-lg truncate group-hover:text-indigo-400 transition-colors">
                            {track.track}
                          </h3>
                          <p className="text-gray-400 truncate mb-3">{track.artist}</p>
                          
                          {/* 차트 순위들 */}
                          <div className="flex flex-wrap gap-1 mb-2">
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
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-gray-300">스코어: {Math.round(track.score)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* HOT TRACKS 섹션 */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-hot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  HOT TRACKS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 16 }, (_, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                      <div className="w-full h-32 bg-gray-700"></div>
                      <div className="p-3">
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
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    HOT TRACKS
                    {isUpdating && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5 text-orange-400" />
                      </motion.div>
                    )}
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {trendingTracks.slice(3, 19).map((track, idx) => (
                      <motion.div
                        key={`${track.artist}-${track.track}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ delay: idx * 0.02 }}
                        className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all cursor-pointer group"
                        onClick={() => router.push(`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`)}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          <ImageWithFallback
                            artist={track.artist}
                            track={track.track}
                            src={track.image_url}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                            {track.track}
                          </h4>
                          <p className="text-gray-400 text-xs truncate mb-2">{track.artist}</p>
                          
                          {/* 베스트 랭크와 차트 수 */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-yellow-500" />
                              <span className="text-gray-300">#{track.best_rank}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3 text-indigo-500" />
                              <span className="text-gray-300">{track.chart_count}</span>
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

          {/* 하이브리드 시스템 상태 표시 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 right-4 bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-700"
          >
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                loadingStage === 'complete' ? 'bg-green-500' : 
                loadingStage === 'static' ? 'bg-yellow-500' : 'bg-blue-500'
              } animate-pulse`}></div>
              <span className="text-gray-300">
                {loadingStage === 'complete' ? '하이브리드 로딩 완료' :
                 loadingStage === 'static' ? '정적 데이터 로딩 중' :
                 'API 데이터 로딩 중'}
              </span>
              {isUpdating && (
                <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
