import React, { useEffect, useState } from 'react';
import { Zap, Clock, RefreshCw, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AIInsightsSectionProps {
  artistName: string;
  stats: any;
}

export function AIInsightsSection({ artistName, stats }: AIInsightsSectionProps) {
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAIInsights();
  }, [artistName]);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      setError(false);
      
      // unified insights API 호출
      const response = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/insights`);
      if (response.ok) {
        const data = await response.json();
        setAiData(data.sections?.ai_analysis);
      }
    } catch (err) {
      console.error('AI insights error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // 캐시된 AI 데이터가 있는 경우
  if (aiData?.cached && aiData?.data) {
    const insights = aiData.data;
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          AI Insights
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded ml-auto">
            {aiData.age_days}일 전 분석
          </span>
        </h3>
        <div className="space-y-3 text-sm">
          {insights.current_status && (
            <div>
              <span className="text-gray-400 text-xs">현재 상황</span>
              <p className="text-white mt-1">{insights.current_status}</p>
            </div>
          )}
          {insights.key_highlights && (
            <div>
              <span className="text-gray-400 text-xs">핵심 포인트</span>
              <p className="text-white mt-1">{insights.key_highlights}</p>
            </div>
          )}
          {!insights.current_status && !insights.key_highlights && (
            // 폴백: 기본 통계 기반 인사이트
            <>
              <p>🎯 {artistName}은(는) 현재 {stats.total_tracks}개 트랙으로 활동 중</p>
              <p>📈 TOP 10 진입률 {stats.success_rate}%로 {
                stats.success_rate > 50 ? '높은 성공률' : 
                stats.success_rate > 20 ? '안정적인 성과' : '성장 가능성'
              } 보유</p>
              {stats.newest_entry && (
                <p>🆕 최신곡 "{stats.newest_entry}" 차트 진입</p>
              )}
              {stats.trending_up > stats.trending_down && (
                <p>🚀 현재 {stats.trending_up}개 트랙 상승세</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // AI 분석 대기 중인 경우
  if (aiData && !aiData.cached) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          AI Insights
          <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded ml-auto">
            대기 중
          </span>
        </h3>
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">AI 분석 예정</p>
            <p className="text-xs text-gray-500 mt-1">
              {aiData.queue_position ? `오늘 ${aiData.queue_position}번째` : '일주일 내 분석'}
            </p>
          </div>
        </div>
        {/* 기본 통계는 표시 */}
        <div className="mt-4 pt-4 border-t border-purple-700/50 space-y-2 text-sm">
          <p>📊 현재 {stats.total_tracks}개 트랙 활동</p>
          <p>🏆 TOP 10 진입 {stats.top10_hits || 0}회</p>
        </div>
      </div>
    );
  }

  // 로딩 중이거나 데이터 없음
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        AI Insights
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
        </div>
      ) : (
        // 기본 통계 기반 인사이트 (AI 없이)
        <div className="space-y-3 text-sm">
          <p>🎯 {artistName}은(는) 현재 {stats.total_tracks}개 트랙으로 활동 중</p>
          <p>📈 TOP 10 진입률 {stats.success_rate}%로 {
            stats.success_rate > 50 ? '높은 성공률' : 
            stats.success_rate > 20 ? '안정적인 성과' : '성장 가능성'
          } 보유</p>
          {stats.newest_entry && (
            <p>🆕 최신곡 "{stats.newest_entry}" 차트 진입</p>
          )}
          {stats.trending_up > stats.trending_down && (
            <p>🚀 현재 {stats.trending_up}개 트랙 상승세</p>
          )}
          {stats.longest_charting > 30 && (
            <p>💎 {stats.longest_charting}일 연속 차트인 기록</p>
          )}
        </div>
      )}
    </div>
  );
}

// Events Section Component
export function EventsSection({ comprehensiveData }: { comprehensiveData: any }) {
  const events = comprehensiveData?.events || {};
  const allEvents = [...(events.concerts || []), ...(events.fanmeetings || [])];

  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        📅 공연 & 행사
        {allEvents.length > 0 && (
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-auto">
            {allEvents.length}개 예정
          </span>
        )}
      </h3>
      {allEvents.length > 0 ? (
        <div className="space-y-2">
          {allEvents.slice(0, 3).map((event: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-white">{event.title}</span>
              <span className="text-xs text-gray-400">{event.date}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">예정된 공연이 없습니다</p>
      )}
    </div>
  );
}

// News Section Component
export function NewsSection({ comprehensiveData }: { comprehensiveData: any }) {
  const news = comprehensiveData?.news || {};

  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold mb-4">📰 최신 소식</h3>
      {news.comeback || news.latest?.length > 0 ? (
        <div className="space-y-2">
          {news.comeback && (
            <div className="p-2 bg-purple-500/20 rounded text-sm">
              <span className="text-purple-400">컴백: </span>
              <span className="text-white">{news.comeback.title}</span>
            </div>
          )}
          {news.latest?.slice(0, 2).map((item: any, idx: number) => (
            <div key={idx} className="text-sm text-white">
              • {item.title}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">새로운 소식이 없습니다</p>
      )}
    </div>
  );
}