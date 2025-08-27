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
  
  // 4~19위 갤러리용 트랙들
  const galleryTracks = trendingTracks.slice(3, 19);
  
  const handleTrackClick = (artist: string, track: string) => {
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    router.push(`/track/${encodedArtist}/${encodedTrack}`);
  };

  return (
    <div className="py-16">
      {/* Clean Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">
          🔥 TRENDING
        </h2>
        <p className="text-gray-400">
          실시간 인기 트랙들
        </p>
      </div>
      
      {/* Minimal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {galleryTracks.map((track, index) => {
          const actualRank = index + 4;
          
          return (
            <motion.div
              key={`${track.artist}-${track.track}`}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => handleTrackClick(track.artist, track.track)}
            >
              {/* Simple Card */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-indigo-600/50">
                
                {/* Album Image */}
                <div className="relative aspect-square">
                  <ImageWithFallback
                    artist={track.artist}
                    track={track.track}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={index < 8}    // 첫 8개만 우선 로드
                  />
                  
                  {/* Simple Rank Badge */}
                  <div className="absolute top-3 left-3 bg-gray-900/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    {actualRank}
                  </div>
                  
                  {/* Chart Count Badge */}
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full px-2 py-1 text-xs font-medium">
                    {track.chart_count}
                  </div>
                </div>
                
                {/* Track Info - Minimal */}
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">
                    {track.artist}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {track.track}
                  </p>
                  
                  {/* Best Rank Only */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-gray-500">최고 순위</span>
                    <span className="text-indigo-400 font-semibold">#{track.best_rank}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* More Button - Simple */}
        <motion.div
          className="group cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: galleryTracks.length * 0.05 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => router.push('/trending')}
        >
          <div className="bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl h-full flex flex-col items-center justify-center text-white p-8 min-h-[280px]">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="font-semibold text-lg mb-2">더 많은</h3>
            <p className="text-sm opacity-90 mb-4">트렌딩 차트</p>
            <div className="bg-white/20 rounded-lg px-4 py-2 text-sm font-medium">
              전체 보기
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrendingGallery;
