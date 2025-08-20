import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaSync } from 'react-icons/fa';
import { chartAPI } from '@/lib/api';
import { useTranslation } from '@/contexts/TranslationContext';

interface ChartUpdateStatusData {
  chart_name: string;
  last_update: string;
  last_update_korean?: string;
  next_update?: string;
  status: 'success' | 'failed' | 'pending' | 'outdated' | 'unknown' | '최신' | '정상' | '지연' | '오류' | 'active';
  tracks_updated?: number;
  error_message?: string;
  track_count?: number;
  raw_time?: string;
  status_color?: string;
}

interface ChartUpdateStatusProps {
  className?: string;
}

const CHART_NAMES: Record<string, string> = {
  melon: 'MELON',
  genie: 'GENIE',
  bugs: 'BUGS',
  vibe: 'VIBE',
  flo: 'FLO',
  spotify: 'SPOTIFY',
  youtube: 'YOUTUBE',
  billboard: 'BILLBOARD'
};

export default function ChartUpdateStatus({ className = '' }: ChartUpdateStatusProps) {
  const [updateStatus, setUpdateStatus] = useState<Record<string, ChartUpdateStatusData>>({});
  const [loading, setLoading] = useState(true);
  const { t, language } = useTranslation();

  // 실시간 업데이트 현황 가져오기
  const fetchUpdateStatus = async () => {
    try {
      const data = await chartAPI.getUpdateStatus();
      // 안전하게 타입 체크
      if (data && data.charts && typeof data.charts === 'object' && !Array.isArray(data.charts)) {
        setUpdateStatus(data.charts as Record<string, ChartUpdateStatusData>);
      } else {
        // fallback 데이터가 배열인 경우 빈 객체로 처리
        setUpdateStatus({});
      }
    } catch (error) {
      console.error('차트 업데이트 현황 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdateStatus();
    
    // 5분마다 상태 업데이트
    const interval = setInterval(() => {
      fetchUpdateStatus();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // 시간 포맷팅 (실제 DB 업데이트 시간 처리)
  const formatSimpleTime = (timeString: string) => {
    try {
      // 한국어 형식 처리 "2025년 07월 30일 00시 33분 (KST)"
      if (timeString && timeString.includes('년')) {
        // 한국어 형식을 간단한 형식으로 변환
        const match = timeString.match(/(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분/);
        if (match) {
          const [_, year, month, day, hour, minute] = match;
          return `${year}.${month}.${day} ${hour}:${minute}`;
        }
        return timeString;
      }
      
      // "2025.07.21 14:19" 형식으로 받음 (실제 DB 업데이트 시간)
      if (timeString && timeString.includes('.')) {
        return timeString; // 이미 포맷된 형식 그대로 사용
      }
      
      // ISO 날짜 형식 처리 (백업용)
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Seoul'
        }).replace(/\. /g, '.').replace(' ', ' ');
      }
      return timeString || '-';
    } catch (error) {
      return timeString || '-';
    }
  };

  // 상태 텍스트 번역
  const getStatusText = (status: string) => {
    if (language === 'ko') return status;
    
    const statusMap: Record<string, string> = {
      '최신': 'Latest',
      '정상': 'Normal',
      '지연': 'Delayed',
      '오류': 'Error',
      'success': 'Success',
      'failed': 'Failed',
      'pending': 'Pending',
      'outdated': 'Outdated',
      'unknown': 'Unknown',
      'active': 'Active'
    };
    
    return statusMap[status] || status;
  };

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <div className="grid md:grid-cols-2 gap-4 h-auto max-h-[150px]">
        {/* 왼쪽: 고정된 업데이트 시간 */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="font-bold text-xs mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <FaClock className="w-3 h-3" />
            {t('chart.update.schedule')}
          </h3>
          <div className="space-y-0.5 text-[11px]">
            <p className="text-gray-600 dark:text-gray-400">
              • <span className="font-semibold">{t('chart.korea3')}</span> {t('chart.schedule.korea')}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              • <span className="font-semibold">Vibe</span> {t('chart.schedule.vibe')}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              • <span className="font-semibold">FLO</span> {t('chart.schedule.flo')}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              • <span className="font-semibold">Spotify</span> {t('chart.schedule.spotify')}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              • <span className="font-semibold">YouTube</span> {t('chart.schedule.youtube')}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              • <span className="font-semibold">Billboard</span> {t('chart.schedule.billboard')}
            </p>
          </div>
        </div>

        {/* 오른쪽: 터미널 스타일 실시간 업데이트 현황 */}
        <div className="bg-black rounded-lg p-2 font-mono text-[10px] overflow-hidden relative">
          <div className="text-green-400 mb-1">{t('chart.update.realtime')}</div>
          
          {/* 업데이트 로그 */}
          <div className="space-y-0.5">
            {loading ? (
              <div className="text-yellow-400">{t('message.loading')}</div>
            ) : (
              <>
                {/* 실제 API 데이터로 크롤링 현황 표시 */}
                {Object.entries(updateStatus).length > 0 ? (
                  Object.entries(updateStatus).map(([chartKey, data]) => {
                    const chartName = CHART_NAMES[chartKey.toLowerCase()] || chartKey.toUpperCase();
                    // 🔥 상태 처리 개선 - 백엔드에서 오는 한국어 상태 처리
                    const isOutdated = data.status === '지연' || data.status === 'outdated';
                    const isActive = data.status === '최신' || data.status === '정상' || data.status === 'active' || data.status === 'success';
                    const isFailed = data.status === '오류' || data.status === 'failed';
                    
                    const statusColor = isActive ? 'text-green-400' : 
                                      isFailed ? 'text-red-400' : 
                                      isOutdated ? 'text-yellow-400' : 'text-gray-400';
                    const statusIcon = isActive ? '✓' : 
                                     isFailed ? '✗' : 
                                     isOutdated ? '⚠' : '◐';
                    
                    // last_update_korean 우선 사용, 없으면 last_update 사용
                    const updateTime = data.last_update_korean || data.last_update || '-';
                    const displayStatus = data.track_count ? 
                      `${data.track_count} ${t('chart.tracks')}` : 
                      t('chart.nodata');
                    
                    return (
                      <div key={chartKey} className={statusColor}>
                        {chartName} - {displayStatus} {statusIcon}
                      </div>
                    );
                  })
                ) : (
                  // API 데이터가 없을 때 기본 표시
                  <>
                    <div className="text-yellow-400">{t('chart.connecting')}</div>
                    <div className="text-gray-500">{t('chart.loading.crawl')}</div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
