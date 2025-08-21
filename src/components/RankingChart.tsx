// components/RankingChart.tsx
// 순위 변화 그래프 컴포넌트

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RankingData {
  chart: string;
  rank: number;
  views: string;
  date: string;
}

interface RankingChartProps {
  artist: string;
  track: string;
}

export default function RankingChart({ artist, track }: RankingChartProps) {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [artist, track]);

  const fetchRankings = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chart/rankings/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`
      );
      const data = await response.json();
      setRankings(data.rankings);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;
  }

  if (!rankings.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        순위 변화 데이터가 없습니다
      </div>
    );
  }

  // 차트별로 데이터 그룹화
  const chartData: { [key: string]: { dates: string[], ranks: number[] } } = {};
  
  rankings.forEach(item => {
    if (!chartData[item.chart]) {
      chartData[item.chart] = { dates: [], ranks: [] };
    }
    chartData[item.chart].dates.push(item.date);
    chartData[item.chart].ranks.push(item.rank);
  });

  // Chart.js 데이터 구성
  const colors = {
    MELON: 'rgb(0, 199, 60)',
    GENIE: 'rgb(0, 181, 226)',
    BUGS: 'rgb(255, 102, 0)',
    VIBE: 'rgb(184, 51, 255)',
    FLO: 'rgb(91, 45, 125)',
    SPOTIFY: 'rgb(30, 215, 96)',
    YOUTUBE: 'rgb(255, 0, 0)',
    BILLBOARD: 'rgb(255, 223, 0)'
  };

  const datasets = Object.entries(chartData).map(([chart, data]) => ({
    label: chart,
    data: data.ranks,
    borderColor: colors[chart as keyof typeof colors] || 'rgb(75, 192, 192)',
    backgroundColor: 'transparent',
    tension: 0.4,
    yAxisID: 'y',
  }));

  const chartConfig = {
    labels: Object.values(chartData)[0]?.dates || [],
    datasets
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '차트 순위 변화',
      },
    },
    scales: {
      y: {
        reverse: true,
        min: 1,
        max: 100,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">순위 변화 추이</h3>
      <Line data={chartConfig} options={options} />
    </div>
  );
}
