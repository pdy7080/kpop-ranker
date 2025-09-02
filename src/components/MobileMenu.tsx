import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaSearch, FaBriefcase, FaChartLine, FaBrain, FaInfoCircle, FaUser, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
    onClose();
  };

  const menuItems = [
    { href: '/', icon: FaHome, label: t('nav.home') },
    { href: '/portfolio', icon: FaBriefcase, label: t('nav.portfolio') },
    { href: '/trending', icon: FaChartLine, label: t('nav.trending') },
    { href: '/insights', icon: FaBrain, label: t('nav.ai_insights') },
    { href: '/about', icon: FaInfoCircle, label: t('nav.about') },
  ];

  return (
    <>
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

          {/* Menu Panel - 인라인 스타일로 강제 적용 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-72 shadow-xl z-50 lg:hidden"
            style={{ 
              backgroundColor: '#111827',  // gray-900
              color: '#ffffff'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" 
                 style={{ borderBottom: '1px solid #374151' }}>
              <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>메뉴</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{ 
                  color: '#ffffff',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
                        style={{
                          backgroundColor: isActive ? '#7c3aed' : 'transparent',
                          color: isActive ? '#ffffff' : '#d1d5db'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#1f2937';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d1d5db';
                          }
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Auth Section */}
            <div className="px-4 py-3" style={{ borderTop: '1px solid #374151', borderBottom: '1px solid #374151' }}>
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'K'}
                    </div>
                    <div>
                      <div className="text-white font-medium">{user?.name || 'K-POP Fan'}</div>
                      <div className="text-gray-400 text-sm">🎵 {t('user.role')}</div>
                    </div>
                  </div>
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>{t('button.logout')}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
                >
                  <FaSignInAlt className="w-5 h-5" />
                  <span>{t('button.login')}</span>
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="px-4 py-3 mb-4">
              <LanguageSelector />
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4"
                 style={{ borderTop: '1px solid #374151' }}>
              <div className="text-center text-sm" style={{ color: '#9ca3af' }}>
                <p>KPOP Ranker v7.1</p>
                <p className="mt-1">© 2025 All rights reserved</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Login Modal */}
    <LoginModal
      isOpen={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
    />
    </>
  );
};

export default MobileMenu;
