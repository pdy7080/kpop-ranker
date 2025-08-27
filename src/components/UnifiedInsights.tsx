import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Award, BarChart3, Calendar, Clock,
  Sparkles, AlertCircle, Users, Target, Trophy,
  Mic, Globe, ChevronRight, Info, RefreshCw
} from 'lucide-react';
import { getChartLogo } from '@/utils/chartLogos';

interface UnifiedInsightsProps {
  artistData: any;
  artistName: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function UnifiedInsights({ artistData, artistName }: UnifiedInsightsProps) {
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [artistName]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/insights`);
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      setInsightsData(data);
    } catch (err) {
      console.error('Insights error:', err);
      setError('인사이트를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !insightsData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">{error || '데이터를 불러올 수 없습니다'}</p>
      </div>
    );
  }

  const { sections, cost_info } = insightsData;
  const performance = sections?.performance?.data || {};
  const aiAnalysis = sections?.ai_analysis || {};
  const events = sections?.events?.data || {};
  const news = sections?.news?.data || {};

  return (
    <div className="space-y-6">
      {/* 실시간 차트 성과 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          실시간 차트 성과
          <span className="text-xs text-gray-400 ml-auto">실시간 업데이트</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">{performance.best_rank || '-'}</p>
            <p className="text-xs text-gray-400">최고 순위</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Target className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold">{performance.top10_entries || 0}</p>
            <p className="text-xs text-gray-400">TOP 10 진입</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Globe className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-2xl font-bold">{performance.chart_coverage || 0}</p>
            <p className="text-xs text-gray-400">활동 차트</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Mic className="w-5 h-5 text-pink-400 mb-2" />
            <p className="text-2xl font-bold">{performance.active_tracks || 0}</p>
            <p className="text-xs text-gray-400">활동곡</p>
          </div>
        </div>
      </motion.div>

      {/* AI 분석 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl p-6 border ${
          aiAnalysis.cached 
            ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50' 
            : 'bg-gray-800/30 border-gray-700'
        }`}
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          AI 종합 분석
          {aiAnalysis.cached && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-2">
              {aiAnalysis.age_days}일 전 분석
            </span>
          )}
        </h3>
        
        {aiAnalysis.cached ? (
          <div className="space-y-4">
            {aiAnalysis.data && Object.entries(aiAnalysis.data).slice(0, 4).map(([key, value]: [string, any]) => (
              <div key={key}>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">
                  {key === 'current_status' ? '현재 상황' :
                   key === 'fan_updates' ? '팬 업데이트' :
                   key === 'key_highlights' ? '핵심 포인트' :
                   key === 'trend' ? '트렌드 분석' : key}
                </h4>
                <p className="text-white">{value || '분석 중...'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">AI 분석 대기 중</p>
              <p className="text-xs text-gray-500">
                {aiAnalysis.queue_position 
                  ? `오늘 ${aiAnalysis.queue_position}번째 예정`
                  : '일주일 내 분석 예정'}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* 공연 & 뉴스 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 공연 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            공연 & 행사
            {events.total > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded ml-auto">
                {events.total}개 예정
              </span>
            )}
          </h3>
          
          {events.total > 0 ? (
            <div className="space-y-2">
              {[...(events.concerts || []), ...(events.fanmeetings || [])].slice(0, 3).map((event: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                  <span className="text-white">{event.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">예정된 공연이 없습니다</p>
          )}
        </motion.div>

        {/* 뉴스 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            최신 소식
          </h3>
          
          {news.comeback || news.latest?.length > 0 ? (
            <div className="space-y-2">
              {news.comeback && (
                <div className="p-2 bg-purple-500/20 rounded text-sm">
                  <span className="text-purple-400">컴백: </span>
                  <span className="text-white">{news.comeback.title}</span>
                </div>
              )}
              {news.latest?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                  <span className="text-white">{item.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">새로운 소식이 없습니다</p>
          )}
        </motion.div>
      </div>

      {/* 비용 정보 */}
      {cost_info && (
        <div className="bg-gray-800/20 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-4 h-4" />
            <span>
              AI 분석: {cost_info.ai_enabled ? '활성' : '대기'} | 
              일일 {cost_info.daily_limit}명 | 
              월 {cost_info.monthly_cost_krw}원
            </span>
          </div>
        </div>
      )}
    </div>
  );
}