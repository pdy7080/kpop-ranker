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
    <div className="py-20">
      {/* Clean Header */}
      <div className="text-center mb-20">
        <h2 className="text-5xl font-bold text-white mb-6">
          🏆 TOP 3
        </h2>
        <p className="text-xl text-gray-300">
          가장 인기있는 트랙들
        </p>
      </div>
      
      {/* Revolutionary Layout - No Background Cards */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* 2위 - 왼쪽 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group cursor-pointer text-center"
            onClick={() => {
              const encodedArtist = encodeURIComponent(top3[1].artist);
              const encodedTrack = encodeURIComponent(top3[1].track);
              window.location.href = `/track/${encodedArtist}/${encodedTrack}`;
            }}
          >
            {/* Rank Badge - Above Image */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
            </div>
            
            {/* Pure Image - No Background */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-6">
              <ImageWithFallback
                artist={top3[1].artist}
                track={top3[1].track}
                className="w-full h-96 object-cover transition-all duration-700 group-hover:scale-110"
                priority={true}
              />
              
              {/* Minimal Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-12 border-l-gray-900 border-t-8 border-t-transparent border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
            
            {/* Clean Text Info - Outside Image */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {top3[1].artist}
              </h3>
              <p className="text-xl text-gray-300">
                {top3[1].track}
              </p>
              <div className="text-base text-gray-400">
                {top3[1].chart_count}개 차트 진입
              </div>
            </div>
          </motion.div>

          {/* 1위 - 중앙, 가장 크게 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group cursor-pointer text-center relative"
            onClick={() => {
              const encodedArtist = encodeURIComponent(top3[0].artist);
              const encodedTrack = encodeURIComponent(top3[0].track);
              window.location.href = `/track/${encodedArtist}/${encodedTrack}`;
            }}
          >            
            {/* Crown + Rank Badge - Above Image */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="text-5xl animate-bounce mb-2">👑</div>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-3xl">1</span>
                </div>
              </div>
            </div>
            
            {/* Massive Pure Image */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-8">
              <ImageWithFallback
                artist={top3[0].artist}
                track={top3[0].track}
                className="w-full h-[30rem] object-cover transition-all duration-700 group-hover:scale-110"
                priority={true}
              />
              
              {/* Minimal Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-16 border-l-gray-900 border-t-10 border-t-transparent border-b-10 border-b-transparent ml-2"></div>
                </div>
              </div>
            </div>
            
            {/* Clean Text Info - Outside Image */}
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {top3[0].artist}
              </h3>
              <p className="text-2xl text-gray-300">
                {top3[0].track}
              </p>
              <div className="text-lg text-gray-400">
                {top3[0].chart_count}개 차트 진입
              </div>
            </div>
          </motion.div>

          {/* 3위 - 오른쪽 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="group cursor-pointer text-center"
            onClick={() => {
              const encodedArtist = encodeURIComponent(top3[2].artist);
              const encodedTrack = encodeURIComponent(top3[2].track);
              window.location.href = `/track/${encodedArtist}/${encodedTrack}`;
            }}
          >
            {/* Rank Badge - Above Image */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
            </div>
            
            {/* Pure Image - No Background */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-6">
              <ImageWithFallback
                artist={top3[2].artist}
                track={top3[2].track}
                className="w-full h-96 object-cover transition-all duration-700 group-hover:scale-110"
                priority={true}
              />
              
              {/* Minimal Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-12 border-l-gray-900 border-t-8 border-t-transparent border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
            
            {/* Clean Text Info - Outside Image */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {top3[2].artist}
              </h3>
              <p className="text-xl text-gray-300">
                {top3[2].track}
              </p>
              <div className="text-base text-gray-400">
                {top3[2].chart_count}개 차트 진입
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TopChampionsSection;