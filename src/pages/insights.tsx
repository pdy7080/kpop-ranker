import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Award, BarChart3, 
  Sparkles, Music, Eye, Calendar, Users, Globe
} from 'lucide-react';
import api from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface DailyInsight {
  new_entries: Array<{
    artist: string;
    title: string;
    chart_name: string;
    current_rank: number;
  }>;
  big_movers: Array<{
    artist: string;
    title: string;
    peak_rank: number;
    max_jump: number;
  }>;
  chart_leaders: Array<{
    chart_name: string;
    artist: string;
    title: string;
  }>;
  summary: {
    total_new_entries: number;
    total_movers: number;
    active_charts: number;
  };
}

interface MarketPulse {
  genre_distribution: Record<string, {count: number; percentage: number}>;
  label_distribution: Array<{label: string; track_count: number}>;
  weekly_trend: Array<{date: string; unique_tracks: number}>;
  market_summary: {
    dominant_genre: string;
    market_stability: string;
    trend_direction: string;
  };
}

interface Recommendations {
  artists_to_watch: Array<{
    artist: string;
    track_count: number;
    avg_rank: number;
    best_rank: number;
  }>;
  hidden_gems: Array<{
    artist: string;
    title: string;
    current_rank: number;
    chart_name: string;
  }>;
  comeback_predictions: Array<{
    artist: string;
    probability: number;
    expected_month: string;
  }>;
}

const InsightsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'daily' | 'market' | 'recommendations'>('daily');
  const [dailyInsights, setDailyInsights] = useState<DailyInsight | null>(null);
  const [marketPulse, setMarketPulse] = useState<MarketPulse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const [daily, market, recs] = await Promise.all([
        api.insights.getDaily(),
        api.insights.getMarketPulse(),
        api.insights.getRecommendations()
      ]);
      
      setDailyInsights(daily.insights);
      setMarketPulse(market.market_pulse);
      setRecommendations(recs.recommendations);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartIcon = (chartName: string) => {
    const icons: Record<string, string> = {
      'Melon': '🍈',
      'Genie': '🧞',
      'Bugs': '🐛',
      'Vibe': '🎵',
      'FLO': '🌊',
      'Spotify': '🟢',
      'YouTube': '📺',
      'Billboard': '📊'
    };
    return icons[chartName] || '🎵';
  };

  const tabLabels = {
    daily: language === 'ko' ? '일일 동향' : 'Daily Trends',
    market: language === 'ko' ? '시장 분석' : 'Market Analysis',
    recommendations: language === 'ko' ? 'AI 추천' : 'AI Recommendations'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-yellow-400" />
            {language === 'ko' ? 'K-POP 인사이트' : 'K-POP Insights'}
          </h1>
          <p className="text-xl text-gray-300">
            {language === 'ko' 
              ? '실시간 차트 분석과 AI 기반 시장 예측'
              : 'Real-time chart analysis and AI-powered market predictions'}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex gap-2">
            {Object.entries(tabLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Daily Insights Tab */}
              {activeTab === 'daily' && dailyInsights && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* New Entries */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      {language === 'ko' ? '신규 진입' : 'New Entries'}
                    </h3>
                    <div className="space-y-3">
                      {dailyInsights.new_entries.slice(0, 5).map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <div className="text-white font-medium">{entry.artist}</div>
                            <div className="text-gray-300 text-xs">{entry.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{getChartIcon(entry.chart_name)}</span>
                            <span className="text-yellow-400 font-bold">#{entry.current_rank}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Big Movers */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      {language === 'ko' ? '급상승' : 'Big Movers'}
                    </h3>
                    <div className="space-y-3">
                      {dailyInsights.big_movers.slice(0, 5).map((mover, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <div className="text-white font-medium">{mover.artist}</div>
                            <div className="text-gray-300 text-xs">{mover.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-bold">+{mover.max_jump}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart Leaders */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      {language === 'ko' ? '차트 1위' : 'Chart Leaders'}
                    </h3>
                    <div className="space-y-3">
                      {dailyInsights.chart_leaders.map((leader, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="text-lg">{getChartIcon(leader.chart_name)}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium">{leader.artist}</div>
                            <div className="text-gray-300 text-xs">{leader.title}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Market Pulse Tab */}
              {activeTab === 'market' && marketPulse && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Market Summary */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      {language === 'ko' ? '시장 요약' : 'Market Summary'}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">
                          {language === 'ko' ? '주도 장르' : 'Dominant Genre'}
                        </div>
                        <div className="text-white font-bold text-lg">
                          {marketPulse.market_summary.dominant_genre}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">
                          {language === 'ko' ? '시장 안정성' : 'Market Stability'}
                        </div>
                        <div className="text-white font-bold text-lg">
                          {marketPulse.market_summary.market_stability}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">
                          {language === 'ko' ? '트렌드 방향' : 'Trend Direction'}
                        </div>
                        <div className="text-white font-bold text-lg flex items-center justify-center gap-1">
                          {marketPulse.market_summary.trend_direction}
                          {marketPulse.market_summary.trend_direction === 'Upward' ? 
                            <TrendingUp className="w-4 h-4 text-green-400" /> :
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Genre Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">
                        {language === 'ko' ? '장르별 분포' : 'Genre Distribution'}
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(marketPulse.genre_distribution).map(([genre, data]) => (
                          <div key={genre}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{genre}</span>
                              <span className="text-white font-medium">{data.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${data.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Label Distribution */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">
                        {language === 'ko' ? '레이블별 분포' : 'Label Distribution'}
                      </h3>
                      <div className="space-y-3">
                        {marketPulse.label_distribution.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-300">{item.label}</span>
                            <span className="text-white font-medium bg-purple-500/30 px-3 py-1 rounded-full">
                              {item.track_count} tracks
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && recommendations && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Artists to Watch */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      {language === 'ko' ? '주목할 아티스트' : 'Artists to Watch'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendations.artists_to_watch.map((artist, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-4">
                          <div className="text-white font-bold mb-2">{artist.artist}</div>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>{language === 'ko' ? '트랙 수:' : 'Tracks:'} {artist.track_count}</div>
                            <div>{language === 'ko' ? '평균 순위:' : 'Avg Rank:'} #{Math.round(artist.avg_rank)}</div>
                            <div>{language === 'ko' ? '최고 순위:' : 'Best Rank:'} #{artist.best_rank}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hidden Gems */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Music className="w-5 h-5 text-yellow-400" />
                      {language === 'ko' ? '숨은 보석' : 'Hidden Gems'}
                    </h3>
                    <div className="space-y-3">
                      {recommendations.hidden_gems.map((gem, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <div className="text-white font-medium">{gem.artist}</div>
                            <div className="text-gray-300 text-sm">{gem.title}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 font-bold">#{gem.current_rank}</div>
                            <div className="text-xs text-gray-400">{gem.chart_name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comeback Predictions */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-400" />
                      {language === 'ko' ? '컴백 예측' : 'Comeback Predictions'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations.comeback_predictions.map((prediction, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-white font-bold text-lg mb-2">{prediction.artist}</div>
                          <div className="text-3xl font-bold text-green-400 mb-2">
                            {prediction.probability}%
                          </div>
                          <div className="text-sm text-gray-300">
                            {new Date(prediction.expected_month).toLocaleDateString(
                              language === 'ko' ? 'ko-KR' : 'en-US',
                              { year: 'numeric', month: 'long' }
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InsightsPage;