/**
 * 🎯 아티스트 상세 페이지 - 뉴스/굿즈 탭 복원 버전
 * - 차트 순위, 뉴스, 굿즈 3개 탭 구조
 * - 네이버 뉴스 API 연동
 * - 스마트스토어 굿즈 연동
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from '@/hooks/useRouter';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaExternalLinkAlt, FaPlay, FaTrophy, FaFire, FaChartLine, FaNewspaper, FaShoppingBag, FaStar, FaCalendar } from 'react-icons/fa';
import { apiUrls } from '@/lib/apiConfig';
import toast from 'react-hot-toast';

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

interface FandomInsight {
  type: 'action_needed' | 'celebration' | 'info';
  title: string;
  message: string;
  tracks?: Array<{
    track: string;
    chart: string;
    rank: number;
  }>;
}

interface ArtistData {
  artist: string;
  artist_normalized?: string;
  variations: string[];
  tracks: Track[];
  stats: ArtistStats;
  fandom_insights: FandomInsight[];
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

// 차트별 설정 데이터
const CHART_CONFIG = {
  melon: {
    name: 'Melon',
    icon: '🍈',
    emoji: '🔥',
    color: '#00CD3C',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400/50',
    description: '국내 최대'
  },
  genie: {
    name: 'Genie', 
    icon: '🧞',
    emoji: '🚀',
    color: '#1E40AF',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400/50',
    description: '실시간 빠름'
  },
  bugs: {
    name: 'Bugs',
    icon: '🐛', 
    emoji: '📊',
    color: '#F97316',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-400/50',
    description: '다운로드 강세'
  },
  vibe: {
    name: 'Vibe',
    icon: '🎵',
    emoji: '🎶', 
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-400/50',
    description: '네이버 생태계'
  },
  spotify: {
    name: 'Spotify',
    icon: '🎧',
    emoji: '🌍',
    color: '#1DB954',
    bgColor: 'bg-green-600/20', 
    borderColor: 'border-green-500/50',
    description: '글로벌 1위'
  },
  billboard: {
    name: 'Billboard',
    icon: '🏆',
    emoji: '🇺🇸',
    color: '#F59E0B',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-400/50', 
    description: '미국 공식'
  },
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    emoji: '❤️',
    color: '#FF0000',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-400/50',
    description: '조회수'
  }
};

// 백엔드 응답을 프론트엔드 형식으로 변환하는 함수
function transformResponseToArtistData(response: any): ArtistData {
  const tracks: Track[] = [];
  const chartPresence: Record<string, number> = {};
  const bestRanks: Record<string, number> = {};
  let bestOverallRank: number | null = null;

  // artist_normalized 값 가져오기 (한글 아티스트명 이미지 문제 해결)
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
          // 🎯 HUNTR 404 오류 해결: HUNTR 변형들을 모두 HUNTR로 정규화
          let finalArtistNormalized = artistNormalized;
          if (artistNormalized && artistNormalized.includes('HUNTR')) {
            finalArtistNormalized = 'HUNTR';
          }
          
          trackMap.set(trackName, {
            name: trackName,
            // 정규화된 아티스트명으로 이미지 URL 생성
            album_image: track.album_image || `/api/album-image-v2/${encodeURIComponent(finalArtistNormalized)}/${encodeURIComponent(trackName)}`,
            charts: {
              melon: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              genie: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              bugs: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
              vibe: { rank: null, views_or_streams: null, last_updated: null, in_chart: false, rank_class: 'not-in-chart' },
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
            last_updated: track.crawl_time || track.last_updated || new Date().toISOString(),
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

    // Map을 배열로 변환하여 tracks에 추가
    trackMap.forEach((track) => {
      tracks.push(track);
    });
  }

  // 트렌드 스코어 계산
  tracks.forEach(track => {
    let score = 0;
    let chartCount = 0;
    let rankSum = 0;

    Object.entries(track.charts).forEach(([_, chartInfo]) => {
      if (chartInfo.rank !== null) {
        chartCount++;
        rankSum += chartInfo.rank;
        score += (101 - chartInfo.rank);
      }
    });

    track.trend_score = chartCount > 0 ? Math.round(score / chartCount) : 0;
  });

  // 트렌드 스코어로 정렬
  tracks.sort((a, b) => b.trend_score - a.trend_score);

  // 통계 계산
  const totalCharts = Object.keys(CHART_CONFIG).length;
  const activeCharts = Object.keys(chartPresence).length;
  const chartDiversity = activeCharts / totalCharts;
  const globalPopularityScore = Math.round(chartDiversity * 100);

  // 팬덤 인사이트 생성
  const fandomInsights: FandomInsight[] = [];
  
  if (bestOverallRank && bestOverallRank <= 10) {
    fandomInsights.push({
      type: 'celebration',
      title: '🎉 TOP 10 진입!',
      message: `${response.artist}가 주요 차트에서 TOP 10에 진입했습니다!`
    });
  }

  if (chartDiversity >= 0.8) {
    fandomInsights.push({
      type: 'info',
      title: '🌍 글로벌 인기',
      message: '대부분의 차트에서 활발한 활동을 보이고 있습니다.'
    });
  }

  return {
    artist: response.artist || '',
    artist_normalized: artistNormalized,
    variations: response.variations || [],
    tracks,
    stats: {
      total_tracks: tracks.length,
      chart_presence: chartPresence,
      best_ranks: bestRanks,
      best_overall_rank: bestOverallRank,
      global_popularity_score: globalPopularityScore,
      chart_diversity: chartDiversity,
    },
    fandom_insights: fandomInsights,
    last_updated: response.last_updated || new Date().toISOString(),
  };
}

// ========================================
// 메인 컴포넌트
// ========================================

export default function ArtistDetailPage() {
  const router = useRouter();
  const { artist } = router.query;
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
        // 🎯 핵심: /complete 경로가 포함된 정확한 API URL
        const response = await fetch(`${apiUrls.artistComplete}/${encodeURIComponent(artist as string)}/complete`);
        
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
      toast.error('뉴스를 불러올 수 없습니다');
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
      toast.error('굿즈를 불러올 수 없습니다');
    } finally {
      setLoadingGoods(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'news' && newsData.length === 0) {
      fetchNewsData();
    } else if (activeTab === 'goods' && goodsData.length === 0) {
      fetchGoodsData();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">아티스트 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !artistData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || '아티스트 정보를 찾을 수 없습니다'}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleTrackClick = (track: Track) => {
    router.push(`/track/${encodeURIComponent(artistData.artist)}/${encodeURIComponent(track.name)}`);
  };

  const firstTrackImage = artistData.tracks[0]?.album_image;
  // 🎯 HUNTR 404 오류 해결: 아티스트 메인 이미지도 정규화
  let artistNormalized = artistData.artist_normalized || artistData.artist;
  if (artistNormalized && artistNormalized.includes('HUNTR')) {
    artistNormalized = 'HUNTR';
  }

  return (
    <Layout>
      <Head>
        <title>{artistData.artist} - K-POP Ranker</title>
        <meta name="description" content={`${artistData.artist}의 차트 순위, 최신 뉴스, 굿즈 정보`} />
      </Head>

      {/* 아티스트 헤더 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={firstTrackImage || `/api/album-image-v2/${encodeURIComponent(artistNormalized)}`}
                alt={artistData.artist}
                artistName={artistData.artist}
                artistNameNormalized={artistNormalized}
                trackName={artistData.tracks[0]?.name}  // 첫 번째 트랙명 추가!
                width={200}
                height={200}
                className="rounded-xl shadow-2xl"
                priority={true}  // 우선 로딩
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold mb-4">{artistData.artist}</h1>
              {artistData.variations.length > 0 && (
                <p className="text-purple-100 mb-4">
                  {artistData.variations.join(' · ')}
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm opacity-80">총 트랙</p>
                  <p className="text-2xl font-bold">{artistData.stats.total_tracks}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm opacity-80">차트 진입</p>
                  <p className="text-2xl font-bold">{Object.keys(artistData.stats.chart_presence).length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm opacity-80">최고 순위</p>
                  <p className="text-2xl font-bold">#{artistData.stats.best_overall_rank || '-'}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm opacity-80">글로벌 점수</p>
                  <p className="text-2xl font-bold">{artistData.stats.global_popularity_score}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('charts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'charts'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaChartLine />
              차트 순위
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'news'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaNewspaper />
              뉴스
            </button>
            <button
              onClick={() => setActiveTab('goods')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'goods'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaShoppingBag />
              굿즈
            </button>
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* 차트 순위 탭 */}
          {activeTab === 'charts' && (
            <motion.div
              key="charts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* 팬덤 인사이트 */}
              {artistData.fandom_insights.length > 0 && (
                <div className="mb-8 space-y-4">
                  {artistData.fandom_insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${
                        insight.type === 'celebration' ? 'bg-green-50 border border-green-200' :
                        insight.type === 'action_needed' ? 'bg-red-50 border border-red-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <h3 className="font-bold mb-1">{insight.title}</h3>
                      <p className="text-sm">{insight.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 트랙 목록 */}
              <div className="grid gap-6">
                {artistData.tracks.map((track, index) => (
                  <motion.div
                    key={track.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleTrackClick(track)}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <ImageWithFallback
                          src={track.album_image}
                          alt={track.name}
                          artistName={artistData.artist}
                          artistNameNormalized={artistNormalized}
                          trackName={track.name}  // 트랙명 추가!
                          width={80}
                          height={80}
                          className="rounded-lg shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{track.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {track.trend_score > 70 && <FaFire className="text-red-500" />}
                            <span className="text-sm text-gray-600">
                              트렌드 점수: {track.trend_score}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 차트별 순위 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {Object.entries(CHART_CONFIG).map(([chartKey, config]) => {
                          const chartData = track.charts[chartKey as keyof typeof track.charts];
                          const isInChart = chartData.in_chart;
                          const rank = chartData.rank;

                          return (
                            <div
                              key={chartKey}
                              className={`relative p-3 rounded-lg border ${config.borderColor} ${config.bgColor} ${
                                isInChart ? 'opacity-100' : 'opacity-50'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-1">{config.icon}</div>
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  {config.name}
                                </div>
                                {isInChart && rank !== null ? (
                                  <div className={`text-lg font-bold ${
                                    rank <= 10 ? 'text-red-600' :
                                    rank <= 50 ? 'text-orange-600' :
                                    'text-gray-700'
                                  }`}>
                                    #{rank}
                                  </div>
                                ) : chartData.views_or_streams ? (
                                  <div className="text-xs text-gray-500">
                                    {chartData.views_or_streams}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400">-</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                  <p className="mt-4 text-gray-600">뉴스를 불러오는 중...</p>
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
                      className="block bg-white rounded-lg shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="flex-shrink-0">
                          {news.image ? (
                            <img
                              src={news.image}
                              alt={news.title}
                              width={120}
                              height={80}
                              className="rounded-lg object-cover w-[120px] h-[80px]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // 콘서트 기본 이미지로 폴백
                                target.src = 'https://cdn.pixabay.com/photo/2016/11/22/19/15/audience-1850119_960_720.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-[120px] h-[80px] rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                              <FaNewspaper className="text-white text-2xl" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                            {news.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {news.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaCalendar />
                              {news.date}
                            </span>
                            <span>{news.source}</span>
                            <span className="flex items-center gap-1 text-purple-600">
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
                  <p className="text-gray-500">뉴스가 없습니다.</p>
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
                  <p className="mt-4 text-gray-600">굿즈를 불러오는 중...</p>
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
                      className="block bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden"
                    >
                      <div className="aspect-w-1 aspect-h-1">
                        <img
                          src={goods.image}
                          alt={goods.name}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/api/album-image-v2/${encodeURIComponent(artistNormalized)}`;
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                          {goods.name}
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-purple-600">
                            {goods.price}
                          </span>
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span className="text-sm text-gray-600">
                              {goods.rating} ({goods.review_count})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{goods.shop}</span>
                          <span className="flex items-center gap-1 text-purple-600">
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
                  <p className="text-gray-500">굿즈가 없습니다.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
