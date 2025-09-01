import React from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';
import { Trophy } from 'lucide-react';

interface HeroTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface HeroSectionV3Props {
  topTracks: HeroTrack[];
  onTrackClick: (artist: string, track: string) => void;
}

const HeroSectionV3: React.FC<HeroSectionV3Props> = ({ topTracks, onTrackClick }) => {
  if (!topTracks || topTracks.length === 0) return null;

  const [champion, second, third] = topTracks;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Champion - #1 */}
      {champion && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => onTrackClick(champion.artist, champion.track)}
          className="lg:col-span-2 cursor-pointer group"
        >
          <div className="relative rounded-xl overflow-hidden border-2 border-yellow-500/50 hover:border-yellow-500 transition-all duration-300">
            {/* Fixed Aspect Ratio Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
              <div className="absolute inset-0">
                {/* Champion Badge */}
                <div className="absolute top-4 left-4 z-30">
                  <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    <div>
                      <div className="text-xs text-yellow-900 font-medium">CHAMPION</div>
                      <div className="text-lg font-black text-white">#1</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="absolute top-4 right-4 z-30">
                  <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg">
                    <span className="text-white font-bold">{champion.chart_count}개 차트</span>
                  </div>
                </div>

                {/* Image */}
                <ImageWithFallback
                  src={champion.image_url}
                  alt={`${champion.artist} - ${champion.track}`}
                  artist={champion.artist}
                  track={champion.track}
                  className="absolute inset-0 w-full h-full object-cover"
                  quality="high"
                  priority
                />
                
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl lg:text-3xl font-black text-white mb-2 drop-shadow-2xl">
                    {champion.track}
                  </h3>
                  <p className="text-lg lg:text-xl text-gray-100 font-medium drop-shadow-xl">
                    {champion.artist}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Right Side - #2 and #3 */}
      <div className="space-y-4">
        {/* Second Place */}
        {second && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => onTrackClick(second.artist, second.track)}
            className="cursor-pointer group"
          >
            <div className="relative rounded-lg overflow-hidden border border-gray-500/50 hover:border-gray-400 transition-all duration-300">
              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                <div className="absolute inset-0">
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-30">
                    <div className="bg-gradient-to-r from-gray-300 to-gray-400 px-3 py-1 rounded-lg shadow-xl">
                      <span className="font-bold text-gray-900">🥈 #2</span>
                    </div>
                  </div>

                  {/* Image */}
                  <ImageWithFallback
                    src={second.image_url}
                    alt={`${second.artist} - ${second.track}`}
                    artist={second.artist}
                    track={second.track}
                    className="absolute inset-0 w-full h-full object-cover"
                    quality="high"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-lg font-bold text-white mb-1 drop-shadow-xl">
                      {second.track}
                    </h4>
                    <p className="text-sm text-gray-200 drop-shadow-lg">
                      {second.artist}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Third Place */}
        {third && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => onTrackClick(third.artist, third.track)}
            className="cursor-pointer group"
          >
            <div className="relative rounded-lg overflow-hidden border border-orange-700/50 hover:border-orange-600 transition-all duration-300">
              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                <div className="absolute inset-0">
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-30">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-3 py-1 rounded-lg shadow-xl">
                      <span className="font-bold text-white">🥉 #3</span>
                    </div>
                  </div>

                  {/* Image */}
                  <ImageWithFallback
                    src={third.image_url}
                    alt={`${third.artist} - ${third.track}`}
                    artist={third.artist}
                    track={third.track}
                    className="absolute inset-0 w-full h-full object-cover"
                    quality="high"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-lg font-bold text-white mb-1 drop-shadow-xl">
                      {third.track}
                    </h4>
                    <p className="text-sm text-gray-200 drop-shadow-lg">
                      {third.artist}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HeroSectionV3;
