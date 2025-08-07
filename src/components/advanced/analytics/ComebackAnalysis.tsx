// components/analytics/ComebackAnalysis.tsx
// 컴백/신곡 발매 효과 분석 컴포넌트

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, PointElement, LinearScale, TimeScale } from 'chart.js';

ChartJS.register(PointElement, LinearScale, TimeScale);

interface ComebackData {
  comeback_events: Array<{
    artist: string;
    date: string;
    search_count: number;
    spike_ratio: number;
    sustained_days: number;
    fandom_power: number;
  }>;
  fandom_ranking: Array<{
    artist: string;
    fandom_score: number;
    total_comebacks: number;
    avg_spike_ratio: number;
    max_search_count: number;
  }>;
  analysis: {
    total_events: number;
    avg_spike_ratio: number;
    most_active_artist: string;
  };
}

const ComebackAnalysis = () => {
  const [data, setData] = useState<ComebackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchComebackData();
  }, []);

  const fetchComebackData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/comeback-analysis?days=30`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching comeback data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // 산점도 데이터 (팬덤 파워 vs 급증률)
  const scatterData = {
    datasets: [{
      label: '컴백 이벤트',
      data: data.comeback_events.map(event => ({
        x: event.spike_ratio,
        y: event.fandom_power,
        artist: event.artist,
        date: event.date
      })),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      pointRadius: 8,
      pointHoverRadius: 10
    }]
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const point = context.raw;
            return [
              `${point.artist}`,
              `급증률: ${point.x}배`,
              `팬덤 파워: ${point.y}점`,
              `날짜: ${new Date(point.date).toLocaleDateString('ko-KR')}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '검색량 급증률 (배)'
        }
      },
      y: {
        title: {
          display: true,
          text: '팬덤 파워 점수'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 개요 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🚀</span>
            <span className="text-sm text-gray-500">지난 30일</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">컴백 이벤트</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.analysis.total_events}건</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📈</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">평균 급증률</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.analysis.avg_spike_ratio}배</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">👑</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">최강 팬덤</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.analysis.most_active_artist}</p>
        </motion.div>
      </div>

      {/* 팬덤 파워 vs 급증률 산점도 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">컴백 효과 분석</h3>
        <p className="text-sm text-gray-600 mb-4">
          X축: 평소 대비 검색량 증가율 | Y축: 팬덤 파워 (급증률 + 지속성 + 절대량)
        </p>
        <div className="h-96">
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </motion.div>

      {/* 팬덤 파워 랭킹 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
          <h3 className="text-lg font-semibold">💪 팬덤 파워 랭킹</h3>
          <p className="text-sm opacity-90 mt-1">컴백 시 검색량 급증과 지속성 기준</p>
        </div>

        <div className="divide-y divide-gray-200">
          {data.fandom_ranking.slice(0, 10).map((artist, index) => (
            <motion.div
              key={artist.artist}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedArtist === artist.artist ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedArtist(
                selectedArtist === artist.artist ? null : artist.artist
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                    ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' :
                      'bg-gray-500'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{artist.artist}</p>
                    <p className="text-sm text-gray-500">
                      {artist.total_comebacks}회 컴백 | 평균 {artist.avg_spike_ratio}배 급증
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-purple-600">
                    {artist.fandom_score}점
                  </p>
                  <p className="text-xs text-gray-500">
                    최대 {artist.max_search_count.toLocaleString()}회
                  </p>
                </div>
              </div>
              
              {/* 선택 시 상세 정보 */}
              {selectedArtist === artist.artist && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">컴백 횟수</p>
                      <p className="font-semibold">{artist.total_comebacks}회</p>
                    </div>
                    <div>
                      <p className="text-gray-500">평균 급증률</p>
                      <p className="font-semibold">{artist.avg_spike_ratio}배</p>
                    </div>
                    <div>
                      <p className="text-gray-500">최고 검색량</p>
                      <p className="font-semibold">{artist.max_search_count.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 인사이트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">💡 팬덤 분석 인사이트</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            • <strong>강력한 팬덤</strong>: 검색량이 평균 5배 이상 증가하고 3일 이상 지속되는 아티스트
          </p>
          <p>
            • <strong>충성도 높은 팬덤</strong>: 컴백 때마다 꾸준히 높은 급증률을 보이는 아티스트
          </p>
          <p>
            • <strong>대중성 있는 팬덤</strong>: 절대 검색량이 높고 급증 후에도 높은 수준 유지
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ComebackAnalysis;
