import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Ticket, Mic, Star, 
  TrendingUp, Award, Music, Globe, Clock,
  ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';

interface Event {
  type: string;
  title: string;
  date: string;
  venue?: string;
  location?: string;
  status?: string;
}

interface News {
  type: string;
  title: string;
  date?: string;
  source?: string;
  content?: string;
}

interface ScheduleProps {
  comprehensiveData: any;
  artistName: string;
}

export default function ArtistSchedule({ comprehensiveData, artistName }: ScheduleProps) {
  if (!comprehensiveData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">종합 정보를 불러오는 중...</p>
      </div>
    );
  }

  const { events, news, schedule, ai_insights } = comprehensiveData;

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date('2025-08-26'); // 현재 날짜
      
      // 과거 날짜는 "완료"로 표시
      if (date < now) {
        return `${date.getMonth() + 1}/${date.getDate()} (완료)`;
      }
      
      // 미래 날짜는 D-day 표시
      const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${date.getMonth() + 1}/${date.getDate()} (D-${diff})`;
    } catch {
      return dateStr;
    }
  };

  // 이벤트 타입별 아이콘
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'concert': return <Mic className="w-5 h-5 text-purple-400" />;
      case 'fanmeeting': return <Star className="w-5 h-5 text-yellow-400" />;
      case 'festival': return <Globe className="w-5 h-5 text-blue-400" />;
      case 'broadcast': return <Music className="w-5 h-5 text-green-400" />;
      default: return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  // 뉴스 타입별 색상
  const getNewsColor = (type: string) => {
    switch (type) {
      case 'comeback': return 'bg-purple-500/20 text-purple-400';
      case 'award': return 'bg-yellow-500/20 text-yellow-400';
      case 'collaboration': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI 인사이트 섹션 */}
      {ai_insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700/50"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            AI 종합 분석
          </h3>
          
          <div className="space-y-4">
            {ai_insights.current_status && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">현재 상황</h4>
                <p className="text-white">{ai_insights.current_status}</p>
              </div>
            )}
            
            {ai_insights.schedule_summary && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">일정 요약</h4>
                <p className="text-white">{ai_insights.schedule_summary}</p>
              </div>
            )}
            
            {ai_insights.fan_updates && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">팬 업데이트</h4>
                <p className="text-white">{ai_insights.fan_updates}</p>
              </div>
            )}
            
            {ai_insights.key_highlights && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">핵심 포인트</h4>
                <p className="text-white">{ai_insights.key_highlights}</p>
              </div>
            )}
          </div>
          
          {ai_insights.data_quality && (
            <div className="mt-4 pt-4 border-t border-purple-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">데이터 신뢰도</span>
                <span className={`font-semibold ${
                  ai_insights.data_quality.reliability === 'HIGH' ? 'text-green-400' :
                  ai_insights.data_quality.reliability === 'MEDIUM' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {ai_insights.data_quality.reliability || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 공연/행사 일정 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 예정된 공연 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            공연 & 행사
          </h3>
          
          {events && (events.concerts?.length > 0 || events.fanmeetings?.length > 0) ? (
            <div className="space-y-3">
              {[...(events.concerts || []), ...(events.fanmeetings || [])].map((event, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  {getEventIcon(event.type)}
                  <div className="flex-grow">
                    <p className="font-medium text-white">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(event.date)}</span>
                      {event.venue && (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>{event.venue}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {event.status === 'On Sale' && (
                    <Ticket className="w-5 h-5 text-green-400" />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">예정된 공연이 없습니다</p>
          )}
        </motion.div>

        {/* 최신 소식 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            최신 소식
          </h3>
          
          {news && (news.latest?.length > 0 || news.comeback) ? (
            <div className="space-y-3">
              {news.comeback && (
                <motion.div
                  whileHover={{ x: 5 }}
                  className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                      COMEBACK
                    </span>
                    <span className="text-xs text-gray-400">{news.comeback.source}</span>
                  </div>
                  <p className="text-white text-sm">{news.comeback.title}</p>
                </motion.div>
              )}
              
              {news.awards?.map((award: News, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-400">{award.source}</span>
                  </div>
                  <p className="text-white text-sm">{award.title}</p>
                </motion.div>
              ))}
              
              {news.latest?.slice(0, 3).map((item: News, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50"
                >
                  <p className="text-white text-sm">{item.title}</p>
                  <span className="text-xs text-gray-400">{item.source}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">새로운 소식이 없습니다</p>
          )}
        </motion.div>
      </div>

      {/* 일정 타임라인 */}
      {schedule && (schedule.this_week?.length > 0 || schedule.this_month?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4">📅 이번 달 일정</h3>
          
          <div className="space-y-2">
            {schedule.this_week?.map((event: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">이번주</span>
                <span className="text-white">{event.title || event}</span>
              </div>
            ))}
            
            {schedule.this_month?.map((event: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">이번달</span>
                <span className="text-white">{event.title || event}</span>
              </div>
            ))}
            
            {schedule.upcoming && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  향후 예정: {typeof schedule.upcoming === 'string' ? schedule.upcoming : `${schedule.upcoming.length}개 일정`}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
