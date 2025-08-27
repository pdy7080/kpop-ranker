import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { chartStatusAPI } from '@/lib/api';

interface ChartUpdateData {
  chart_name: string;
  last_update: string;
  track_count?: number;
  status?: string;
}

interface ChartUpdateStatusProps {
  className?: string;
}

const CHART_NAMES: Record<string, string> = {
  melon: '멜론',
  genie: '지니', 
  bugs: '벅스',
  vibe: '바이브',
  flo: '플로',
  spotify: 'Spotify',
  youtube: 'YouTube',
  billboard: 'Billboard'
};

export default function ChartUpdateStatus({ className = '' }: ChartUpdateStatusProps) {
  const [charts, setCharts] = useState<ChartUpdateData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdateStatus = async () => {
    try {
      const data = await chartStatusAPI.getUpdateStatus();
      if (data?.charts && Array.isArray(data.charts)) {
        setCharts(data.charts);
      }
    } catch (error) {
      console.error('차트 업데이트 현황 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdateStatus();
    const interval = setInterval(fetchUpdateStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return '-';
      
      // ISO 형식이면 변환
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}.${day} ${hours}:${minutes}`;
      }
      
      // 이미 포맷된 경우 그대로 반환
      return timeString;
    } catch (error) {
      return timeString || '-';
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <div className="grid md:grid-cols-2 gap-4">
        {/* 왼쪽: 차트별 업데이트 시간 */}
        <div className="glass-card p-4 border border-white/10">
          <h3 className="font-bold text-sm mb-3 text-white flex items-center gap-2">
            <Clock className="w-4 h-4" />
            [차트별 업데이트시간]
          </h3>
          <div className="space-y-1 text-xs">
            <p className="text-gray-400">
              • <span className="font-semibold text-white">한국 3사</span> (멜론, 지니, 벅스) → 하루 4회: 01시 / 07시 / 13시 / 19시
            </p>
            <p className="text-gray-400">
              • <span className="font-semibold text-white">Vibe</span> → 하루 2회: 01시 / 13시
            </p>
            <p className="text-gray-400">
              • <span className="font-semibold text-white">FLO</span> → 하루 4회: 01시 / 07시 / 13시 / 19시
            </p>
            <p className="text-gray-400">
              • <span className="font-semibold text-white">Spotify</span> → 매일 09:00 KST
            </p>
            <p className="text-gray-400">
              • <span className="font-semibold text-white">YouTube</span> → 매일 12:00 KST
            </p>
            <p className="text-gray-400">
              • <span className="font-semibold text-white">Billboard</span> → 매주 화요일 14:00 KST 경
            </p>
          </div>
        </div>

        {/* 오른쪽: 실시간 업데이트 현황 */}
        <div className="bg-black/80 backdrop-blur rounded-lg p-3 font-mono text-xs border border-green-900/50">
          <div className="text-green-400 mb-2 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            [실시간 DB 업데이트 현황]
          </div>
          
          <div className="space-y-1">
            {loading ? (
              <div className="text-yellow-400">로딩 중...</div>
            ) : charts.length > 0 ? (
              charts.map((chart) => {
                const chartName = CHART_NAMES[chart.chart_name?.toLowerCase()] || chart.chart_name?.toUpperCase() || 'UNKNOWN';
                const isActive = chart.status === 'active' || chart.status === '정상';
                const statusColor = isActive ? 'text-green-400' : 'text-yellow-400';
                const statusIcon = isActive ? '✓' : '◐';
                
                return (
                  <div key={chart.chart_name} className={statusColor}>
                    • {chartName} → {formatTime(chart.last_update)} [{chart.track_count || 0}곡] {statusIcon}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500">데이터를 불러오는 중...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
