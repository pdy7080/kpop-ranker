import React from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';
import { Trophy, TrendingUp, Users } from 'lucide-react';

interface HeroTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface HeroSectionProps {
  topTracks: HeroTrack[];
  onTrackClick: (artist: string, track: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ topTracks, onTrackClick }) => {
  if (!topTracks || topTracks.length === 0) return null;

  const [champion, ...runners] = topTracks;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🏆 CHAMPIONS
          </h2>
          <p className="text-gray-400">지금 가장 핫한 트랙들</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Champion (Left - Larger) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div 
              onClick={() => onTrackClick(champion.artist, champion.track)}
              className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold text-lg">#1</span>
                  </div>
                </div>
              </div>

              {/* Album Image */}
              <div className="relative aspect-square lg:aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={champion.image_url}
                  alt={`${champion.artist} - ${champion.track}`}
                  artist={champion.artist}
                  track={champion.track}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  priority
                  quality="high"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    {champion.track}
                  </h3>
                  <p className="text-lg lg:text-xl text-gray-200 mb-4 drop-shadow-lg">
                    {champion.artist}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg">
                      <span className="text-white font-semibold">{champion.chart_count}개 차트</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg">
                      <span className="text-white font-semibold">최고 #{champion.best_rank}</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/30">
                      <span className="text-white font-semibold">🔥 {Math.round(champion.score)}점</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Runners Up (Right - Smaller) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {runners.map((track, index) => (
              <motion.div
                key={`${track.artist}-${track.track}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => onTrackClick(track.artist, track.track)}
                className="relative group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
              >
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 z-30">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-3 py-1 rounded-lg shadow-lg">
                    <span className="font-bold text-white">#{index + 2}</span>
                  </div>
                </div>

                {/* Album Image */}
                <div className="relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={track.image_url}
                    alt={`${track.artist} - ${track.track}`}
                    artist={track.artist}
                    track={track.track}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    quality="medium"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-lg font-bold text-white mb-1 drop-shadow-lg line-clamp-1">
                    {track.track}
                  </h4>
                  <p className="text-sm text-gray-200 mb-2 drop-shadow-lg line-clamp-1">
                    {track.artist}
                  </p>
                  
                  <div className="flex gap-2">
                    <span className="text-xs bg-white/10 backdrop-blur-md px-2 py-1 rounded text-white">
                      {track.chart_count}개 차트
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
