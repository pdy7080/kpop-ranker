RankingChart/**
 * 🎯 트랙 상세 페이지 - 네온 테마 v8.1 (수정)
 * - 8개 차트 실시간 순위 표시
 * - 포트폴리오 추가/제거 기능
 * - 아티스트 페이지 이동
 * - 차트 히스토리 모달
 * - 다크 테마 통일
 * - CORS 및 특수문자 문제 해결
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import ChartHistoryModal from '@/components/ChartHistoryModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, FaSpotify, FaYoutube, FaApple, FaChartLine, 
  FaClock, FaFire, FaGlobeAsia, FaTrophy, FaArrowUp, 
  FaArrowDown, FaMinus, FaExternalLinkAlt, FaMusic,
  FaHeart, FaRegHeart, FaUser, FaHistory
} from 'react-icons/fa';
import { SiYoutubemusic, SiApplemusic } from 'react-icons/si';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';

import RankingChart from '@/components/RankingChart';
import YouTubeStats from '@/components/YouTubeStats';

// ========================================
// 타입 정의
// ========================================

interface ChartData {
  chart: string;
  rank: number;
  views?: string;
  change?: number;
  last_updated?: string;
}

interface TrackInfo {
  artist: string;
  artist_normalized?: string;
  track: string;
  album?: string;
  release_date?: string;
  genre?: string;
  charts: ChartData[];
  streaming_links?: {
    spotify?: string;
    apple_music?: string;
    youtube_music?: string;
    melon?: string;
    genie?: string;
    bugs?: string;
  };
  trend_score?: number;
}

// 차트별 설정 데이터 (8개 차트)
const CHART_CONFIG: Record<string, {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  streamingUrl?: (artist: string, track: string) => string;
}> = {
  melon: {
    name: 'Melon',
    icon: '🍉',
    color: '#00CD3C',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-400/30',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-green-600',
    streamingUrl: (artist, track) => `https://www.melon.com/search/song/index.htm?q=${encodeURIComponent(artist + ' ' + track)}`
  },
  genie: {
    name: 'Genie', 
    icon: '🧞',
    color: '#1E40AF',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-400/30',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    streamingUrl: (artist, track) => `https://www.genie.co.kr/search/searchMain?query=${encodeURIComponent(artist + ' ' + track)}`
  },
  bugs: {
    name: 'Bugs',
    icon: '🐛', 
    color: '#F97316',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-400/30',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    streamingUrl: (artist, track) => `https://music.bugs.co.kr/search/integrated?q=${encodeURIComponent(artist + ' ' + track)}`
  },
  vibe: {
    name: 'Vibe',
    icon: '🎵',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-400/30',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600',
    streamingUrl: (artist, track) => `https://vibe.naver.com/search?query=${encodeURIComponent(artist + ' ' + track)}`
  },
  flo: {
    name: 'FLO',
    icon: '🌊',
    color: '#00A9FF',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-400/30',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-cyan-600',
    streamingUrl: (artist, track) => `https://www.music-flo.com/search/all?keyword=${encodeURIComponent(artist + ' ' + track)}`
  },
  spotify: {
    name: 'Spotify',
    icon: '🎧',
    color: '#1DB954',
    bgColor: 'bg-green-600/10', 
    borderColor: 'border-green-500/30',
    gradientFrom: 'from-green-600',
    gradientTo: 'to-green-700',
    streamingUrl: (artist, track) => `https://open.spotify.com/search/${encodeURIComponent(artist + ' ' + track)}`
  },
  billboard: {
    name: 'Billboard',
    icon: '🏆',
    color: '#F59E0B',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-400/30',
    gradientFrom: 'from-yellow-500',
    gradientTo: 'to-yellow-600',
    streamingUrl: () => 'https://www.billboard.com/charts/hot-100/'
  },
  youtube: {
    name: 'YouTube',
    icon: '📺',
    color: '#FF0000',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-400/30',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-red-600',
    streamingUrl: (artist, track) => `https://www.youtube.com/results?search_query=${encodeURIComponent(artist + ' ' + track)}`
  }
};

// 순위 변동 아이콘 표시
const getRankChangeIcon = (change?: number) => {
  if (!change || change === 0) return <FaMinus className="text-gray-500" />;
  if (change > 0) return <FaArrowUp className="text-green-400" />;
  return <FaArrowDown className="text-red-400" />;
};

// 순위에 따른 색상 (다크 테마용)
const getRankColor = (rank: number) => {
  if (rank <= 3) return 'text-red-400 font-bold';
  if (rank <= 10) return 'text-orange-400 font-bold';
  if (rank <= 50) return 'text-blue-400';
  return 'text-gray-400';
};

// 트렌드 스코어 계산 (가중치 적용)
const calculateTrendScore = (charts: ChartData[]) => {
  if (!charts || charts.length === 0) return 0;
  
  const weights: Record<string, number> = {
    billboard: 30,
    spotify: 25,
    youtube: 20,
    melon: 10,
    genie: 5,
    bugs: 3,
    vibe: 4,
    flo: 3
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  charts.forEach(chart => {
    if (chart.rank) {
      const chartName = chart.chart.toLowerCase();
      const weight = weights[chartName] || 1;
      const rankScore = Math.max(0, 101 - chart.rank);
      totalScore += (rankScore * weight) / 100;
      totalWeight += weight;
    }
  });
  
  const averageScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  return Math.min(100, Math.round(averageScore));
};

// 아티스트 이름 정리 함수 (특수문자 처리)
const getSimpleArtistName = (artist: string): string => {
  // 복잡한 콜라보 아티스트 이름에서 첫 번째 아티스트만 추출
  // "HUNTR/X & EJAE & ..." => "HUNTR"
  const cleanedName = artist
    .split(/[&,\/]/)[0]  // &, ,, / 로 분리하여 첫 번째만
    .trim()
    .replace(/[^a-zA-Z0-9가-힣\s]/g, ''); // 특수문자 제거
  
  return cleanedName || artist; // 만약 정리 후 빈 문자열이면 원본 반환
};

// ========================================
// 메인 컴포넌트
// ========================================

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, track } = router.query;
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'history'>('overview');
  const [error, setError] = useState<string | null>(null);
  
  // 포트폴리오 상태
  const [isInPortfolio, setIsInPortfolio] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  
  // 히스토리 모달 상태
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>('');
  const [selectedChartRank, setSelectedChartRank] = useState<number>(0);

  useEffect(() => {
    if (artist && track) {
      fetchTrackData(artist as string, track as string);
      checkPortfolioStatus();
    }
  }, [artist, track]);

  // 포트폴리오 상태 확인
  const checkPortfolioStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${apiUrl}/api/portfolio`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
        // credentials: 'include' 제거 (CORS 문제 해결)
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
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (loadingPortfolio) return;
    
    setLoadingPortfolio(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('auth_token');
      
      if (isInPortfolio) {
        // 제거 로직
        const response = await fetch(`${apiUrl}/api/portfolio`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          // credentials: 'include' 제거
          body: JSON.stringify({
            artist: trackInfo?.artist || artist,
            track: trackInfo?.track || track
          })
        });

        if (response.ok) {
          toast.success('포트폴리오에서 제거되었습니다');
          setIsInPortfolio(false);
        }
      } else {
        // 추가 로직
        const response = await fetch(`${apiUrl}/api/portfolio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          // credentials: 'include' 제거
          body: JSON.stringify({
            artist: trackInfo?.artist || artist,
            track: trackInfo?.track || track
          })
        });

        if (response.ok) {
          toast.success('포트폴리오에 추가되었습니다', {
            id: 'portfolio-add',
            duration: 3000
          });
          setIsInPortfolio(true);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || '포트폴리오 추가 실패');
        }
      }
    } catch (error) {
      console.error('포트폴리오 토글 오류:', error);
      toast.error('작업 중 오류가 발생했습니다');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // 아티스트 페이지로 이동 (특수문자 처리)
  const navigateToArtistPage = () => {
    const simpleArtistName = getSimpleArtistName(trackInfo?.artist || artist as string);
    router.push(`/artist/${encodeURIComponent(simpleArtistName)}`);
  };

  // 차트 히스토리 보기 (아티스트 이름 간소화)
  const openChartHistory = (chartName: string, rank: number) => {
    setSelectedChart(chartName);
    setSelectedChartRank(rank);
    setHistoryModalOpen(true);
  };

  const fetchTrackData = async (artistName: string, trackName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // 먼저 track API 시도
      const response = await fetch(`${apiUrl}/api/track/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Track API data:', data);
        
        // 차트 이름을 소문자로 정규화
        if (data.charts && Array.isArray(data.charts)) {
          data.charts = data.charts.map((chart: any) => ({
            ...chart,
            chart: chart.chart.toLowerCase()
          }));
        }
        
        // trend_score 재계산
        if (!data.trend_score || data.trend_score < 5) {
          data.trend_score = calculateTrendScore(data.charts);
        }
        
        setTrackInfo(data);
        return;
      }
      
      // 여러 API 엔드포인트 시도
      const endpoints = [
        `/api/charts/summary/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`,
        `/api/search?q=${encodeURIComponent(artistName + ' ' + trackName)}`
      ];

      let data = null;
      let success = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${apiUrl}${endpoint}`);
          if (response.ok) {
            const result = await response.json();
            
            // API 응답 형식에 따라 데이터 변환
            if (result.charts) {
              // charts/summary 형식
              data = transformChartsData(result, artistName, trackName);
              success = true;
              break;
            } else if (result.results) {
              // search2 형식
              data = transformSearchData(result, artistName, trackName);
              success = true;
              break;
            } else if (result.track_info) {
              // track API 형식
              data = transformTrackData(result, artistName, trackName);
              success = true;
              break;
            }
          }
        } catch (err) {
          console.error(`Failed to fetch from ${endpoint}:`, err);
        }
      }

      if (!success) {
        // 모든 API 실패 시 기본 데이터 생성
        data = createDefaultData(artistName, trackName);
      }

      setTrackInfo(data);
    } catch (error) {
      console.error('Failed to fetch track data:', error);
      setError('트랙 정보를 불러올 수 없습니다');
      setTrackInfo(createDefaultData(artistName, trackName));
    } finally {
      setIsLoading(false);
    }
  };

  // charts/summary API 응답 변환
  const transformChartsData = (data: any, artistName: string, trackName: string): TrackInfo => {
    const charts: ChartData[] = [];
    
    Object.entries(data.charts || {}).forEach(([chartName, chartInfo]: [string, any]) => {
      if (chartInfo.rank) {
        charts.push({
          chart: chartName.toLowerCase(), // 소문자로 통일
          rank: chartInfo.rank,
          views: chartInfo.views || chartInfo.views_or_streams,
          change: chartInfo.change,
          last_updated: chartInfo.last_update
        });
      }
    });

    return {
      artist: data.found_artist || data.artist || artistName,
      artist_normalized: data.artist_normalized,
      track: data.found_track || data.track || trackName,
      album: data.album,
      release_date: data.release_date,
      genre: 'K-POP',
      charts,
      trend_score: calculateTrendScore(charts)
    };
  };

  // search2 API 응답 변환
  const transformSearchData = (data: any, artistName: string, trackName: string): TrackInfo => {
    const charts: ChartData[] = [];
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((item: any) => {
        charts.push({
          chart: item.chart,
          rank: item.rank,
          views: item.views,
          last_updated: item.created_at
        });
      });
    }

    return {
      artist: data.artist || artistName,
      artist_normalized: data.artist_normalized,
      track: data.track || trackName,
      charts,
      trend_score: calculateTrendScore(charts)
    };
  };

  // track API 응답 변환
  const transformTrackData = (data: any, artistName: string, trackName: string): TrackInfo => {
    const charts: ChartData[] = [];
    
    if (data.current_positions) {
      Object.entries(data.current_positions).forEach(([chartName, rank]) => {
        charts.push({
          chart: chartName.toLowerCase(), // 소문자로 통일
          rank: rank as number
        });
      });
    }

    return {
      artist: data.track_info?.artist || artistName,
      track: data.track_info?.title || trackName,
      album: data.track_info?.album,
      release_date: data.track_info?.release_date,
      genre: data.track_info?.genre || 'K-POP',
      charts,
      streaming_links: data.streaming_links,
      trend_score: calculateTrendScore(charts)
    };
  };

  // 기본 데이터 생성
  const createDefaultData = (artistName: string, trackName: string): TrackInfo => {
    return {
      artist: artistName,
      track: trackName,
      album: 'Unknown Album',
      release_date: '2024',
      genre: 'K-POP',
      charts: [],
      trend_score: 0
    };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!trackInfo) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">트랙을 찾을 수 없습니다</h2>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const artistNormalized = trackInfo.artist_normalized || trackInfo.artist;
  const simpleArtistForHistory = getSimpleArtistName(trackInfo.artist);

  return (
    <Layout>
      <Head>
        <title>{trackInfo.track} - {trackInfo.artist} | KPOP Ranker</title>
        <meta name="description" content={`${trackInfo.artist}의 ${trackInfo.track} 실시간 차트 순위`} />
      </Head>

      <div className="min-h-screen bg-[#0A0A0F] text-white">

        <RankingChart artist={artist} track={trackInfo?.track || ''} />
        <YouTubeStats artist={artist} track={trackInfo?.track || ''} />

        {/* 헤더 섹션 - 네온 그라디언트 */}
        <div className="relative bg-gradient-to-b from-purple-900/50 to-transparent backdrop-blur-xl border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20" />
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* 앨범 이미지 */}
              <motion.div 
                className="relative w-64 h-64 rounded-2xl overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
                <ImageWithFallback
                  src={`/api/album-image-smart/${encodeURIComponent(artistNormalized)}/${encodeURIComponent(trackInfo.track)}`}
                  alt={trackInfo.track}
                  width={256}
                  height={256}
                  className="relative z-10 w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 ring-2 ring-white/20 rounded-2xl" />
              </motion.div>

              {/* 트랙 정보 */}
              <motion.div 
                className="flex-1 text-center md:text-left"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {trackInfo.track}
                </h1>
                <h2 className="text-2xl md:text-3xl text-gray-300 mb-6">
                  {trackInfo.artist}
                </h2>
                
                <div className="flex flex-wrap gap-4 mb-6 text-gray-400">
                  {trackInfo.genre && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                      🎵 {trackInfo.genre}
                    </span>
                  )}
                  {trackInfo.album && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                      💿 {trackInfo.album}
                    </span>
                  )}
                  {trackInfo.release_date && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                      📅 {trackInfo.release_date}
                    </span>
                  )}
                </div>

                {/* 액션 버튼들 */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {/* 아티스트 페이지 이동 버튼 (특수문자 처리) */}
                  <motion.button
                    onClick={navigateToArtistPage}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-400 rounded-full flex items-center gap-2 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaUser />
                    {t('artist.page')}
                  </motion.button>

                  {/* 포트폴리오 추가/제거 버튼 */}
                  <motion.button
                    onClick={togglePortfolio}
                    disabled={loadingPortfolio}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                      isInPortfolio 
                        ? 'bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/50 text-pink-400'
                        : 'bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/50 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isInPortfolio ? <FaHeart /> : <FaRegHeart />}
                    {loadingPortfolio ? t('message.loading') : isInPortfolio ? '포트폴리오에서 제거' : t('portfolio.add')}
                  </motion.button>
                </div>

                {/* 스트리밍 버튼 */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={() => window.open(CHART_CONFIG.spotify.streamingUrl(trackInfo.artist, trackInfo.track), '_blank')}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-full flex items-center gap-2 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSpotify />
                    Spotify
                  </motion.button>
                  <motion.button
                    onClick={() => window.open(CHART_CONFIG.youtube.streamingUrl(trackInfo.artist, trackInfo.track), '_blank')}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-full flex items-center gap-2 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaYoutube />
                    YouTube
                  </motion.button>
                  <motion.button
                    onClick={() => window.open(`https://music.apple.com/search?term=${encodeURIComponent(trackInfo.artist + ' ' + trackInfo.track)}`, '_blank')}
                    className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-400 rounded-full flex items-center gap-2 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaApple />
                    Apple Music
                  </motion.button>
                  <motion.button
                    onClick={() => window.open(`https://music.youtube.com/search?q=${encodeURIComponent(trackInfo.artist + ' ' + trackInfo.track)}`, '_blank')}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-full flex items-center gap-2 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SiYoutubemusic />
                    YT Music
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 - 다크 테마 */}
        <div className="sticky top-16 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t('chart.tabs.overview')}
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === 'charts'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t('chart.tabs.chart')}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-2 border-b-2 font-medium transition-all ${
                  activeTab === 'history'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t('chart.tabs.history')}
              </button>
            </div>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* 현재 차트 순위 */}
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <FaChartLine className="text-purple-400" />
                    {t('chart.current.rank')}
                  </h2>
                  
                  {trackInfo.charts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(CHART_CONFIG).map(([chartKey, config]) => {
                        const chartData = trackInfo.charts.find(
                          c => c.chart.toLowerCase() === chartKey.toLowerCase()
                        );
                        
                        return (
                          <motion.div
                            key={chartKey}
                            className={`relative p-3 rounded-lg border ${config.borderColor} ${config.bgColor} group hover:scale-105 transition-all cursor-pointer ${
                              !chartData && 'opacity-50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => chartData && openChartHistory(chartKey, chartData.rank)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{config.icon}</span>
                                <span className="text-xs font-medium text-gray-300">{config.name}</span>
                              </div>
                              {chartData && (
                                <FaHistory className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                            
                            {chartData ? (
                              <div className="space-y-1">
                                <div className={`text-xl font-bold ${getRankColor(chartData.rank)}`}>
                                  #{chartData.rank}
                                </div>
                                {chartData.change !== undefined && (
                                  <div className="flex items-center gap-1">
                                    {getRankChangeIcon(chartData.change)}
                                    <span className="text-xs text-gray-400">
                                      {Math.abs(chartData.change || 0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                <div className="text-lg">-</div>
                                <div className="text-xs">{t('chart.out')}</div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      현재 차트 데이터가 없습니다
                    </div>
                  )}
                </div>

                {/* 트렌딩 스코어 */}
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <FaFire className="text-orange-400" />
                    {t('chart.trending.score')}
                  </h2>
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="16"
                          fill="none"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="url(#gradient)"
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${(trackInfo.trend_score || 0) * 5.52} 552`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient">
                            <stop offset="0%" stopColor="#9333EA" />
                            <stop offset="50%" stopColor="#EC4899" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {trackInfo.trend_score || 0}°
                        </div>
                        <div className="text-sm text-gray-400">
                          {trackInfo.trend_score && trackInfo.trend_score >= 80 ? t('track.temperature.hot') :
                           trackInfo.trend_score && trackInfo.trend_score >= 60 ? t('track.temperature.warm') :
                           trackInfo.trend_score && trackInfo.trend_score >= 40 ? t('track.temperature.normal') :
                           trackInfo.trend_score && trackInfo.trend_score >= 20 ? t('track.temperature.cool') :
                           t('track.temperature.cool')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 차트 탭 */}
            {activeTab === 'charts' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {trackInfo.charts.length > 0 ? (
                  trackInfo.charts.map((chart, index) => {
                    const chartConfig = CHART_CONFIG[chart.chart.toLowerCase()] || {
                      name: chart.chart,
                      icon: '📊',
                      color: '#6B7280',
                      bgColor: 'bg-gray-800/50',
                      borderColor: 'border-gray-700',
                      gradientFrom: 'from-gray-600',
                      gradientTo: 'to-gray-700'
                    };

                    return (
                      <motion.div
                        key={chart.chart}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${chartConfig.gradientFrom} ${chartConfig.gradientTo}`}>
                              <span className="text-3xl">{chartConfig.icon}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{chartConfig.name}</h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`text-2xl font-bold ${getRankColor(chart.rank)}`}>
                                  #{chart.rank}
                                </span>
                                {chart.change !== undefined && (
                                  <div className="flex items-center gap-1">
                                    {getRankChangeIcon(chart.change)}
                                    <span className="text-sm text-gray-400">
                                      {Math.abs(chart.change)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {chart.views && (
                                <div className="text-sm text-gray-400 mt-1">
                                  조회수: {chart.views}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {/* 히스토리 보기 버튼 */}
                            <motion.button
                              onClick={() => openChartHistory(chart.chart.toLowerCase(), chart.rank)}
                              className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg flex items-center gap-2 transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaHistory />
                              {t('track.tab.history').replace('📈 ', '')}
                            </motion.button>
                            {chartConfig.streamingUrl && (
                              <motion.button
                                onClick={() => window.open(
                                  chartConfig.streamingUrl!(trackInfo.artist, trackInfo.track),
                                  '_blank'
                                )}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaPlay />
                                재생
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <FaChartLine className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">현재 차트 데이터가 없습니다</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 히스토리 탭 */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <FaClock className="text-purple-400" />
                    {t('track.history.title')}
                  </h2>
                  {trackInfo.charts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trackInfo.charts.map((chart) => {
                        const chartConfig = CHART_CONFIG[chart.chart.toLowerCase()] || {
                          name: chart.chart,
                          icon: '📊',
                          color: '#6B7280',
                          bgColor: 'bg-gray-800/50',
                          borderColor: 'border-gray-700'
                        };

                        return (
                          <motion.div
                            key={chart.chart}
                            onClick={() => openChartHistory(chart.chart.toLowerCase(), chart.rank)}
                            className={`p-4 rounded-lg border ${chartConfig.borderColor} ${chartConfig.bgColor} cursor-pointer hover:scale-105 transition-all`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{chartConfig.icon}</span>
                                <span className="font-medium text-white">{chartConfig.name}</span>
                              </div>
                              <FaHistory className="text-gray-400" />
                            </div>
                            <div className={`text-xl font-bold ${getRankColor(chart.rank)}`}>
                              #{chart.rank}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {t('track.history.clickToView')}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <FaClock className="text-6xl text-gray-600 mx-auto mb-4" />
                      <p>차트 데이터가 없어 히스토리를 확인할 수 없습니다</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 차트 히스토리 모달 (간소화된 아티스트 이름 사용) */}
        <ChartHistoryModal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          chart={selectedChart}
          artist={simpleArtistForHistory}
          track={trackInfo.track}
          currentRank={selectedChartRank}
        />
      </div>
    </Layout>
  );
}
