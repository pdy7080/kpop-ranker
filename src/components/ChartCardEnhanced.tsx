import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSpotify, FaYoutube, FaApple, FaGlobeAsia, FaChartLine, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { SiShazam, SiBillboard } from 'react-icons/si';
import TrendChart from './TrendChart';

interface ChartResult {
  rank: number | null;
  album_image: string | null;
  published_at: string;
  previous_rank?: number | null;
  peak_rank?: number | null;
  weeks_on_chart?: number;
  found?: boolean;
  view_count?: number; // YouTube 조회수 (숫자)
  view_count_formatted?: string; // YouTube 조회수 (포맷된 문자열)
  views?: string; // YouTube 조회수 (백엔드에서 보내는 필드)
}

interface ChartCardProps {
  name: string;
  data: ChartResult;
  index: number;
  artistName?: string;
  trackName?: string;
  isLoading?: boolean;
}

const chartIcons: Record<string, React.ElementType> = {
  Spotify: FaSpotify,
  YouTube: FaYoutube,
  AppleMusic: FaApple,
  Shazam: SiShazam,
  Billboard: SiBillboard,
};

const chartColors: Record<string, string> = {
  Spotify: 'bg-green-500',
  YouTube: 'bg-red-500',
  AppleMusic: 'bg-gray-800',
  Shazam: 'bg-blue-500',
  Billboard: 'bg-purple-500',
  Melon: 'bg-green-600',
  Genie: 'bg-blue-600',
  Bugs: 'bg-orange-500',
  Vibe: 'bg-purple-600',
  Flo: 'bg-pink-500',
};

const ChartCardEnhanced: React.FC<ChartCardProps> = ({ 
  name, 
  data, 
  index, 
  artistName, 
  trackName,
  isLoading = false
}) => {
  const [showTrend, setShowTrend] = useState(false);
  const Icon = chartIcons[name] || FaGlobeAsia;
  const bgColor = chartColors[name] || 'bg-gray-500';

  const isYouTube = name && name.toLowerCase() === 'youtube';
  const hasYouTubeViews = isYouTube && (data.view_count_formatted || data.views);

  // Calculate rank change
  const rankChange = data.rank && data.previous_rank 
    ? data.previous_rank - data.rank
    : null;

  const getRankChangeIcon = () => {
    if (!rankChange) return <FaMinus className="w-3 h-3 text-gray-400" />;
    if (rankChange > 0) return <FaArrowUp className="w-3 h-3 text-green-500" />;
    return <FaArrowDown className="w-3 h-3 text-red-500" />;
  };

  const getRankChangeText = () => {
    if (!rankChange) return 'NEW';
    if (rankChange > 0) return `+${rankChange}`;
    return `${rankChange}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${bgColor} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(data.published_at).toLocaleString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })} 기준
            </p>
          </div>
        </div>
        
        {/* Trend Button */}
        {(data.rank !== null || hasYouTubeViews) && artistName && trackName && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowTrend(!showTrend)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="트렌드 보기"
          >
            <FaChartLine className="w-5 h-5 text-primary-500" />
          </motion.button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</p>
        </div>
      ) : data.rank !== null || hasYouTubeViews ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              {isYouTube && hasYouTubeViews ? (
                // YouTube 조회수 표시
                <div>
                  <p className="text-3xl font-bold text-red-500">
                    {data.view_count_formatted || data.views}
                  </p>
                  <p className="text-sm text-red-400 mt-1">조회수</p>
                </div>
              ) : (
                // 일반 차트 순위 표시
                <div>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-bold text-primary-500">
                      {data.rank}위
                    </p>
                    {rankChange !== null && (
                      <div className="flex items-center space-x-1">
                        {getRankChangeIcon()}
                        <span className={`text-sm font-medium ${
                          rankChange > 0 ? 'text-green-500' : 
                          rankChange < 0 ? 'text-red-500' : 
                          'text-gray-400'
                        }`}>
                          {getRankChangeText()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Stats */}
                  <div className="mt-2 space-y-1">
                    {data.peak_rank && (
                      <p className="text-xs text-gray-500">
                        최고 순위: {data.peak_rank}위
                      </p>
                    )}
                    {data.weeks_on_chart && (
                      <p className="text-xs text-gray-500">
                        차트인: {data.weeks_on_chart}주
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {data.album_image && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                {/* 🎯 Next.js Image 대신 일반 img 태그 사용으로 수정 */}
                <img
                  src={data.album_image}
                  alt="Album cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로딩 실패 시 fallback 처리
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/images/album-placeholder.svg') {
                      target.src = '/images/album-placeholder.svg';
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Trend Chart */}
          {showTrend && artistName && trackName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <TrendChart
                chartName={name}
                artistName={artistName}
                trackName={trackName}
              />
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          {isYouTube ? (
            <>
              <p className="text-gray-400 dark:text-gray-600">영상 없음</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                YouTube에서 찾을 수 없습니다
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-400 dark:text-gray-600">순위 없음</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                차트에 진입하지 않았습니다
              </p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ChartCardEnhanced;
