import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import ShareModal from '@/components/ShareModal';
import { trackAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Play, Heart, Share2, BarChart3, Music, Clock, TrendingUp, 
  TrendingDown, Minus, ArrowUp, ArrowDown, Eye, Calendar,
  ExternalLink, Award, Star, Radio, Disc
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ChartData {
  chart: string;
  chart_display?: string;
  rank: number;
  change?: number;
  views?: string;
  last_updated?: string;
  last_updated_formatted?: string;
}

interface TrackInfo {
  artist: string;
  track?: string;
  title?: string;
  charts?: ChartData[];
  trend_score?: number;
  image_url?: string;
  album?: string;
  release_date?: string;
  genre?: string;
  stats?: {
    peak_rank?: number;
    chart_count?: number;
    days_on_chart?: number;
    first_charted?: string;
    best_rank?: number;
    total_charts?: number;
  };
  history?: any[];
  streaming_links?: {
    spotify?: string;
    youtube?: string;
    apple_music?: string;
  };
  total_charts?: number;
}

const CHART_COLORS: { [key: string]: string } = {
  melon: '#00CD3C',
  genie: '#1E40AF', 
  bugs: '#F97316',
  flo: '#AA40FC',
  vibe: '#EC4899',
  spotify: '#1DB954',
  youtube: '#FF0000',
  billboard: '#1F2937'
};

const CHART_NAMES: { [key: string]: string } = {
  melon: 'Melon',
  genie: 'Genie',
  bugs: 'Bugs',
  flo: 'FLO',
  vibe: 'Vibe',
  spotify: 'Spotify',
  youtube: 'YouTube',
  billboard: 'Billboard'
};

const formatViews = (views: string | number): string => {
  if (!views) return '';
  
  const num = typeof views === 'string' ? parseInt(views.replace(/[^0-9]/g, '')) : views;
  if (isNaN(num)) return '';
  
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const ChangeIndicator = ({ change }: { change?: number }) => {
  if (!change || change === 0) {
    return (
      <span className="flex items-center text-gray-400 text-sm">
        <Minus className="w-4 h-4 mr-1" />
        -
      </span>
    );
  }
  
  if (change > 0) {
    return (
      <span className="flex items-center text-green-500 text-sm font-medium">
        <ArrowUp className="w-4 h-4 mr-1" />
        {change}
      </span>
    );
  }
  
  return (
    <span className="flex items-center text-red-500 text-sm font-medium">
      <ArrowDown className="w-4 h-4 mr-1" />
      {Math.abs(change)}
    </span>
  );
};

export default function TrackDetailPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { artist, title } = router.query;
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (artist && title) {
      fetchTrackData();
    }
  }, [artist, title]);

  const fetchTrackData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎵 Fetching track data:', { artist, title });
      
      const response = await trackAPI.getTrackDetail(
        artist as string,
        title as string
      );
      
      console.log('📊 Track data received:', response);
      
      if (response) {
        setTrackInfo(response);
      } else {
        setError(t('search.no.results'));
      }
    } catch (err) {
      console.error('❌ Failed to fetch track data:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = () => {
    if (trackInfo?.artist) {
      router.push(`/artist/${encodeURIComponent(trackInfo.artist)}`);
    }
  };

  // YouTube 뛰어가기 기능 추가
  const handleWatchOnYouTube = () => {
    if (trackInfo?.artist && currentTrackTitle) {
      const searchQuery = `${trackInfo.artist} ${currentTrackTitle} official MV`.replace(/[()]/g, '');
      const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      window.open(youtubeUrl, '_blank');
    }
  };

  // 1. Spotify에서 트랙 재생
  const handlePlayTrack = () => {
    const currentTrackTitle = trackInfo?.track || trackInfo?.title || (title as string) || '';
    if (trackInfo?.artist && currentTrackTitle) {
      const searchQuery = `${trackInfo.artist} ${currentTrackTitle}`.replace(/[()]/g, '');
      const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`;
      window.open(spotifyUrl, '_blank');
    }
  };

  // 2. 포트폴리오에 곡 추가
  const handleAddToPortfolio = async () => {
    try {
      const currentTrackTitle = trackInfo?.track || trackInfo?.title || (title as string) || '';
      console.log('🔥 포트폴리오 추가 시도:', { artist: trackInfo?.artist, title: currentTrackTitle });
      
      const response = await fetch(`${API_URL}/api/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token' // 임시 데모 토큰 사용
        },
        body: JSON.stringify({
          artist: trackInfo?.artist,
          title: currentTrackTitle  // track → title로 변경
        })
      });
      
      console.log('🔍 포트폴리오 API 응답 상태:', response.status);
      
      const data = await response.json();
      console.log('📊 포트폴리오 API 응답 데이터:', data);
      
      if (data.success) {
        alert(t('toast.added.portfolio'));
      } else {
        if (data.requireAuth) {
          alert(t('portfolio.login.description'));
        } else {
          console.error('❌ 포트폴리오 추가 실패:', data);
          alert(data.error || '포트폴리오 추가에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('❌ 포트폴리오 추가 중 오류:', error);
      alert('포트폴리오 추가 중 오류가 발생했습니다.');
    }
  };

  // 3. 공유하기 기능 - 모달 열기
  const handleShare = () => {
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="flex flex-col items-center gap-4"
          >
            <Disc className="w-16 h-16 text-purple-500" />
            <p className="text-gray-400">{t('common.loading')}</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error || !trackInfo) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {error || t('search.no.results')}
            </h2>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentTrackTitle = trackInfo?.track || trackInfo?.title || (title as string) || '';
  const bestRank = trackInfo.stats?.best_rank || 
                  (trackInfo.charts && trackInfo.charts.length > 0 
                    ? Math.min(...trackInfo.charts.map(c => c.rank)) 
                    : null);

  return (
    <Layout>
      <Head>
        <title>{currentTrackTitle} - {trackInfo.artist} | KPOP Ranker</title>
        <meta name="description" content={`${trackInfo.artist}의 ${currentTrackTitle} 차트 성과 및 순위 정보`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Background Blur */}
          <div className="absolute inset-0">
            <ImageWithFallback
              artist={trackInfo.artist}
              track={currentTrackTitle}
              className="w-full h-full object-cover filter blur-2xl opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Album Art */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <div className="relative group">
                  <div className="w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
                     <ImageWithFallback
                       artist={trackInfo.artist}
                       track={currentTrackTitle}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       isDetailView={true}
                       priority={true}
                     />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                                  transition-all flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full 
                                   flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Best Rank Badge */}
                  {bestRank && (
                    <div className="absolute -top-4 -right-4 w-16 h-16 
                                  bg-gradient-to-r from-yellow-500 to-orange-500 
                                  rounded-full flex items-center justify-center shadow-xl">
                      <div className="text-center">
                        <div className="text-white text-xs font-bold">BEST</div>
                        <div className="text-white text-lg font-black">#{bestRank}</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Track Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                    {currentTrackTitle}
                  </h1>
                  <button
                    onClick={handleArtistClick}
                    className="text-2xl text-gray-300 hover:text-white transition-colors 
                             flex items-center gap-2 group"
                  >
                    {trackInfo.artist}
                    <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-white">
                      {trackInfo.charts?.length || trackInfo.total_charts || 0}
                    </div>
                    <div className="text-sm text-gray-400">Charts</div>
                  </div>
                  
                  {bestRank && (
                    <div className="glass-card p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-white">#{bestRank}</div>
                      <div className="text-sm text-gray-400">Best Rank</div>
                    </div>
                  )}
                  
                  {trackInfo.stats?.days_on_chart && (
                    <div className="glass-card p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-white">{trackInfo.stats.days_on_chart}</div>
                      <div className="text-sm text-gray-400">Days</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button 
                    onClick={handlePlayTrack}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 
                             text-white font-bold rounded-full flex items-center gap-2 
                             hover:shadow-lg transform hover:scale-105 transition-all
                             hover:from-green-500 hover:to-green-400"
                  >
                    <Play className="w-4 h-4" />
                    Spotify
                  </button>
                  
                  <button 
                    onClick={handleWatchOnYouTube}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 
                             text-white font-bold rounded-full flex items-center gap-2 
                             hover:shadow-lg transform hover:scale-105 transition-all
                             hover:from-red-500 hover:to-red-400"
                  >
                    <Play className="w-4 h-4" />
                    YouTube
                  </button>
                  
                  <button 
                    onClick={handleAddToPortfolio}
                    className="px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-full 
                             hover:from-pink-500 hover:to-pink-400 hover:shadow-lg transform hover:scale-105 transition-all
                             flex items-center gap-2"
                    title="포트폴리오에 추가"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="px-6 py-4 glass-card text-white rounded-full 
                             hover:bg-white/20 transition-all flex items-center gap-2"
                    title="공유하기"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Chart Rankings */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            Chart Performance
          </h2>

          {trackInfo.charts && trackInfo.charts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trackInfo.charts.map((chart, index) => {
                const chartName = chart.chart.toLowerCase();
                const color = CHART_COLORS[chartName] || '#6b7280';
                const displayName = CHART_NAMES[chartName] || chart.chart_display || chart.chart;

                return (
                  <motion.div
                    key={chart.chart}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: color }}
                        >
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{displayName}</h3>
                          <div className="text-sm text-gray-400">
                            {chart.last_updated_formatted || chart.last_updated || ''}
                          </div>
                        </div>
                      </div>
                      <ChangeIndicator change={chart.change} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Rank</span>
                        <span className="text-3xl font-bold text-white">#{chart.rank}</span>
                      </div>
                      
                      {chart.views && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            {chartName === 'youtube' ? 'Video Views' : 'Views'}
                          </span>
                          <span className="text-white font-medium">{formatViews(chart.views)}</span>
                        </div>
                      )}

                      {/* YouTube 전용 뮤직비디오 버튼 */}
                      {chartName === 'youtube' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWatchOnYouTube();
                          }}
                          className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 
                                   text-white rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Watch MV
                        </button>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(5, 100 - chart.rank)}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Chart Data Available</h3>
              <p className="text-gray-500">This track is not currently on any charts</p>
            </div>
          )}
        </div>

        {/* More from Artist */}
        <div className="container mx-auto px-4 pb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <Music className="w-6 h-6" />
            </div>
            More from {trackInfo.artist}
          </h2>
          
          <div className="text-center">
            <button
              onClick={handleArtistClick}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white font-bold rounded-full hover:shadow-lg 
                       transform hover:scale-105 transition-all"
            >
              View All Tracks by {trackInfo.artist}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      {/* Share Modal */}
      {trackInfo && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          trackInfo={{
            artist: trackInfo.artist,
            title: currentTrackTitle
          }}
          url={typeof window !== 'undefined' ? window.location.href : ''}
        />
      )}
    </Layout>
  );
}
