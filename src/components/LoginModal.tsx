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
    
    // provider를 localStorage에 저장 (콜백 페이지에서 사용)
    localStorage.setItem('oauth_provider', provider);
    
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
      
      if (response?.url) {
        // OAuth 페이지로 리다이렉트
        window.location.href = response.url;
      } else if (response?.configured === false) {
        // OAuth가 설정되지 않은 경우 데모 로그인으로 전환
        console.log(`${provider} OAuth가 설정되지 않았습니다. 데모 로그인을 사용하세요.`);
        toast('소셜 로그인 설정 중입니다. 데모 로그인을 사용해주세요.', {
          icon: '🔧',
        });
        setShowDemoForm(true);
      } else {
        console.warn(`${provider} OAuth URL을 가져오지 못했습니다.`);
        toast.error('로그인 서비스에 일시적인 문제가 있습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!demoName.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await demoLogin(demoName, demoEmail || undefined);
      if (success) {
        toast.success(`환영합니다, ${demoName}님! 🎉`);
        onClose();
        setDemoName('');
        setDemoEmail('');
        setShowDemoForm(false);
      }
    } catch (error) {
      console.error('데모 로그인 에러:', error);
      toast.error('로그인에 실패했습니다.');
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl z-50 p-6"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
            
            {/* 타이틀 */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {showDemoForm ? '데모 로그인' : 'KPOP Ranker 로그인'}
              </h2>
              <p className="text-gray-400 text-sm">
                {showDemoForm 
                  ? '이름을 입력하고 시작하세요!'
                  : '팬덤 활동을 시작하세요!'}
              </p>
            </div>
            
            {!showDemoForm ? (
              <div className="space-y-3">
                {/* 구글 로그인 버튼 */}
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FaGoogle size={20} />
                  Google로 로그인
                </button>
                
                {/* 카카오 로그인 버튼 */}
                <button
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  <SiKakao size={20} />
                  카카오로 로그인
                </button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">또는</span>
                  </div>
                </div>
                
                {/* 데모 로그인 버튼 */}
                <button
                  onClick={() => setShowDemoForm(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  <FaUser size={18} />
                  데모로 시작하기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 데모 로그인 폼 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    이메일 (선택)
                  </label>
                  <input
                    type="email"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDemoForm(false)}
                    className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    뒤로
                  </button>
                  <button
                    onClick={handleDemoLogin}
                    disabled={isLoading || !demoName.trim()}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? '로그인 중...' : '시작하기'}
                  </button>
                </div>
              </div>
            )}
            
            {/* 하단 안내 */}
            <div className="mt-6 text-center text-xs text-gray-500">
              로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
