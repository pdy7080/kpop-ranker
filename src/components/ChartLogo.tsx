import React from 'react';

interface ChartLogoProps {
  chart: string;
  size?: 'sm' | 'md' | 'lg';
}

const ChartLogo: React.FC<ChartLogoProps> = ({ chart, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const chartLogos: { [key: string]: { icon: string; color: string; label: string } } = {
    melon: { icon: '🍈', color: 'text-green-600', label: '멜론' },
    genie: { icon: '🧞', color: 'text-blue-600', label: '지니' },
    bugs: { icon: '🐛', color: 'text-orange-600', label: '벅스' },
    vibe: { icon: '🎵', color: 'text-purple-600', label: '바이브' },
    flo: { icon: '🌊', color: 'text-cyan-600', label: '플로' },
    spotify: { icon: '🎧', color: 'text-green-500', label: 'Spotify' },
    youtube: { icon: '▶️', color: 'text-red-600', label: 'YouTube' },
    billboard: { icon: '📊', color: 'text-gray-800', label: 'Billboard' }
  };

  const chartInfo = chartLogos[chart.toLowerCase()] || { icon: '🎵', color: 'text-gray-600', label: chart };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]}`} title={chartInfo.label}>
      <span className={chartInfo.color}>{chartInfo.icon}</span>
    </span>
  );
};

export default ChartLogo;
