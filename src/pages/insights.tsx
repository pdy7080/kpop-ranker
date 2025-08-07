import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { insightsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FaBrain, FaLightbulb, FaChartLine, FaArrowUp, FaRobot } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface DailyInsight {
  trends: Array<{
    artist: string;
    insight: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  market_analysis: string;
  recommendations: string[];
}

interface MarketPulse {
  timestamp: string;
  active_artists: number;
  trending_tracks: number;
  market_sentiment: string;
  hot_topics: Array<{
    artist: string;
    track: string;
    score: number;
  }>;
}

interface Recommendation {
  artists_to_watch: Array<{
    name: string;
    reason: string;
  }>;
  trending_genres: string[];
  investment_tips: string[];
}

export default function InsightsPage() {
  const [dailyInsights, setDailyInsights] = useState<DailyInsight | null>(null);
  const [marketPulse, setMarketPulse] = useState<MarketPulse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'market' | 'recommendations'>('daily');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const [daily, pulse, recs] = await Promise.all([
        insightsApi.getDailyInsights(),
        insightsApi.getMarketPulse(),
        insightsApi.getRecommendations()
      ]);

      if (daily.data) setDailyInsights(daily.data);
      if (pulse.data) setMarketPulse(pulse.data);
      if (recs.data) setRecommendations(recs.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      toast.error('인사이트를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      default:
        return '➡️';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-500">AI 인사이트를 분석하는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>AI 인사이트 - KPOP FANfolio</title>
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FaBrain className="w-8 h-8 mr-3 text-primary-500" />
              AI 인사이트
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI가 분석한 K-POP 시장 트렌드와 맞춤형 추천
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'bg-white dark:bg-gray-900 text-primary-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              일일 트렌드
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'market'
                  ? 'bg-white dark:bg-gray-900 text-primary-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              시장 펄스
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-white dark:bg-gray-900 text-primary-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              맞춤 추천
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'daily' && dailyInsights && (
                <>
                  {/* Market Analysis */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 mb-6"
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FaChartLine className="w-5 h-5 mr-2 text-primary-500" />
                      시장 분석
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {dailyInsights.market_analysis}
                    </p>
                  </motion.div>

                  {/* Trends */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h2 className="text-xl font-semibold mb-4">주요 트렌드</h2>
                    <div className="space-y-4">
                      {dailyInsights.trends.map((trend, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <span className="text-2xl mt-1">
                            {getSentimentIcon(trend.sentiment)}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-semibold">{trend.artist}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {trend.insight}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}

              {activeTab === 'market' && marketPulse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Market Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-primary-500">
                        {marketPulse.active_artists}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">활성 아티스트</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-primary-500">
                        {marketPulse.trending_tracks}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">트렌딩 트랙</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-lg font-bold capitalize">
                        {marketPulse.market_sentiment}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">시장 분위기</p>
                    </div>
                  </div>

                  {/* Hot Topics */}
                  <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">🔥 핫 토픽</h2>
                    <div className="space-y-3">
                      {marketPulse.hot_topics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">{topic.artist}</p>
                            <p className="text-sm text-gray-500">{topic.track}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-500">
                              #{index + 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'recommendations' && recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Artists to Watch */}
                  <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FaArrowUp className="w-5 h-5 mr-2 text-primary-500" />
                      주목할 아티스트
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.artists_to_watch.map((artist, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg"
                        >
                          <h3 className="font-semibold text-lg">{artist.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {artist.reason}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Investment Tips */}
                  <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FaLightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                      투자 팁
                    </h2>
                    <ul className="space-y-3">
                      {recommendations.investment_tips.map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <span className="text-yellow-500 mt-1">💡</span>
                          <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* AI Assistant Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                    <FaRobot className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI 어시스턴트</h3>
                    <p className="text-xs text-gray-500">24/7 분석 중</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  실시간으로 K-POP 시장을 분석하고 있습니다. 매시간 새로운 인사이트가 업데이트됩니다.
                </p>
              </motion.div>

              {/* Recommendations Summary */}
              {dailyInsights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="font-semibold mb-4">오늘의 추천</h3>
                  <ul className="space-y-2">
                    {dailyInsights.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2"
                      >
                        <span className="text-primary-500 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
