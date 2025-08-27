import React from 'react';
import ChartLogo from './ChartLogo';

interface ChartRankDisplayProps {
  chartName: string;
  rank: number;
  displayType?: 'compact' | 'full' | 'badge';
}

const ChartRankDisplay: React.FC<ChartRankDisplayProps> = ({ 
  chartName, 
  rank, 
  displayType = 'compact' 
}) => {
  const chartNames: { [key: string]: string } = {
    melon: '멜론',
    genie: '지니',
    bugs: '벅스',
    vibe: '바이브',
    flo: '플로',
    spotify: 'Spotify',
    youtube: 'YouTube',
    billboard: 'Billboard'
  };

  const displayName = chartNames[chartName.toLowerCase()] || chartName;

  if (displayType === 'badge') {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full border border-white/20">
        <ChartLogo chart={chartName} size="sm" />
        <span className="text-xs font-semibold text-white">#{rank}</span>
      </div>
    );
  }

  if (displayType === 'full') {
    return (
      <div className="flex items-center gap-2">
        <ChartLogo chart={chartName} size="md" />
        <span className="text-sm">{displayName}</span>
        <span className="font-bold text-lg">#{rank}</span>
      </div>
    );
  }

  // compact (default)
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md">
      <ChartLogo chart={chartName} size="sm" />
      <span className="text-sm font-medium text-white">{rank}위</span>
    </div>
  );
};

export default ChartRankDisplay;
