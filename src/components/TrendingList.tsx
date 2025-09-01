import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import ImageWithFallback from './ImageWithFallback';
import { 
  TrendingUp, Music, Trophy, Flame, BarChart3,
  Grid3x3, List, Filter, ChevronDown
} from 'lucide-react';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
  positions?: string;
}

interface TrendingListProps {
  tracks: TrendingTrack[];
  selectedChart: string;
  viewMode: 'grid' | 'list';
}

const TrendingList: React.FC<TrendingListProps> = ({ 
  tracks, 
  selectedChart,
  viewMode 
}) => {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  // Grid View - Album-focused
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tracks.map((track, index) => (
          <motion.div
            key={`${track.artist}-${track.track}-${index}`}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleTrackClick(track.artist, track.track)}
            className="cursor-pointer group"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                {/* Rank Badge - Floating */}
                <div className="absolute top-3 left-3 z-30">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.02 }}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-lg font-bold shadow-lg
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-lg' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                        index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                        'bg-black/70 backdrop-blur-md text-white text-sm'}
                    `}
                  >
                    {index < 3 && index === 0 ? '👑' : index + 1}
                  </motion.div>
                </div>

                {/* Charts Badge - Top Right */}
                <div className="absolute top-3 right-3 z-30">
                  <div className="px-2 py-1 bg-purple-500/20 backdrop-blur-md rounded-lg border border-purple-500/30">
                    <span className="text-xs font-bold text-purple-300">
                      {track.chart_count} 차트
                    </span>
                  </div>
                </div>

                {/* Album Image - Full Focus */}
                <div className="relative aspect-square">
                  <ImageWithFallback
                    src={track.image_url}
                    alt={`${track.artist} - ${track.track}`}
                    artist={track.artist}
                    track={track.track}
                    className="w-full h-full object-cover"
                    quality="medium"
                  />
                  
                  {/* Hover Effect Overlay */}
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex items-end"
                      >
                        <div className="p-4 w-full">
                          <div className="flex items-center justify-between mb-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="text-white font-bold">
                              Score: {Math.round(track.score)}
                            </span>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-lg p-2">
                            <div className="text-xs text-gray-300">
                              최고 순위: #{track.best_rank}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Track Info - Clean Design */}
                <div className="p-4 bg-gradient-to-b from-gray-900/80 to-black">
                  <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                    {track.track}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {track.artist}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // List View - Detailed
  return (
    <div className="space-y-3">
      {tracks.map((track, index) => (
        <motion.div
          key={`${track.artist}-${track.track}-${index}`}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, delay: index * 0.02 }}
          onClick={() => handleTrackClick(track.artist, track.track)}
          className="group cursor-pointer"
        >
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 hover:bg-gray-900/50 transition-all duration-300">
            {/* Rank */}
            <div className={`
              flex items-center justify-center min-w-[48px] h-12 rounded-lg font-bold text-lg
              ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                'bg-gray-800 text-gray-300'}
            `}>
              {index === 0 ? '👑' : index + 1}
            </div>

            {/* Album Cover */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={track.image_url}
                alt={`${track.artist} - ${track.track}`}
                artist={track.artist}
                track={track.track}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                quality="medium"
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                {track.track}
              </h3>
              <p className="text-gray-400 line-clamp-1">{track.artist}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">차트</div>
                <div className="font-bold text-purple-400">{track.chart_count}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">최고</div>
                <div className="font-bold text-green-400">#{track.best_rank}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">점수</div>
                <div className="font-bold text-orange-400">{Math.round(track.score)}</div>
              </div>
            </div>

            {/* Arrow */}
            <ChevronDown className="w-5 h-5 text-gray-500 rotate-[-90deg] group-hover:text-purple-400 transition-colors" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrendingList;
