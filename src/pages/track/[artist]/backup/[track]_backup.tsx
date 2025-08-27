import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioAPI, trackAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaPlus, FaMusic, FaClock, FaChartLine, FaHeart, FaEye, FaPlay } from 'react-icons/fa';

interface ChartPosition {
  rank: number;
  updated_at: string;
  views?: string;
}

interface TrackInfo {
  artist: string;
  title: string;
  chart_positions?: {
    [key: string]: ChartPosition;
  };
  image_url?: string;
  album?: string;
  release_date?: string;
  genre?: string;
}

const CHART_COLORS: { [key: string]: string } = {
  melon: '#00CD3C',
  genie: '#1E40AF', 
  bugs: '#F97316',
  flo: '#AA40FC',
  spotify: '#1DB954',
  apple_music: '#FA243C',
  youtube: '#FF0000',
  lastfm: '#D51007'
};

const CHART_NAMES: { [key: string]: string } = {
  melon: 'Melon',
  genie: 'Genie',
  bugs: 'Bugs',
  flo: 'FLO',
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  youtube: 'YouTube',
  lastfm: 'Last.fm'
};

const formatViews = (views: string): string => {
  const num = parseInt(views.replace(/,/g, ''));
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return views;
};

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, track } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToPortfolio, setIsAddingToPortfolio] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (artist && track) {
      fetchTrackData();
      checkPortfolioStatus();
    }
  }, [artist, track]);

  const checkPortfolioStatus = async () => {
    if (!isAuthenticated || !artist || !track) return;
    
    try {
      const response = await portfolioAPI.list();
      if (response.portfolio) {
        const isInPortfolio = response.portfolio.some(
          (item: any) => item.artist === artist && item.track === track
        );
        setIsFavorite(isInPortfolio);
      }
    } catch (error) {
      console.error('Portfolio check error:', error);
    }
  };

  const fetchTrackData = async () => {
    try {
      setLoading(true);
      
      const response = await trackAPI.getDetails(String(artist), String(track));
      
      if (response && response.track) {
        setTrackInfo(response.track);
      } else if (response) {
        setTrackInfo(response);
      } else {
        setTrackInfo({
          artist: String(artist),
          title: String(track),
          chart_positions: {}
        });
      }
    } catch (error) {
      console.error('Track data fetch error:', error);
      setTrackInfo({
        artist: String(artist),
        title: String(track),
        chart_positions: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    if (!trackInfo || isFavorite) return;

    setIsAddingToPortfolio(true);
    try {
      const response = await portfolioAPI.add(trackInfo.artist, trackInfo.title);
      
      if (response.success) {
        toast.success('포트폴리오에 추가되었습니다!');
        setIsFavorite(true);
      } else {
        toast.error(response.error || '추가에 실패했습니다');
      }
    } catch (error) {
      console.error('Portfolio add error:', error);
      toast.error('포트폴리오 추가 중 오류가 발생했습니다');
    } finally {
      setIsAddingToPortfolio(false);
    }
  };

  const removeFromPortfolio = async () => {
    if (!trackInfo || !isFavorite) return;

    setIsAddingToPortfolio(true);
    try {
      const response = await portfolioAPI.remove(trackInfo.artist, trackInfo.title);
      
      if (response.success) {
        toast.success('포트폴리오에서 제거되었습니다');
        setIsFavorite(false);
      } else {
        toast.error(response.error || '제거에 실패했습니다');
      }
    } catch (error) {
      console.error('Portfolio remove error:', error);
      toast.error('포트폴리오 제거 중 오류가 발생했습니다');
    } finally {
      setIsAddingToPortfolio(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </Layout>
    );
  }

  if (!trackInfo) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
          <div className="text-white text-xl">트랙을 찾을 수 없습니다</div>
        </div>
      </Layout>
    );
  }

  const hasChartData = trackInfo.chart_positions && Object.keys(trackInfo.chart_positions).length > 0;
  const chartEntries = hasChartData ? Object.entries(trackInfo.chart_positions!) : [];
  
  // 순위 차트와 조회수 차트 분리
  const rankCharts = chartEntries.filter(([chart]) => chart !== 'youtube');
  const viewsCharts = chartEntries.filter(([chart]) => chart === 'youtube');

  return (
    <Layout>
      <Head>
        <title>{trackInfo.title} - {trackInfo.artist} | KPOP Ranker</title>
        <meta name="description" content={`${trackInfo.artist}의 ${trackInfo.title} 차트 순위 및 상세 정보`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 메인 카드 */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 앨범 이미지 */}
              <div className="lg:w-1/3">
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg overflow-hidden">
                  <ImageWithFallback
                    artist={trackInfo.artist}
                    track={trackInfo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 트랙 정보 */}
              <div className="lg:w-2/3 text-white">
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
                  <FaMusic />
                  <span>TRACK</span>
                </div>
                
                <h1 className="text-4xl font-bold mb-2">{trackInfo.title}</h1>
                <p className="text-2xl text-gray-300 mb-6">{trackInfo.artist}</p>
                
                {/* 차트 요약 */}
                {hasChartData && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rankCharts.map(([chartName, data]) => (
                        data.rank > 0 && (
                          <span
                            key={chartName}
                            className="px-3 py-1 rounded-full text-sm font-semibold border-2"
                            style={{
                              borderColor: CHART_COLORS[chartName],
                              color: CHART_COLORS[chartName]
                            }}
                          >
                            {CHART_NAMES[chartName]} #{data.rank}
                          </span>
                        )
                      ))}
                      {viewsCharts.map(([chartName, data]) => (
                        data.views && (
                          <span
                            key={chartName}
                            className="px-3 py-1 rounded-full text-sm font-semibold border-2 flex items-center gap-1"
                            style={{
                              borderColor: CHART_COLORS[chartName],
                              color: CHART_COLORS[chartName]
                            }}
                          >
                            <FaEye className="text-xs" />
                            {formatViews(data.views)} views
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex flex-wrap gap-3">
                  {/* 포트폴리오 버튼 */}
                  {isAuthenticated && (
                    <button
                      onClick={isFavorite ? removeFromPortfolio : addToPortfolio}
                      disabled={isAddingToPortfolio}
                      className={`
                        flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                        ${isFavorite 
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'}
                        ${isAddingToPortfolio ? 'opacity-50 cursor-wait' : ''}
                      `}
                    >
                      {isFavorite ? (
                        <>
                          <FaHeart className="text-lg" />
                          포트폴리오에서 제거
                        </>
                      ) : (
                        <>
                          <FaPlus className="text-lg" />
                          {isAddingToPortfolio ? '처리 중...' : '포트폴리오에 추가'}
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => router.push(`/artist/${encodeURIComponent(trackInfo.artist)}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                  >
                    <FaMusic className="text-lg" />
                    아티스트 페이지
                  </button>
                </div>

                {!isAuthenticated && (
                  <p className="text-gray-500 text-sm mt-3">
                    <span 
                      onClick={() => router.push('/login')}
                      className="text-purple-400 hover:text-purple-300 cursor-pointer underline"
                    >
                      로그인
                    </span>
                    하시면 포트폴리오 기능을 사용할 수 있습니다
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 차트 순위 섹션 */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-6">
            <div className="flex items-center gap-2 text-white mb-6">
              <FaChartLine />
              <h2 className="text-2xl font-bold">현재 차트 순위</h2>
            </div>
            
            {hasChartData ? (
              <div className="space-y-6">
                {/* 순위 차트 */}
                {rankCharts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">음원 차트 순위</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {rankCharts.map(([chartName, data]) => {
                        const displayName = CHART_NAMES[chartName] || chartName;
                        const color = CHART_COLORS[chartName] || '#6B7280';
                        
                        return data.rank > 0 ? (
                          <div key={chartName} className="bg-gray-700/50 rounded-lg p-4 text-center border-2 hover:bg-gray-600/50 transition-all" style={{ borderColor: color }}>
                            <div className="text-gray-400 text-sm mb-1">{displayName}</div>
                            <div className="text-3xl font-bold mb-1" style={{ color }}>
                              #{data.rank}
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.updated_at && new Date(data.updated_at).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* 조회수 차트 */}
                {viewsCharts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">조회수</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewsCharts.map(([chartName, data]) => {
                        const displayName = CHART_NAMES[chartName] || chartName;
                        const color = CHART_COLORS[chartName] || '#6B7280';
                        
                        return data.views ? (
                          <div key={chartName} className="bg-gray-700/50 rounded-lg p-6 text-center border-2 hover:bg-gray-600/50 transition-all" style={{ borderColor: color }}>
                            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-2">
                              <FaPlay className="text-xs" />
                              <span>{displayName}</span>
                            </div>
                            <div className="text-3xl font-bold mb-1" style={{ color }}>
                              {data.views.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                              <FaEye className="text-xs" />
                              조회수
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {data.updated_at && new Date(data.updated_at).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  이 트랙은 현재 차트에 진입하지 않았습니다.
                </div>
                <p className="text-sm text-gray-600">
                  차트 진입 시 실시간으로 업데이트됩니다.
                </p>
              </div>
            )}
          </div>

          {/* 관련 정보 섹션 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 순위 히스토리 */}
            <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-2 text-white mb-6">
                <FaClock />
                <h2 className="text-xl font-bold">순위 히스토리</h2>
              </div>
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">순위 변동 차트</div>
                <p className="text-sm text-gray-600">곧 업데이트 예정</p>
              </div>
            </div>

            {/* 아티스트 정보 */}
            <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-2 text-white mb-6">
                <FaMusic />
                <h2 className="text-xl font-bold">아티스트 정보</h2>
              </div>
              <div className="space-y-3 text-gray-300">
                <div>
                  <span className="text-gray-500">아티스트:</span>
                  <span className="ml-2 font-semibold">{trackInfo.artist}</span>
                </div>
                {/* 더미데이터 제거: genre 삭제 */}
                <button
                  onClick={() => router.push(`/artist/${encodeURIComponent(trackInfo.artist)}`)}
                  className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                >
                  더 많은 곡 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
