import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaUser, FaTimes, FaSignInAlt } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: 'K-POP Fan',
    email: 'fan@kpopranker.com'
  });
  const { demoLogin } = useAuth();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const success = await demoLogin(demoForm.name, demoForm.email);
      if (success) {
        // 🔥 조용한 처리 - 알림창 제거
        console.log('✅ 데모 로그인 성공');
        onClose();
      } else {
        // 🔥 실패 시에만 조용한 콘솔 로그
        console.warn('데모 로그인 실패');
      }
    } catch (error) {
      // 🔥 에러 시도 조용한 처리
      console.error('데모 로그인 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // 실제 소셜 로그인은 추후 구현
      // 🔥 조용한 처리 - 알림창 제거
      console.log(`${provider} 소셜 로그인은 준비 중입니다. 데모 로그인을 사용해주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-morphism rounded-3xl p-8 w-full max-w-md relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FaSignInAlt className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">로그인</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  포트폴리오 관리를 위해 로그인이 필요합니다
                </p>
              </div>

              {/* Demo Login Form */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-center text-primary-600 dark:text-primary-400">
                  🚀 데모 로그인 (체험하기)
                </h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">닉네임</label>
                  <input
                    type="text"
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="당신의 K-POP 팬 닉네임"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">이메일</label>
                  <input
                    type="email"
                    value={demoForm.email}
                    onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="이메일 주소"
                  />
                </div>

                <button
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <FaUser className="w-5 h-5" />
                  <span>{isLoading ? '로그인 중...' : '데모 로그인'}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-dark-100 text-gray-500">또는</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  <FaGoogle className="w-5 h-5 text-red-500" />
                  <span>Google로 로그인</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('Kakao')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  <RiKakaoTalkFill className="w-5 h-5 text-yellow-500" />
                  <span>카카오로 로그인</span>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  로그인하면 포트폴리오 관리, 순위 알림 등<br />
                  모든 기능을 사용할 수 있습니다
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
