// components/PortfolioTableEnhanced.tsx
// 앨범 썸네일이 포함된 포트폴리오 테이블 컴포넌트

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioItem {
  id: string;
  artist: string;
  track: string;
  albumImage?: string;
  currentRank: number | null;
  previousRank: number | null;
  peakRank: number;
  weeksOnChart: number;
  addedDate: string;
}

interface PortfolioTableProps {
  items: PortfolioItem[];
  onRemove: (id: string) => void;
}

const PortfolioTableEnhanced: React.FC<PortfolioTableProps> = ({ items, onRemove }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // 순위 변동 계산
  const getRankChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return { value: 0, type: 'same' };
    
    const change = previous - current;
    if (change > 0) return { value: change, type: 'up' };
    if (change < 0) return { value: Math.abs(change), type: 'down' };
    return { value: 0, type: 'same' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              곡 정보
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              현재 순위
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              순위 변동
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              최고 순위
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              차트 기간
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              추가일
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              관리
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <AnimatePresence>
            {items.map((item) => {
              const rankChange = getRankChange(item.currentRank, item.previousRank);
              
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50 transition-colors"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* 곡 정보 (앨범 썸네일 포함) */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative flex-shrink-0 h-12 w-12 mr-3">
                        {item.albumImage ? (
                          <>
                            <Image
                              src={item.albumImage}
                              alt={`${item.artist} - ${item.track}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-md"
                            />
                            {/* 호버 시 확대 효과 */}
                            {hoveredId === item.id && (
                              <motion.div
                                className="absolute z-50 -top-2 -left-2 w-24 h-24 rounded-lg overflow-hidden shadow-xl"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                              >
                                <Image
                                  src={item.albumImage}
                                  alt={`${item.artist} - ${item.track}`}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </motion.div>
                            )}
                          </>
                        ) : (
                          <div className="h-full w-full bg-gray-300 rounded-md flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.track}</div>
                        <div className="text-sm text-gray-500">{item.artist}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* 현재 순위 */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {item.currentRank ? (
                      <span className="text-2xl font-bold text-gray-800">#{item.currentRank}</span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  
                  {/* 순위 변동 */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {rankChange.type === 'up' && (
                      <span className="flex items-center justify-center text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {rankChange.value}
                      </span>
                    )}
                    {rankChange.type === 'down' && (
                      <span className="flex items-center justify-center text-red-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {rankChange.value}
                      </span>
                    )}
                    {rankChange.type === 'same' && (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  
                  {/* 최고 순위 */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-semibold text-blue-600">#{item.peakRank}</span>
                  </td>
                  
                  {/* 차트 기간 */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-600">{item.weeksOnChart}주</span>
                  </td>
                  
                  {/* 추가일 */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-500">
                      {new Date(item.addedDate).toLocaleDateString('ko-KR')}
                    </span>
                  </td>
                  
                  {/* 관리 */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTableEnhanced;
