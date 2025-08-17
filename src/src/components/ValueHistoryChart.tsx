import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ValueHistory {
  date: string;
  value: number;
  change: number;
}

interface ValueHistoryChartProps {
  data: ValueHistory[];
  height?: number;
}

const ValueHistoryChart: React.FC<ValueHistoryChartProps> = ({ data, height = 300 }) => {
  // Calculate statistics
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || currentValue;
  const changePercent = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  // Prepare chart data
  const chartData = {
    labels: data.map(item => 
      format(new Date(item.date), 'M/d', { locale: ko })
    ),
    datasets: [
      {
        label: '포트폴리오 가치',
        data: data.map(item => item.value),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const date = new Date(data[index].date);
            return format(date, 'yyyy년 M월 d일', { locale: ko });
          },
          label: (context) => {
            const value = context.parsed.y;
            const index = context.dataIndex;
            const change = data[index].change;
            
            return [
              `가치: ${value.toLocaleString()}점`,
              `변동: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
            ];
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => `${(Number(value) / 1000).toFixed(0)}k`,
        },
        suggestedMin: minValue * 0.95,
        suggestedMax: maxValue * 1.05,
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            {currentValue.toLocaleString()}점
          </h3>
          <p className={`text-sm ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {changePercent >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}% 
            <span className="text-gray-500 ml-1">전일 대비</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">최고가</p>
          <p className="font-semibold">{maxValue.toLocaleString()}점</p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Period Selector */}
      <div className="flex justify-center space-x-2">
        {['1주', '1개월', '3개월', '전체'].map((period) => (
          <button
            key={period}
            className="px-3 py-1 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ValueHistoryChart;
