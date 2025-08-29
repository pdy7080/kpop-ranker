import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import ImageWithFallback from './ImageWithFallback';
import { 
  TrendingUp, Music, Trophy, Flame, BarChart3,
  Grid3x3, List, Filter, ChevronDown, Star
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

interface TrendingListV2Props {
  tracks: TrendingTrack[];
  selectedChart: string;
  viewMode: 'grid' | 'list';
}

const TrendingListV2: React.FC<TrendingListV2Props> = ({ 
  tracks, 
  selectedChart,
  viewMode 
}) => {
  const router = useRouter();

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  // Grid View - Full Image Focus
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tracks.map((track, index) => (
          <motion.div
            key={`${track.artist}-${track.track}-${index}`}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ y: -6 }}
            onClick={() => handleTrackClick(track.artist, track.track)}
            className="cursor-pointer group"
          >
            <div className="relative">
              {/* Card - Full Image Coverage */}
              <div className="relative overflow-hidden rounded-lg bg-black border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                
                {/* Album Image - FULL */}
                <div className="relative aspect-square">
                  {/* Rank Badge */}
                  <div className="absolute top-2 left-2 z-20">
                    <div className={`
                      px-2 py-1 rounded-md font-bold text-xs backdrop-blur-md shadow-lg
                      ${index === 0 
                        ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white' 
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90 text-gray-900'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-600/90 to-orange-700/90 text-white'
                        : 'bg-black/80 text-white'}
                    `}>
                      {index === 0 ? '👑' : index + 1}
                    </div>
                  </div>

                  {/* Charts Count - Top Right */}
                  <div className="absolute top-2 right-2 z-20">
                    <div className="px-2 py-1 bg-purple-500/30 backdrop-blur-md rounded-md border border-purple-400/30">
                      <span className="text-xs font-bold text-white">
                        {isNaN(track.chart_count) || !track.chart_count ? '0' : track.chart_count}
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  <ImageWithFallback
                    src={track.image_url}
                    alt={`${track.artist} - ${track.track}`}
                    artist={track.artist}
                    track={track.track}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Strong Gradient for Text */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
                  
                  {/* Track Info - Over Image */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-bold text-white text-sm mb-0.5 line-clamp-1 drop-shadow-lg">
                      {track.track}
                    </h3>
                    <p className="text-xs text-gray-200 line-clamp-1 drop-shadow-lg">
                      {track.artist}
                    </p>
                    
                    {/* Mini Stats */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-white font-medium">#{isNaN(track.best_rank) ? '?' : track.best_rank}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-white font-medium">{isNaN(track.score) ? '0' : Math.round(track.score)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // List View - Clean and Detailed
  return (
    <div className="space-y-2">
      {tracks.map((track, index) => (
        <motion.div
          key={`${track.artist}-${track.track}-${index}`}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, delay: index * 0.01 }}
          onClick={() => handleTrackClick(track.artist, track.track)}
          className="group cursor-pointer"
        >
          <div className="flex items-center gap-4 p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 hover:bg-black/60 transition-all duration-300">
            {/* Rank */}
            <div className={`
              flex items-center justify-center min-w-[40px] h-10 rounded-lg font-bold
              ${index === 0 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                : index === 1
                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
                : index === 2
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
                : 'bg-gray-800/80 text-gray-300'}
            `}>
              {index === 0 ? '👑' : index + 1}
            </div>

            {/* Album Cover */}
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={track.image_url}
                alt={`${track.artist} - ${track.track}`}
                artist={track.artist}
                track={track.track}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                {track.track}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-1">{track.artist}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center hidden sm:block">
                <div className="text-xs text-gray-500">차트</div>
                <div className="font-bold text-purple-400">{isNaN(track.chart_count) || !track.chart_count ? '0' : track.chart_count}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">최고</div>
                <div className="font-bold text-green-400">#{isNaN(track.best_rank) ? '?' : track.best_rank}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">점수</div>
                <div className="font-bold text-orange-400">{isNaN(track.score) ? '0' : Math.round(track.score)}</div>
              </div>
            </div>

            {/* Arrow Icon */}
            <ChevronDown className="w-5 h-5 text-gray-500 rotate-[-90deg] group-hover:text-purple-400 transition-colors" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrendingListV2;
