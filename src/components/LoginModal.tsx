import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGoogle, FaUser, FaEnvelope } from 'react-icons/fa';
import { SiKakao } from 'react-icons/si';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [showDemoForm, setShowDemoForm] = useState(false);
  
  const { login, demoLogin } = useAuth();

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    try {
      // OAuth URL 가져오기
      let response;
      if (provider === 'google') {
        response = await authApi.getGoogleOAuthUrl();
      } else if (provider === 'kakao') {
        response = await authApi.getKakaoOAuthUrl();
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
      
      if (response?.data?.url) {
        // OAuth 페이지로 리다이렉트
        window.location.href = response.data.url;
      } else {
        console.warn(`${provider} OAuth URL을 가져오지 못했습니다.`);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!demoName.trim()) {
      // 🔥 입력 검증 실패 시에만 조용한 콘솔 로그
      console.warn('이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await demoLogin(demoName, demoEmail || undefined);
      
      if (success) {
        // 🔥 조용한 처리 - 알림창 제거
        console.log('✅ 데모 로그인 성공');
        onClose();
        setShowDemoForm(false);
        setDemoName('');
        setDemoEmail('');
      } else {
        // 🔥 실패 시에만 조용한 콘솔 로그
        console.warn('데모 로그인 실패');
      }
    } catch (error) {
      // 🔥 에러도 조용히 처리
      console.error('데모 로그인 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-dark-200 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-300">
              <h2 className="text-xl font-bold">로그인</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showDemoForm ? (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    K-POP 포트폴리오를 시작하세요!
                  </p>

                  {/* Social Login Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => handleSocialLogin('google')}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-3 p-3 border border-gray-300 dark:border-dark-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaGoogle className="w-5 h-5 text-red-500" />
                      <span>Google로 시작하기</span>
                    </motion.button>

                    <motion.button
                      onClick={() => handleSocialLogin('kakao')}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-3 p-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SiKakao className="w-5 h-5" />
                      <span>카카오로 시작하기</span>
                    </motion.button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-200 dark:border-dark-300"></div>
                    <span className="px-4 text-sm text-gray-500">또는</span>
                    <div className="flex-1 border-t border-gray-200 dark:border-dark-300"></div>
                  </div>

                  {/* Demo Login */}
                  <motion.button
                    onClick={() => setShowDemoForm(true)}
                    className="w-full flex items-center justify-center space-x-3 p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaUser className="w-5 h-5" />
                    <span>데모로 체험하기</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">데모 체험</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      간단한 정보로 포트폴리오 기능을 체험해보세요
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <FaUser className="inline w-4 h-4 mr-2" />
                        이름 *
                      </label>
                      <input
                        type="text"
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        placeholder="닉네임을 입력해주세요"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <FaEnvelope className="inline w-4 h-4 mr-2" />
                        이메일 (선택)
                      </label>
                      <input
                        type="email"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="demo@example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-300"
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => setShowDemoForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                      >
                        돌아가기
                      </button>
                      <motion.button
                        onClick={handleDemoLogin}
                        disabled={isLoading || !demoName.trim()}
                        className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? '로그인 중...' : '시작하기'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-300">
                <p className="text-xs text-gray-500 text-center">
                  로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
