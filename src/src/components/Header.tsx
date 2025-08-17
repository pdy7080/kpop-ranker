import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChartLine, FaBriefcase, FaBars, FaInfoCircle, FaUser, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import MobileMenu from './MobileMenu';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-dark-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <motion.div 
                className="flex items-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HiSparkles className="w-8 h-8 text-primary-500" />
                <div>
                  <h1 className="text-xl font-bold gradient-text">KPOP FANfolio</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">실시간 차트 모니터링</p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/portfolio">
                <motion.div 
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <FaBriefcase className="w-4 h-4" />
                  <span>내 포트폴리오</span>
                </motion.div>
              </Link>
              
              <Link href="/trending">
                <motion.div 
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <FaChartLine className="w-4 h-4" />
                  <span>트렌딩</span>
                </motion.div>
              </Link>
              
              <Link href="/about">
                <motion.div 
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <FaInfoCircle className="w-4 h-4" />
                  <span>소개</span>
                </motion.div>
              </Link>

              {/* Auth Section */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200 dark:border-dark-300">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {user?.name?.[0]?.toUpperCase() || 'K'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'K-POP Fan'}</span>
                        <span className="text-xs text-gray-500">🎵 포트폴리오 관리자</span>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span className="text-sm">로그아웃</span>
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-pink-500 text-white px-4 py-2 rounded-full hover:from-primary-600 hover:to-pink-600 transition-all shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSignInAlt className="w-4 h-4" />
                    <span>로그인</span>
                  </motion.button>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <motion.button 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                whileTap={{ scale: 0.95 }}
              >
                <FaBars className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Header;
