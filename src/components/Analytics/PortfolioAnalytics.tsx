import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Star } from 'lucide-react';

interface PortfolioAnalyticsProps {
  portfolioItems: any[];
}

export default function PortfolioAnalytics({ portfolioItems }: PortfolioAnalyticsProps) {
  // 포트폴리오 분석 로직
  const calculateMetrics = () => {
    if (!portfolioItems || portfolioItems.length === 0) {
      return {
        totalTracks: 0,
        avgRank: 0,
        topPerformer: null,
        portfolioScore: 0,
        chartDominance: 0
      };
    }

    const totalTracks = portfolioItems.length;
    
    // 평균 순위 계산
    const ranks = portfolioItems.flatMap(item => 
      Object.values(item.charts || {}).filter(r => typeof r === 'number')
    );
    const avgRank = ranks.length > 0 
      ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length)
      : 0;

    // 최고 성과 트랙
    const topPerformer = portfolioItems.reduce((best, item) => {
      const bestRank = Math.min(...Object.values(item.charts || {}).filter(r => typeof r === 'number'));
      const currentBestRank = best ? Math.min(...Object.values(best.charts || {}).filter(r => typeof r === 'number')) : 999;
      return bestRank < currentBestRank ? item : best;
    }, null);

    // 포트폴리오 점수 (100점 만점)
    const portfolioScore = Math.round(
      (100 - avgRank) * 0.5 + // 평균 순위 기반
      totalTracks * 2 + // 트랙 수 보너스
      (topPerformer && Object.values(topPerformer.charts || {}).some(r => r === 1) ? 20 : 0) // 1위 보너스
    );

    // 차트 지배력
    const chartDominance = portfolioItems.reduce((acc, item) => {
      return acc + Object.keys(item.charts || {}).length;
    }, 0) / (totalTracks || 1);

    return {
      totalTracks,
      avgRank,
      topPerformer,
      portfolioScore: Math.min(100, portfolioScore),
      chartDominance: Math.round(chartDominance)
    };
  };

  const metrics = calculateMetrics();

  const insights = [
    {
      icon: <Trophy className="w-5 h-5" />,
      label: '포트폴리오 점수',
      value: metrics.portfolioScore,
      suffix: '점',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: '평균 순위',
      value: metrics.avgRank || '-',
      suffix: '위',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: '차트 지배력',
      value: metrics.chartDominance,
      suffix: '개',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: '보유 트랙',
      value: metrics.totalTracks,
      suffix: '곡',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 메트릭 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-4"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${insight.color} opacity-10`} />
            
            <div className="relative z-10">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${insight.color} bg-opacity-20 mb-3`}>
                {insight.icon}
              </div>
              
              <p className="text-xs text-gray-400 mb-1">{insight.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{insight.value}</span>
                <span className="text-sm text-gray-400">{insight.suffix}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 최고 성과 트랙 */}
      {metrics.topPerformer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold text-white">최고 성과 트랙</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <img 
              src={metrics.topPerformer.album_image || '/images/default-album.svg'}
              alt={metrics.topPerformer.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-white">{metrics.topPerformer.title}</p>
              <p className="text-sm text-gray-400">{metrics.topPerformer.artist}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">최고 순위</p>
              <p className="text-2xl font-bold text-yellow-500">
                #{Math.min(...Object.values(metrics.topPerformer.charts || {}).filter(r => typeof r === 'number'))}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 성과 추천 */}
      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
        <h4 className="text-sm font-medium text-gray-400 mb-2">AI 추천</h4>
        <p className="text-xs text-gray-500">
          {metrics.portfolioScore > 80 
            ? "🎉 훌륭한 포트폴리오입니다! 현재 트렌드를 잘 파악하고 계십니다."
            : metrics.portfolioScore > 50
            ? "📈 좋은 선택입니다. 더 다양한 차트의 트랙을 추가해보세요."
            : "💡 포트폴리오를 더 다양화하면 좋은 성과를 얻을 수 있습니다."}
        </p>
      </div>
    </div>
  );
}