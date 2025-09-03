import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { trendingApi, chartStatusAPI, statisticsAPI } from '@/lib/api';
import UnifiedSearch from '@/components/UnifiedSearch';
import HeroSectionV3 from '@/components/HeroSectionV3';
import AlbumGalleryV3 from '@/components/AlbumGalleryV3';
import { 
  TrendingUp, Music, Award, Globe, Zap, Clock, Database, Activity, Trophy
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

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

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
  const [topTracks, setTopTracks] = useState<TrendingTrack[]>([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    activeCharts: 8,
    lastUpdate: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // fetchStats()는 fetchData 내부에서 병렬 처리되므로 제거
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 병렬 호출로 최적화
      const [trendingResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/trending?limit=10&fast=true`), // 초기 로딩은 10개만
        statisticsAPI.getStatistics()
      ]);
      
      if (trendingResponse.ok) {
        const data = await trendingResponse.json();
        console.log('Trending API Response:', data);
        
        if (data?.trending && Array.isArray(data.trending)) {
          const processedTracks = data.trending.map((track: any, index: number) => {
            let imageUrl = track.image_url;
            
            // 최적화: 상위 5개만 즉시 이미지 로딩
            if (!imageUrl || !track.has_real_image) {
              imageUrl = `${API_URL}/api/track-image-detail/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.track)}`;
            } else if (!imageUrl.startsWith('http')) {
              imageUrl = imageUrl.startsWith('/') ? `${API_URL}${imageUrl}` : imageUrl;
            }
            
            // 상위 5개만 프리로드
            if (index < 5) {
              const img = new Image();
              img.src = imageUrl;
            }
            
            return {
              ...track,
              image_url: imageUrl
            };
          });
          
          setTrendingTracks(processedTracks);
          setTopTracks(processedTracks.slice(0, 3));
          console.log('Processed tracks:', processedTracks.length);
        }
      }
      
      // 통계 데이터 처리
      if (statsResponse) {
        setStats({
          totalTracks: statsResponse.total_tracks || 350,
          totalArtists: statsResponse.total_artists || 150,
          activeCharts: 8,
          lastUpdate: statsResponse.last_update || ''
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // 에러 시 기본값 설정
      setStats({
        totalTracks: 350,
        totalArtists: 150,
        activeCharts: 8,
        lastUpdate: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트 분석</title>
        <meta name="description" content="전 세계 K-POP 차트를 실시간으로 모니터링하고 분석하는 플랫폼" />
      </Head>

      {/* Hero Section with Search */}
      <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-900/10 via-black to-black">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                KPOP
              </span>
              <span className="text-white ml-3">RANKER</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              전 세계 K-POP 차트를 한눈에
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <UnifiedSearch />
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-6 flex-wrap"
            >
              <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 px-6 py-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats.totalTracks.toLocaleString()}</div>
                <div className="text-xs text-gray-400">총 트랙 수</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-pink-500/20 px-6 py-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats.totalArtists.toLocaleString()}</div>
                <div className="text-xs text-gray-400">아티스트</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-blue-500/20 px-6 py-3 rounded-xl">
                <div className="text-2xl font-bold text-white">{stats.activeCharts}</div>
                <div className="text-xs text-gray-400">차트</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TOP 3 Champions Section with Better Title */}
      {!isLoading && topTracks.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 flex items-center justify-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-500" />
                <span className="text-gray-900">
                  CHAMPIONS
                </span>
              </h2>
              <p className="text-base text-gray-300">지금 가장 핫한 TOP 3</p>
            </motion.div>
            <HeroSectionV3 
              topTracks={topTracks} 
              onTrackClick={handleTrackClick}
            />
          </div>
        </section>
      )}

      {/* Rising Stars Gallery with Better Title */}
      {!isLoading && trendingTracks.length > 3 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2 flex items-center justify-center gap-3">
                <span className="text-3xl">🚀</span>
                <span className="text-gray-900">
                  RISING STARS
                </span>
              </h2>
              <p className="text-base text-gray-300">빠르게 상승중인 트랙들</p>
            </motion.div>
            <AlbumGalleryV3 
              tracks={trendingTracks.slice(3, 15)}
              showViewAll={true}
            />
          </div>
        </section>
      )}

      {/* Features Section - Better Visibility */}
      <section className="py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl lg:text-3xl font-bold text-center text-white mb-8"
          >
            왜 KPOP Ranker인가?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-sm border border-purple-500/30 p-6 rounded-xl text-center hover:scale-105 hover:border-purple-500/50 transition-all"
            >
              <Globe className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-lg font-bold text-white mb-2">글로벌 차트 통합</h3>
              <p className="text-sm text-gray-300">
                Melon, Genie, Spotify 등<br/>8개 차트 실시간 모니터링
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-sm border border-pink-500/30 p-6 rounded-xl text-center hover:scale-105 hover:border-pink-500/50 transition-all"
            >
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-pink-400" />
              <h3 className="text-lg font-bold text-white mb-2">스마트 랭킹</h3>
              <p className="text-sm text-gray-300">
                AI 기반 트렌드 분석과<br/>종합 스코어링 알고리즘
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm border border-blue-500/30 p-6 rounded-xl text-center hover:scale-105 hover:border-blue-500/50 transition-all"
            >
              <Clock className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-bold text-white mb-2">실시간 업데이트</h3>
              <p className="text-sm text-gray-300">
                매시간 자동 크롤링으로<br/>최신 차트 정보 제공
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
