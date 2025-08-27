import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { trendingApi, chartStatusAPI } from '@/lib/api';
import ImageWithFallback from '@/components/ImageWithFallback';
import UnifiedSearch from '@/components/UnifiedSearch';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import TopChampionsSection from '@/components/TopChampionsSection';
import TrendingGallery from '@/components/TrendingGallery';
import { 
  TrendingUp, Music, Award, Flame, ChevronRight,
  Activity, Sparkles, BarChart3, Globe, Star,
  Zap, Users, Radio, Headphones, Crown, Play,
  Clock, Heart, Eye, Trophy
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
  local_image?: string;
  has_real_image?: boolean;
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

export default function Home() {
  const router = useRouter();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [topTracks, setTopTracks] = useState<TrendingTrack[]>([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    activeCharts: 8,
    lastUpdate: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 트렌딩 데이터 가져오기
      console.log('🔥 Fetching trending data from:', `${API_URL}/api/trending?limit=20`);
      const response = await fetch(`${API_URL}/api/trending?limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Trending API Response:', data);
        
        if (data?.trending && Array.isArray(data.trending)) {
          // 이미지 URL 처리
          const processedTracks = data.trending.map((track: any) => {
            let imageUrl = track.image_url;
            
            // 이미지가 없거나 has_real_image가 false인 경우 Smart API 사용
            if (!imageUrl || !track.has_real_image) {
              imageUrl = `${API_URL}/api/album-image-smart/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`;
            } else if (!imageUrl.startsWith('http')) {
              imageUrl = imageUrl.startsWith('/') ? `${API_URL}${imageUrl}` : imageUrl;
            }
            
            return {
              ...track,
              image_url: imageUrl
            };
          });
          
          setTrendingTracks(processedTracks);
          setTopTracks(processedTracks.slice(0, 3)); // TOP 3 저장
          
          console.log('✅ Trending tracks set:', processedTracks.length);
          console.log('✅ Top 3 tracks set:', processedTracks.slice(0, 3));
        } else {
          console.log('⚠️ No trending data found in response');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch trending:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 API Request:', `${API_URL}/api/chart/update-status`);
      
      const response = await fetch(`${API_URL}/api/chart/update-status`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        
        // 고유 아티스트 수 계산 (추정)
        const estimatedArtists = Math.floor((data.total_tracks || 0) / 5); // 1인당 평균 5곡
        
        setStats({
          totalTracks: data.total_tracks || 992,
          totalArtists: estimatedArtists || 200,
          activeCharts: data.charts?.length || 8,
          lastUpdate: data.last_updated || new Date().toISOString()
        });
        
        console.log('✅ Stats updated:', {
          totalTracks: data.total_tracks,
          totalArtists: estimatedArtists,
          activeCharts: data.charts?.length
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      // 폴백 데이터
      setStats({
        totalTracks: 992,
        totalArtists: 200,
        activeCharts: 8,
        lastUpdate: new Date().toISOString()
      });
    }
  };

  // 차트 정보 렌더링
  const renderChartInfo = (charts: Record<string, number | string>) => {
    const entries = Object.entries(charts);
    const rankCharts = entries.filter(([chart, value]) => 
      chart !== 'youtube' && typeof value === 'number' && value > 0
    );
    const youtubeData = entries.find(([chart]) => chart === 'youtube');

    return (
      <div className="flex flex-wrap gap-1">
        {/* 순위 차트들 */}
        {rankCharts.slice(0, 3).map(([chart, rank]) => (
          <ChartRankDisplay
            key={chart}
            chartName={chart}
            rank={rank as number}
            displayType="badge"
          />
        ))}
        
        {/* YouTube 조회수 */}
        {youtubeData && youtubeData[1] && (
          <div className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
            <Play className="w-3 h-3" />
            {formatViews(youtubeData[1])}
          </div>
        )}
      </div>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트 통합 플랫폼</title>
        <meta name="description" content="전 세계 K-POP 차트를 한눈에 - Melon, Genie, Spotify, Apple Music 등 8개 차트 실시간 모니터링" />
      </Head>

      <div className="min-h-screen bg-gray-900">

        {/* Hero Section */}
        <div className="relative">
          <div className="container mx-auto px-4 py-12">
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="mb-6"
              >
                <h1 className="text-5xl md:text-6xl font-black text-white mb-3">
                  <span className="text-indigo-400">KPOP</span>
                  <span className="ml-3">RANKER</span>
                </h1>
              </motion.div>
              
              <p className="text-lg md:text-xl text-gray-400 font-light">
                전 세계 K-POP 차트를 한눈에
              </p>
              
              {/* Live Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 mt-3"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm text-gray-400">LIVE</span>
              </motion.div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <UnifiedSearch />
            </motion.div>

            {/* Stats - Clean */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-8 mb-16"
            >
              {[
                { label: '총 트랙 수', value: stats.totalTracks.toLocaleString() },
                { label: '아티스트 수', value: stats.totalArtists.toLocaleString() },
                { label: '차트 수', value: stats.activeCharts }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Top Champions Section - 새로운 TOP 3 섹션 */}
            {!isLoading && trendingTracks.length > 0 && (
              <TopChampionsSection 
                trendingTracks={trendingTracks}
                stats={{
                  totalTracks: stats.totalTracks,
                  totalArtists: stats.totalArtists,
                  activeCharts: stats.activeCharts,
                  lastUpdate: new Date().toLocaleString('ko-KR')
                }}
              />
            )}
          </div>
        </div>

        {/* Trending Gallery - 새로운 4x4 갤러리 */}
        {!isLoading && trendingTracks.length > 3 && (
          <TrendingGallery trendingTracks={trendingTracks} />
        )}

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="relative py-16"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Globe,
                  title: '글로벌 차트 통합',
                  description: 'Melon, Genie, Bugs, Spotify, Apple Music, Last.fm, YouTube 등 8개 차트 실시간 모니터링',
                  gradient: 'from-blue-600 to-cyan-600'
                },
                {
                  icon: Crown,
                  title: '스마트 랭킹 시스템',
                  description: 'AI 기반 트렌드 분석과 종합 스코어링 알고리즘으로 정확한 인기도 측정',
                  gradient: 'from-purple-600 to-pink-600'
                },
                {
                  icon: Radio,
                  title: '실시간 업데이트',
                  description: '매시간 자동 크롤링으로 최신 차트 정보와 YouTube 조회수까지 제공',
                  gradient: 'from-green-600 to-emerald-600'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                  <div className="relative glass-card p-8 h-full border border-white/10 hover:border-white/20 transition-all">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
