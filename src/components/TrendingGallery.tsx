import React from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';
import { useRouter } from 'next/router';

interface TrendingTrack {
  artist: string;
  track: string;
  score: number;
  charts: Record<string, number | string>;
  best_rank: number;
  chart_count: number;
  image_url?: string;
}

interface TrendingGalleryProps {
  trendingTracks: TrendingTrack[];
}

const TrendingGallery: React.FC<TrendingGalleryProps> = ({ trendingTracks }) => {
  const router = useRouter();
  
  // 4~9위만 표시 (6개) - 깔끔하게 줄임
  const galleryTracks = trendingTracks.slice(3, 9);
  
  const handleTrackClick = (artist: string, track: string) => {
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    router.push(`/track/${encodedArtist}/${encodedTrack}`);
  };

  return (
    <div className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">
          🔥 TRENDING
        </h2>
        <p className="text-xl text-gray-400">
          지금 뜨고 있는 트랙들
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {galleryTracks.map((track, index) => {
            const actualRank = index + 4;
            
            return (
              <motion.div
                key={`${track.artist}-${track.track}`}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => handleTrackClick(track.artist, track.track)}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-xl">
                  <ImageWithFallback
                    artist={track.artist}
                    track={track.track}
                    className="w-full h-64 md:h-80 object-cover transition-all duration-500 group-hover:scale-105"
                    priority={index < 6}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 left-4 z-10">
                    <div className="w-8 h-8 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {actualRank}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-bold mb-1 line-clamp-1">{track.artist}</h3>
                    <p className="text-gray-200 text-sm mb-2 line-clamp-1">{track.track}</p>
                    <div className="text-xs text-gray-300">
                      {track.chart_count}개 차트
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center mt-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/trending')}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-300 border border-white/20"
          >
            전체 보기 →
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TrendingGallery;