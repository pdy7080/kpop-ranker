import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { FaPlay, FaEye } from 'react-icons/fa';

interface TrendingCardProps {
  track: {
    rank_position?: number;
    unified_artist: string;
    unified_track: string;
    chart_name?: string;
    views_or_streams?: string;
    optimized_album_image?: string | null;
    created_at?: string;
    charts?: {
      [key: string]: number | string;
    };
    chart_count?: number;
    best_rank?: number;
    score?: number;
  };
  index: number;
}

// 조회수 포맷팅 함수
const formatViews = (views: string | undefined): string => {
  if (!views || views === '0' || views === '') return '';
  
  try {
    const cleanViews = views.replace(/,/g, '');
    const num = parseInt(cleanViews);
    if (isNaN(num)) return '';
    
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  } catch {
    return '';
  }
};

// 한글 정규화 함수 (NFC 형식으로 통일)
const normalizeKorean = (text: string): string => {
  // 브라우저 환경에서 한글 정규화
  if (typeof text !== 'string') return '';
  return text.normalize('NFC');
};

// 특수문자 제거 함수
const cleanSpecialChars = (text: string): string => {
  // 하트, 별 등 이모지 제거
  return text.replace(/[♥❤💖💕♡❍⭐✨🌟💫]/g, '').trim();
};

// 차트별 색상 및 이름
const CHART_CONFIG: Record<string, { color: string; name: string }> = {
  melon: { color: 'bg-green-600', name: 'Melon' },
  genie: { color: 'bg-blue-600', name: 'Genie' },
  bugs: { color: 'bg-orange-500', name: 'Bugs' },
  flo: { color: 'bg-purple-500', name: 'FLO' },
  spotify: { color: 'bg-green-500', name: 'Spotify' },
  apple_music: { color: 'bg-gray-800', name: 'Apple Music' },
  youtube: { color: 'bg-red-500', name: 'YouTube' },
  lastfm: { color: 'bg-red-600', name: 'Last.fm' }
};

const TrendingCard: React.FC<TrendingCardProps> = ({ track, index }) => {
  const viewsFormatted = formatViews(track.views_or_streams);
  
  // 차트 데이터 처리
  const chartData = track.charts || {};
  const chartEntries = Object.entries(chartData);
  
  // YouTube 조회수와 일반 순위 차트 분리
  const rankCharts = chartEntries.filter(([chart, value]) => 
    chart !== 'youtube' && typeof value === 'number' && value > 0
  );
  const youtubeData = chartEntries.find(([chart]) => chart === 'youtube');
  
  // 한글 정규화 및 특수문자 처리
  const normalizedArtist = normalizeKorean(cleanSpecialChars(track.unified_artist));
  const normalizedTrack = normalizeKorean(cleanSpecialChars(track.unified_track));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <Link href={`/track/${encodeURIComponent(normalizedArtist)}/${encodeURIComponent(normalizedTrack)}`}>
        <div className="flex p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          {/* 순위 표시 */}
          <div className="flex-shrink-0 w-12 flex items-center justify-center mr-4">
            {track.best_rank && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  #{track.best_rank}
                </div>
                <div className="text-xs text-gray-500">최고</div>
              </div>
            )}
          </div>
          
          {/* 앨범 이미지 */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-purple-500 to-pink-500">
              <ImageWithFallback
                artist={track.unified_artist}
                track={track.unified_track}
                className="w-full h-full object-cover"
                quality="medium"
              />
            </div>
          </div>
          
          {/* 트랙 정보 */}
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {track.unified_track}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 truncate mb-2">
              {track.unified_artist}
            </p>
            
            {/* 차트 순위 표시 */}
            <div className="space-y-1">
              {rankCharts.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {rankCharts.slice(0, 4).map(([chart, rank]) => {
                    const config = CHART_CONFIG[chart] || { color: 'bg-gray-500', name: chart };
                    return (
                      <span
                        key={chart}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}
                      >
                        {config.name} #{rank}
                      </span>
                    );
                  })}
                  {rankCharts.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{rankCharts.length - 4}개 더
                    </span>
                  )}
                </div>
              )}
              
              {/* YouTube 조회수 */}
              {youtubeData && youtubeData[1] && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <FaPlay className="text-red-500 text-xs" />
                  <span className="font-medium">
                    {formatViews(String(youtubeData[1]))} views
                  </span>
                </div>
              )}
              
              {/* 차트 개수 표시 */}
              {track.chart_count && track.chart_count > 1 && (
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {track.chart_count}개 차트 진입
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
