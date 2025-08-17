import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaChartLine, FaExclamationTriangle, FaGlobeAmericas, FaMusic } from 'react-icons/fa';

interface ChartData {
  rank: number | null;
  album_image?: string | null;
  published_at: string;
  found?: boolean;
  error?: string;
  view_count?: number; // YouTube 조회수 (숫자)
  view_count_formatted?: string; // YouTube 조회수 (포맷된 문자열)
}

interface ChartOverviewProps {
  searchResult: {
    results: Record<string, ChartData>;
    success_count: number;
  };
  artistName: string;
  trackName: string;
  onChartClick?: (chartName: string) => void;
}

const chartConfig = {
  // 글로벌 차트
  Spotify: { name: 'Spotify', color: '#1DB954', isGlobal: true, icon: '🎵' },
  spotify: { name: 'Spotify', color: '#1DB954', isGlobal: true, icon: '🎵' },
  Billboard: { name: 'Billboard', color: '#000000', isGlobal: true, icon: '📊' },
  billboard: { name: 'Billboard', color: '#000000', isGlobal: true, icon: '📊' },
  'Apple Music': { name: 'Apple Music', color: '#FA243C', isGlobal: true, icon: '🍎' },
  apple_music: { name: 'Apple Music', color: '#FA243C', isGlobal: true, icon: '🍎' },
  YouTube: { name: 'YouTube 조회수', color: '#FF0000', isGlobal: true, icon: '📺' },
  youtube: { name: 'YouTube 조회수', color: '#FF0000', isGlobal: true, icon: '📺' },
  Vibe: { name: 'Vibe', color: '#FF6B6B', isGlobal: true, icon: '🎶' },
  vibe: { name: 'Vibe', color: '#FF6B6B', isGlobal: true, icon: '🎶' },
  // Shazam 제거됨 (크롤링 불가)
  
  // 국내 차트
  Melon: { name: '멜론', color: '#00CD3C', isGlobal: false, icon: '🍈' },
  melon: { name: '멜론', color: '#00CD3C', isGlobal: false, icon: '🍈' },
  Genie: { name: '지니', color: '#FF6F00', isGlobal: false, icon: '🧞' },
  genie: { name: '지니', color: '#FF6F00', isGlobal: false, icon: '🧞' },
  Bugs: { name: '벅스', color: '#FF3366', isGlobal: false, icon: '🐛' },
  bugs: { name: '벅스', color: '#FF3366', isGlobal: false, icon: '🐛' }
  // Vibe, FLO 제거됨 (크롤링 불가)
};

