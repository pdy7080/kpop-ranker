import React from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';
import { Trophy, TrendingUp, Flame, Star, Music } from 'lucide-react';

interface HeroTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface HeroSectionV2Props {
  topTracks: HeroTrack[];
  onTrackClick: (artist: string, track: string) => void;
}

const HeroSectionV2: React.FC<HeroSectionV2Props> = ({ topTracks, onTrackClick }) => {
  if (!topTracks || topTracks.length === 0) return null;

  const [champion, second, third] = topTracks;

  return (
    <section className="relative w-full py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            CHAMPIONS
          </h2>
          <p className="text-sm text-gray-400 mt-1">지금 가장 핫한 TOP 3</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Champion - Left Large */}
          {champion && (
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:row-span-2"
            >
              <div 
                onClick={() => onTrackClick(champion.artist, champion.track)}
                className="relative group cursor-pointer h-full"
              >
                <div className="relative overflow-hidden rounded-2xl bg-black border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 h-full">
                  {/* Champion Badge */}
                  <div className="absolute top-4 left-4 z-30">
                    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 px-4 py-2 rounded-xl shadow-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👑</span>
                        <div>
                          <div className="text-xs text-yellow-900 font-medium">CHAMPION</div>
                          <div className="text-lg font-black text-white">#1</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Badge - Top Right */}
                  <div className="absolute top-4 right-4 z-30 space-y-2">
                    <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                      <span className="text-white font-bold">{champion.chart_count}개 차트</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-400/30">
                      <span className="text-white font-bold">🔥 {Math.round(champion.score)}</span>
                    </div>
                  </div>

                  {/* Album Image */}
                  <div className="relative aspect-square lg:aspect-[4/5]">
                    <ImageWithFallback
                      src={champion.image_url}
                      alt={`${champion.artist} - ${champion.track}`}
                      artist={champion.artist}
                      track={champion.track}
                      className="w-full h-full object-cover"
                      priority
                    />
                    
                    {/* Strong Gradient for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  </div>

                  {/* Content - Better Positioned */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-2xl">
                      {champion.track}
                    </h3>
                    <p className="text-xl lg:text-2xl text-gray-100 font-medium drop-shadow-xl">
                      {champion.artist}
                    </p>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Second Place - Top Right */}
          {second && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => onTrackClick(second.artist, second.track)}
              className="cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-xl bg-black border border-gray-500/20 hover:border-gray-400/50 transition-all duration-300">
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 z-30">
                  <div className="bg-gradient-to-r from-gray-300 to-gray-400 px-3 py-1.5 rounded-lg shadow-xl">
                    <span className="font-bold text-gray-900">🥈 #2</span>
                  </div>
                </div>

                {/* Chart Badge */}
                <div className="absolute top-3 right-3 z-30">
                  <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg">
                    <span className="text-xs font-bold text-white">{second.chart_count} 차트</span>
                  </div>
                </div>

                {/* Album Image */}
                <div className="relative aspect-[16/9]">
                  <ImageWithFallback
                    src={second.image_url}
                    alt={`${second.artist} - ${second.track}`}
                    artist={second.artist}
                    track={second.track}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-xl font-bold text-white mb-1 drop-shadow-xl">
                    {second.track}
                  </h4>
                  <p className="text-base text-gray-200 drop-shadow-lg">
                    {second.artist}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Third Place - Bottom Right */}
          {third && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => onTrackClick(third.artist, third.track)}
              className="cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-xl bg-black border border-orange-700/20 hover:border-orange-600/50 transition-all duration-300">
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 z-30">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-3 py-1.5 rounded-lg shadow-xl">
                    <span className="font-bold text-white">🥉 #3</span>
                  </div>
                </div>

                {/* Chart Badge */}
                <div className="absolute top-3 right-3 z-30">
                  <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg">
                    <span className="text-xs font-bold text-white">{third.chart_count} 차트</span>
                  </div>
                </div>

                {/* Album Image */}
                <div className="relative aspect-[16/9]">
                  <ImageWithFallback
                    src={third.image_url}
                    alt={`${third.artist} - ${third.track}`}
                    artist={third.artist}
                    track={third.track}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-xl font-bold text-white mb-1 drop-shadow-xl">
                    {third.track}
                  </h4>
                  <p className="text-base text-gray-200 drop-shadow-lg">
                    {third.artist}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV2;
