import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaLightbulb, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

interface PortfolioInsight {
  analysis: string;
  strengths: string[];
  suggestions: string[];
  risk_level: 'low' | 'medium' | 'high';
}

interface PortfolioInsightsProps {
  portfolioSize: number;
  onRefresh?: () => void;
}

const PortfolioInsights: React.FC<PortfolioInsightsProps> = ({ portfolioSize, onRefresh }) => {
  const [insights, setInsights] = useState<PortfolioInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portfolioSize > 0) {
      fetchInsights();
    }
  }, [portfolioSize]);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 임시 더미 데이터
      const dummyInsights: PortfolioInsight = {
        analysis: "포트폴리오가 균형잡혀 있습니다. 다양한 아티스트와 장르가 포함되어 있어 좋습니다.",
        strengths: [
          "다양한 장르의 아티스트 포함",
          "신인과 베테랑 아티스트의 균형",
          "글로벌 차트 진입 가능성 높음"
        ],
        suggestions: [
          "최근 인기 급상승 중인 아티스트 추가 고려",
          "시즌별 컴백 예정 아티스트 모니터링"
        ],
        risk_level: 'low'
      };
      
      setInsights(dummyInsights);
    } catch (err) {
      setError('인사이트를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low':
        return '낮음';
      case 'medium':
        return '보통';
      case 'high':
        return '높음';
      default:
        return '알 수 없음';
    }
  };

  if (portfolioSize === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <FaBrain className="w-6 h-6 text-primary-500 animate-pulse" />
          <h3 className="text-xl font-semibold">AI 인사이트 분석 중...</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FaBrain className="w-6 h-6 text-gray-400" />
            <h3 className="text-xl font-semibold">AI 인사이트</h3>
          </div>
          <button
            onClick={() => {
              fetchInsights();
              onRefresh?.();
            }}
            className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
        <p className="text-gray-500">{error}</p>
      </motion.div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaBrain className="w-6 h-6 text-primary-500" />
          <h3 className="text-xl font-semibold">AI 포트폴리오 분석</h3>
        </div>
        <div className="flex items-center space-x-2">
          <FaExclamationTriangle className={`w-4 h-4 ${getRiskLevelColor(insights.risk_level)}`} />
          <span className={`text-sm font-medium ${getRiskLevelColor(insights.risk_level)}`}>
            리스크: {getRiskLevelText(insights.risk_level)}
          </span>
        </div>
      </div>

      {/* Analysis */}
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {insights.analysis}
        </p>
      </div>

      {/* Strengths */}
      {insights.strengths.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <FaChartLine className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold">강점</h4>
          </div>
          <ul className="space-y-2">
            {insights.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {insights.suggestions.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FaLightbulb className="w-5 h-5 text-yellow-500" />
            <h4 className="font-semibold">개선 제안</h4>
          </div>
          <ul className="space-y-2">
            {insights.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <span className="text-yellow-500 mt-1">💡</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            fetchInsights();
            onRefresh?.();
          }}
          className="text-sm text-primary-500 hover:text-primary-600 transition-colors flex items-center space-x-2"
        >
          <span>새로운 인사이트 받기</span>
          <span className="text-xs">(1시간마다 업데이트)</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PortfolioInsights;