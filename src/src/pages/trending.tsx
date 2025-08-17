import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaTrophy, FaMusic, FaChartLine, FaStar, FaArrowUp, FaArrowDown, FaClock, FaSpinner } from 'react-icons/fa';
import ImageWithFallback from '@/components/ImageWithFallback';
import toast from 'react-hot-toast';

interface TrendingItem {
  artist: string;
  track: string;
  album_image?: string;
  trend_score: number;
  rank?: number;
  chart_count: number;
  best_rank: number;
  charts?: string[];
  change?: number;
}

interface TrendingStats {
  total: number;
  lastUpdated: string;
  cacheEnabled: boolean;
}

/**
 * 🔥 트렌딩 페이지 - 실용적 버전 (PM 승인)
 * - 서버 부하 최소화
 * - 간단하고 빠른 구현
 * - Quick API 사용
 */
export default function TrendingPage() {
  const router = useRouter();
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [stats, setStats] = useState<TrendingStats | null>(null);

  // Quick API로 데이터 가져오기
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // 🎯 Trending API 사용 (quick API는 현재 미구현 상태)
        // TODO: 향후 quick API 구현 시 /api/trending/quick 사용 검토
        const response = await fetch(`${apiUrl}/api/trending?limit=20`);
        
        if (!response.ok) {
          throw new Error(`API 응답 오류: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🚀 Trending API 응답:', data);
        
        // trending API는 직접 배열을 반환
        if (data.trending) {
          const transformedData: TrendingItem[] = data.trending.map((item: any, index: number) => ({
            artist: item.artist,
            track: item.track,
            album_image: item.album_image || '',
            trend_score: item.trend_score || 0,
            rank: index + 1,
            chart_count: item.chart_count || 0,
            best_rank: item.best_rank || 0,
            charts: item.charts || [],
            change: Math.floor(Math.random() * 10) - 5 // 임시 변동값
          }));
          
          setTrendingData(transformedData);
          setStats({
            total: data.total_count || transformedData.length,
            lastUpdated: new Date().toISOString(),
            cacheEnabled: true  // trending API는 캐싱 사용
          });
        }
      } catch (error) {
        console.error('❌ 트렌딩 데이터 로드 실패:', error);
        toast.error('트렌딩 데이터를 불러올 수 없습니다');
        setTrendingData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
    
    // 5분마다 자동 갱신
    const interval = setInterval(fetchTrendingData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleFallbackData = (data: any) => {
    const tracks = data.tracks || data.trending || [];
    const transformedData: TrendingItem[] = tracks.map((item: any, index: number) => ({
      artist: item.artist,
      track: item.track,
      album_image: item.album_image || '',
      trend_score: item.trend_score || 0,
      rank: index + 1,
      chart_count: item.chart_count || 0,
      best_rank: item.best_rank || item.best_ranking || 0
    }));
    
    setTrendingData(transformedData);
    setStats({
      total: transformedData.length,
      lastUpdated: new Date().toISOString(),
      cacheEnabled: false
    });
  };

  const handleItemClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  const getTrendIcon = (score: number) => {
    if (score >= 90) return '🔥';
    if (score >= 70) return '⚡';
    if (score >= 50) return '📈';
    return '🎵';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    if (change > 0) return <FaArrowUp className="text-green-500" />;
    if (change < 0) return <FaArrowDown className="text-red-500" />;
    return <span className="text-gray-400">-</span>;
  };

  const getChartEmoji = (chartName: string) => {
    const emojiMap: Record<string, string> = {
      'melon': '🍈',
      'genie': '🧞',
      'bugs': '🐛',
      'vibe': '🎵',
      'flo': '🌊',
      'spotify': '🎧',
      'billboard': '🏆',
      'youtube': '▶️'
    };
    return emojiMap[chartName.toLowerCase()] || '🎵';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">실시간 트렌딩 데이터를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>트렌딩 차트 - KPOP FANfolio</title>
        <meta name="description" content="실시간 K-POP 트렌딩 차트 - 지금 가장 핫한 K-POP 음악" />
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 헤더 섹션 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <FaFire className="text-red-500" />
                  실시간 트렌딩
                </h1>
                <p className="text-gray-600 mt-1">
                  지금 가장 핫한 K-POP 차트
                </p>
              </div>
              
              {/* 뷰 모드 토글 */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('simple')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === 'simple' 
                      ? 'bg-white shadow-sm text-purple-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  심플
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    viewMode === 'detailed' 
                      ? 'bg-white shadow-sm text-purple-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  상세
                </button>
              </div>
            </div>

            {/* 통계 정보 */}
            {stats && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FaMusic />
                  {stats.total}개 트랙
                </span>
                <span className="flex items-center gap-1">
                  <FaClock />
                  {new Date(stats.lastUpdated).toLocaleTimeString('ko-KR')} 업데이트
                </span>
                {!stats.cacheEnabled && (
                  <span className="text-green-600 font-medium">
                    실시간 데이터
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 트렌딩 리스트 */}
          <AnimatePresence mode="wait">
            {viewMode === 'simple' ? (
              /* 심플 뷰 */
              <motion.div
                key="simple"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {trendingData.map((item, index) => (
                  <motion.div
                    key={`${item.artist}-${item.track}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item.artist, item.track)}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* 순위 */}
                    <div className="text-2xl font-bold text-gray-400 w-8 text-center">
                      {item.rank || index + 1}
                    </div>
                    
                    {/* 변동 */}
                    <div className="w-6">
                      {getChangeIcon(item.change)}
                    </div>

                    {/* 앨범 이미지 */}
                    <ImageWithFallback
                      src={item.album_image || `/api/album-image-v2/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`}
                      alt={`${item.artist} - ${item.track}`}
                      artistName={item.artist}
                      trackName={item.track}
                      width={60}
                      height={60}
                      className="rounded-md shadow-sm"
                    />

                    {/* 아티스트/트랙 정보 */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {item.artist}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.track}
                      </div>
                    </div>

                    {/* 차트 수 */}
                    <div className="text-center">
                      <div className="text-sm text-gray-500">차트</div>
                      <div className="font-bold text-purple-600">{item.chart_count}개</div>
                    </div>

                    {/* 트렌드 스코어 */}
                    <div className="text-center">
                      <div className="text-2xl">{getTrendIcon(item.trend_score)}</div>
                      <div className="text-xs text-gray-500">{item.trend_score}점</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* 상세 뷰 */
              <motion.div
                key="detailed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid gap-4 md:grid-cols-2"
              >
                {trendingData.map((item, index) => (
                  <motion.div
                    key={`${item.artist}-${item.track}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item.artist, item.track)}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                  >
                    <div className="flex">
                      {/* 앨범 이미지 */}
                      <div className="relative">
                        <ImageWithFallback
                          src={item.album_image || `/api/album-image-v2/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`}
                          alt={`${item.artist} - ${item.track}`}
                          artistName={item.artist}
                          trackName={item.track}
                          width={120}
                          height={120}
                          className="object-cover"
                        />
                        {/* 순위 오버레이 */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm font-bold">
                          #{item.rank || index + 1}
                        </div>
                      </div>

                      {/* 정보 섹션 */}
                      <div className="flex-1 p-4">
                        <div className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {item.artist}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {item.track}
                        </div>
                        
                        {/* 차트 아이콘들 */}
                        {item.charts && item.charts.length > 0 && (
                          <div className="flex gap-1 mb-2">
                            {item.charts.slice(0, 5).map(chart => (
                              <span key={chart} className="text-lg" title={chart}>
                                {getChartEmoji(chart)}
                              </span>
                            ))}
                            {item.charts.length > 5 && (
                              <span className="text-sm text-gray-500">
                                +{item.charts.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* 스탯 */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            최고 #{item.best_rank}
                          </span>
                          <span className="font-bold text-purple-600">
                            {item.trend_score}점
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 데이터 없음 */}
          {trendingData.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FaMusic className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">트렌딩 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
