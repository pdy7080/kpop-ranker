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
    melon: { icon: '🍈', color: 'text-green-600', label: 'Melon' },
    genie: { icon: '🧞', color: 'text-blue-600', label: 'Genie' },
    bugs: { icon: '🐛', color: 'text-orange-600', label: 'Bugs' },
    flo: { icon: '🌊', color: 'text-purple-600', label: 'FLO' },
    spotify: { icon: '🎧', color: 'text-green-500', label: 'Spotify' },
    apple_music: { icon: '🍎', color: 'text-gray-800', label: 'Apple Music' },
    youtube: { icon: '▶️', color: 'text-red-600', label: 'YouTube' },
    lastfm: { icon: '🎼', color: 'text-red-600', label: 'Last.fm' }
  };

  const chartKey = chart.toLowerCase();
  const chartInfo = chartLogos[chartKey] || { icon: '🎵', color: 'text-gray-600', label: chart };

  return (
    <span className={`inline-flex items-center justify-center ${sizeClasses[size]}`} title={chartInfo.label}>
      <span className={`${chartInfo.color} text-center leading-none`}>{chartInfo.icon}</span>
    </span>
  );
};

export default ChartLogo;
