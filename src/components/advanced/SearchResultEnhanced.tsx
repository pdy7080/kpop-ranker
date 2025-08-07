// components/SearchResultEnhanced.tsx
// 앨범 이미지가 강화된 검색 결과 컴포넌트

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ChartData {
  rank: number | null;
  published_at: string;
  album_image?: string;
}

interface SearchResultProps {
  artist: string;
  track: string;
  charts: {
    [key: string]: ChartData;
  };
  searched_at: string;
}

const SearchResultEnhanced: React.FC<SearchResultProps> = ({ artist, track, charts }) => {
  // 앨범 이미지 추출 (첫 번째로 발견되는 이미지 사용)
  const albumImage = Object.values(charts).find(chart => chart.album_image)?.album_image;
  
  // 차트 색상 매핑
  const chartColors: { [key: string]: string } = {
    'Spotify': '#1DB954',
    'Melon': '#00D639',
    'Genie': '#009BD6',
    'Bugs': '#FF6B00',
    'Vibe': '#FF3366',
    'Flo': '#7C5CFF',
    'Apple Music': '#FA243C',
    'YouTube': '#FF0000',
    'Shazam': '#0088FF',
    'Billboard': '#FFC107'
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* 앨범 이미지 섹션 */}
      {albumImage && (
        <div className="relative h-96 bg-gradient-to-b from-gray-900 to-gray-700">
          {/* 블러 배경 */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={albumImage}
              alt={`${artist} - ${track}`}
              layout="fill"
              objectFit="cover"
              className="filter blur-3xl opacity-50"
            />
          </div>
          
          {/* 메인 앨범 이미지 */}
          <motion.div 
            className="relative h-full flex items-center justify-center p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={albumImage}
                alt={`${artist} - ${track}`}
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
          </motion.div>
          
          {/* 곡 정보 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-3xl font-bold text-white mb-1">{track}</h2>
            <p className="text-xl text-gray-200">{artist}</p>
          </div>
        </div>
      )}
      
      {/* 차트 순위 섹션 */}
      <div className="p-6">
        {!albumImage && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{track}</h2>
            <p className="text-lg text-gray-600">{artist}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(charts).map(([chartName, chartData]) => (
            <motion.div
              key={chartName}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: chartColors[chartName] || '#666' }}
                />
                <h3 className="text-lg font-semibold flex-1 ml-3">{chartName}</h3>
                {chartData.rank ? (
                  <div className="text-3xl font-bold text-gray-800">
                    #{chartData.rank}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">순위 없음</div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                발표: {new Date(chartData.published_at).toLocaleString('ko-KR')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultEnhanced;
