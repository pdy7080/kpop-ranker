import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes } from 'react-icons/fa';

interface RankingAlertsProps {
  portfolioItems: any[];
  onMarkAsRead: (alertId: string) => void;
}

export default function RankingAlerts({ portfolioItems, onMarkAsRead }: RankingAlertsProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [unreadCount] = useState(0);

  return (
    <div className="relative">
      {/* 알림 벨 버튼 */}
      <button
        onClick={() => setShowAlerts(!showAlerts)}
        className="relative p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <FaBell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 패널 */}
      <AnimatePresence>
        {showAlerts && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border z-50 max-h-96 overflow-hidden"
          >
            {/* 헤더 */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <FaBell className="w-4 h-4 mr-2" />
                  순위 변화 알림
                </h3>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <FaTimes className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 알림 목록 */}
            <div className="p-6 text-center text-gray-500">
              <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>실시간 순위 변화 알림</p>
              <p className="text-xs mt-1">
                포트폴리오에 곡을 추가하면<br />
                순위 변화 알림을 받을 수 있어요
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
