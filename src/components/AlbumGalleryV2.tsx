import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import ImageWithFallback from './ImageWithFallback';
import { TrendingUp, Music, Flame, Star, ChevronRight } from 'lucide-react';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface AlbumGalleryV2Props {
  tracks: TrendingTrack[];
  title?: string;
  showViewAll?: boolean;
  columns?: 3 | 4 | 5 | 6;
}

const AlbumGalleryV2: React.FC<AlbumGalleryV2Props> = ({ 
  tracks, 
  title = "🔥 TRENDING NOW",
  showViewAll = true,
  columns = 4
}) => {
  const router = useRouter();

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  const getGridCols = () => {
    switch(columns) {
      case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      case 5: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      default: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <section className="w-full py-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">실시간 차트 업데이트</p>
          </motion.div>
          
          {showViewAll && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/trending')}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <span className="text-sm text-gray-300 group-hover:text-white">전체 보기</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </motion.button>
          )}
        </div>

        {/* Album Grid - Larger Images */}
        <div className={`grid ${getGridCols()} gap-6`}>
          {tracks.map((track, index) => (
            <motion.div
              key={`${track.artist}-${track.track}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => handleTrackClick(track.artist, track.track)}
              className="group cursor-pointer"
            >
              <div className="relative">
                {/* Card Container - Minimal height */}
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                  
                  {/* Album Image - FULL SIZE */}
                  <div className="relative aspect-square w-full">
                    {/* Rank Badge - Top Left */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className={`
                        px-2.5 py-1 rounded-lg font-bold backdrop-blur-md shadow-lg
                        ${index === 0 
                          ? 'bg-gradient-to-br from-yellow-500/90 to-orange-500/90 text-white text-sm' 
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300/90 to-gray-400/90 text-gray-900 text-sm'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-600/90 to-orange-700/90 text-white text-sm'
                          : 'bg-black/70 text-white text-xs'}
                      `}>
                        {index === 0 ? '👑 1' : index + 1}
                      </div>
                    </div>

                    {/* Charts Badge - Top Right */}
                    <div className="absolute top-3 right-3 z-20">
                      <div className="px-2 py-1 bg-purple-500/20 backdrop-blur-md rounded-lg border border-purple-400/30 shadow-lg">
                        <span className="text-xs font-bold text-purple-200">
                          {track.chart_count}개 차트
                        </span>
                      </div>
                    </div>

                    {/* Album Image */}
                    <ImageWithFallback
                      src={track.image_url}
                      alt={`${track.artist} - ${track.track}`}
                      artist={track.artist}
                      track={track.track}
                      className="w-full h-full object-cover"
                      quality="medium"
                    />
                    
                    {/* Gradient Overlay - Bottom only */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent" />
                    
                    {/* Track Info - Over Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white text-base mb-1 line-clamp-1 drop-shadow-lg">
                        {track.track}
                      </h3>
                      <p className="text-sm text-gray-200 line-clamp-1 drop-shadow-lg">
                        {track.artist}
                      </p>
                      
                      {/* Mini Stats Bar */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-gray-300">#{track.best_rank}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-gray-300">{Math.round(track.score)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlbumGalleryV2;
