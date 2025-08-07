import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaSpotify, FaYoutube, FaApple, FaGlobeAsia } from 'react-icons/fa';
import { SiShazam, SiBillboard } from 'react-icons/si';

interface ChartResult {
  rank: number | null;
  album_image: string | null;
  published_at: string;
}

interface ChartCardProps {
  name: string;
  data: ChartResult;
  index: number;
  artist?: string;
  track?: string;
  onChartClick?: (chart: string) => void;
}

const chartIcons: Record<string, React.ElementType> = {
  Spotify: FaSpotify,
  YouTube: FaYoutube,
  AppleMusic: FaApple,
  Shazam: SiShazam,
  Billboard: SiBillboard,
};

const chartColors: Record<string, string> = {
  Spotify: 'bg-green-500',
  YouTube: 'bg-red-500',
  AppleMusic: 'bg-gray-800',
  Shazam: 'bg-blue-500',
  Billboard: 'bg-purple-500',
  Melon: 'bg-green-600',
  Genie: 'bg-blue-600',
  Bugs: 'bg-orange-500',
  Vibe: 'bg-purple-600'
  // Flo 제거됨
};

const ChartCard: React.FC<ChartCardProps> = ({ name, data, index, artist, track, onChartClick }) => {
  const Icon = chartIcons[name] || FaGlobeAsia;
  const bgColor = chartColors[name] || 'bg-gray-500';

  const handleClick = () => {
    if (onChartClick && data.rank !== null && artist && track) {
      onChartClick(name.toLowerCase());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass rounded-2xl p-6 card-hover ${data.rank !== null && onChartClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${bgColor} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(data.published_at).toLocaleString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })} 기준
            </p>
          </div>
        </div>
      </div>

      {data.rank !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-primary-500">
                {data.rank}위
              </p>
            </div>
            {data.album_image && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={data.album_image}
                  alt="Album cover"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 dark:text-gray-600">순위 없음</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
            차트에 진입하지 않았습니다
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ChartCard;
