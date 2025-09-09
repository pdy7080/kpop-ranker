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
  video_url?: string;
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
  youtube_url?: string;
  total_charts?: number;
}

const CHART_COLORS: { [key: string]: string } = {
  melon: '#00CD3C',
  genie: '#1E40AF', 
  bugs: '#F97316',
  flo: '#AA40FC',
  spotify: '#1DB954',
  youtube: '#FF0000',
  apple_music: '#FC3C44',
  salam: '#FF6B35'
};

const CHART_NAMES: { [key: string]: string } = {
  melon: 'Melon',
  genie: 'Genie',
  bugs: 'Bugs',
  flo: 'FLO',
  spotify: 'Spotify',
  youtube: 'YouTube',
  apple_music: 'Apple Music',
  salam: 'Salam'
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
      <span className="flex items-center text-gray-500 text-sm">
        <Minus className="w-4 h-4 mr-1" />
        -
      </span>
    );
  }
  
  if (change > 0) {
    return (
      <span className="flex items-center text-green-400 text-sm font-medium">
        <ArrowUp className="w-4 h-4 mr-1" />
        {change}
      </span>
    );
  }
  
  return (
    <span className="flex items-center text-red-400 text-sm font-medium">
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
      
      // API 응답 처리 수정 - 객체인지 확인 후 처리
      if (response) {
        let trackData = response.track || response;
        
        // trackData가 문자열이나 기본형이면 객체로 변환
        if (typeof trackData !== 'object' || trackData === null) {
          trackData = {
            artist: decodeURIComponent(artist as string),
            track: decodeURIComponent(title as string),
            title: decodeURIComponent(title as string),
            charts: []
          };
        } else {
          // 객체인 경우 복사본 생성 (읽기 전용 방지)
          trackData = { ...trackData };
          
          // artist 필드가 없으면 URL 파라미터에서 가져오기
          if (!trackData.artist && artist) {
            trackData.artist = decodeURIComponent(artist as string);
          }
          
          // title/track 필드 처리
          if (!trackData.track && !trackData.title && title) {
            trackData.track = decodeURIComponent(title as string);
            trackData.title = decodeURIComponent(title as string);
          }
        }
        
        // chart_positions을 charts 배열로 변환
        if (trackData.chart_positions && !trackData.charts) {
          trackData.charts = Object.entries(trackData.chart_positions).map(([chart, data]: [string, any]) => ({
            chart,
            rank: data.rank || data,
            last_updated: data.updated,
            views: data.views
          }));
        }
        
        // charts가 빈 배열이면 처리
        if (!trackData.charts || trackData.charts.length === 0) {
          // chart_data나 다른 필드에서 시도
          if (response.charts && response.charts.length > 0) {
            trackData.charts = response.charts;
          }
        }
        
        console.log('✅ Processed track data:', trackData);
        setTrackInfo(trackData);
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
    const artistName = trackInfo?.artist || artist;
    if (artistName) {
      router.push(`/artist/${encodeURIComponent(artistName as string)}`);
    }
  };

  // YouTube 뮤직비디오 열기
  const handleWatchOnYouTube = () => {
    const artistName = trackInfo?.artist || artist;
    const trackTitle = trackInfo?.track || trackInfo?.title || title;
    
    if (artistName && trackTitle) {
      const searchQuery = `${artistName} ${trackTitle} official MV`.replace(/[()\[\]]/g, '');
      const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      window.open(youtubeUrl, '_blank');
    }
  };

  // Spotify에서 트랙 검색
  const handlePlayTrack = () => {
    const artistName = trackInfo?.artist || artist;
    const trackTitle = trackInfo?.track || trackInfo?.title || title;
    
    if (artistName && trackTitle) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      console.log('🔍 디바이스 정보:', { isMobile, isIOS, isAndroid });
      console.log('🎧 아티스트:', artistName);
      console.log('🎵 곡제목:', trackTitle);
      
      const cleanTitle = (trackTitle as string).replace(/\s*\(.*?\)\s*/g, '').trim();
      const searchQuery = `${artistName} ${cleanTitle}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      
      if (isMobile) {
        if (isIOS) {
          const spotifyAppUrl = `spotify://search/${encodedQuery}`;
          const spotifyWebUrl = `https://open.spotify.com/search/${encodedQuery}`;
          
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = spotifyAppUrl;
          document.body.appendChild(iframe);
          
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.open(spotifyWebUrl, '_blank');
          }, 1000);
        } else if (isAndroid) {
          const spotifyAppUrl = `spotify://search/${encodedQuery}`;
          const spotifyWebUrl = `https://open.spotify.com/search/${encodedQuery}`;
          
          window.location.href = spotifyAppUrl;
          
          setTimeout(() => {
            window.open(spotifyWebUrl, '_blank');
          }, 1000);
        } else {
          window.open(`https://open.spotify.com/search/${encodedQuery}`, '_blank');
        }
      } else {
        window.open(`https://open.spotify.com/search/${encodedQuery}`, '_blank');
      }
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAddToPortfolio = () => {
    alert(t('track.portfolio.login.required'));
  };

  // 현재 artist와 title 가져오기 (여러 소스에서)
  const currentArtist = trackInfo?.artist || artist || '';
  const currentTrackTitle = trackInfo?.track || trackInfo?.title || title || '';

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#050507] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !trackInfo) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#050507] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || t('search.no.results')}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{currentTrackTitle} - {currentArtist} | KPOP Ranker</title>
        <meta name="description" content={`${currentArtist}의 ${currentTrackTitle} 차트 순위 및 스트리밍 정보`} />
      </Head>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#050507]"
      >
        {/* 헤더 섹션 */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-[#050507] backdrop-blur-sm"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* 앨범 이미지 */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl">
                  <ImageWithFallback
                    artist={currentArtist as string}
                    track={currentTrackTitle as string}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <button
                      onClick={handleWatchOnYouTube}
                      className="px-4 py-2 bg-red-600 text-white rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      Watch MV
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 트랙 정보 */}
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <button
                    onClick={handleArtistClick}
                    className="text-purple-400 hover:text-purple-300 text-lg mb-2 transition-colors cursor-pointer"
                  >
                    {currentArtist}
                  </button>
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-white">
                      {currentTrackTitle}
                    </h1>
                    <button
                      onClick={() => {/* TODO: 즐겨찾기 기능 */}}
                      className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
                    >
                      <Heart className="w-6 h-6 text-pink-400" />
                    </button>
                  </div>
                </motion.div>

                {/* 차트 정보 */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-6 justify-center md:justify-start mb-6"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text">
                      {trackInfo.charts?.length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Charts</div>
                  </div>
                  
                  {trackInfo.stats?.best_rank && (
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">
                        #{trackInfo.stats.best_rank}
                      </div>
                      <div className="text-gray-400 text-sm">Best Rank</div>
                    </div>
                  )}
                </motion.div>

                {/* 액션 버튼 */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-wrap gap-3 justify-center md:justify-start"
                >
                  <button
                    onClick={handlePlayTrack}
                    className="px-6 py-3 bg-green-600 text-white rounded-full flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-600/30"
                  >
                    <Play className="w-5 h-5" />
                    Spotify
                  </button>
                  
                  <button
                    onClick={handleWatchOnYouTube}
                    className="px-6 py-3 bg-red-600 text-white rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-600/30"
                  >
                    <Play className="w-5 h-5" />
                    YouTube
                  </button>
                  
                  <button
                    onClick={handleAddToPortfolio}
                    className="px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition-colors shadow-lg"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition-colors shadow-lg"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 성과 섹션 */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <BarChart3 className="w-6 h-6 text-purple-500" />
              Chart Performance
            </h2>
            
            {trackInfo.charts && trackInfo.charts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trackInfo.charts.map((chart, index) => (
                  <motion.div
                    key={`${chart.chart}-${index}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="glass-card p-6 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-lg"
                          style={{ 
                            backgroundColor: CHART_COLORS[chart.chart] || '#9CA3AF',
                            boxShadow: `0 0 10px ${CHART_COLORS[chart.chart] || '#9CA3AF'}40`
                          }}
                        ></div>
                        <h3 className="font-semibold text-lg text-gray-200">
                          {CHART_NAMES[chart.chart] || chart.chart}
                        </h3>
                      </div>
                      <ChangeIndicator change={chart.change} />
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white">
                          #{chart.rank}
                        </div>
                        {chart.views && (
                          <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatViews(chart.views)}
                          </div>
                        )}
                      </div>
                      
                      {chart.last_updated && (
                        <div className="text-xs text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {new Date(chart.last_updated).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Chart Data Available</h3>
                <p className="text-gray-500">This track is not currently on any charts</p>
              </div>
            )}
          </motion.div>

          {/* 더 많은 트랙 섹션 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <Music className="w-6 h-6 text-purple-500" />
              More from {currentArtist}
            </h2>
            
            <div className="glass-card p-6">
              <p className="text-gray-400 mb-4">Discover more tracks from this artist</p>
              <button
                onClick={handleArtistClick}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-purple-600/30"
              >
                View All Tracks by {currentArtist}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {showShareModal && (
        <ShareModal
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={`${currentArtist} - ${currentTrackTitle}`}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </Layout>
  );
}
