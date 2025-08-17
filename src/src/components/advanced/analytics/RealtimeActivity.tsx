// components/analytics/RealtimeActivity.tsx
// 실시간 활동 모니터링 컴포넌트

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface RealtimeData {
  recent_searches: Array<{
    artist: string;
    track: string;
    time: string;
    has_results: boolean;
  }>;
  trending_now: Array<{
    artist: string;
    track: string;
    count: number;
  }>;
  chart_leaders: {
    [key: string]: {
      artist: string;
      track: string;
      album_image?: string;
    };
  };
}

const RealtimeActivity = () => {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // 초기 로드
    fetchRealtimeData();

    // 10초마다 업데이트
    const interval = setInterval(fetchRealtimeData, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchRealtimeData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/realtime`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching realtime data:', error);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 실시간 검색 */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">실시간 검색</h3>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {data.recent_searches.map((search, index) => (
              <motion.div
                key={`${search.artist}-${search.track}-${search.time}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{search.track}</p>
                  <p className="text-xs text-gray-500">{search.artist}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {search.has_results && (
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatTime(search.time)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 실시간 급상승 */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-4">🔥 실시간 급상승</h3>
        
        <div className="space-y-3">
          {data.trending_now.map((item, index) => (
            <motion.div
              key={`${item.artist}-${item.track}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  'bg-gray-500'}
              `}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.track}</p>
                <p className="text-xs text-gray-500">{item.artist}</p>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{item.count}</span>
                <span className="text-xs ml-1">검색</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 차트별 1위 */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4">👑 차트별 1위</h3>
        
        <div className="space-y-3">
          {Object.entries(data.chart_leaders).slice(0, 5).map(([chart, leader], index) => (
            <motion.div
              key={chart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="flex-shrink-0">
                {leader.album_image ? (
                  <Image
                    src={leader.album_image}
                    alt={`${leader.artist} - ${leader.track}`}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs">🎵</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{chart}</p>
                <p className="text-xs text-gray-500">
                  {leader.artist} - {leader.track}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RealtimeActivity;
