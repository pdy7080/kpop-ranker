import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import UnifiedSearch from '@/components/UnifiedSearch';
import ChartUpdateStatus from '@/components/ChartUpdateStatus';
import { motion } from 'framer-motion';
import { trendingApi } from '@/lib/api';
import { FaFire, FaRocket, FaChartLine, FaBolt, FaGlobeAsia, FaCheck, FaStar, FaHeart, FaTrophy, FaClock, FaDatabase, FaSearch, FaMusic, FaChevronRight } from 'react-icons/fa';
import { HiLightningBolt } from 'react-icons/hi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { searchApi } from '@/lib/api';

interface TrendingArtist {
  id: number;
  name: string;
  profile_image: string | null;
  current_rank: number | null;
  rank_change: number | null;
  trend_score: number;
}

interface TrendingTrack {
  id: number;
  name: string;
  artist: string;
  profile_image: string | null;
  album_image: string | null;
  rank: number;
}

interface TrendingResponse {
  tracks?: any[];
  artists?: any[];
  results?: any[];
}

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [trendingArtists, setTrendingArtists] = useState<TrendingArtist[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    setIsLoading(true);
    try {
      const response = await trendingApi.getTrending('hot', 10) as TrendingResponse;
      console.log('Trending response:', response);
      
      // API가 { tracks: [], artists: [] } 형태로 반환
      if (response) {
        // tracks 데이터 처리
        if (response.tracks) {
          setTrendingTracks(response.tracks.slice(0, 10));
        } else if (response.results) {
          // 대체 형식
          setTrendingTracks(response.results.slice(0, 10).map((item: any, index: number) => ({
            id: index + 1,
            name: item.track,
            artist: item.artist,
            profile_image: null,
            album_image: item.album_image,
            rank: item.best_ranking || item.rank || (index + 1)
          })));
        }
        
        // artists 데이터 처리
        if (response.artists) {
          setTrendingArtists(response.artists.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (artist: string, track: string) => {
    if (typeof window === 'undefined') return;
    
    if (!mounted) {
      toast.error('페이지 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!track || track.trim() === '') {
      router.push(`/artist/${encodeURIComponent(artist)}`);
      return;
    }
    
    const loadingToast = toast.loading('검색 중...');
    
    try {
      // artist와 track을 합쳐서 검색 쿼리로 만들기
      const searchQuery = track ? `${artist} ${track}` : artist;
      const response = await searchApi.search(searchQuery);
      
      if (response && response.charts) {
        const foundInAnyChart = Object.values(response.charts).some(
          (chart: any) => chart.found === true
        );
        
        if (foundInAnyChart) {
          toast.dismiss(loadingToast);
          router.push({
            pathname: '/search',
            query: { artist, track }
          });
        } else {
          toast.dismiss(loadingToast);
          toast.error('검색 결과가 없습니다. 다른 검색어로 시도해주세요.');
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error('검색에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('검색 중 오류가 발생했습니다.');
      console.error('Search error:', error);
    }
  };

  if (!mounted) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>KPOP FANfolio - 실시간 K-POP 차트 통합 모니터링</title>
        <meta name="description" content="Spotify, YouTube, Billboard, 멜론 등 전 세계 7개 주요 음원 차트를 한 곳에서! 실시간 자동 업데이트로 최신 순위를 확인하세요." />
        <meta property="og:title" content="KPOP FANfolio - 실시간 K-POP 차트 모니터링" />
        <meta property="og:description" content="7개 글로벌 & 국내 차트를 실시간으로 한눈에! 매일 자동 업데이트" />
        <meta property="og:type" content="website" />
        <meta name="keywords" content="K-POP,케이팝,차트,순위,실시간,모니터링,Spotify,YouTube,Billboard,멜론,지니,벅스" />
      </Head>
      
      <Layout>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10"></div>
          
          <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {/* 실시간 업데이트 배지 */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full text-sm font-bold text-red-600 dark:text-red-400 mb-8 relative">
                <span className="absolute -left-1 -top-1 h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <HiLightningBolt className="w-4 h-4 ml-2" />
                <span>매일 실시간 차트 자동 업데이트</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  7개 차트
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  한 곳에서 확인
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-2 font-medium max-w-3xl mx-auto">
                최애 아티스트의 글로벌 & 국내 차트 순위
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Spotify, YouTube, Billboard, 멜론, 지니, 벅스를 한눈에!
              </p>
            </motion.div>
            
            {/* 검색창 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <UnifiedSearch />
            </motion.div>

            {/* 실시간 업데이트 현황 - 강조 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-purple-900/10 to-pink-900/10 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 backdrop-blur-sm border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FaDatabase className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    실시간 차트 데이터 현황
                  </h3>
                </div>
                <ChartUpdateStatus className="max-w-4xl mx-auto" />
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-3 text-center">
                  매일 자동 크롤링으로 최신 차트 데이터 업데이트
                </p>
              </div>
            </motion.div>

            {/* 핵심 가치 제안 - 3개 아이콘 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-3">
                  <FaMusic className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">통합 검색</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  아티스트와 곡명으로 간편 검색
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-3">
                  <FaClock className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">실시간 업데이트</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  매일 자동 크롤링 시스템
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-3">
                  <FaGlobeAsia className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">7개 차트 통합</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  글로벌 + 국내 모든 차트
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 왜 KPOP FANfolio인가? */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                왜 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">KPOP FANfolio</span>인가?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                K-POP 팬들을 위한 최고의 차트 모니터링 서비스
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <FaChartLine className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">한눈에 보는 순위</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  흩어져 있는 차트 사이트를 일일이 확인할 필요 없이, 
                  한 곳에서 모든 순위를 확인하세요.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full font-medium">편리함</span>
                  <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-full font-medium">시간절약</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <FaRocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">팬덤 활동 지원</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  순위가 떨어진 차트를 파악하고, 팬클럽과 함께 
                  스트리밍 파워를 집중할 수 있어요.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-medium">전략적</span>
                  <span className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-full font-medium">효과적</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <FaBolt className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">최신 데이터 보장</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  매일 자동으로 업데이트되는 시스템으로 
                  항상 최신 차트 데이터를 제공합니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-medium">실시간</span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-medium">정확함</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 차트 Coverage */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">글로벌 & 국내</span>
                <br />7개 주요 차트
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                전 세계 K-POP 팬들이 가장 주목하는 플랫폼
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Spotify", emoji: "🎧", type: "global", color: "from-green-400 to-green-600", desc: "글로벌 스트리밍" },
                { name: "YouTube", emoji: "📺", type: "global", color: "from-red-400 to-red-600", desc: "뮤직비디오" },
                { name: "Apple Music", emoji: "🎵", type: "global", color: "from-gray-400 to-gray-600", desc: "프리미엄 음원" },
                { name: "Billboard", emoji: "📊", type: "global", color: "from-purple-400 to-purple-600", desc: "공식 차트" },
                { name: "Melon", emoji: "🍈", type: "korea", color: "from-green-400 to-green-600", desc: "국내 1위" },
                { name: "Genie", emoji: "🧞", type: "korea", color: "from-blue-400 to-blue-600", desc: "실시간 차트" },
                { name: "Bugs", emoji: "🐛", type: "korea", color: "from-orange-400 to-orange-600", desc: "일간 차트" }
              ].map((chart, index) => (
                <motion.div
                  key={chart.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center hover:scale-105 transition-all border-2 border-gray-100 dark:border-gray-700 hover:border-transparent hover:shadow-2xl group relative overflow-hidden"
                >
                  <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform">
                    {chart.emoji}
                  </div>
                  <p className="font-bold text-base mb-1">{chart.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{chart.desc}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full inline-block bg-gradient-to-r ${chart.color} text-white`}>
                    {chart.type === 'global' ? '글로벌' : '국내'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                지금 바로 시작하세요!
              </h2>
              <p className="text-xl mb-8 opacity-95">
                최애 아티스트의 실시간 차트 순위를 확인하고<br />
                팬덤과 함께 1위를 향해 달려보세요
              </p>
              <div className="max-w-2xl mx-auto mb-8">
                <UnifiedSearch />
              </div>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  <span>100% 무료</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  <span>회원가입 없이 OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  <span>매일 실시간 업데이트</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
}
