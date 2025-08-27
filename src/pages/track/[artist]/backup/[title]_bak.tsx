import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioAPI, trackAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaPlus, FaMusic, FaClock, FaChartLine, FaHeart, FaEye, FaPlay, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

interface ChartData {
  chart: string;
  chart_display: string;
  rank: number;
  change: number;
  views: string;
  last_updated: string;
  last_updated_formatted: string;
}

interface TrackInfo {
  artist: string;
  track: string;
  charts: ChartData[];
  trend_score: number;
  image_url?: string;
  album?: string;
  release_date?: string;
  genre?: string;
  stats?: {
    peak_rank: number;
    chart_count: number;
    days_on_chart: number;
    first_charted?: string;
  };
  history?: any[];
  streaming_links?: {
    spotify?: string;
    youtube?: string;
    apple_music?: string;
  };
  chart_independence?: {
    total_charts: number;
    updated_independently: boolean;
    last_update_times: { [key: string]: string };
  };
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

const formatViews = (views: string): string => {
  if (!views || views === '') return '';
  
  const cleanViews = views.replace(/,/g, '').replace(/[^0-9]/g, '');
  const num = parseInt(cleanViews);
  
  if (isNaN(num)) return views;
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const ChangeIndicator = ({ change }: { change: number }) => {
  if (change > 0) {
    return (
      <span className="flex items-center text-green-600 text-sm font-medium">
        <FaArrowUp className="mr-1" />
        {change}
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="flex items-center text-red-600 text-sm font-medium">
        <FaArrowDown className="mr-1" />
        {Math.abs(change)}
      </span>
    );
  }
  return (
    <span className="flex items-center text-gray-500 text-sm">
      <FaMinus className="mr-1" />
      0
    </span>
  );
};

export default function TrackDetailPageV15() {
  const router = useRouter();
  const { artist, title } = router.query; // title 파라미터 사용
  const { isAuthenticated, user } = useAuth();
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToPortfolio, setIsAddingToPortfolio] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (artist && title) {
      fetchTrackData();
      checkPortfolioStatus();
    }
  }, [artist, title]);

  const checkPortfolioStatus = async () => {
    if (!isAuthenticated || !artist || !title) return;
    
    try {
      const response = await portfolioAPI.list();
      if (response.portfolio) {
        const isInPortfolio = response.portfolio.some(
          (item: any) => item.artist === artist && item.track === title
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
      setApiError(null);
      
      console.log('Fetching track data for:', artist, title);
      
      // title 파라미터 사용하여 API 호출
      const response = await trackAPI.getDetails(String(artist), String(title));
      
      console.log('Track API response:', response);
      
      if (response && response.charts) {
        setTrackInfo(response);
      } else {
        console.warn('Invalid response format:', response);
        setApiError('트랙 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('Track data fetch error:', error);
      setApiError('API 연결 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      setIsAddingToPortfolio(true);

      if (isFavorite) {
        await portfolioAPI.remove(String(artist), String(title));
        setIsFavorite(false);
        toast.success('포트폴리오에서 제거되었습니다');
      } else {
        await portfolioAPI.add({
          artist: String(artist),
          track: String(title),
          image_url: trackInfo?.image_url || '',
        });
        setIsFavorite(true);
        toast.success('포트폴리오에 추가되었습니다');
      }
    } catch (error) {
      console.error('Portfolio operation error:', error);
      toast.error('작업 중 오류가 발생했습니다');
    } finally {
      setIsAddingToPortfolio(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">트랙 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (apiError || !trackInfo) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaMusic className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">트랙을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-4">{apiError || '요청한 트랙 정보를 찾을 수 없습니다.'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const chartCount = trackInfo.charts?.length || 0;
  const bestRank = chartCount > 0 ? Math.min(...trackInfo.charts.map(c => c.rank)) : 0;

  return (
    <Layout>
      <Head>
        <title>{trackInfo.track} - {trackInfo.artist} | KPOP Ranker</title>
        <meta name="description" content={`${trackInfo.artist}의 ${trackInfo.track} 실시간 차트 순위 및 상세 정보`} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Album Image */}
              <div className="flex-shrink-0">
                <div className="w-64 h-64 rounded-lg overflow-hidden shadow-md">
                  <ImageWithFallback
                    artist={trackInfo.artist}
                    track={trackInfo.track}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Track Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  <div className="mb-6 lg:mb-0">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{trackInfo.track}</h1>
                    <h2 className="text-2xl text-gray-600 mb-4">{trackInfo.artist}</h2>
                    
                    {trackInfo.album && (
                      <p className="text-gray-500 mb-2">
                        <FaMusic className="inline mr-2" />
                        앨범: {trackInfo.album}
                      </p>
                    )}
                    
                    {trackInfo.release_date && (
                      <p className="text-gray-500 mb-2">
                        <FaClock className="inline mr-2" />
                        발매일: {trackInfo.release_date}
                      </p>
                    )}

                    {trackInfo.genre && (
                      <p className="text-gray-500 mb-4">
                        장르: {trackInfo.genre}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="text-center bg-blue-50 px-4 py-2 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{chartCount}</div>
                        <div className="text-sm text-gray-600">차트 진입</div>
                      </div>
                      
                      {bestRank > 0 && (
                        <div className="text-center bg-green-50 px-4 py-2 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">#{bestRank}</div>
                          <div className="text-sm text-gray-600">최고 순위</div>
                        </div>
                      )}
                      
                      <div className="text-center bg-purple-50 px-4 py-2 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{trackInfo.trend_score || 0}</div>
                        <div className="text-sm text-gray-600">트렌드 점수</div>
                      </div>

                      {trackInfo.stats?.days_on_chart && trackInfo.stats.days_on_chart > 0 && (
                        <div className="text-center bg-orange-50 px-4 py-2 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{trackInfo.stats.days_on_chart}</div>
                          <div className="text-sm text-gray-600">차트 활동일</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {isAuthenticated && (
                      <button
                        onClick={handleAddToPortfolio}
                        disabled={isAddingToPortfolio}
                        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                          isFavorite
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isAddingToPortfolio ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <FaHeart className="mr-2" />
                        )}
                        {isFavorite ? '포트폴리오에서 제거' : '포트폴리오에 추가'}
                      </button>
                    )}

                    {/* Streaming Links */}
                    {trackInfo.streaming_links && (
                      <div className="flex flex-col gap-2">
                        {trackInfo.streaming_links.spotify && (
                          <a
                            href={trackInfo.streaming_links.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <FaPlay className="mr-2" />
                            Spotify에서 듣기
                          </a>
                        )}
                        
                        {trackInfo.streaming_links.youtube && (
                          <a
                            href={trackInfo.streaming_links.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <FaPlay className="mr-2" />
                            YouTube에서 듣기
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Independence Info */}
          {trackInfo.chart_independence && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-lg">
              <div className="flex items-center">
                <FaChartLine className="text-blue-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-blue-800">차트 독립성 보장</h3>
                  <p className="text-blue-700">
                    각 차트별로 최신 업데이트가 개별적으로 반영됩니다. 
                    총 {trackInfo.chart_independence.total_charts}개 차트에서 독립적으로 업데이트됨
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <FaChartLine className="mr-3 text-blue-600" />
              실시간 차트 순위
            </h3>
            
            {trackInfo.charts && trackInfo.charts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trackInfo.charts.map((chart, index) => (
                  <div
                    key={`${chart.chart}-${index}`}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: CHART_COLORS[chart.chart] || '#666', borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg" style={{ color: CHART_COLORS[chart.chart] || '#666' }}>
                        {chart.chart_display || CHART_NAMES[chart.chart] || chart.chart.toUpperCase()}
                      </h4>
                      <ChangeIndicator change={chart.change} />
                    </div>
                    
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-gray-900">#{chart.rank}</div>
                    </div>
                    
                    {chart.views && chart.views !== '' && (
                      <div className="text-center mb-3">
                        <div className="text-sm text-gray-600">
                          <FaEye className="inline mr-1" />
                          {formatViews(chart.views)}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 text-center">
                      {chart.last_updated_formatted || new Date(chart.last_updated).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaChartLine className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600">현재 차트에 진입한 기록이 없습니다.</p>
              </div>
            )}
          </div>

          {/* History Section */}
          {trackInfo.history && trackInfo.history.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <FaClock className="mr-3 text-green-600" />
                최근 7일 순위 변화
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        날짜
                      </th>
                      {Object.keys(CHART_NAMES).map(chart => (
                        <th
                          key={chart}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {CHART_NAMES[chart]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trackInfo.history.map((day, index) => (
                      <tr key={`history-${day.date}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </td>
                        {Object.keys(CHART_NAMES).map(chart => (
                          <td key={chart} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {day[chart] ? `#${day[chart]}` : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
