import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { chartStatusAPI } from '@/lib/api';

interface ChartStatus {
  chart_name: string;
  track_count: number;
  last_update: string;
  status: string;
}

const ChartUpdateStatus: React.FC = () => {
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
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border-t border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse flex items-center justify-center">
            <div className="h-4 bg-gray-700 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/10 to-pink-900/10 backdrop-blur-sm border-t border-purple-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Live Indicator */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 rounded-full w-3 h-3"></div>
            </div>
            <span className="text-sm font-bold text-white">LIVE DATABASE</span>
            <span className="text-xs text-gray-400">실시간 업데이트 중</span>
          </motion.div>

          {/* Chart Status Grid */}
          <div className="flex flex-wrap gap-3">
            {chartStatus.slice(0, 5).map((chart, index) => (
              <motion.div
                key={chart.chart_name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10"
              >
                <span className="text-lg">{getChartEmoji(chart.chart_name)}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white">
                    {chart.chart_name.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {chart.track_count} tracks • {formatTime(chart.last_update)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">{totalTracks.toLocaleString()}</span>
              <span className="text-xs text-gray-400">Total Tracks</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">{formatTime(lastUpdate)}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChartUpdateStatus;
