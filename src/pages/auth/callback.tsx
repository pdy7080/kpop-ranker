import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

const AuthCallbackPage: React.FC = () => {
  const router = useRouter();
  const { login, checkAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('로그인 처리 중...');
  const [isProcessing, setIsProcessing] = useState(false); // 중복 실행 방지

  useEffect(() => {
    const handleCallback = async () => {
      // 이미 처리 중이면 무시
      if (isProcessing) {
        console.log('🔄 Already processing OAuth callback, skipping...');
        return;
      }
      
      // URL에서 code와 provider 파라미터 추출
      const { code, state, error } = router.query;
      
      // code가 없으면 처리하지 않음
      if (!code && !error) {
        return;
      }
      
      // 처리 시작
      setIsProcessing(true);
      
      // 디버깅 로그 추가 (프로덕션에서는 비활성화 권장)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔵 OAuth Callback Parameters:', {
          code: code ? `${String(code).substring(0, 10)}...` : 'NO_CODE',
          state: state,
          error: error,
          provider: 'detected'
        });
      }
      
      if (error) {
        console.error('🔴 OAuth Error:', error);
        setStatus('error');
        setMessage('로그인이 취소되었거나 실패했습니다.');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      if (!code) {
        console.error('🔴 No authorization code');
        setStatus('error');
        setMessage('인증 코드가 없습니다.');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      try {
        // localStorage에서 provider 확인 (우선)
        let provider = localStorage.getItem('oauth_provider') || 'google';
        
        // 추가적으로 URL에서 provider 판별 (폴백)
        const referrer = document.referrer;
        if (!localStorage.getItem('oauth_provider')) {
          if (referrer.includes('kakao') || window.location.href.includes('kakao')) {
            provider = 'kakao';
          } else if (state && typeof state === 'string' && state.includes('kakao')) {
            provider = 'kakao';
          }
        }
        
        // provider 사용 후 localStorage에서 제거
        localStorage.removeItem('oauth_provider');

        // OAuth 콜백 처리
        if (process.env.NODE_ENV === 'development') {
          console.log(`🟢 Calling ${provider} OAuth callback API...`);
        }
        
        let response;
        if (provider === 'google') {
          response = await authAPI.googleCallback(code as string);
        } else {
          response = await authAPI.kakaoCallback(code as string);
        }
        
        // 디버깅 로그 - API 응답 (프로덕션에서는 비활성화)
        if (process.env.NODE_ENV === 'development') {
          console.log('🟡 OAuth API Response:', {
            success: response?.data?.success,
            hasToken: !!response?.data?.token,
            hasUser: !!response?.data?.user
          });
        }

        if (response?.data?.success && response?.data?.token) {
          // 토큰 저장
          localStorage.setItem('auth_token', response.data.token);
          
          // 사용자 정보 저장
          if (response.data.user) {
            localStorage.setItem('user_info', JSON.stringify(response.data.user));
            
            // AuthContext 업데이트
            // login 함수 대신 checkAuth 호출하여 상태 업데이트
            await checkAuth();
          }

          setStatus('success');
          setMessage('로그인 성공! 잠시 후 이동합니다...');
          
          // 포트폴리오 페이지로 이동
          setTimeout(() => {
            router.push('/portfolio');
          }, 1500);
        } else {
          throw new Error('로그인 처리 실패');
        }
      } catch (error: any) {
        console.error('🔴 OAuth callback error:', error);
        console.error('🔴 Error details:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status
        });
        
        setStatus('error');
        const errorMessage = error?.response?.data?.error || error?.message || '로그인 처리 중 오류가 발생했습니다.';
        setMessage(errorMessage);
        setTimeout(() => router.push('/'), 3000);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-pink-50 dark:from-dark-100 dark:to-dark-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center">
          {status === 'processing' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <FaSpinner className="w-12 h-12 text-primary-500 mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">로그인 처리 중</h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">로그인 성공!</h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">로그인 실패</h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallbackPage;
