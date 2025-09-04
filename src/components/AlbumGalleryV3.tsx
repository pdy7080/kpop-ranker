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
  tracks?: TrendingTrack[];
  initialData?: TrendingTrack[]; // SSG를 위한 prop 추가
  showViewAll?: boolean;
}

const AlbumGalleryV3: React.FC<AlbumGalleryV3Props> = ({ 
  tracks,
  initialData,
  showViewAll = true
}) => {
  const router = useRouter();
  
  // tracks 또는 initialData 사용, 둘 다 없으면 빈 배열
  const displayTracks = tracks || initialData || [];

  const handleTrackClick = (artist: string, track: string) => {
    router.push(`/track/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
  };

  // 안전한 배열 체크
  if (!Array.isArray(displayTracks)) {
    console.error('AlbumGalleryV3: tracks is not an array', displayTracks);
    return null;
  }

  return (
    <div>
      {/* View All Button */}
      {showViewAll && displayTracks.length > 0 && (
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
      {displayTracks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayTracks.map((track, index) => (
            <motion.div
              key={`${track.artist}-${track.track}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="group cursor-pointer"
              onClick={() => handleTrackClick(track.artist, track.track)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800/50">
                {/* Rank Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="text-xs font-bold text-purple-400">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Hot Badge for top 3 */}
                {index < 3 && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-1">
                      <Flame className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                )}

                {/* Album Image */}
                <ImageWithFallback
                  src={track.image_url || ''}
                  alt={`${track.artist} - ${track.track}`}
                  artist={track.artist}
                  track={track.track}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Track Info - Show on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <h3 className="text-sm font-semibold truncate text-white">
                    {track.track}
                  </h3>
                  <p className="text-xs text-gray-300 truncate">
                    {track.artist}
                  </p>
                  
                  {/* Score */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">
                        {track.score ? Math.round(track.score) : 0}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {track.chart_count || 0} charts
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">트렌딩 데이터를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

export default AlbumGalleryV3;