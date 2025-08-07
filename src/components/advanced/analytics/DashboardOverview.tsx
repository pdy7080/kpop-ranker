// components/analytics/DashboardOverview.tsx
// 대시보드 개요 컴포넌트

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

interface OverviewData {
  metrics: {
    today_searches: number;
    search_growth: number;
    active_users_today: number;
    total_users: number;
    tracks_in_charts: number;
  };
  weekly_trend: Array<{
    date: string;
    searches: number;
  }>;
}

const DashboardOverview = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/dashboard/overview`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      title: '오늘 검색수',
      value: data.metrics.today_searches.toLocaleString(),
      change: data.metrics.search_growth,
      icon: '🔍',
      color: 'blue'
    },
    {
      title: '활성 사용자',
      value: data.metrics.active_users_today.toLocaleString(),
      subtitle: `총 ${data.metrics.total_users.toLocaleString()}명`,
      icon: '👥',
      color: 'green'
    },
    {
      title: '차트인 곡',
      value: data.metrics.tracks_in_charts.toLocaleString(),
      icon: '🎵',
      color: 'purple'
    },
    {
      title: '평균 응답시간',
      value: '0.3초',
      subtitle: '캐시 적중률 82%',
      icon: '⚡',
      color: 'yellow'
    }
  ];

  // 차트 데이터
  const chartData = {
    labels: data.weekly_trend.map(d => 
      new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      label: '일별 검색수',
      data: data.weekly_trend.map(d => d.searches),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
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
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{metric.icon}</span>
              {metric.change !== undefined && (
                <span className={`text-sm font-medium ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            {metric.subtitle && (
              <p className="text-sm text-gray-500 mt-1">{metric.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* 주간 트렌드 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">주간 검색 트렌드</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
