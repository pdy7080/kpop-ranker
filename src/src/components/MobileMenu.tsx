import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaSearch, FaBriefcase, FaChartLine, FaBrain, FaInfoCircle } from 'react-icons/fa';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const menuItems = [
    { href: '/', icon: FaHome, label: '홈' },
    { href: '/portfolio', icon: FaBriefcase, label: '포트폴리오' },
    { href: '/trending', icon: FaChartLine, label: '트렌딩' },
    { href: '/insights', icon: FaBrain, label: 'AI 인사이트' },
    { href: '/about', icon: FaInfoCircle, label: '소개' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Menu Panel - 다크 테마 강제 적용 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-72 bg-gray-900 shadow-xl z-50 lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">메뉴</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
              <div className="text-center text-sm text-gray-400">
                <p>KPOP Ranker v7.1</p>
                <p className="mt-1">© 2025 All rights reserved</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
