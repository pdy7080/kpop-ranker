import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TrendingItem {
  artist: string;
  track: string;
  trend_score: number;
  melon_rank?: number;
  genie_rank?: number;
  bugs_rank?: number;
  vibe_rank?: number;
  flo_rank?: number;
  youtube_rank?: number;
  spotify_rank?: number;
  album_image?: string;
}

export default function TrendingPage() {
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchTrendingData();
  }, [timeRange]);

  const fetchTrendingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/trending?type=${timeRange}&limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending data');
      }
      
      const data = await response.json();
      setTrendingData(data.trending || []);
    } catch (err) {
      console.error('Error fetching trending data:', err);
      setError('트렌딩 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getChartBadge = (rank?: number) => {
    if (!rank || rank === 0) return <span className="text-gray-400 text-xs">-</span>;
    
    const bgColor = rank <= 10 ? 'bg-red-500' : 
                   rank <= 30 ? 'bg-orange-500' : 
                   rank <= 50 ? 'bg-yellow-500' : 'bg-gray-500';
    
    return (
      <span className={`${bgColor} text-white text-xs px-2 py-1 rounded font-medium`}>
        {rank}
      </span>
    );
  };

  const getTrendIcon = (score: number) => {
    if (score >= 80) return '🔥';
    if (score >= 60) return '📈';
    if (score >= 40) return '➡️';
    return '📉';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎵 트렌딩 차트
          </h1>
          <p className="text-gray-600">
            7개 차트를 종합한 실시간 트렌딩 음악
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-4 mb-6">
          {(['daily', 'weekly', 'monthly'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === 'daily' ? '일간' : range === 'weekly' ? '주간' : '월간'}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Trending List */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      순위
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      아티스트 / 곡
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      트렌드
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Melon
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genie
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bugs
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vibe
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      YouTube
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spotify
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trendingData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-2xl font-bold text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {item.album_image && (
                            <img
                              src={item.album_image.startsWith('http') ? item.album_image : `${API_URL}${item.album_image}`}
                              alt={item.track}
                              className="w-12 h-12 rounded-lg mr-3 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-album.png';
                              }}
                            />
                          )}
                          <div>
                            <Link
                              href={`/artist/${encodeURIComponent(item.artist)}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {item.artist}
                            </Link>
                            <div className="text-sm text-gray-500">{item.track}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{getTrendIcon(item.trend_score)}</span>
                          <span className="text-xs text-gray-500 mt-1">{item.trend_score}점</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getChartBadge(item.melon_rank)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getChartBadge(item.genie_rank)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getChartBadge(item.bugs_rank)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getChartBadge(item.vibe_rank)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getChartBadge(item.youtube_rank)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getChartBadge(item.spotify_rank)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trendingData.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">트렌딩 데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}