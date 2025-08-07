// components/ChartHistory.tsx
// 차트 히스토리 그래프 컴포넌트

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { motion } from 'framer-motion';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartHistoryProps {
  artist: string;
  track: string;
  days?: number;
}

interface ChartData {
  dates: string[];
  ranks: (number | null)[];
}

const ChartHistory: React.FC<ChartHistoryProps> = ({ artist, track, days = 30 }) => {
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 차트 색상 매핑
  const chartColors: { [key: string]: string } = {
    'Spotify': '#1DB954',
    'Melon': '#00D639',
    'Genie': '#009BD6',
    'Bugs': '#FF6B00',
    'Vibe': '#FF3366',
    'Flo': '#7C5CFF',
    'Apple Music': '#FA243C',
    'YouTube': '#FF0000',
    'Shazam': '#0088FF',
    'Billboard': '#FFC107'
  };

  useEffect(() => {
    fetchHistory();
  }, [artist, track, days]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        artist,
        track,
        days: days.toString()
      });
      
      const response = await fetch(`${API_URL}/api/history/track?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
        
        // 기본적으로 상위 3개 차트 선택
        if (data.chart_data) {
          const charts = Object.keys(data.chart_data).slice(0, 3);
          setSelectedCharts(charts);
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChart = (chartName: string) => {
    setSelectedCharts(prev => {
      if (prev.includes(chartName)) {
        return prev.filter(c => c !== chartName);
      } else {
        return [...prev, chartName];
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">순위 변동 히스토리</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!historyData || !historyData.chart_data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">순위 변동 히스토리</h3>
        <p className="text-gray-500">히스토리 데이터가 없습니다.</p>
      </div>
    );
  }

  // Chart.js 데이터 구성
  const chartData = {
    labels: historyData.dates || [],
    datasets: selectedCharts.map(chartName => {
      const data = historyData.chart_data[chartName];
      return {
        label: chartName,
        data: data.ranks,
        borderColor: chartColors[chartName] || '#666',
        backgroundColor: chartColors[chartName] || '#666',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    })
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        reverse: true,
        min: 1,
        max: 100,
        ticks: {
          stepSize: 10
        },
        title: {
          display: true,
          text: '순위'
        }
      },
      x: {
        title: {
          display: true,
          text: '날짜'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">순위 변동 히스토리</h3>
        
        {/* 통계 정보 */}
        {historyData.statistics && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">최고 순위</p>
              <p className="text-lg font-bold text-blue-600">
                #{historyData.statistics.peak_rank || '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">평균 순위</p>
              <p className="text-lg font-bold text-gray-700">
                #{historyData.statistics.average_rank || '-'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 차트 선택 버튼들 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(historyData.chart_data).map(chartName => (
          <button
            key={chartName}
            onClick={() => toggleChart(chartName)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedCharts.includes(chartName)
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: selectedCharts.includes(chartName) 
                ? chartColors[chartName] 
                : undefined
            }}
          >
            {chartName}
          </button>
        ))}
      </div>

      {/* 그래프 */}
      <div className="h-64">
        {selectedCharts.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            차트를 선택해주세요
          </div>
        )}
      </div>

      {/* 기간 선택 */}
      <div className="mt-4 flex justify-center space-x-2">
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => {
              if (d !== days) {
                window.location.search = `?days=${d}`;
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm ${
              d === days
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d}일
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartHistory;
