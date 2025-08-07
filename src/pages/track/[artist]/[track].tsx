import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import AlbumImage from '@/components/AlbumImage';
import SmartSearchBox from '@/components/SmartSearchBox';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaTrophy, FaChartLine, FaArrowUp, FaArrowDown, FaHeart, FaRegHeart, FaCalendar, FaSpotify, FaYoutube, FaGlobe, FaExternalLinkAlt, FaCrown, FaFire } from 'react-icons/fa';
import { SiApplemusic, SiBillboard } from 'react-icons/si';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  chart: string;
  rank: number | null;
  views: string;
  album_image?: string;
  crawl_time?: string;
  rank_change?: number;
}

interface TrackData {
  artist: string;
  artist_normalized?: string;
  track: string;
  charts: ChartData[];
}

interface ChartHistory {
  date: string;
  rank: number;
  views?: string;
}

// 차트별 설정
const chartConfigs: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
  bgPattern?: string;
}> = {
  'Spotify': {
    icon: <FaSpotify className="text-2xl" />,
    gradient: 'from-green-500 to-green-600',
    accentColor: 'text-green-600',
    bgPattern: 'bg-gradient-to-br from-green-50 to-green-100'
  },
  'YouTube': {
    icon: <FaYoutube className="text-2xl" />,
    gradient: 'from-red-500 to-red-600',
    accentColor: 'text-red-600',
    bgPattern: 'bg-gradient-to-br from-red-50 to-red-100'
  },
  'Melon': {
    icon: <div className="text-2xl">🍈</div>,
    gradient: 'from-green-400 to-green-500',
    accentColor: 'text-green-500',
    bgPattern: 'bg-gradient-to-br from-green-50 to-green-100'
  },
  'Genie': {
    icon: <div className="text-2xl">🧞</div>,
    gradient: 'from-blue-400 to-blue-500',
    accentColor: 'text-blue-500',
    bgPattern: 'bg-gradient-to-br from-blue-50 to-blue-100'
  },
  'Bugs': {
    icon: <div className="text-2xl">🐛</div>,
    gradient: 'from-orange-400 to-orange-500',
    accentColor: 'text-orange-500',
    bgPattern: 'bg-gradient-to-br from-orange-50 to-orange-100'
  },
  'Vibe': {
    icon: <div className="text-2xl">💜</div>,
    gradient: 'from-purple-400 to-purple-500',
    accentColor: 'text-purple-500',
    bgPattern: 'bg-gradient-to-br from-purple-50 to-purple-100'
  },
  'Billboard': {
    icon: <SiBillboard className="text-xl" />,
    gradient: 'from-yellow-400 to-yellow-500',
    accentColor: 'text-yellow-600',
    bgPattern: 'bg-gradient-to-br from-yellow-50 to-yellow-100'
  }
};

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, track } = router.query;
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartHistory, setChartHistory] = useState<ChartHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isInPortfolio, setIsInPortfolio] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // 포트폴리오 상태 확인
  const checkPortfolioStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/portfolio`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const exists = data.items?.some((item: any) => 
          item.artist === artist && item.track === track
        );
        setIsInPortfolio(exists);
      }
    } catch (error) {
      console.error('포트폴리오 상태 확인 오류:', error);
    }
  };

  // 포트폴리오 추가/제거
  const togglePortfolio = async () => {
    setLoadingPortfolio(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (isInPortfolio) {
        // 제거 로직 (필요시 구현)
        toast.success('포트폴리오에서 제거되었습니다');
        setIsInPortfolio(false);
      } else {
        // 추가 로직
        const response = await fetch(`${apiUrl}/api/portfolio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // 세션 쿠키 포함
          body: JSON.stringify({
            artist: trackData?.artist || artist,
            track: trackData?.track || track
          })
        });

        if (response.ok) {
          toast.success('포트폴리오에 추가되었습니다');
          setIsInPortfolio(true);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || '포트폴리오 추가 실패');
        }
      }
    } catch (error) {
      console.error('포트폴리오 토글 오류:', error);
      toast.error('포트폴리오 업데이트 실패');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // 트랙 데이터 가져오기
  const fetchTrackData = async () => {
    if (!artist || !track) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(
        `${apiUrl}/api/search2?artist=${encodeURIComponent(artist as string)}&track=${encodeURIComponent(track as string)}`
      );
      
      if (!response.ok) {
        const searchResponse = await fetch(
          `${apiUrl}/api/search?artist=${encodeURIComponent(artist as string)}&track=${encodeURIComponent(track as string)}`
        );
        
        if (!searchResponse.ok) {
          throw new Error('트랙 정보를 불러올 수 없습니다');
        }
        
        const searchData = await searchResponse.json();
        processSearchData(searchData);
        return;
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const chartsData: ChartData[] = [];
        
        data.results.forEach((chartResult: any) => {
          const trackInfo = chartResult.tracks?.[0];
          if (trackInfo) {
            chartsData.push({
              chart: chartResult.chart,
              rank: trackInfo.rank,
              views: trackInfo.views_or_streams || trackInfo.views || '',
              album_image: trackInfo.album_image,
              crawl_time: trackInfo.crawl_time,
              rank_change: trackInfo.rank_change
            });
          }
        });

        setTrackData({
          artist: data.artist || (artist as string),
          artist_normalized: data.artist_normalized,
          track: data.track || (track as string),
          charts: chartsData
        });
      }
    } catch (error) {
      console.error('트랙 정보 로드 오류:', error);
      toast.error('트랙 정보를 불러올 수 없습니다');
      setTrackData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 일반 검색 데이터 처리
  const processSearchData = (data: any) => {
    const chartsData: ChartData[] = [];
    
    data.results?.forEach((chartResult: any) => {
      const trackInfo = chartResult.tracks?.find((t: any) => 
        t.track?.toLowerCase() === (track as string).toLowerCase()
      );
      
      if (trackInfo) {
        chartsData.push({
          chart: chartResult.chart,
          rank: trackInfo.rank,
          views: trackInfo.views || '',
          album_image: trackInfo.album_image
        });
      }
    });

    setTrackData({
      artist: artist as string,
      track: track as string,
      charts: chartsData
    });
  };

  // 실제 차트 히스토리 데이터 가져오기
  const fetchChartHistory = async (chartName: string) => {
    setLoadingHistory(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // artist와 track이 있는지 확인
      const artistName = trackData?.artist || artist as string;
      const trackName = trackData?.track || track as string;
      
      const response = await fetch(
        `${apiUrl}/api/chart/history/${encodeURIComponent(chartName)}/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          setChartHistory(data.history);
          return;
        }
      }

      // 실제 데이터가 없을 경우 빈 배열 설정 (시뮬레이션 데이터 사용하지 않음)
      setChartHistory([]);
      // toast.info 대신 console.log 사용 (toast.info는 지원되지 않음)
      console.log(`${chartName} 차트의 순위 변화 데이터가 아직 없습니다.`);
    } catch (error) {
      console.error('차트 히스토리 로드 오류:', error);
      // 에러 시 빈 배열 설정
      setChartHistory([]);
      // 404 에러는 데이터가 없는 것이므로 에러 토스트 표시하지 않음
      console.log('차트 히스토리 데이터 없음:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (artist && track) {
      fetchTrackData();
      checkPortfolioStatus();
    }
  }, [artist, track]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">트랙 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!trackData || trackData.charts.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">"{track}" 트랙 정보를 찾을 수 없습니다.</p>
            <p className="text-gray-500 mb-6">아티스트: {artist}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const albumImage = trackData.charts.find(chart => chart.album_image)?.album_image;

  // 차트 성과 계산
  const totalCharts = trackData.charts.length;
  const rankedCharts = trackData.charts.filter(c => c.rank !== null);
  const bestRank = rankedCharts.length > 0 
    ? Math.min(...rankedCharts.map(c => c.rank as number))
    : null;
  const averageRank = rankedCharts.length > 0
    ? Math.round(rankedCharts.reduce((sum, c) => sum + (c.rank || 0), 0) / rankedCharts.length)
    : null;

  // 차트 히스토리 그래프 데이터
  const chartHistoryData = {
    labels: chartHistory.map(h => h.date.slice(5)),
    datasets: [{
      label: '순위',
      data: chartHistory.map(h => h.rank),
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgb(147, 51, 234)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${selectedChart} 순위 변화`,
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        reverse: true,
        min: 1,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return '#' + value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>{trackData.track} - {trackData.artist} | K-POP Ranker</title>
        <meta name="description" content={`${trackData.artist}의 ${trackData.track} 차트 순위`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* 헤더 */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                {/* 앨범 이미지 */}
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <AlbumImage
                      src={albumImage}
                      alt={`${trackData.artist} - ${trackData.track}`}
                      size="xlarge"
                      artist={trackData.artist_normalized || trackData.artist}
                      artistNormalized={trackData.artist_normalized}
                      track={trackData.track}
                      className="relative z-10 rounded-2xl shadow-2xl w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
                    />
                  </div>
                </motion.div>
                
                {/* 트랙 정보 */}
                <div className="flex-1">
                  <motion.h1 
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {trackData.track}
                  </motion.h1>
                  <motion.button
                    onClick={() => router.push(`/artist/${encodeURIComponent(trackData.artist)}`)}
                    className="text-lg sm:text-xl text-gray-700 hover:text-purple-600 mt-1 transition-colors flex items-center gap-2"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {trackData.artist}
                    <FaExternalLinkAlt className="text-sm" />
                  </motion.button>
                  <motion.div 
                    className="flex items-center gap-4 mt-4"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                      <FaChartLine className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        {totalCharts}개 차트 진입
                      </span>
                    </div>
                    {/* 포트폴리오 버튼 */}
                    <button
                      onClick={togglePortfolio}
                      disabled={loadingPortfolio}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
                        isInPortfolio 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                          : 'bg-white border-2 border-purple-300 text-purple-600 hover:border-purple-500'
                      } ${loadingPortfolio ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isInPortfolio ? <FaHeart /> : <FaRegHeart />}
                      <span className="font-medium">
                        {isInPortfolio ? '포트폴리오' : '포트폴리오 추가'}
                      </span>
                    </button>
                  </motion.div>
                </div>
              </div>
              
              <div className="w-full lg:w-auto">
                <SmartSearchBox />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 차트 성과 요약 (위치 변경) */}
          <motion.div 
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaTrophy className="mr-3 text-yellow-500 text-2xl" />
                차트 성과 요약
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {totalCharts}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 font-medium">진입 차트 수</div>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-4xl font-bold text-yellow-600 flex items-center justify-center">
                    {bestRank ? (
                      <>
                        <FaCrown className="mr-2" />
                        {bestRank}
                      </>
                    ) : '-'}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 font-medium">최고 순위</div>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-4xl font-bold text-blue-600">
                    {averageRank || '-'}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 font-medium">평균 순위</div>
                </motion.div>
              </div>

              {bestRank && bestRank <= 10 && (
                <motion.div 
                  className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center justify-center text-yellow-800">
                    <FaFire className="mr-2 text-orange-500" />
                    <span className="font-medium">TOP 10 진입! 팬덤 파워가 대단해요! 🎉</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 차트별 순위 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FaChartLine className="mr-3 text-purple-600" />
              차트별 순위
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trackData.charts.map((chartInfo, index) => {
                const config = chartConfigs[chartInfo.chart] || {
                  icon: <FaGlobe className="text-2xl" />,
                  gradient: 'from-gray-400 to-gray-500',
                  accentColor: 'text-gray-600',
                  bgPattern: 'bg-gradient-to-br from-gray-50 to-gray-100'
                };

                return (
                  <motion.div
                    key={`${chartInfo.chart}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      setSelectedChart(chartInfo.chart);
                      fetchChartHistory(chartInfo.chart);
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 ${config.bgPattern}`}>
                      {/* 차트 헤더 */}
                      <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {config.icon}
                            <h3 className="font-bold text-lg">{chartInfo.chart}</h3>
                          </div>
                        </div>
                      </div>
                      
                      {/* 차트 콘텐츠 */}
                      <div className="p-6">
                        <div className="text-center">
                          {chartInfo.rank !== null ? (
                            <>
                              <motion.div 
                                className={`text-5xl font-black ${config.accentColor} mb-2`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                              >
                                #{chartInfo.rank}
                              </motion.div>
                              {chartInfo.rank_change !== undefined && chartInfo.rank_change !== 0 && (
                                <div className={`flex items-center justify-center gap-1 text-sm font-medium ${
                                  chartInfo.rank_change > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {chartInfo.rank_change > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                  <span>{Math.abs(chartInfo.rank_change)}단계</span>
                                </div>
                              )}
                              {chartInfo.views && (
                                <div className="text-sm text-gray-600 mt-3 font-medium">
                                  {chartInfo.views}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400">
                              <FaMusic className="mx-auto text-4xl mb-3" />
                              <p className="font-medium">조회수 집계</p>
                              {chartInfo.views && (
                                <div className="text-sm text-gray-600 mt-3 font-medium">
                                  {chartInfo.views}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {chartInfo.crawl_time && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center text-xs text-gray-500">
                              <FaCalendar className="mr-1" />
                              {new Date(chartInfo.crawl_time).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 차트 히스토리 모달 */}
          <AnimatePresence>
            {selectedChart && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedChart(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      {chartConfigs[selectedChart]?.icon}
                      {selectedChart} 순위 변화
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {trackData.artist} - {trackData.track}
                    </p>
                    {loadingHistory && (
                      <p className="text-sm text-purple-600 mt-2">실시간 데이터 로딩 중...</p>
                    )}
                  </div>
                  
                  <div className="h-80 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                    {chartHistory.length > 0 ? (
                      <Line data={chartHistoryData} options={chartOptions} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FaChartLine className="text-6xl mb-4 text-gray-300 mx-auto" />
                          <p className="text-lg font-medium">순위 변화 데이터가 없습니다</p>
                          <p className="text-sm mt-2">추후 데이터가 누적되면 표시됩니다</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSelectedChart(null)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-medium"
                  >
                    닫기
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}