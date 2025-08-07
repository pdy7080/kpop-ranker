// components/analytics/ArtistTypeTrends.tsx
// 솔로/그룹 트렌드 분석 컴포넌트

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement);

interface TypeData {
  categories: {
    solo: { this_week: number; last_week: number; growth: number };
    group: { this_week: number; last_week: number; growth: number };
  };
  top_in_category: {
    solo: Array<{ artist: string; searches: number }>;
    group: Array<{ artist: string; searches: number }>;
  };
}

const ArtistTypeTrends = () => {
  const [data, setData] = useState<TypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchTypeData();
  }, []);

  const fetchTypeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/artist-type-trends`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching type data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const categoryInfo = {
    solo: {
      title: '솔로 아티스트',
      icon: '🎤',
      color: 'from-purple-500 to-purple-600',
      chartColor: 'rgba(147, 51, 234, 0.8)'
    },
    group: {
      title: '그룹',
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      chartColor: 'rgba(59, 130, 246, 0.8)'
    }
  };

  // 차트 데이터
  const pieData = {
    labels: ['솔로', '그룹'],
    datasets: [{
      data: [
        data.categories.solo.this_week,
        data.categories.group.this_week
      ],
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ],
      borderColor: [
        'rgb(147, 51, 234)',
        'rgb(59, 130, 246)'
      ],
      borderWidth: 2
    }]
  };

  // 성장률 비교 차트
  const barData = {
    labels: ['이번 주', '지난 주'],
    datasets: [
      {
        label: '솔로',
        data: [data.categories.solo.this_week, data.categories.solo.last_week],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
      },
      {
        label: '그룹',
        data: [data.categories.group.this_week, data.categories.group.last_week],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 전체 분포 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">솔로 vs 그룹 검색 분포</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('pie')}
              className={`p-2 rounded ${viewMode === 'pie' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="원형 차트"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`p-2 rounded ${viewMode === 'bar' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="막대 차트"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="h-64">
          {viewMode === 'pie' ? (
            <Doughnut data={pieData} options={chartOptions} />
          ) : (
            <Bar data={barData} options={chartOptions} />
          )}
        </div>
        
        {/* 인사이트 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {data.categories.solo.this_week > data.categories.group.this_week
              ? `솔로 아티스트가 전체 검색의 ${Math.round(data.categories.solo.this_week / (data.categories.solo.this_week + data.categories.group.this_week) * 100)}%를 차지하고 있습니다.`
              : `그룹이 전체 검색의 ${Math.round(data.categories.group.this_week / (data.categories.solo.this_week + data.categories.group.this_week) * 100)}%를 차지하고 있습니다.`
            }
          </p>
        </div>
      </motion.div>

      {/* 카테고리별 상세 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.entries(data.categories) as [keyof typeof categoryInfo, any][]).map(([category, stats], index) => {
          const info = categoryInfo[category];
          const topArtists = data.top_in_category[category];
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* 헤더 */}
              <div className={`bg-gradient-to-r ${info.color} text-white p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{info.icon}</span>
                    <h3 className="text-lg font-semibold">{info.title}</h3>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${
                    stats.growth > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {stats.growth > 0 ? '+' : ''}{stats.growth}%
                  </div>
                </div>
              </div>
              
              {/* 통계 */}
              <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">이번 주</p>
                    <p className="text-xl font-semibold">{stats.this_week.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">지난 주</p>
                    <p className="text-xl font-semibold">{stats.last_week.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Top 5 아티스트 */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top 5 아티스트</h4>
                <div className="space-y-2">
                  {topArtists.slice(0, 5).map((artist, idx) => (
                    <div key={artist.artist} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          idx === 0 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium capitalize">
                          {artist.artist}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {artist.searches.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ArtistTypeTrends;
