import React from 'react';
import ChartLogo from './ChartLogo';
import { Play, Eye } from 'lucide-react';

interface ChartRankDisplayProps {
  chartName: string;
  rank: number | string;
  displayType?: 'compact' | 'full' | 'badge';
  isViews?: boolean;
}

const ChartRankDisplay: React.FC<ChartRankDisplayProps> = ({ 
  chartName, 
  rank, 
  displayType = 'compact',
  isViews = false
}) => {
  const chartNames: { [key: string]: string } = {
    melon: 'Melon',
    genie: 'Genie', 
    bugs: 'Bugs',
    flo: 'FLO',
    spotify: 'Spotify',
    apple_music: 'Apple Music',
    youtube: 'YouTube',
    lastfm: 'Last.fm'
  };

  const chartColors: { [key: string]: string } = {
    melon: 'bg-green-600',
    genie: 'bg-blue-600',
    bugs: 'bg-orange-500', 
    flo: 'bg-purple-500',
    spotify: 'bg-green-500',
    apple_music: 'bg-gray-800',
    youtube: 'bg-red-500',
    lastfm: 'bg-red-600'
  };

  const displayName = chartNames[chartName.toLowerCase()] || chartName;
  const bgColor = chartColors[chartName.toLowerCase()] || 'bg-gray-500';

  // YouTube는 조회수로 처리
  const isYouTubeViews = chartName.toLowerCase() === 'youtube' || isViews;
  
  // 조회수 포맷팅
  const formatViews = (views: string | number): string => {
    const num = typeof views === 'string' ? parseInt(views.replace(/,/g, '')) : views;
    if (isNaN(num)) return String(views);
    
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  if (displayType === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 ${bgColor} rounded-full text-white text-xs font-semibold`}>
        <ChartLogo chart={chartName} size="sm" />
        {isYouTubeViews ? (
          <>
            <Play className="w-3 h-3" />
            <span>{formatViews(rank)}</span>
          </>
        ) : (
          <span>#{rank}</span>
        )}
      </div>
    );
  }

  if (displayType === 'full') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
        <ChartLogo chart={chartName} size="md" />
        <div className="flex-grow">
          <div className="text-sm text-gray-400">{displayName}</div>
          <div className="font-bold text-lg text-white">
            {isYouTubeViews ? (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatViews(rank)} views
              </div>
            ) : (
              `#${rank}`
            )}
          </div>
        </div>
      </div>
    );
  }

  // compact (default)
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 ${bgColor} rounded-md text-white text-sm font-medium`}>
      <ChartLogo chart={chartName} size="sm" />
      {isYouTubeViews ? (
        <>
          <Play className="w-3 h-3" />
          <span>{formatViews(rank)}</span>
        </>
      ) : (
        <span>#{rank}</span>
      )}
    </div>
  );
};

export default ChartRankDisplay;
