import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGoogle, FaUser, FaEnvelope } from 'react-icons/fa';
import { SiKakao } from 'react-icons/si';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { authAPI } from '@/lib/api';
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
  const { t } = useTranslation();

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    // provider를 localStorage에 저장 (콜백 페이지에서 사용)
    localStorage.setItem('oauth_provider', provider);
    
    try {
      // 백엔드 OAuth API 호출
      let response;
      if (provider === 'google') {
        response = await authAPI.getGoogleOAuthUrl();
      } else if (provider === 'kakao') {
        response = await authAPI.getKakaoOAuthUrl();
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
      
      if (response.success && response.url) {
        // OAuth 페이지로 리다이렉트
        console.log(`🚀 Redirecting to ${provider} OAuth:`, response.url);
        console.log(`🔗 Redirect URI: ${response.redirect_uri}`);
        window.location.href = response.url;
      } else {
        console.warn(`${provider} OAuth API 호출 실패:`, response);
        toast.error(t('login.error'));
        // 데모 로그인으로 폴백
        setShowDemoForm(true);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      toast.error(t('login.error'));
      // 데모 로그인으로 폴백
      setShowDemoForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!demoName.trim()) {
      toast.error(t('login.demo.name.required'));
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await demoLogin(demoName, demoEmail || undefined);
      if (success) {
        toast.success(t('login.welcome', '', { name: demoName }));
        onClose();
        setDemoName('');
        setDemoEmail('');
        setShowDemoForm(false);
      }
    } catch (error) {
      console.error('데모 로그인 에러:', error);
      toast.error(t('login.demo.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* 모바일 전체화면 모달 */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed inset-x-0 bottom-0 top-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:h-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* 모바일 핸들바 (상단) */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 sm:bg-gray-800/50 backdrop-blur-sm"
            >
              <FaTimes size={16} />
            </button>
            
            {/* 스크롤 가능한 컨텐츠 */}
            <div className="px-6 py-8 sm:p-6 h-full overflow-y-auto">
              {/* 타이틀 */}
              <div className="text-center mb-8 sm:mb-6">
                <div className="mb-4 sm:mb-2">
                  <div className="w-16 h-16 sm:w-12 sm:h-12 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 sm:mb-2">
                    <FaUser className="text-white text-xl sm:text-lg" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-xl font-bold text-white mb-3 sm:mb-2">
                  {showDemoForm ? t('login.demo.title') : t('login.title')}
                </h2>
                <p className="text-gray-400 text-base sm:text-sm leading-relaxed">
                  {showDemoForm 
                    ? t('login.demo.subtitle')
                    : t('login.subtitle')}
                </p>
              </div>
              
              {!showDemoForm ? (
                <div className="space-y-4 sm:space-y-3">
                  {/* 구글 로그인 버튼 */}
                  <button
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 sm:py-3 px-6 sm:px-4 rounded-xl sm:rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaGoogle size={20} className="sm:w-5 sm:h-5" />
                    <span className="text-base sm:text-sm">{t('login.google')}</span>
                  </button>
                  
                  {/* 카카오 로그인 버튼 */}
                  <button
                    onClick={() => handleSocialLogin('kakao')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-4 sm:py-3 px-6 sm:px-4 rounded-xl sm:rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <SiKakao size={20} className="sm:w-5 sm:h-5" />
                    <span className="text-base sm:text-sm">{t('login.kakao')}</span>
                  </button>
                  
                  <div className="relative my-6 sm:my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-800 text-gray-400 text-base sm:text-sm">{t('login.or')}</span>
                    </div>
                  </div>
                  
                  {/* 데모 로그인 버튼 */}
                  <button
                    onClick={() => setShowDemoForm(true)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white font-semibold py-4 sm:py-3 px-6 sm:px-4 rounded-xl sm:rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaUser size={18} className="sm:w-4 sm:h-4" />
                    <span className="text-base sm:text-sm">{t('login.demo.start')}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-4">
                  {/* 데모 로그인 폼 */}
                  <div>
                    <label className="block text-base sm:text-sm font-medium text-gray-300 mb-3 sm:mb-2">
                      {t('login.demo.name')}
                    </label>
                    <input
                      type="text"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      placeholder={t('login.demo.name.placeholder')}
                      className="w-full px-4 py-4 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl sm:rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-base sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base sm:text-sm font-medium text-gray-300 mb-3 sm:mb-2">
                      {t('login.demo.email')}
                    </label>
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      placeholder={t('login.demo.email.placeholder')}
                      className="w-full px-4 py-4 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl sm:rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-base sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-4 sm:gap-3 pt-4 sm:pt-2">
                    <button
                      onClick={() => setShowDemoForm(false)}
                      className="flex-1 py-4 sm:py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl sm:rounded-lg transition-colors text-base sm:text-sm"
                    >
                      {t('login.back')}
                    </button>
                    <button
                      onClick={handleDemoLogin}
                      disabled={isLoading || !demoName.trim()}
                      className="flex-1 py-4 sm:py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl sm:rounded-lg transition-all disabled:opacity-50 text-base sm:text-sm"
                    >
                      {isLoading ? t('login.loading') : t('login.start')}
                    </button>
                  </div>
                </div>
              )}
              
              {/* 하단 안내 - 모바일에서만 여백 추가 */}
              <div className="mt-8 sm:mt-6 pb-8 sm:pb-0 text-center text-xs text-gray-500">
                {t('login.terms')}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;