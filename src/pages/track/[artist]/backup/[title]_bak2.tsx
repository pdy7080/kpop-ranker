import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioAPI, trackAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaPlus, FaMusic, FaClock, FaChartLine, FaHeart, FaEye, FaPlay, FaArrowUp, FaArrowDown, FaMinus, FaInfoCircle } from 'react-icons/fa';

interface ChartData {
  chart: string;
  chart_display: string;
  rank: number;
  change: number;
  views?: string;
  last_updated: string;
  last_updated_formatted?: string;
}

interface DayHistory {
  date: string;
  [chartName: string]: string | number | undefined;
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
  history?: DayHistory[];
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

function formatViews(views?: string): string {
  if (!views || views === '') return '';
  const cleanViews = views.replace(/,/g, '').replace(/[^0-9]/g, '');
  const num = parseInt(cleanViews);
  if (isNaN(num)) return views;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

const ChangeIndicator: React.FC<{ change: number }> = ({ change }) => {
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
  const { artist, title } = router.query;
  const { isAuthenticated } = useAuth();
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
    // eslint-disable-next-line
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
    setLoading(true);
    setApiError(null);
    try {
      const response = await trackAPI.getDetails(String(artist), String(title));
      if (response && response.charts) setTrackInfo(response);
      else setApiError('트랙 정보를 불러올 수 없습니다.');
    } catch (error) {
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
    setIsAddingToPortfolio(true);
    try {
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
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
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            <div className="mb-8 lg:mb-0 flex-shrink-0">
              <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white flex items-center justify-center">
                <ImageWithFallback
                  src={trackInfo.image_url}
                  alt={`${trackInfo.track} 앨범커버`}
                  width={240}
                  height={240}
                  className="w-full h-full object-cover"
                  fallbackSrc="/cover-fallback.png"
                />
                {trackInfo.streaming_links && (
                  <div className="absolute right-2 bottom-2 flex space-x-2">
                    {trackInfo.streaming_links.spotify && (
                      <a href={trackInfo.streaming_links.spotify} target="_blank" rel="noopener noreferrer" title="Spotify에서 듣기" className="bg-green-100 hover:bg-green-200 rounded-full px-2 py-1 text-green-800 text-xs flex items-center shadow">
                        <FaPlay className="mr-1" /> Spotify
                      </a>
                    )}
                    {trackInfo.streaming_links.youtube && (
                      <a href={trackInfo.streaming_links.youtube} target="_blank" rel="noopener noreferrer" title="YouTube에서 듣기" className="bg-red-100 hover:bg-red-200 rounded-full px-2 py-1 text-red-700 text-xs flex items-center shadow">
                        <FaPlay className="mr-1" /> YouTube
                      </a>
                    )}
                    {trackInfo.streaming_links.apple_music && (
                      <a href={trackInfo.streaming_links.apple_music} target="_blank" rel="noopener noreferrer" title="Apple Music에서 듣기" className="bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-gray-800 text-xs flex items-center shadow">
                        <FaPlay className="mr-1" /> Apple
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                <div className="mb-6 lg:mb-0">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{trackInfo.track}</h1>
                  <h2 className="text-2xl text-gray-600 mb-4">{trackInfo.artist}</h2>
                  {(trackInfo.album && trackInfo.album !== 'K-POP Album' && trackInfo.album.trim() !== '') && (
                    <p className="text-gray-500 mb-2">
                      <FaMusic className="inline mr-2" />
                      앨범: {trackInfo.album}
                    </p>
                  )}
                  {(trackInfo.release_date && trackInfo.release_date !== '2024' && trackInfo.release_date.trim() !== '') && (
                    <p className="text-gray-500 mb-2">
                      <FaClock className="inline mr-2" />
                      발매일: {trackInfo.release_date}
                    </p>
                  )}
                  {trackInfo.genre && trackInfo.genre !== '기타' && trackInfo.genre.trim() !== '' && (
                    <p className="text-gray-500 mb-4">
                      장르: {trackInfo.genre}
                    </p>
                  )}
                  {trackInfo.stats && (
                    <div className="grid grid-cols-3 gap-4 bg-gray-100 rounded-lg px-5 py-2 mb-3 text-center">
                      <div>
                        <div className="text-sm text-gray-500 font-semibold">최고 순위</div>
                        <div className="text-lg font-extrabold text-blue-600">{trackInfo.stats.peak_rank}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 font-semibold">차트 진입</div>
                        <div className="text-lg font-extrabold text-pink-600">{trackInfo.stats.chart_count}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 font-semibold">차트 유지 일수</div>
                        <div className="text-lg font-extrabold text-indigo-700">{trackInfo.stats.days_on_chart}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={handleAddToPortfolio}
                    disabled={isAddingToPortfolio}
                    className={`flex items-center px-6 py-2 rounded-lg shadow font-bold text-lg focus:outline-none transition
                    ${isFavorite
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'}
                    `}
                  >
                    <FaHeart className="mr-2" />
                    {isFavorite ? '포트폴리오에서 제거' : '내 포트폴리오 추가'}
                  </button>
                  {trackInfo.trend_score && (
                    <div className="flex items-center bg-gradient-to-r from-blue-200 via-pink-100 to-indigo-100 rounded-lg px-3 py-1 mt-1 text-blue-900 font-bold shadow text-base">
                      <FaChartLine className="mr-1" />
                      트렌드 점수 {trackInfo.trend_score}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {trackInfo.chart_independence && trackInfo.chart_independence.updated_independently && (
            <div className="bg-gradient-to-r from-blue-200/80 to-indigo-200/70 border-l-8 border-blue-700 p-8 mb-8 rounded-lg shadow-xl flex items-center">
              <FaInfoCircle className="text-blue-700 text-4xl mr-6 flex-shrink-0 drop-shadow-md" />
              <div>
                <h3 className="text-2xl font-extrabold text-blue-900 mb-2 flex items-center">
                  <span>💡 실시간 차트 독립 업데이트</span>
                </h3>
                <p className="text-blue-800 mb-3 font-semibold leading-relaxed">
                  각 음원 차트는 서로 다른 시간에 <span className="underline underline-offset-2">독립적으로 업데이트</span>되어<br className="hidden sm:block" /> 가장 정확한 실시간 순위를 제공합니다.
                </p>
                <div className="bg-white bg-opacity-90 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    총 {trackInfo.chart_independence.total_charts}개 차트에서 개별 업데이트 중
                  </p>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>• Melon: 매일 01:10, 07:10, 13:10, 19:10</p>
                    <p>• Genie: 매일 01:15, 07:15, 13:15, 19:15</p>
                    <p>• Bugs: 매일 01:20, 07:20, 13:20, 19:20</p>
                    <p className="text-gray-500 italic mt-2">* 각 차트의 실제 업데이트 시간이 개별 표시됩니다</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <FaChartLine className="mr-3 text-blue-600" />
              실시간 차트 순위
              {trackInfo.chart_independence && (
                <span className="ml-auto text-sm font-normal text-gray-600">
                  각 차트별 독립 업데이트
                </span>
              )}
            </h3>
            {trackInfo.charts && trackInfo.charts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trackInfo.charts.map((chart, index) => (
                  <div
                    key={`${chart.chart}-${index}`}
                    className="border rounded-lg p-6 hover:shadow-lg transition-all duration-300 relative"
                    style={{ borderLeftColor: CHART_COLORS[chart.chart] || '#666', borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-center mb-3">
                      <span className="font-bold mr-2 text-lg" style={{ color: CHART_COLORS[chart.chart] }}>{CHART_NAMES[chart.chart] || chart.chart_display}</span>
                      <span className="text-xs text-gray-400">{chart.chart_display !== CHART_NAMES[chart.chart] ? chart.chart_display : ''}</span>
                    </div>
                    <div className="flex items-center justify-between mb-6 h-12">
                      <span className="text-4xl font-extrabold text-blue-900 flex items-center">
                        {chart.rank > 0 ? chart.rank : <span className="text-gray-400 text-2xl">-</span>}
                      </span>
                      <ChangeIndicator change={chart.change} />
                    </div>
                    {chart.views && chart.views !== '' && (
                      <div className="flex items-center text-gray-700 mb-2">
                        <FaEye className="mr-1 text-gray-500" /> {formatViews(chart.views)}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-50 rounded-b-lg px-3 py-2 border-t mt-2 flex items-center justify-center space-x-1">
                      <FaClock className="text-blue-500 text-base mr-1" />
                      <span className="font-medium text-xs text-blue-700">
                        {chart.last_updated_formatted ||
                          new Date(chart.last_updated).toLocaleString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          }).replace(/\. /g, '/').replace('.', '')}
                      </span>
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
        </div>
      </div>
    </Layout>
  );
}