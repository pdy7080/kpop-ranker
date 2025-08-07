import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { chartApi } from '@/lib/api';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  chartName: string;
  artistName: string;
  trackName: string;
  period?: number; // days
}

interface HistoryData {
  date: string;
  rank: number;
}

const TrendChart: React.FC<TrendChartProps> = ({
  chartName,
  artistName,
  trackName,
  period = 30
}) => {
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [chartName, artistName, trackName, period]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await chartApi.getChartHistory(chartName, artistName, trackName);
      if (response && response.history) {
        // 이미 특정 차트의 히스토리만 받아옴
        setHistoryData(response.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-gray-500 text-sm">트렌드 데이터가 없습니다</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: historyData.map(item => 
      new Date(item.date).toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: `${chartName} 순위`,
        data: historyData.map(item => item.rank),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}위`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        reverse: true, // 1위가 위에 오도록
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 1,
          callback: (value) => `${value}위`,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-48"
    >
      <Line data={chartData} options={options} />
    </motion.div>
  );
};

export default TrendChart;
