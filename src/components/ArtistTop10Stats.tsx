import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Star, Sparkles, Crown, Target } from 'lucide-react';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Top10Track {
  track: string;
  best_rank: number;
  chart_count: number;
  charts: string[];
}

interface NewEntry {
  track: string;
  entry_rank: number;
  entry_date: string;
}

interface ArtistTop10StatsProps {
  artistName: string;
}

export default function ArtistTop10Stats({ artistName }: ArtistTop10StatsProps) {
  const router = useRouter();
  const [top10Data, setTop10Data] = useState<any>(null);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTop10Stats();
    fetchRealtimeStats();
  }, [artistName]);

  const fetchTop10Stats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/top10`);
      if (response.ok) {
        const data = await response.json();
        setTop10Data(data);
      }
    } catch (error) {
      console.error('Failed to fetch TOP 10 stats:', error);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/realtime-stats`);
      if (response.ok) {
        const data = await response.json();
        setRealtimeStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch realtime stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (track: string) => {
    router.push(`/track/${encodeURIComponent(artistName)}/${encodeURIComponent(track)}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-800 rounded-xl"></div>
        <div className="h-48 bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 실시간 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-900/30 to-purple-700/30 rounded-xl p-4 border border-purple-500/30"
        >
          <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">{realtimeStats?.top10_tracks_total || 0}</p>
          <p className="text-xs text-gray-400">TOP 10 진입곡</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-700/30 rounded-xl p-4 border border-blue-500/30"
        >
          <Star className="w-6 h-6 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">{realtimeStats?.success_rate?.toFixed(1) || 0}%</p>
          <p className="text-xs text-gray-400">성공률</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-900/30 to-green-700/30 rounded-xl p-4 border border-green-500/30"
        >
          <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">{realtimeStats?.active_tracks || 0}</p>
          <p className="text-xs text-gray-400">현재 차트인</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-900/30 to-orange-700/30 rounded-xl p-4 border border-orange-500/30"
        >
          <Target className="w-6 h-6 text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">#{realtimeStats?.average_rank?.toFixed(0) || '-'}</p>
          <p className="text-xs text-gray-400">평균 순위</p>
        </motion.div>
      </div>

      {/* TOP 10 진입곡 리스트 */}
      {top10Data?.top10_tracks?.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            TOP 10 진입곡
          </h3>
          <div className="space-y-3">
            {top10Data.top10_tracks.slice(0, 5).map((track: Top10Track, idx: number) => (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                onClick={() => handleTrackClick(track.track)}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${track.best_rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black' :
                      track.best_rank <= 3 ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white' :
                      'bg-gray-700 text-gray-300'}
                  `}>
                    {track.best_rank}
                  </div>
                  <div>
                    <p className="font-medium text-white">{track.track}</p>
                    <p className="text-xs text-gray-400">{track.chart_count}개 차트 진입</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {track.charts.slice(0, 3).map((chart, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-800 rounded">
                      {chart}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 신규 진입곡 */}
      {top10Data?.new_entries?.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            이번 주 신규 진입
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {top10Data.new_entries.map((entry: NewEntry, idx: number) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleTrackClick(entry.track)}
                className="p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{entry.track}</p>
                    <p className="text-xs text-gray-400">
                      진입 순위: #{entry.entry_rank}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    NEW
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 차트별 1위 현황 */}
      {top10Data?.chart_ones && Object.keys(top10Data.chart_ones).length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">차트별 1위 기록</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Object.entries(top10Data.chart_ones).map(([chart, count]) => (
              <div key={chart} className="text-center">
                <div className="text-2xl mb-1">{count}</div>
                <div className="text-xs text-gray-400 capitalize">{chart}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
