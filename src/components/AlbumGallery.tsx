import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import ImageWithFallback from './ImageWithFallback';
import { TrendingUp, Music, Sparkles, ChevronRight } from 'lucide-react';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface AlbumGalleryProps {
  tracks: TrendingTrack[];
  title?: string;
  showViewAll?: boolean;
}

const AlbumGallery: React.FC<AlbumGalleryProps> = ({ 
  tracks, 
  title = "🔥 TRENDING",
  showViewAll = true 
}) => {
  const router = useRouter();

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  return (
    <section className="w-full py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">실시간 인기 급상승 트랙</p>
          </motion.div>
          
          {showViewAll && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/trending')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Album Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tracks.map((track, index) => (
            <motion.div
              key={`${track.artist}-${track.track}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => handleTrackClick(track.artist, track.track)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-900 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                {/* Rank Badge - Minimalist */}
                <div className="absolute top-2 left-2 z-20">
                  <div className={`
                    px-2 py-1 rounded-md backdrop-blur-md font-bold text-xs
                    ${index < 3 
                      ? 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white' 
                      : 'bg-black/60 text-gray-200'}
                  `}>
                    #{index + 1}
                  </div>
                </div>

                {/* Chart Count Badge - Top Right */}
                <div className="absolute top-2 right-2 z-20">
                  <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md">
                    <span className="text-xs font-semibold text-white">
                      {track.chart_count}
                    </span>
                  </div>
                </div>

                {/* Album Cover */}
                <div className="relative aspect-square">
                  <ImageWithFallback
                    src={track.image_url}
                    alt={`${track.artist} - ${track.track}`}
                    artist={track.artist}
                    track={track.track}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Track Info - Below Image */}
                <div className="p-3 bg-gradient-to-b from-gray-900 to-black">
                  <h3 className="font-bold text-sm text-white mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                    {track.track}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {track.artist}
                  </p>
                  
                  {/* Mini Stats */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-500">#{track.best_rank}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-gray-500">{Math.round(track.score)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlbumGallery;
