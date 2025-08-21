import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

interface TrendingCardProps {
  track: {
    rank_position?: number;
    unified_artist: string;
    unified_track: string;
    chart_name?: string;
    views_or_streams?: string;
    optimized_album_image?: string | null;
    created_at?: string;
  };
  index: number;
}

// 조회수 포맷팅 함수
const formatViews = (views: string | undefined): string => {
  if (!views || views === '0' || views === '') return '';
  
  try {
    const num = parseInt(views);
    if (isNaN(num)) return '';
    
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  } catch {
    return '';
  }
};

// 차트별 색상
const getChartColor = (chartName?: string): string => {
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
  return colors[chartName?.toLowerCase() || ''] || 'bg-gray-500';
};

const TrendingCard: React.FC<TrendingCardProps> = ({ track, index }) => {
  const viewsFormatted = formatViews(track.views_or_streams);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <Link href={`/track/${encodeURIComponent(track.unified_artist)}/${encodeURIComponent(track.unified_track)}`}>
        <div className="flex p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          {/* 순위 */}
          {track.rank_position && (
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {track.rank_position}
              </span>
            </div>
          )}
          
          {/* 앨범 이미지 */}
          <div className="flex-shrink-0 mr-4">
            <ImageWithFallback
              src={track.optimized_album_image}
              alt={`${track.unified_artist} - ${track.unified_track}`}
              width={80}
              height={80}
              className="rounded-lg shadow-md"
            />
          </div>
          
          {/* 트랙 정보 */}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {track.unified_track}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 truncate">
              {track.unified_artist}
            </p>
            
            {/* 차트 배지 및 조회수 */}
            <div className="flex items-center gap-3 mt-2">
              {/* 차트 배지 */}
              {track.chart_name && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getChartColor(track.chart_name)}`}>
                  {track.chart_name.toUpperCase()}
                </span>
              )}
              
              {/* YouTube 조회수 */}
              {viewsFormatted && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                  </svg>
                  <span className="font-medium">{viewsFormatted} views</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 화살표 아이콘 */}
          <div className="flex-shrink-0 ml-2 flex items-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TrendingCard;
