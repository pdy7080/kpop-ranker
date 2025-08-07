import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaTrash, FaEdit, FaArrowUp, FaArrowDown, FaMinus, FaChartLine, FaMusic } from 'react-icons/fa';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PortfolioItem {
  id: number;
  artist: {
    id: number;
    name: string;
    profile_image: string | null;
  };
  track: {
    id: number;
    name: string;
    album_image?: string | null;
  };
  shares: number;
  purchase_rank: number | null;
  purchase_date: string | null;
  current_rank: number | null;
  current_value: number | null;
  value_change: number | null;
  memo: string | null;
  tags: string[];
}

interface PortfolioTableProps {
  items: PortfolioItem[];
  onDelete: (id: number) => void;
  onItemClick?: (item: PortfolioItem) => void;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ items, onDelete, onItemClick }) => {
  const [sortField, setSortField] = useState<keyof PortfolioItem | 'artist_name' | 'track_name'>('current_value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof PortfolioItem | 'artist_name' | 'track_name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'artist_name':
        aValue = a.artist.name;
        bValue = b.artist.name;
        break;
      case 'track_name':
        aValue = a.track.name;
        bValue = b.track.name;
        break;
      case 'current_value':
        aValue = a.current_value || 0;
        bValue = b.current_value || 0;
        break;
      case 'value_change':
        aValue = a.value_change || 0;
        bValue = b.value_change || 0;
        break;
      case 'current_rank':
        aValue = a.current_rank || 999;
        bValue = b.current_rank || 999;
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getRankChangeIcon = (item: PortfolioItem) => {
    if (!item.purchase_rank || !item.current_rank) return null;
    
    const change = item.purchase_rank - item.current_rank;
    if (change > 0) return <FaArrowUp className="w-3 h-3 text-green-500" />;
    if (change < 0) return <FaArrowDown className="w-3 h-3 text-red-500" />;
    return <FaMinus className="w-3 h-3 text-gray-400" />;
  };

  const getRankChange = (item: PortfolioItem) => {
    if (!item.purchase_rank || !item.current_rank) return null;
    const change = item.purchase_rank - item.current_rank;
    return change;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4">
              <button
                onClick={() => handleSort('artist_name')}
                className="font-semibold hover:text-primary-500 transition-colors"
              >
                아티스트/트랙
              </button>
            </th>
            <th className="text-center py-3 px-4">
              <button
                onClick={() => handleSort('shares')}
                className="font-semibold hover:text-primary-500 transition-colors"
              >
                보유
              </button>
            </th>
            <th className="text-center py-3 px-4">
              <button
                onClick={() => handleSort('current_rank')}
                className="font-semibold hover:text-primary-500 transition-colors"
              >
                현재 순위
              </button>
            </th>
            <th className="text-center py-3 px-4">
              <button
                onClick={() => handleSort('current_value')}
                className="font-semibold hover:text-primary-500 transition-colors"
              >
                가치
              </button>
            </th>
            <th className="text-center py-3 px-4">
              <button
                onClick={() => handleSort('value_change')}
                className="font-semibold hover:text-primary-500 transition-colors"
              >
                변동률
              </button>
            </th>
            <th className="text-center py-3 px-4">액션</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item, index) => {
            const rankChange = getRankChange(item);
            
            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                onClick={() => onItemClick?.(item)}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {/* Album Image */}
                      {item.track.album_image ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={item.track.album_image}
                            alt={item.track.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white shadow-md">
                          <FaMusic className="w-5 h-5" />
                        </div>
                      )}
                      
                      {/* Artist Profile */}
                      {item.artist.profile_image ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                          <Image
                            src={item.artist.profile_image}
                            alt={item.artist.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-800">
                          {item.artist.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{item.artist.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.track.name}</p>
                      {item.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {item.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-center py-4 px-4">
                  <span className="font-medium">{item.shares}주</span>
                </td>
                <td className="text-center py-4 px-4">
                  {item.current_rank ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-bold text-lg">{item.current_rank}위</span>
                      {rankChange !== null && (
                        <div className="flex items-center space-x-1">
                          {getRankChangeIcon(item)}
                          <span className={`text-sm ${
                            rankChange > 0 ? 'text-green-500' : 
                            rankChange < 0 ? 'text-red-500' : 
                            'text-gray-400'
                          }`}>
                            {rankChange > 0 ? `+${rankChange}` : rankChange}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-4 px-4">
                  {item.current_value !== null ? (
                    <span className="font-bold text-lg">
                      {item.current_value.toFixed(0)}점
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-4 px-4">
                  {item.value_change !== null ? (
                    <span className={`font-medium ${
                      item.value_change > 0 ? 'text-green-500' : 
                      item.value_change < 0 ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {item.value_change > 0 ? '+' : ''}{item.value_change.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-center py-4 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement chart view
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="차트 보기"
                    >
                      <FaChartLine className="w-4 h-4 text-primary-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="삭제"
                    >
                      <FaTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">포트폴리오가 비어있습니다</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioTable;
