import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Filler
} from 'chart.js';
import { FaTimes, FaChartLine, FaFireAlt, FaTrophy } from 'react-icons/fa';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { chartAPI } from '@/lib/api';

// Chart.js 등록
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

interface ChartHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: string;
  artist: string;
  track: string;
  currentRank?: number;
}

interface HistoryData {
  date: string;
  rank: number;
  views_or_streams?: string;
}

interface ChartHistoryResponse {
  history: HistoryData[];
  rank_change?: number;
  trend?: 'up' | 'down' | 'stable';
  message?: string;
}

const ChartHistoryModal: React.FC<ChartHistoryModalProps> = ({
  isOpen,
  onClose,
  chart,
  artist,
  track,
  currentRank
}) => {
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [rankChange, setRankChange] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (isOpen && artist && track) {
      fetchChartHistory();
    }
  }, [isOpen, chart, artist, track]);

  const fetchChartHistory = async () => {
    setLoading(true);
    try {
      const response = await chartAPI.getHistory(chart, artist, track) as ChartHistoryResponse;
      // response가 이미 데이터 객체임 (safeApiCall에서 response.data를 반환)
      setHistory(response.history || []);
      setRankChange(response.rank_change || 0);
      setTrend(response.trend || 'stable');
    } catch (error) {
      console.error('History fetch error:', error);
      toast.error('순위 히스토리를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 차트 데이터 준비
  const chartData = {
    labels: history.map(h => {
      const date = new Date(h.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }).reverse(),
    datasets: [
      {
        label: '순위',
        data: history.map(h => h.rank).reverse(),
        borderColor: chart === 'spotify' ? '#1DB954' : 
                     chart === 'youtube' ? '#FF0000' :
                     chart === 'melon' ? '#00CD3C' :
                     chart === 'billboard' ? '#1B1B1B' :
                     '#ef5144',
        backgroundColor: chart === 'spotify' ? 'rgba(29, 185, 84, 0.1)' : 
                        chart === 'youtube' ? 'rgba(255, 0, 0, 0.1)' :
                        chart === 'melon' ? 'rgba(0, 205, 60, 0.1)' :
                        chart === 'billboard' ? 'rgba(27, 27, 27, 0.1)' :
                        'rgba(239, 81, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        reverse: true, // 순위는 낮을수록 좋으므로 역순
        beginAtZero: false,
        min: 1,
        max: Math.max(...(history.map(h => h.rank) || [100])),
        ticks: {
          stepSize: 10,
          callback: function(value: any) {
            return value + '위';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const historyItem = history[history.length - 1 - dataIndex];
            let label = `${context.parsed.y}위`;
            if (historyItem?.views_or_streams) {
              label += ` (${historyItem.views_or_streams})`;
            }
            return label;
          }
        }
      }
    }
  };

  const getChartColor = () => {
    const colors: { [key: string]: string } = {
      spotify: 'bg-green-500',
      youtube: 'bg-red-500',
      melon: 'bg-green-400',
      billboard: 'bg-gray-800',
      bugs: 'bg-orange-500',
      genie: 'bg-blue-500',
      vibe: 'bg-purple-500',
      apple_music: 'bg-pink-500'
    };
    return colors[chart.toLowerCase()] || 'bg-primary-500';
  };

  const getTrendIcon = () => {
    if (rankChange > 0) return <HiTrendingUp className="w-6 h-6 text-green-500" />;
    if (rankChange < 0) return <HiTrendingDown className="w-6 h-6 text-red-500" />;
    return <FaChartLine className="w-6 h-6 text-gray-500" />;
  };

  const getTrendMessage = () => {
    if (rankChange > 10) {
      return {
        text: `${rankChange}계단 상승! 🚀`,
        className: 'text-green-600 font-bold',
        icon: <FaTrophy className="w-5 h-5 text-yellow-500" />
      };
    } else if (rankChange > 0) {
      return {
        text: `${rankChange}계단 상승`,
        className: 'text-green-600',
        icon: null
      };
    } else if (rankChange < -5) {
      return {
        text: `${Math.abs(rankChange)}계단 하락 - 화력 필요! 🔥`,
        className: 'text-red-600 font-bold',
        icon: <FaFireAlt className="w-5 h-5 text-red-500" />
      };
    } else if (rankChange < 0) {
      return {
        text: `${Math.abs(rankChange)}계단 하락`,
        className: 'text-red-600',
        icon: null
      };
    } else {
      return {
        text: '순위 유지 중',
        className: 'text-gray-600',
        icon: null
      };
    }
  };

  if (!isOpen) return null;

  const trendMessage = getTrendMessage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* 헤더 */}
              <div className={`relative p-6 ${getChartColor()}`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-white" />
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  {chart.toUpperCase()} 순위 변화
                </h2>
                <p className="text-white text-opacity-90">
                  {artist} - {track}
                </p>
                {currentRank && (
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-3xl font-bold text-white">
                      현재 {currentRank}위
                    </span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon()}
                      <span className={`${trendMessage.className} bg-white px-3 py-1 rounded-full flex items-center gap-2`}>
                        {trendMessage.icon}
                        {trendMessage.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 컨텐츠 */}
              <div className="p-6">
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="loading-spinner" />
                  </div>
                ) : history.length > 0 ? (
                  <>
                    <div className="h-96">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                    
                    {/* 팬덤 액션 제안 */}
                    {rankChange < -5 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg border-l-4 border-red-500"
                      >
                        <h3 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                          <FaFireAlt className="w-5 h-5" />
                          팬덤 화력 집중 필요!
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          최근 순위가 하락하고 있습니다. {chart.toUpperCase()}에서 스트리밍과 검색을 늘려주세요!
                        </p>
                      </motion.div>
                    )}
                    
                    {rankChange > 10 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg border-l-4 border-green-500"
                      >
                        <h3 className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                          <FaTrophy className="w-5 h-5" />
                          순위 급상승 중!
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          팬덤의 노력이 빛을 발하고 있습니다! 이 기세를 이어가세요!
                        </p>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <FaChartLine className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        순위 히스토리 데이터가 아직 수집되지 않았습니다.
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        매일 자동으로 순위를 수집하고 있습니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChartHistoryModal;
