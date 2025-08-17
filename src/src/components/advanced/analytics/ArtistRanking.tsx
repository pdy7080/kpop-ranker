// components/analytics/ArtistRanking.tsx
// 아티스트 종합 랭킹 컴포넌트

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';

interface RankingData {
  search_ranking: Array<{
    rank: number;
    artist: string;
    search_count: number;
    unique_users: number;
  }>;
  chart_ranking: Array<{
    rank: number;
    artist: string;
    average_rank: number;
    average_charts: number;
    best_rank: number;
  }>;
}

const ArtistRanking = () => {
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchRankingData();
  }, [period]);

  const fetchRankingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/artist-ranking?days=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching ranking data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  // 차트 데이터 준비
  const chartData = {
    labels: data.search_ranking.slice(0, 10).map(item => item.artist),
    datasets: [
      {
        label: '검색수',
        data: data.search_ranking.slice(0, 10).map(item => item.search_count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 컨트롤 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">아티스트 종합 랭킹</h2>
          <div className="flex items-center space-x-2">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  period === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {days}일
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded ${viewMode === 'chart' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 검색량 기준 랭킹 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
              <h3 className="text-lg font-semibold">🔍 검색량 랭킹</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {data.search_ranking.map((item, index) => (
                <motion.div
                  key={item.artist}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                        ${item.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                          item.rank === 2 ? 'bg-gray-400' : 
                          item.rank === 3 ? 'bg-amber-600' :
                          'bg-gray-500'}
                      `}>
                        {item.rank}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.artist}</p>
                        <p className="text-sm text-gray-500">
                          {item.unique_users.toLocaleString()}명 검색
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {item.search_count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">검색</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 차트 성과 기준 랭킹 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
              <h3 className="text-lg font-semibold">📊 차트 성과 랭킹</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {data.chart_ranking.map((item, index) => (
                <motion.div
                  key={item.artist}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                        ${item.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                          item.rank === 2 ? 'bg-gray-400' : 
                          item.rank === 3 ? 'bg-amber-600' :
                          'bg-gray-500'}
                      `}>
                        {item.rank}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.artist}</p>
                        <p className="text-sm text-gray-500">
                          최고 #{item.best_rank} / 평균 {item.average_charts}개 차트
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        #{item.average_rank}
                      </p>
                      <p className="text-xs text-gray-500">평균 순위</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">검색량 Top 10</h3>
          <div className="h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ArtistRanking;
