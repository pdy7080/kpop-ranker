import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaUser, FaTimes, FaSignInAlt } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api_fixed';
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
        console.log('✅ 데모 로그인 성공');
        onClose();
      } else {
        console.warn('데모 로그인 실패');
      }
    } catch (error) {
      console.error('데모 로그인 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // OAuth URL을 서버에서 가져오기 (보안상 권장)
      let oauthUrl = '';
      
      if (provider === 'google') {
        // 서버에서 Google OAuth URL 가져오기
        const response = await authApi.getGoogleOAuthUrl();
        if (response?.url) {
          oauthUrl = response.url;
        } else if (!response?.configured) {
          console.log('Google OAuth가 설정되지 않았습니다. 데모 로그인을 사용하세요.');
          toast.info('Google 로그인이 설정되지 않았습니다. 데모 로그인을 사용해주세요.');
          return;
        }
      } else if (provider === 'kakao') {
        // 서버에서 Kakao OAuth URL 가져오기
        const response = await authApi.getKakaoOAuthUrl();
        if (response?.url) {
          oauthUrl = response.url;
        } else if (!response?.configured) {
          console.log('Kakao OAuth가 설정되지 않았습니다. 데모 로그인을 사용하세요.');
          toast.info('카카오 로그인이 설정되지 않았습니다. 데모 로그인을 사용해주세요.');
          return;
        }
      }
      
      if (oauthUrl) {
        // provider 정보 저장 (콜백에서 사용)
        localStorage.setItem('oauth_provider', provider);
        // OAuth 페이지로 리다이렉트
        window.location.href = oauthUrl;
      } else {
        toast.error(`${provider === 'google' ? 'Google' : '카카오'} 로그인 URL을 가져올 수 없습니다.`);
      }
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);
      toast.error(`${provider === 'google' ? 'Google' : '카카오'} 로그인 중 오류가 발생했습니다.`);
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
                disabled={isLoading}
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
                  빠른 시작
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">이름</label>
                    <input
                      type="text"
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 
                               focus:border-transparent transition-all"
                      placeholder="이름을 입력하세요"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">이메일</label>
                    <input
                      type="email"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 
                               focus:border-transparent transition-all"
                      placeholder="이메일을 입력하세요"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 
                           text-white font-semibold rounded-lg hover:shadow-lg 
                           transition-all duration-300 flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaUser className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <FaUser className="w-5 h-5" />
                  )}
                  데모로 시작하기
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-dark-200 text-gray-500">또는</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-300 
                           dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                           transition-all duration-300 flex items-center justify-center gap-3
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaGoogle className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Google로 계속하기</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#FEE500] hover:bg-[#FDD835] rounded-lg 
                           transition-all duration-300 flex items-center justify-center gap-3
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RiKakaoTalkFill className="w-6 h-6 text-[#000000]" />
                  <span className="font-medium text-[#000000]">카카오로 계속하기</span>
                </button>
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
