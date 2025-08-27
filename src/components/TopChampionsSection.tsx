import React from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface TopChampionsSectionProps {
  trendingTracks: TrendingTrack[];
  stats: {
    totalTracks: number;
    totalArtists: number;
    activeCharts: number;
    lastUpdate: string;
  };
}

const TopChampionsSection: React.FC<TopChampionsSectionProps> = ({ 
  trendingTracks, 
  stats 
}) => {
  const top3 = trendingTracks.slice(0, 3);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 my-12 shadow-xl">
      {/* Simple Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          🏆 TOP 3
        </h2>
        <p className="text-gray-400 text-lg">
          지금 가장 인기 있는 K-POP 트랙
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* TOP 3 Champions - Minimalist Design */}
        {top3.map((track, index) => (
          <motion.div
            key={`${track.artist}-${track.track}`}
            className={`text-center ${index === 0 ? 'lg:col-span-1' : ''} cursor-pointer`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              const encodedArtist = encodeURIComponent(track.artist);
              const encodedTrack = encodeURIComponent(track.track);
              window.location.href = `/track/${encodedArtist}/${encodedTrack}`;
            }}
          >
            {/* Rank Badge - Simplified */}
            <div className="text-4xl mb-6">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </div>
            
            {/* Album Image - Clean Design */}
            <div className="relative mb-6 mx-auto w-fit group">
              <ImageWithFallback
                artist={track.artist}
                track={track.track}
                className={`${index === 0 ? 'w-48 h-48' : 'w-40 h-40'} rounded-xl shadow-lg mx-auto object-cover transition-transform duration-300 group-hover:scale-105`}
                priority={true}  // TOP 3는 항상 우선 로드
              />
              
              {/* Simple Rank Number */}
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                #{index + 1}
              </div>
            </div>
            
            {/* Track Info - Minimal */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">
                {track.artist}
              </h3>
              <p className="text-lg text-gray-300">
                {track.track}
              </p>
              
              {/* Only Essential Info */}
              <div className="text-sm text-gray-400">
                {track.chart_count}개 차트 진입
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Stats Panel - Clean & Professional */}
        <motion.div
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-6 text-center">
            📊 실시간 현황
          </h3>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalTracks}
              </div>
              <div className="text-sm text-gray-400">총 트랙</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalArtists}
              </div>
              <div className="text-sm text-gray-400">아티스트</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.activeCharts}
              </div>
              <div className="text-sm text-gray-400">차트</div>
            </div>
            
            <div className="border-t border-gray-700 pt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TopChampionsSection;
