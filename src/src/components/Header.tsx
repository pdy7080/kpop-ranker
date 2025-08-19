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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - 개선된 가시성 */}
            <Link href="/">
              <motion.div 
                className="flex items-center space-x-3 cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <HiSparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    KPOP <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">FANfolio</span>
                  </h1>
                  <p className="text-xs text-gray-400 hidden sm:block">실시간 차트 모니터링</p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/portfolio">
                <motion.div 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all cursor-pointer group"
                  whileHover={{ y: -2 }}
                >
                  <FaBriefcase className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                  <span className="relative">
                    내 포트폴리오
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
                  </span>
                </motion.div>
              </Link>
              
              <Link href="/trending">
                <motion.div 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all cursor-pointer group"
                  whileHover={{ y: -2 }}
                >
                  <FaChartLine className="w-4 h-4 group-hover:text-pink-400 transition-colors" />
                  <span className="relative">
                    트렌딩
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
                  </span>
                </motion.div>
              </Link>
              
              <Link href="/about">
                <motion.div 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all cursor-pointer group"
                  whileHover={{ y: -2 }}
                >
                  <FaInfoCircle className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  <span className="relative">
                    소개
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
                  </span>
                </motion.div>
              </Link>

              {/* Auth Section */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-purple-500/20">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {user?.name?.[0]?.toUpperCase() || 'K'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{user?.name || 'K-POP Fan'}</span>
                        <span className="text-xs text-gray-400">🎵 포트폴리오 관리자</span>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-gray-300 hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
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
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
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
                className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 backdrop-blur-sm transition-colors border border-purple-500/30"
                onClick={() => setIsMobileMenuOpen(true)}
                whileTap={{ scale: 0.95 }}
              >
                <FaBars className="w-6 h-6 text-white" />
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
