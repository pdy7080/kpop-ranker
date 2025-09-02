import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Award, BarChart3, 
  Sparkles, Music, Eye, Calendar, Users, Globe,
  Brain, MessageSquare, Star, Zap
} from 'lucide-react';
import api, { insightsAPI } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface WeeklyInsight {
  trending_tracks: Array<{
    artist: string;
    title: string;
    chart_name: string;
    avg_rank: number;
    chart_count: number;
    expert_comment?: string;
    trend_prediction?: string;
  }>;
  rising_stars: Array<{
    artist: string;
    title: string;
    best_rank: number;
    momentum: number;
    expert_insight?: string;
    evidence?: string;
  }>;
  chart_dominators: Array<{
    chart_name: string;
    artist: string;
    title: string;
    weeks_on_chart: number;
    expert_prediction?: string;
  }>;
  summary: {
    total_trending: number;
    total_rising: number;
    active_charts: number;
    analysis_period: string;
    ai_powered?: boolean;
  };
}

interface MarketPulse {
  current_trends?: string;
  competitive_landscape?: string;
  emerging_patterns?: string;
  genre_distribution?: Record<string, {count: number; percentage: number}>;
  label_distribution?: Array<{label: string; track_count: number}>;
  weekly_trend?: Array<{date: string; unique_tracks: number}>;
  market_summary: {
    dominant_genre: string;
    market_stability: string;
    trend_direction: string;
  };
}

interface Recommendations {
  must_watch?: Array<{
    artist: string;
    reason: string;
  }>;
  artists_to_watch: Array<{
    artist: string;
    track_count: number;
    avg_rank: number;
    best_rank: number;
  }>;
  hidden_gems: Array<{
    artist: string;
    title?: string;
    current_rank?: number;
    chart_name?: string;
    potential?: string;
  }>;
  comeback_predictions: Array<{
    artist: string;
    probability: number;
    expected_month: string;
    analysis?: string;
  }>;
}

const InsightsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'weekly' | 'market' | 'recommendations'>('weekly');
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsight | null>(null);
  const [marketPulse, setMarketPulse] = useState<MarketPulse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const [weekly, market, recs] = await Promise.all([
        insightsAPI.getDaily(), // 호환성 API 사용 (weekly 데이터 반환)
        insightsAPI.getMarketPulse(),
        insightsAPI.getRecommendations()
      ]);
      
      console.log('Weekly insights:', weekly);
      console.log('Market pulse:', market);
      console.log('Recommendations:', recs);
      
      setWeeklyInsights(weekly.insights);
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
      'melon': '🍈',
      'genie': '🧞',
      'bugs': '🐛',
      'vibe': '🎵',
      'flo': '🌊',
      'spotify': '🟢',
      'youtube': '📺',
      'billboard': '📊'
    };
    return icons[chartName?.toLowerCase()] || '🎵';
  };

  const tabLabels = {
    weekly: language === 'ko' ? '주간 동향' : 'Weekly Trends',
    market: language === 'ko' ? '시장 분석' : 'Market Analysis',
    recommendations: language === 'ko' ? 'AI 추천' : 'AI Recommendations'
  };

  // AI 분석 텍스트를 표시하는 컴포넌트
  const AIAnalysisCard = ({ title, content, icon }: { title: string; content?: string; icon: React.ReactNode }) => {
    if (!content) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-4 mb-4 border border-purple-500/30"
      >
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4 className="text-white font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed">{content}</p>
      </motion.div>
    );
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
          {weeklyInsights?.summary?.ai_powered && (
            <div className="mt-2 flex items-center justify-center gap-2 text-purple-300">
              <Brain className="w-4 h-4" />
              <span className="text-sm">AI 전문가 분석 활성화</span>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex gap-2">
            {Object.entries(tabLabels || {}).map(([key, label]) => (
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
              {/* Weekly Insights Tab */}
              {activeTab === 'weekly' && weeklyInsights && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Trending Tracks with AI Analysis */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      {language === 'ko' ? '주간 인기 트랙' : 'Weekly Trending'}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {(weeklyInsights.trending_tracks || []).slice(0, 6).map((track, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 rounded-xl p-5 border border-white/10"
                        >
                          {/* Track Info */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="text-white font-bold text-lg">{track.artist}</div>
                              <div className="text-gray-300 text-sm mb-2">{track.title}</div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{getChartIcon(track.chart_name)}</span>
                                <span className="text-yellow-400 font-bold">#{track.avg_rank}</span>
                                <span className="text-purple-400 text-sm">({track.chart_count}개 차트)</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 text-sm font-medium">{idx + 1}</span>
                            </div>
                          </div>

                          {/* AI Expert Analysis */}
                          {track.expert_comment && (
                            <AIAnalysisCard
                              title="💬 전문가 분석"
                              content={track.expert_comment}
                              icon={<Brain className="w-4 h-4 text-purple-400" />}
                            />
                          )}

                          {/* Trend Prediction */}
                          {track.trend_prediction && (
                            <div className="bg-green-500/20 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2 text-green-300 text-sm">
                                <Zap className="w-4 h-4" />
                                <span className="font-medium">트렌드 예측</span>
                              </div>
                              <p className="text-green-200 text-sm mt-1">{track.trend_prediction}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Rising Stars with Expert Insights */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      {language === 'ko' ? '라이징 스타' : 'Rising Stars'}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {(weeklyInsights.rising_stars || []).slice(0, 4).map((star, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-5 border border-yellow-500/20"
                        >
                          {/* Rising Star Info */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-white font-bold text-lg">{star.artist}</div>
                              <div className="text-gray-300 text-sm">{star.title}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-400 font-bold text-xl">+{star.momentum}</div>
                              <div className="text-yellow-400 text-sm">#{star.best_rank}</div>
                            </div>
                          </div>

                          {/* Evidence */}
                          {star.evidence && (
                            <div className="bg-yellow-500/20 rounded-lg p-2 mb-3">
                              <span className="text-yellow-200 text-sm font-medium">{star.evidence}</span>
                            </div>
                          )}

                          {/* Expert Insight */}
                          {star.expert_insight && (
                            <AIAnalysisCard
                              title="🔍 전문가 인사이트"
                              content={star.expert_insight}
                              icon={<MessageSquare className="w-4 h-4 text-yellow-400" />}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Chart Dominators */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                      {language === 'ko' ? '차트 지배자' : 'Chart Dominators'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(weeklyInsights.chart_dominators || []).map((dominator, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white/5 rounded-xl p-4 text-center"
                        >
                          <div className="text-3xl mb-2">{getChartIcon(dominator.chart_name)}</div>
                          <div className="text-white font-bold mb-1">{dominator.artist}</div>
                          <div className="text-gray-300 text-sm mb-2">{dominator.title}</div>
                          <div className="text-purple-400 text-xs">{dominator.weeks_on_chart}주간 지배</div>
                          
                          {dominator.expert_prediction && (
                            <div className="mt-3 bg-purple-500/20 rounded-lg p-2">
                              <p className="text-purple-200 text-xs">{dominator.expert_prediction}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Market Pulse Tab - Enhanced with AI Analysis */}
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
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">
                          {language === 'ko' ? '주도 장르' : 'Dominant Genre'}
                        </div>
                        <div className="text-white font-bold text-lg">
                          {marketPulse.market_summary?.dominant_genre || 'K-POP'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">
                          {language === 'ko' ? '시장 안정성' : 'Market Stability'}
                        </div>
                        <div className="text-white font-bold text-lg">
                          {marketPulse.market_summary?.market_stability || '보통'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">
                          {language === 'ko' ? '트렌드 방향' : 'Trend Direction'}
                        </div>
                        <div className="text-white font-bold text-lg flex items-center justify-center gap-1">
                          {marketPulse.market_summary?.trend_direction || 'Upward'}
                          {(marketPulse.market_summary?.trend_direction || 'Upward') === 'Upward' ? 
                            <TrendingUp className="w-4 h-4 text-green-400" /> :
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          }
                        </div>
                      </div>
                    </div>

                    {/* AI Market Analysis */}
                    <div className="space-y-4">
                      {marketPulse.current_trends && (
                        <AIAnalysisCard
                          title="📈 현재 트렌드"
                          content={marketPulse.current_trends}
                          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
                        />
                      )}
                      
                      {marketPulse.competitive_landscape && (
                        <AIAnalysisCard
                          title="🏢 경쟁 환경"
                          content={marketPulse.competitive_landscape}
                          icon={<Users className="w-4 h-4 text-green-400" />}
                        />
                      )}
                      
                      {marketPulse.emerging_patterns && (
                        <AIAnalysisCard
                          title="🔮 신흥 패턴"
                          content={marketPulse.emerging_patterns}
                          icon={<Sparkles className="w-4 h-4 text-purple-400" />}
                        />
                      )}
                    </div>
                  </div>

                  {/* Genre/Label Distribution if available */}
                  {(marketPulse.genre_distribution || marketPulse.label_distribution) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {marketPulse.genre_distribution && (
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
                      )}

                      {marketPulse.label_distribution && (
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
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recommendations Tab - Enhanced with AI Reasons */}
              {activeTab === 'recommendations' && recommendations && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Must Watch Artists (with AI reasons) */}
                  {recommendations.must_watch && recommendations.must_watch.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        {language === 'ko' ? '필수 시청 아티스트' : 'Must Watch Artists'}
                      </h3>
                      <div className="space-y-4">
                        {recommendations.must_watch.map((artist, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20"
                          >
                            <div className="text-white font-bold text-lg mb-2">{artist.artist}</div>
                            <p className="text-yellow-200 text-sm">{artist.reason}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artists to Watch */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      {language === 'ko' ? '주목할 아티스트' : 'Artists to Watch'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(recommendations.artists_to_watch || []).map((artist, idx) => (
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

                  {/* Hidden Gems with AI Potential Analysis */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Music className="w-5 h-5 text-yellow-400" />
                      {language === 'ko' ? '숨은 보석' : 'Hidden Gems'}
                    </h3>
                    <div className="space-y-3">
                      {(recommendations.hidden_gems || []).map((gem, idx) => (
                        <div key={idx} className="flex items-start justify-between bg-white/5 rounded-lg p-4">
                          <div className="flex-1">
                            <div className="text-white font-medium">{gem.artist}</div>
                            {gem.title && <div className="text-gray-300 text-sm">{gem.title}</div>}
                            {gem.potential && (
                              <div className="mt-2 bg-green-500/20 rounded-lg p-2">
                                <p className="text-green-200 text-sm">{gem.potential}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            {gem.current_rank && (
                              <>
                                <div className="text-yellow-400 font-bold">#{gem.current_rank}</div>
                                {gem.chart_name && <div className="text-xs text-gray-400">{gem.chart_name}</div>}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comeback Predictions with AI Analysis */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-400" />
                      {language === 'ko' ? '컴백 예측' : 'Comeback Predictions'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(recommendations.comeback_predictions || []).map((prediction, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 rounded-xl p-4"
                        >
                          <div className="text-center mb-3">
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
                          
                          {prediction.analysis && (
                            <div className="bg-green-500/20 rounded-lg p-3 mt-3">
                              <p className="text-green-200 text-sm">{prediction.analysis}</p>
                            </div>
                          )}
                        </motion.div>
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