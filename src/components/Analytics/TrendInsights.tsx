import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Award, Clock, BarChart3 } from 'lucide-react';

interface Insight {
  type: 'rising' | 'falling' | 'new' | 'milestone';
  title: string;
  description: string;
  value?: string | number;
  change?: number;
  icon?: React.ReactNode;
}

interface TrendInsightsProps {
  data: any[];
}

export default function TrendInsights({ data }: TrendInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      generateInsights();
    }
  }, [data]);

  const generateInsights = () => {
    const newInsights: Insight[] = [];

    // 1. 가장 큰 순위 상승
    const biggestRiser = data.reduce((prev, curr) => 
      (curr.change > prev.change) ? curr : prev
    );
    
    if (biggestRiser.change > 0) {
      newInsights.push({
        type: 'rising',
        title: '🚀 급상승',
        description: `${biggestRiser.artist} - ${biggestRiser.title}`,
        value: `+${biggestRiser.change}`,
        change: biggestRiser.change,
        icon: <TrendingUp className="w-5 h-5" />
      });
    }

    // 2. 신규 진입
    const newEntries = data.filter(item => !item.prev_rank || item.prev_rank > 100);
    if (newEntries.length > 0) {
      newInsights.push({
        type: 'new',
        title: '✨ 신규 진입',
        description: `${newEntries.length}개 트랙이 차트에 새로 진입`,
        value: newEntries.length,
        icon: <Zap className="w-5 h-5" />
      });
    }

    // 3. 차트 점유율
    const chartDominance = data.reduce((acc, item) => {
      const chartCount = Object.keys(item.charts || {}).length;
      if (chartCount >= 5) {
        acc.push(item);
      }
      return acc;
    }, []);

    if (chartDominance.length > 0) {
      newInsights.push({
        type: 'milestone',
        title: '👑 올킬 임박',
        description: `${chartDominance[0].artist}가 ${Object.keys(chartDominance[0].charts).length}개 차트 석권`,
        value: Object.keys(chartDominance[0].charts).length,
        icon: <Award className="w-5 h-5" />
      });
    }

    // 4. 실시간 핫 트렌드
    const hotTrend = data.filter(item => item.trendingScore > 85);
    if (hotTrend.length > 0) {
      newInsights.push({
        type: 'rising',
        title: '🔥 핫 트렌드',
        description: `${hotTrend.length}개 트랙이 트렌딩 스코어 85점 이상`,
        value: `${hotTrend.length}곡`,
        icon: <BarChart3 className="w-5 h-5" />
      });
    }

    setInsights(newInsights);
  };

  const getInsightColor = (type: string) => {
    switch(type) {
      case 'rising': return 'from-green-500 to-emerald-500';
      case 'falling': return 'from-red-500 to-pink-500';
      case 'new': return 'from-blue-500 to-cyan-500';
      case 'milestone': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${getInsightColor(insight.type)} opacity-10`} />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-300">{insight.title}</h3>
              {insight.icon}
            </div>
            
            <p className="text-xs text-gray-400 mb-2">{insight.description}</p>
            
            {insight.value && (
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {insight.value}
                </span>
                {insight.change !== undefined && (
                  <span className={`text-xs font-medium ${insight.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {insight.change > 0 ? '↑' : '↓'} {Math.abs(insight.change)}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Animated Background */}
          <motion.div
            className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${getInsightColor(insight.type)} rounded-full blur-2xl`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}