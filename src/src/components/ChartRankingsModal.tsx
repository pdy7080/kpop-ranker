import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMusic, FaArrowUp, FaArrowDown, FaMinus, FaExternalLinkAlt } from 'react-icons/fa';
import Image from 'next/image';
import { formatNumber } from '@/lib/utils';

interface ChartData {
  chart: string;
  rank: number | null;
  track: string;
  album_image: string | null;
  views_or_streams?: string;
  view_count?: number;
  view_count_formatted?: string;
  previous_rank?: number | null;
  crawl_time?: string;
}

interface ChartRankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistName: string;
  chartData: ChartData[];
}

export default function ChartRankingsModal({ 
  isOpen, 
  onClose, 
  artistName, 
  chartData 
}: ChartRankingsModalProps) {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const getRankChange = (currentRank: number | null, previousRank: number | null) => {
    if (!currentRank || !previousRank) return null;
    return previousRank - currentRank;
  };

  const getRankIcon = (change: number | null) => {
    if (change === null || change === 0) return <FaMinus className="w-3 h-3 text-gray-500" />;
    if (change > 0) return <FaArrowUp className="w-3 h-3 text-green-500" />;
    return <FaArrowDown className="w-3 h-3 text-red-500" />;
  };

  const getChartColor = (chartName: string) => {
    const colors: { [key: string]: string } = {
      'Spotify': 'bg-green-500',
      'YouTube': 'bg-red-500', 
      'Melon': 'bg-green-600',
      'Genie': 'bg-blue-500',
      'Bugs': 'bg-orange-500',
      'Vibe': 'bg-purple-500',
      'Billboard': 'bg-yellow-500'
    };
    return colors[chartName] || 'bg-gray-500';
  };

  const getChartUrl = (chartName: string, artistName: string, trackName: string) => {
    const encodedArtist = encodeURIComponent(artistName);
    const encodedTrack = encodeURIComponent(trackName);
    
    const urls: { [key: string]: string } = {
      'Spotify': `https://open.spotify.com/search/${encodedArtist}%20${encodedTrack}`,
      'YouTube': `https://www.youtube.com/results?search_query=${encodedArtist}+${encodedTrack}`,
      'Melon': `https://www.melon.com/search/total/index.htm?q=${encodedArtist}+${encodedTrack}`,
      'Genie': `https://www.genie.co.kr/search/searchMain?query=${encodedArtist}+${encodedTrack}`,
      'Bugs': `https://music.bugs.co.kr/search/integrated?q=${encodedArtist}+${encodedTrack}`,
      'Vibe': `https://vibe.naver.com/search?query=${encodedArtist}+${encodedTrack}`,
      'Billboard': `https://www.billboard.com/charts/hot-100/`
    };
    return urls[chartName] || '#';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaMusic className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">{artistName}</h2>
                  <p className="text-purple-100">전체 차트 순위</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                차트 데이터를 찾을 수 없습니다.
              </div>
            ) : (
              <div className="grid gap-4">
                {chartData.map((chart, index) => {
                  const rankChange = getRankChange(chart.rank, chart.previous_rank ?? null);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Chart Icon */}
                        <div className={`w-12 h-12 ${getChartColor(chart.chart)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <FaMusic className="w-6 h-6 text-white" />
                        </div>

                        {/* Album Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {chart.album_image ? (
                            <Image
                              src={chart.album_image}
                              alt={chart.track}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaMusic className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Chart Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                              {chart.chart}
                            </h3>
                            <a
                              href={getChartUrl(chart.chart, artistName, chart.track)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              <FaExternalLinkAlt className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                            {chart.track}
                          </p>
                          {chart.views_or_streams && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {chart.view_count_formatted || chart.views_or_streams}
                            </p>
                          )}
                          {chart.crawl_time && (
                            <p className="text-xs text-gray-400">
                              업데이트: {new Date(chart.crawl_time).toLocaleString('ko-KR')}
                            </p>
                          )}
                        </div>

                        {/* Rank */}
                        <div className="text-right flex-shrink-0">
                          {chart.rank ? (
                            <>
                              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                #{chart.rank}
                              </div>
                              {rankChange !== null && (
                                <div className="flex items-center justify-end space-x-1 mt-1">
                                  {getRankIcon(rankChange)}
                                  <span className={`text-sm font-medium ${
                                    rankChange > 0 ? 'text-green-500' : 
                                    rankChange < 0 ? 'text-red-500' : 'text-gray-500'
                                  }`}>
                                    {Math.abs(rankChange)}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-lg font-medium text-gray-400">
                              순위 없음
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                마지막 업데이트: {new Date().toLocaleString('ko-KR')}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
