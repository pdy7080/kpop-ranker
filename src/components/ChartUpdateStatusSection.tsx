import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Clock, CheckCircle } from 'lucide-react';
import { chartStatusAPI } from '@/lib/api';

interface ChartStatus {
  chart_name: string;
  track_count: number;
  last_update: string;
  status: string;
}

const ChartUpdateStatusSection: React.FC = () => {
  const [chartStatus, setChartStatus] = useState<ChartStatus[]>([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await chartStatusAPI.getUpdateStatus();
      if (data?.charts) {
        setChartStatus(data.charts);
        setTotalTracks(data.total_tracks || 0);
        setLastUpdate(data.last_updated || '');
      }
    } catch (error) {
      console.error('Error fetching chart status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartEmoji = (chartName: string) => {
    const emojis: Record<string, string> = {
      melon: '🍈',
      genie: '🧞',
      bugs: '🐛',
      spotify: '🎧',
      youtube: '📺',
      flo: '🌊',
      vibe: '💜',
      billboard: '📊'
    };
    return emojis[chartName.toLowerCase()] || '🎵';
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // 분 단위
    
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  };

  if (isLoading) {
    return (
      <section className="py-8 bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-20 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-b from-gray-900/30 to-black border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 rounded-full w-3 h-3"></div>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-white">차트 업데이트 시간</h3>
        </motion.div>

        {/* Chart Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 국내 차트 */}
          <div className="md:col-span-4 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 md:col-span-4">
              <div className="text-xs font-bold text-green-400 mb-2">🇰🇷 국내 차트</div>
            </div>
            {['melon', 'genie', 'bugs', 'flo', 'vibe'].map((chartName) => {
              const chart = chartStatus.find(c => c.chart_name.toLowerCase() === chartName);
              if (!chart) return null;
              
              return (
                <motion.div
                  key={chart.chart_name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-lg">{getChartEmoji(chart.chart_name)}</span>
                    <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
                  </div>
                  <div className="text-xs font-bold text-white mb-0.5">
                    {chart.chart_name.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(chart.last_update)}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 글로벌 차트 */}
          <div className="md:col-span-4 lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-3">
              <div className="text-xs font-bold text-blue-400 mb-2">🌍 글로벌 차트</div>
            </div>
            {['spotify', 'youtube', 'billboard'].map((chartName) => {
              const chart = chartStatus.find(c => c.chart_name.toLowerCase() === chartName);
              if (!chart) return null;
              
              return (
                <motion.div
                  key={chart.chart_name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-lg">{getChartEmoji(chart.chart_name)}</span>
                    <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
                  </div>
                  <div className="text-xs font-bold text-white mb-0.5">
                    {chart.chart_name.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(chart.last_update)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 참고 사항 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          💡 이용 도움말은 우측 하단 톡톡에서 문의 가능, 응답은 오전10시-저녁6시
        </motion.div>
      </div>
    </section>
  );
};

export default ChartUpdateStatusSection;
