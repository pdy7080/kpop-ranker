import React, { memo, Suspense, lazy } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { 
  TrendingUp, Music, Award, Globe, Zap, Clock, Trophy
} from 'lucide-react';

// Lazy Loading Components
const UnifiedSearch = lazy(() => import('@/components/UnifiedSearch'));
const HeroSectionV3 = lazy(() => import('@/components/HeroSectionV3'));
const AlbumGalleryV3 = lazy(() => import('@/components/AlbumGalleryV3'));

interface HomeProps {
  trending: any[];
  stats: {
    totalTracks: number;
    totalArtists: number;
    activeCharts: number;
  };
  lastUpdated: string;
}

// SSG - 빌드 시점에 데이터 페치
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // 병렬 데이터 페치
    const [trendingRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/cache/api/trending?limit=15&fast=true`).catch(() => 
        fetch(`${API_URL}/api/trending?limit=15`)
      ),
      fetch(`${API_URL}/api/main/stats/optimized`).catch(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            total_tracks: 350,
            total_artists: 150,
            active_charts: 8
          })
        })
      )
    ]);
    
    const trendingData = await trendingRes.json();
    const statsData = await statsRes.json();
    
    // 데이터 정제
    const trending = trendingData.trending?.slice(0, 15).map((track: any, index: number) => ({
      ...track,
      id: `${track.artist}-${track.track}-${index}`,
      score: track.score || Math.floor(Math.random() * 500) + 100
    })) || [];
    
    const stats = {
      totalTracks: statsData.total_tracks || 350,
      totalArtists: statsData.total_artists || 150,
      activeCharts: statsData.active_charts || 8
    };
    
    return {
      props: {
        trending,
        stats,
        lastUpdated: new Date().toISOString()
      },
      // 5분마다 재생성
      revalidate: 300
    };
  } catch (error) {
    console.error('SSG Error:', error);
    
    // 에러 시 기본값 반환
    return {
      props: {
        trending: [],
        stats: {
          totalTracks: 350,
          totalArtists: 150,
          activeCharts: 8
        },
        lastUpdated: new Date().toISOString()
      },
      revalidate: 60 // 에러 시 1분 후 재시도
    };
  }
};

// 최적화된 통계 카드
const OptimizedStatCard = memo(({ 
  icon, 
  label, 
  value, 
  delay 
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  </motion.div>
));

OptimizedStatCard.displayName = 'OptimizedStatCard';

const Home: React.FC<HomeProps> = ({ trending, stats, lastUpdated }) => {
  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트 모니터링 플랫폼</title>
        <meta name="description" content="전 세계 K-POP 차트를 실시간으로 모니터링하고 분석하는 플랫폼" />
        <meta property="og:title" content="KPOP Ranker" />
        <meta property="og:description" content="실시간 K-POP 차트 모니터링" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://kpop-ranker.vercel.app" />
      </Head>

      {/* Hero Section with Search */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              KPOP Ranker
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-400 mb-8"
          >
            전 세계 K-POP 차트를 실시간으로 모니터링하고 분석하는 플랫폼
          </motion.p>
          
          {/* Unified Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Suspense fallback={
              <div className="h-14 bg-gray-800/50 rounded-xl animate-pulse" />
            }>
              <UnifiedSearch />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OptimizedStatCard
              icon={<Music className="w-6 h-6 text-purple-400" />}
              label="총 트랙 수"
              value={stats.totalTracks}
              delay={0}
            />
            <OptimizedStatCard
              icon={<Trophy className="w-6 h-6 text-pink-400" />}
              label="아티스트"
              value={stats.totalArtists}
              delay={0.1}
            />
            <OptimizedStatCard
              icon={<Globe className="w-6 h-6 text-blue-400" />}
              label="활성 차트"
              value={stats.activeCharts}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              주요 기능
            </span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "실시간 차트 모니터링",
                description: "8개 글로벌 차트 실시간 추적"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "초고속 검색",
                description: "한글/영어 양방향 검색 지원"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "트렌드 분석",
                description: "AI 기반 인기도 분석"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "글로벌 차트",
                description: "Billboard, Spotify, Apple Music"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "실시간 업데이트",
                description: "매일 자동 업데이트"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "아티스트 랭킹",
                description: "종합 순위 시스템"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <div className="mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Album Gallery - SSR에서는 trending 데이터 전달 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              인기 트랙
            </span>
          </motion.h2>
          
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          }>
            <AlbumGalleryV3 initialData={trending} />
          </Suspense>
        </div>
      </section>

      {/* Update Time */}
      <div className="text-center text-xs text-gray-600 py-4">
        마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
      </div>
    </Layout>
  );
};

export default memo(Home);