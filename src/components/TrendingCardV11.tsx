import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

interface TrendingCardProps {
  track: {
    rank?: number;
    artist: string;
    title: string;
    name?: string;
    best_rank?: number;
    chart_count?: number;
    avg_rank?: number;
    charts?: Record<string, number>;  // 차트별 순위
    album_image?: string | null;
    trending_score?: number;
    has_real_image?: boolean;
    youtube_views?: number;
    rank_change?: number;
  };
  index: number;
}

// 조회수 포맷팅 함수
const formatViews = (views: number | undefined): string => {
  if (!views || views === 0) return '';
  
  try {
    if (views >= 1000000000) return `${(views / 1000000000).toFixed(1)}B`;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toLocaleString();
  } catch {
    return '';
  }
};

// 차트별 색상
const getChartColor = (chartName: string): string => {
  const colors: Record<string, string> = {
    melon: 'bg-green-600',
    genie: 'bg-blue-600',
    bugs: 'bg-orange-500',
    vibe: 'bg-purple-600',
    flo: 'bg-pink-500',
    spotify: 'bg-green-500',
    youtube: 'bg-red-500',
    billboard: 'bg-purple-500'
  };
  return colors[chartName.toLowerCase()] || 'bg-gray-500';
};

// 순위 변동 표시
const getRankChangeIcon = (change?: number) => {
  if (!change) return null;
  if (change > 0) return <span className="text-green-500">▲ {change}</span>;
  if (change < 0) return <span className="text-red-500">▼ {Math.abs(change)}</span>;
  return <span className="text-gray-400">-</span>;
};

const TrendingCardV11: React.FC<TrendingCardProps> = ({ track, index }) => {
  const viewsFormatted = formatViews(track.youtube_views);
  const trackTitle = track.title || track.name || 'Unknown Track';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <Link href={`/track/${encodeURIComponent(track.artist)}/${encodeURIComponent(trackTitle)}`}>
        <div className="flex p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          {/* 순위 */}
          <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center mr-4">
            <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {track.rank || index + 1}
            </span>
            {track.rank_change && (
              <div className="text-xs mt-1">
                {getRankChangeIcon(track.rank_change)}
              </div>
            )}
          </div>
          
          {/* 앨범 이미지 */}
          <div className="flex-shrink-0 mr-4">
            <ImageWithFallback
              src={track.album_image}
              alt={`${track.artist} - ${trackTitle}`}
              width={80}
              height={80}
              className="rounded-lg shadow-md"
            />
          </div>
          
          {/* 트랙 정보 */}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {trackTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 truncate">
              {track.artist}
            </p>
            
            {/* 차트 정보 */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* 차트별 순위 표시 */}
              {track.charts && Object.entries(track.charts).slice(0, 5).map(([chart, rank]) => (
                <span 
                  key={chart}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getChartColor(chart)}`}
                  title={`${chart.toUpperCase()} #${rank}`}
                >
                  {chart.toUpperCase()} #{rank}
                </span>
              ))}
              
              {/* 추가 차트 수 표시 */}
              {track.charts && Object.keys(track.charts).length > 5 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{Object.keys(track.charts).length - 5} more
                </span>
              )}
            </div>
            
            {/* 통계 정보 */}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {/* 차트 진입 수 */}
              {track.chart_count && track.chart_count > 0 && (
                <span>📊 {track.chart_count} charts</span>
              )}
              
              {/* 평균 순위 */}
              {track.avg_rank && (
                <span>Avg #{track.avg_rank.toFixed(1)}</span>
              )}
              
              {/* YouTube 조회수 */}
              {viewsFormatted && (
                <span>👁️ {viewsFormatted}</span>
              )}
              
              {/* 트렌드 스코어 */}
              {track.trending_score && (
                <span>🔥 {track.trending_score.toFixed(0)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TrendingCardV11;