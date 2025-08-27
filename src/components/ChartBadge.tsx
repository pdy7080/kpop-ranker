import React from 'react';
import { motion } from 'framer-motion';

interface ChartBadgeProps {
  charts: Record<string, number>;
  maxDisplay?: number;
}

const getChartInfo = (chartName: string) => {
  const charts: Record<string, { color: string; emoji: string }> = {
    melon: { color: 'bg-green-600', emoji: '🍉' },
    genie: { color: 'bg-blue-600', emoji: '🧞' },
    bugs: { color: 'bg-orange-500', emoji: '🐛' },
    vibe: { color: 'bg-purple-600', emoji: '💜' },
    flo: { color: 'bg-pink-500', emoji: '🌸' },
    spotify: { color: 'bg-green-500', emoji: '🎵' },
    youtube: { color: 'bg-red-500', emoji: '📺' },
    billboard: { color: 'bg-purple-500', emoji: '📊' }
  };
  return charts[chartName.toLowerCase()] || { color: 'bg-gray-500', emoji: '📈' };
};

const ChartBadge: React.FC<ChartBadgeProps> = ({ charts, maxDisplay = 3 }) => {
  const chartEntries = Object.entries(charts || {});
  const displayCharts = chartEntries.slice(0, maxDisplay);
  const remainingCount = chartEntries.length - maxDisplay;

  if (chartEntries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayCharts.map(([chart, rank], index) => {
        const info = getChartInfo(chart);
        return (
          <motion.span
            key={chart}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${info.color}`}
            title={`${chart.toUpperCase()} #${rank}`}
          >
            <span className="mr-0.5">{info.emoji}</span>
            <span className="font-bold">#{rank}</span>
          </motion.span>
        );
      })}
      
      {remainingCount > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: maxDisplay * 0.05 }}
          className="text-xs text-gray-500 dark:text-gray-400 ml-1"
        >
          +{remainingCount}
        </motion.span>
      )}
    </div>
  );
};

export default ChartBadge;
