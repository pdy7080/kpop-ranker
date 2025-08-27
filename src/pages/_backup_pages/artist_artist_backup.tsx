/**
 * 🎯 아티스트 상세 페이지 - 다크 테마 버전 v8.1
 * - 차트/뉴스/굿즈 3개 탭 구조
 * - 8개 차트 완벽 지원
 * - 네온 다크 테마 통일
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, FaExternalLinkAlt, FaPlay, FaTrophy, FaFire, 
  FaChartLine, FaNewspaper, FaShoppingBag, FaStar, FaCalendar,
  FaSpotify, FaYoutube, FaMusic
} from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';
import toast from 'react-hot-toast';
import { useTranslation } from '@/contexts/TranslationContext';

// ========================================
// 타입 정의
// ========================================

interface ChartRank {
  rank: number | null;
  views_or_streams: string | null;
  last_updated: string | null;
  in_chart: boolean;
  rank_class: string;
}

interface Track {
  name: string;
  album_image: string;
  charts: {
    melon: ChartRank;
    genie: ChartRank;
    bugs: ChartRank;
    vibe: ChartRank;
    flo: ChartRank;
    spotify: ChartRank;
    billboard: ChartRank;
    youtube: ChartRank;
  };
  streaming_links: {
    spotify: string;
    apple_music: string;
    youtube_music: string;
    melon: string;
    genie: string;
    bugs: string;
  };
  trend_score: number;
}

interface ArtistStats {
  total_tracks: number;
  chart_presence: Record<string, number>;
  best_ranks: Record<string, number>;
  best_overall_rank: number | null;
  global_popularity_score: number;
  chart_diversity: number;
}

interface ArtistData {
  artist: string;
  artist_normalized?: string;
  variations: string[];
  tracks: Track[];
  stats: ArtistStats;
  last_updated: string;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  image: string;
  date: string;
  source: string;
}

interface GoodsItem {
  name: string;
  price: string;
  image: string;
  url: string;
  rating: number;
  review_count: number;
  shop: string;
}

// 차트별 설정 데이터 (8개 차트)
const CHART_CONFIG = {
  melon: {
    name: 'Melon',
    icon: '🍉',
    color: '#00CD3C',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400/50',
    description: '국내 최대'
  },
  genie: {
    name: 'Genie', 
    icon: '🧞',
    color: '#1E40AF',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400/50',
    description: '실시간'
  },
  bugs: {
    name: 'Bugs',
    icon: '🐛', 
    color: '#F97316',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-400/50',
    description: '고음질'
  },
  vibe: {
    name: 'Vibe',
    icon: '🎵',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-400/50',
    description: '네이버'
  },
  flo: {
    name: 'FLO',
    icon: '🌊',
    color: '#00A9FF',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-400/50',
    description: 'SK텔레콤'
  },
  spotify: {
    name: 'Spotify',
    icon: '🎧',
    color: '#1DB954',
    bgColor: 'bg-green-600/20', 
    borderColor: 'border-green-500/50',
    description: '글로벌'
  },
  billboard: {
    name: 'Billboard',
    icon: '🏆',
    color: '#F59E0B',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-400/50', 
    description: '미국'
  },
  youtube: {
    name: 'YouTube',
    icon: '📺',
    color: '#FF0000',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-400/50',
    description: '조회수'
  }
};

// 백엔드 응답을 프론트엔드 형식으로 변환
function transformResponseToArtistData(response: any): ArtistData {
  const tracks: Track[] = [];
  const chartPresence: Record<string, number> = {};
  const bestRanks: Record<string, number> = {};
  let bestOverallRank: number | null = null;

  const artistNormalized = response.artist_normalized || response.artist || '';

  // charts 데이터를 tracks 형식으로 변환
  if (response.charts) {
    const trackMap = new Map<string, Track>();

    Object.entries(response.charts).forEach(([chartName, chartTracks]) => {
      const chartKey = chartName.toLowerCase();
      chartPresence[chartKey] = (chartTracks as any[]).length;

      (chartTracks as any[]).forEach((track: any) => {
        const trackName = track.track;
        
        if (!trackMap.has(trackName)) {
          trackMap.set(trackName, {
            name: trackName,
            album_image: track.album_image || `/api/album-image-smart/${encodeURIComponent(artistNormalized)}/${encodeURIComponent(trackName)}`,
            charts: {
              melon: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              genie: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              bugs: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              vibe: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              flo: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              spotify: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              billboard: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              youtube: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
            },
            streaming_links: {
              spotify: '#',
              apple_music: '#',
              youtube_music: '#',
              melon: '#',
              genie: '#',
              bugs: '#',
            },
            trend_score: 0,
          });
        }

        const currentTrack = trackMap.get(trackName)!;
        const rank = track.rank !== 999 && track.rank !== null ? track.rank : null;
        
        // 차트 데이터 업데이트
        if (chartKey in currentTrack.charts) {
          (currentTrack.charts as any)[chartKey] = {
            rank: rank,
            views_or_streams: track.views || null,
            last_updated: new Date().toISOString(),
            in_chart: rank !== null,
            rank_class: rank === null ? 'not-in-chart' : rank <= 10 ? 'top-10' : rank <= 50 ? 'top-50' : 'in-chart'
          };
        }

        // 베스트 순위 업데이트
        if (rank !== null) {
          if (!bestRanks[chartKey] || rank < bestRanks[chartKey]) {
            bestRanks[chartKey] = rank;
          }
          if (!bestOverallRank || rank < bestOverallRank) {
            bestOverallRank = rank;
          }
        }
      });
    });

    // Map을 배열로 변환
    trackMap.forEach((track) => {
      // 트렌드 스코어 계산
      let score = 0;
      let chartCount = 0;

      Object.entries(track.charts).forEach(([_, chartInfo]) => {
        if (chartInfo.rank !== null) {
          chartCount++;
          score += (101 - chartInfo.rank);
        }
      });

      track.trend_score = chartCount > 0 ? Math.round(score / chartCount) : 0;
      tracks.push(track);
    });
  }

  // 트렌드 스코어로 정렬
  tracks.sort((a, b) => b.trend_score - a.trend_score);

  const totalCharts = Object.keys(CHART_CONFIG).length;
  const activeCharts = Object.keys(chartPresence).length;
  const chartDiversity = activeCharts / totalCharts;
  const globalPopularityScore = Math.round(chartDiversity * 100);

  return {
    artist: response.artist || '',
    artist_normalized: artistNormalized,
    variations: response.variations || [],
    tracks,
    stats: {
      total_tracks: response.unique_tracks || tracks.length,
      chart_presence: chartPresence,
      best_ranks: response.best_ranks || bestRanks,
      best_overall_rank: bestOverallRank,
      global_popularity_score: globalPopularityScore,
      chart_diversity: chartDiversity,
    },
    last_updated: new Date().toISOString(),
  };
}

// ========================================
// 메인 컴포넌트
// ========================================

export default function ArtistDetailPage() {
  const router = useRouter();
  const { artist } = router.query;
  const { t } = useTranslation();
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [goodsData, setGoodsData] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingGoods, setLoadingGoods] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'charts' | 'news' | 'goods'>('charts');

  // 아티스트 데이터 가져오기
  useEffect(() => {
    if (!artist) return;

    const fetchArtistData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/artist/${encodeURIComponent(artist as string)}/complete`);
        
        if (!response.ok) {
          throw new Error('아티스트 정보를 불러올 수 없습니다');
        }

        const data = await response.json();
        const transformedData = transformResponseToArtistData(data);
        setArtistData(transformedData);
      } catch (err) {
        console.error('Error fetching artist data:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artist]);

  // 뉴스 데이터 가져오기
  const fetchNewsData = async () => {
    if (!artist || loadingNews) return;

    setLoadingNews(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/artist/${encodeURIComponent(artist as string)}/news`);
      
      if (response.ok) {
        const data = await response.json();
        setNewsData(data.news || []);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  // 굿즈 데이터 가져오기
  const fetchGoodsData = async () => {
    if (!artist || loadingGoods) return;

    setLoadingGoods(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/artist/${encodeURIComponent(artist as string)}/goods`);
      
      if (response.ok) {
        const data = await response.json();
        setGoodsData(data.goods || []);
      }
    } catch (err) {
      console.error('Error fetching goods:', err);
    } finally {
      setLoadingGoods(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'news' && newsData.length === 0 && !loadingNews) {
      fetchNewsData();
    } else if (activeTab === 'goods' && goodsData.length === 0 && !loadingGoods) {
      fetchGoodsData();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !artistData) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-400">{error || '아티스트 정보를 찾을 수 없습니다'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const artistNormalized = artistData.artist_normalized || artistData.artist;

  return (
    <Layout>
      <Head>
        <title>{artistData.artist} - KPOP Ranker</title>
        <meta name="description" content={`${artistData.artist}의 실시간 차트 순위 및 트랙 정보`} />
      </Head>

      <div className="min-h-screen bg-[#0A0A0F]">
        {/* 헤더 섹션 - 네온 그라디언트 */}
        <div className="relative bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 backdrop-blur-xl border-b border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0F]/50" />
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* 아티스트 이미지 */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl ring-4 ring-purple-500/50">
                  <ImageWithFallback
                    src={
                      artistData.tracks.length > 0 && artistData.tracks[0].album_image
                        ? artistData.tracks[0].album_image
                        : `/api/album-image-smart/${encodeURIComponent(artistNormalized)}/profile`
                    }
                    alt={artistData.artist}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-600/20 to-transparent" />
              </motion.div>

              {/* 아티스트 정보 */}
              <div className="flex-1 text-center md:text-left">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2"
                >
                  {artistData.artist}
                </motion.h1>
                {artistData.artist_normalized && artistData.artist !== artistData.artist_normalized && (
                  <p className="text-xl text-gray-300 mb-4">{artistData.artist_normalized}</p>
                )}
                
                {/* 통계 - 네온 효과 */}
                <div className="flex flex-wrap gap-6 justify-center md:justify-start mt-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-purple-400">{artistData.stats.total_tracks}</div>
                    <div className="text-sm text-gray-400">{t('artist.stats.tracks')}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-pink-400">{Object.keys(artistData.stats.chart_presence).length}</div>
                    <div className="text-sm text-gray-400">{t('artist.stats.charts')}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-yellow-400">
                      {artistData.stats.best_overall_rank ? `#${artistData.stats.best_overall_rank}` : '-'}
                    </div>
                    <div className="text-sm text-gray-400">{t('artist.stats.peak')}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-cyan-400">{artistData.stats.global_popularity_score}%</div>
                    <div className="text-sm text-gray-400">{t('artist.stats.popularity')}</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 - 다크 테마 */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 sticky top-16 z-10">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('charts')}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === 'charts'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                {t('artist.tabs.charts')}
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === 'news'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <FaNewspaper className="inline mr-2" />
                {t('artist.tabs.news')}
              </button>
              <button
                onClick={() => setActiveTab('goods')}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === 'goods'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <FaShoppingBag className="inline mr-2" />
                {t('artist.tabs.goods')}
              </button>
            </div>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* 차트 탭 */}
            {activeTab === 'charts' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {artistData.tracks.length > 0 ? (
                  artistData.tracks.map((track, index) => (
                    <motion.div
                      key={track.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-xl p-6 hover:shadow-xl transition-all hover:border-purple-500/50"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* 트랙 정보 */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-24 h-24 rounded-lg overflow-hidden shadow-lg">
                            <ImageWithFallback
                              src={track.album_image}
                              alt={track.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{track.name}</h3>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-1 text-sm">
                                <FaFire className="text-orange-500" />
                                <span className="text-orange-400">{t('artist.trendScore')}: {track.trend_score}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/track/${encodeURIComponent(artistData.artist)}/${encodeURIComponent(track.name)}`)}
                              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
                            >
                              {t('artist.viewDetails')}
                            </button>
                          </div>
                        </div>

                        {/* 차트별 순위 - 2x4 그리드로 크게 표시 */}
                        <div className="grid grid-cols-4 md:grid-cols-4 gap-3 lg:w-[500px]">
                          {Object.entries(CHART_CONFIG).map(([chartKey, config]) => {
                            const chartData = track.charts[chartKey as keyof typeof track.charts];
                            const isInChart = chartData.in_chart;
                            const rank = chartData.rank;

                            return (
                              <motion.div
                                key={chartKey}
                                whileHover={{ scale: 1.05 }}
                                className={`relative p-3 rounded-lg border ${config.borderColor} ${config.bgColor} ${
                                  isInChart ? 'opacity-100' : 'opacity-40'
                                } transition-all backdrop-blur-sm`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl mb-1">{config.icon}</div>
                                  <div className="text-xs font-medium text-gray-400 mb-1">
                                    {config.name}
                                  </div>
                                  {isInChart && rank !== null ? (
                                    <>
                                      <div className={`text-lg font-bold ${
                                        rank <= 10 ? 'text-yellow-400' :
                                        rank <= 50 ? 'text-orange-400' :
                                        'text-gray-300'
                                      }`}>
                                        #{rank}
                                      </div>
                                      {chartData.views_or_streams && (
                                        <div className="text-[10px] text-gray-500 truncate mt-1">
                                          {chartData.views_or_streams}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-sm text-gray-600">-</div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">차트에 진입한 트랙이 없습니다.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 뉴스 탭 */}
            {activeTab === 'news' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {loadingNews ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-400">뉴스를 불러오는 중...</p>
                  </div>
                ) : newsData.length > 0 ? (
                  <div className="space-y-4">
                    {newsData.map((news, index) => (
                      <motion.a
                        key={index}
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="block glass-card rounded-lg hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="flex-shrink-0">
                            {news.image ? (
                              <img
                                src={news.image}
                                alt={news.title}
                                className="w-[120px] h-[80px] rounded-lg object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/120x80?text=News';
                                }}
                              />
                            ) : (
                              <div className="w-[120px] h-[80px] rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                                <FaNewspaper className="text-purple-400 text-2xl" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-1 line-clamp-2">
                              {news.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                              {news.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <FaCalendar />
                                {news.date}
                              </span>
                              <span>{news.source}</span>
                              <span className="flex items-center gap-1 text-purple-400">
                                기사 보기
                                <FaExternalLinkAlt />
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaNewspaper className="text-6xl text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">현재 관련 뉴스가 없습니다.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 굿즈 탭 */}
            {activeTab === 'goods' && (
              <motion.div
                key="goods"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {loadingGoods ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-400">굿즈를 불러오는 중...</p>
                  </div>
                ) : goodsData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goodsData.map((goods, index) => (
                      <motion.a
                        key={index}
                        href={goods.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="block glass-card rounded-lg overflow-hidden hover:border-purple-500/50 transition-all"
                      >
                        <div className="aspect-w-1 aspect-h-1">
                          <img
                            src={goods.image}
                            alt={goods.name}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(artistNormalized)}`;
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-white mb-2 line-clamp-2">
                            {goods.name}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-purple-400">
                              {goods.price}
                            </span>
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-400" />
                              <span className="text-sm text-gray-400">
                                {goods.rating} ({goods.review_count})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{goods.shop}</span>
                            <span className="flex items-center gap-1 text-purple-400">
                              구매하기
                              <FaExternalLinkAlt />
                            </span>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaShoppingBag className="text-6xl text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">현재 판매 중인 굿즈가 없습니다.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
