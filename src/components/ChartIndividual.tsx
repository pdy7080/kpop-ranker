import React from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';

interface ChartTrack {
  rank?: number;
  artist: string;
  track: string;
  views?: string;
  streams?: string;
  image_url?: string;
  local_image?: string;
}

interface ChartIndividualProps {
  chartName: string;
  displayName: string;
  tracks: ChartTrack[];
  lastUpdate: string;
  isYoutube: boolean;
  onTrackClick?: (artist: string, track: string) => void;  // 트랙 클릭 핸들러 추가
}

const ChartIndividual: React.FC<ChartIndividualProps> = ({
  chartName,
  displayName,
  tracks,
  lastUpdate,
  isYoutube,
  onTrackClick
}) => {
  const [showCount, setShowCount] = React.useState(10);  // 표시할 트랙 수
  const formatUpdateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChartIcon = (chartName: string) => {
    const icons: Record<string, string> = {
      melon: '🍈',
      genie: '🧞',
      bugs: '🐛',
      spotify: '🎧',
      youtube: '📺',
      flo: '🌊',
      apple_music: '🍎',
      lastfm: '🎵'
    };
    return icons[chartName] || '🎵';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
    >
      {/* 차트 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getChartIcon(chartName)}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{displayName}</h3>
            <p className="text-sm text-gray-300">
              업데이트: {formatUpdateTime(lastUpdate)}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {isYoutube ? '조회수 순' : '순위 순'}
        </div>
      </div>

      {/* 트랙 리스트 */}
      <div className="space-y-3">
        {tracks.slice(0, showCount).map((track, index) => (
          <motion.div
            key={`${track.artist}-${track.track}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors cursor-pointer"
            onClick={() => onTrackClick?.(track.artist, track.track)}  // 트랙 클릭 시 상세페이지
          >
            {/* 순위 또는 인덱스 */}
            <div className="flex-shrink-0 w-8 text-center">
              {isYoutube ? (
                <span className="text-sm font-bold text-gray-300">{index + 1}</span>
              ) : (
                <span className="text-lg font-bold text-purple-400">#{track.rank}</span>
              )}
            </div>

            {/* 앨범 이미지 */}
            <div className="flex-shrink-0">
              <ImageWithFallback
                artist={track.artist}
                track={track.track}
                className="w-12 h-12 rounded-lg object-cover"
              />
            </div>

            {/* 트랙 정보 */}
            <div className="flex-grow min-w-0">
              <p className="font-semibold text-white truncate">{track.track}</p>
              <p className="text-sm text-gray-300 truncate">{track.artist}</p>
            </div>

            {/* 조회수 또는 스트리밍 수 */}
            <div className="flex-shrink-0 text-right">
              {isYoutube ? (
                <div>
                  <p className="text-sm font-semibold text-red-400">{track.views}</p>
                  <p className="text-xs text-gray-400">조회수</p>
                </div>
              ) : (
                track.streams && (
                  <div>
                    <p className="text-sm font-semibold text-green-400">{track.streams}</p>
                    <p className="text-xs text-gray-400">재생</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      {tracks.length > showCount && (
        <div className="mt-4 text-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowCount(prev => Math.min(prev + 20, tracks.length));
            }}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors px-4 py-2 bg-purple-600/20 rounded-lg hover:bg-purple-600/30"
          >
            더보기 ({tracks.length - showCount}개 더)
          </button>
        </div>
      )}
      
      {/* 축소 버튼 */}
      {showCount > 10 && (
        <div className="mt-2 text-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowCount(10);
            }}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            접기
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ChartIndividual;
