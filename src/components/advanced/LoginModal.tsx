// components/LoginModal.tsx
// 로그인 모달 컴포넌트

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Google 로그인 성공 핸들러
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 토큰 저장
        localStorage.setItem('token', data.token);
        
        // 로그인 성공 콜백
        onLoginSuccess(data.user);
        onClose();
      } else {
        console.error('Login failed');
        alert('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  // Kakao 로그인
  const handleKakaoLogin = () => {
    window.location.href = `${API_URL}/api/auth/kakao`;
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* 모달 컨텐츠 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-8"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* 모달 헤더 */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">로그인</h2>
              <p className="text-gray-600">K-POP 포트폴리오를 관리해보세요</p>
            </div>
            
            {/* 로그인 옵션 */}
            <div className="space-y-4">
              {/* Google 로그인 */}
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.error('Google Login Failed');
                    alert('Google 로그인에 실패했습니다.');
                  }}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
              
              {/* 구분선 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>
              
              {/* Kakao 로그인 */}
              <button
                onClick={handleKakaoLogin}
                className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-3"
              >
                <Image
                  src="/kakao-icon.png"
                  alt="Kakao"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span>카카오 계정으로 계속하기</span>
              </button>
            </div>
            
            {/* 추가 정보 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
              </p>
            </div>
            
            {/* 혜택 안내 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">로그인 시 혜택</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 포트폴리오 영구 저장</li>
                <li>• 검색 기록 보관</li>
                <li>• 맞춤 추천 서비스</li>
                <li>• 순위 변동 알림</li>
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