export default function ChartOverview({ searchResult, artistName, trackName, onChartClick }: ChartOverviewProps) {
  const { results } = searchResult;

  // 차트별 통계 계산
  const stats = useMemo(() => {
    const chartsWithRank = Object.entries(results)
      .filter(([_, data]) => data.rank !== null && data.rank > 0)
      .map(([chartName, data]) => {
        const config = chartConfig[chartName as keyof typeof chartConfig];
        return {
          chartName,
          rank: data.rank!,
          isGlobal: config?.isGlobal || false
        };
      });

    const globalCharts = chartsWithRank.filter(c => c.isGlobal);
    const domesticCharts = chartsWithRank.filter(c => !c.isGlobal);
    
    const bestRank = chartsWithRank.length > 0 
      ? Math.min(...chartsWithRank.map(c => c.rank))
      : null;
      
    const bestChart = chartsWithRank.find(c => c.rank === bestRank);

    return {
      totalCharts: chartsWithRank.length,
      globalCharts: globalCharts.length,
      domesticCharts: domesticCharts.length,
      bestRank,
      bestChart: bestChart?.chartName,
      needsAttention: chartsWithRank.filter(c => c.rank > 50).length
    };
  }, [results]);

  // 차트 그룹별로 분류
  const groupedCharts = useMemo(() => {
    const all = Object.entries(results).map(([chartName, data]) => ({
      chartName,
      ...data,
      config: chartConfig[chartName as keyof typeof chartConfig] || { name: chartName, color: '#666', isGlobal: false, icon: '📊' }
    }));

    return {
      global: all.filter(c => c.config.isGlobal),
      domestic: all.filter(c => !c.config.isGlobal)
    };
  }, [results]);

  const renderChartBox = (chartName: string, data: ChartData, config: any, index: number) => {
    const hasRank = data.rank !== null && data.rank > 0;
    const isYouTube = chartName.toLowerCase() === 'youtube';
    const hasYouTubeViews = isYouTube && data.view_count_formatted;
    const isLowRank = hasRank && data.rank! > 50;
    const isClickable = hasRank || hasYouTubeViews; // 순위가 있거나 YouTube 조회수가 있으면 클릭 가능
    
    return (
      <motion.div
        key={chartName}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-300
          ${hasRank || hasYouTubeViews
            ? isLowRank 
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
              : 'border-green-400 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
          }
          ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'hover:shadow-lg hover:scale-105'}
        `}
        onClick={() => {
          if (isClickable && onChartClick) {
            onChartClick(chartName);
          }
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="font-semibold" style={{ color: config.color }}>
              {config.name}
            </h3>
          </div>
          {isLowRank && (
            <FaExclamationTriangle className="text-yellow-500 animate-pulse" />
          )}
          {isClickable && (
            <div className="opacity-60 hover:opacity-100 transition-opacity">
              <FaChartLine className="text-sm" />
            </div>
          )}
        </div>
        
        <div className="text-center">
          {isYouTube ? (
            // YouTube 조회수 표시
            hasYouTubeViews ? (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {data.view_count_formatted}
                </div>
                <p className="text-xs text-red-500 mt-1">조회수</p>
                {isClickable && (
                  <p className="text-xs text-gray-500 mt-2">클릭해서 변화 확인</p>
                )}
              </>
            ) : (
              <div className="text-gray-400">
                <span className="text-sm">영상 없음</span>
              </div>
            )
          ) : (
            // 일반 차트 순위 표시
            hasRank ? (
              <>
                <div className={`text-3xl font-bold ${isLowRank ? 'text-yellow-600' : 'text-green-600'}`}>
                  {data.rank}위
                </div>
                {isLowRank ? (
                  <p className="text-xs text-yellow-600 mt-1">스트리밍 필요!</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">클릭해서 순위 변화 확인</p>
                )}
              </>
            ) : (
              <div className="text-gray-400">
                <span className="text-sm">순위 없음</span>
              </div>
            )
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 통계 대시보드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaChartLine className="mr-2" />
          차트 성과 요약
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-500">{stats.totalCharts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">진입 차트</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">
              {stats.bestRank || '-'}위
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">최고 순위</p>
            {stats.bestChart && (
              <p className="text-xs text-gray-500 mt-1">
                {chartConfig[stats.bestChart as keyof typeof chartConfig]?.name}
              </p>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">{stats.globalCharts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">글로벌 차트</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-500">{stats.domesticCharts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">국내 차트</p>
          </div>
        </div>

        {stats.needsAttention > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-400"
          >
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {stats.needsAttention}개 차트에서 순위가 50위 이하입니다. 팬덤 파워가 필요해요! 💪
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* 글로벌 차트 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaGlobeAmericas className="mr-2 text-blue-500" />
          글로벌 차트
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {groupedCharts.global.map((chart, index) => 
            renderChartBox(chart.chartName, chart, chart.config, index)
          )}
        </div>
      </div>

      {/* 국내 차트 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaMusic className="mr-2 text-purple-500" />
          국내 차트
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {groupedCharts.domestic.map((chart, index) => 
            renderChartBox(chart.chartName, chart, chart.config, index)
          )}
        </div>
      </div>

      {/* 팬덤 액션 가이드 */}
      {stats.totalCharts === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 glass rounded-xl"
        >
          <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            아직 차트에 진입하지 못했어요. 스트리밍을 시작해볼까요? 🎵
          </p>
        </motion.div>
      )}
    </div>
  );
}
