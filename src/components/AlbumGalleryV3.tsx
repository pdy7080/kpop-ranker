import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import ImageWithFallback from './ImageWithFallback';
import { TrendingUp, Flame, ChevronRight } from 'lucide-react';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface AlbumGalleryV3Props {
  tracks: TrendingTrack[];
  showViewAll?: boolean;
}

const AlbumGalleryV3: React.FC<AlbumGalleryV3Props> = ({ 
  tracks,
  showViewAll = true
}) => {
  const router = useRouter();

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  return (
    <div>
      {/* View All Button */}
      {showViewAll && (
        <div className="text-right mb-4">
          <button
            onClick={() => router.push('/trending')}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all"
          >
            <span className="text-sm text-gray-300 group-hover:text-white">전체 보기</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
          </button>
        </div>
      )}

      {/* Album Grid - Simple and Clean */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tracks.map((track, index) => (
          <motion.div
            key={`${track.artist}-${track.track}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            onClick={() => handleTrackClick(track.artist, track.track)}
            className="cursor-pointer group"
          >
            <div className="relative bg-black rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
              
              {/* Image Container with Fixed Aspect Ratio */}
              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                {/* Position Absolute for Full Coverage */}
                <div className="absolute inset-0">
                  {/* Badges Layer */}
                  <div className="absolute top-0 left-0 right-0 p-2 z-20 flex justify-between">
                    {/* Rank Badge */}
                    <div className={`
                      px-2 py-1 rounded-md font-bold text-xs backdrop-blur-md shadow-lg
                      ${index === 0 
                        ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white' 
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-300/90 to-gray-400/90 text-gray-900'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-600/90 to-orange-700/90 text-white'
                        : 'bg-black/70 text-white'}
                    `}>
                      {index === 0 ? '👑' : index + 1}
                    </div>

                    {/* Chart Count */}
                    <div className="px-2 py-1 bg-purple-500/30 backdrop-blur-md rounded-md border border-purple-400/30">
                      <span className="text-xs font-bold text-white">{isNaN(track.chart_count) || !track.chart_count ? '0' : track.chart_count}</span>
                    </div>
                  </div>

                  {/* Album Image - Absolute Fill */}
                  <ImageWithFallback
                    src={track.image_url}
                    alt={`${track.artist} - ${track.track}`}
                    artist={track.artist}
                    track={track.track}
                    className="absolute inset-0 w-full h-full object-cover"
                    quality="medium"
                  />
                  
                  {/* Gradient Overlay for Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  {/* Track Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-bold text-white text-sm mb-0.5 line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {track.track}
                    </h3>
                    <p className="text-xs text-gray-200 line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {track.artist}
                    </p>
                    
                    {/* Stats Bar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-[10px] text-white font-medium">#{isNaN(track.best_rank) ? '?' : track.best_rank}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] text-white font-medium">{isNaN(track.score) ? '0' : Math.round(track.score)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AlbumGalleryV3;
