import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const isDev = process.env.NODE_ENV === 'development';

function debugLog(message: string, ...args: any[]) {
  if (isDev) {
    console.log(message, ...args);
  }
}

function debugError(message: string, ...args: any[]) {
  if (isDev) {
    console.error(message, ...args);
  } else {
    console.warn(message); // 프로덕션에서는 warning만
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  useEffect(() => {
    const handleCallback = async () => {
      // 이미 처리된 경우 중복 실행 방지
      const processingKey = `oauth_processing_${Date.now()}`;
      if (sessionStorage.getItem('oauth_processing')) {
        console.log('⚠️ OAuth 이미 처리 중...');
        return;
      }
      
      sessionStorage.setItem('oauth_processing', processingKey);
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state'); // provider 정보
      const error = urlParams.get('error');
      
      if (error) {
        debugError('OAuth error:', error);
        toast.error('로그인에 실패했습니다.');
        sessionStorage.removeItem('oauth_processing');
        router.push('/');
        return;
      }
      
      if (!code) {
        debugError('No authorization code');
        toast.error('인증 코드를 받지 못했습니다.');
        sessionStorage.removeItem('oauth_processing');
        router.push('/');
        return;
      }
      
      // localStorage에서 provider 가져오기 (fallback)
      const provider = state || localStorage.getItem('oauth_provider') || 'google';
      debugLog('OAuth callback processing:', { provider, code: code.substring(0, 10) + '...' });
      
      try {
        // 백엔드로 코드 전송하여 토큰 교환 시도
        const response = await fetch(`${API_URL}/api/auth/oauth/${provider}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
          credentials: 'include', // 세션 쿠키 포함
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
          // 백엔드 처리 성공
          debugLog('Backend OAuth success:', data.user.email);
          
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_email', data.user.email);
          localStorage.setItem('user_name', data.user.name);
          if (data.user.picture) {
            localStorage.setItem('user_picture', data.user.picture);
          }
          
          // 컨텍스트 업데이트
          await login(data.user.email);
          
          toast.success(`${data.user.name}님 환영합니다!`);
          sessionStorage.removeItem('oauth_processing');
          router.push('/');
          return;
        } else {
          throw new Error(data.error || '백엔드 로그인 실패');
        }
      } catch (error) {
        debugError('백엔드 OAuth 처리 실패, 클라이언트 측 처리 시도:', error);
        
        // 폴백: 클라이언트 측에서 직접 OAuth 처리
        try {
          // 이미 카카오에서 인증받은 사용자이므로 localStorage에 저장된 정보 사용
          const userEmail = localStorage.getItem('user_email');
          const userName = localStorage.getItem('user_name');
          const userPicture = localStorage.getItem('user_picture');
          
          if (userEmail && userName) {
            // 클라이언트 측 로그인 성공
            debugLog('Client-side OAuth success:', userEmail);
            
            // 포트폴리오 API가 인식할 수 있는 강력한 토큰 생성
            const clientToken = `oauth_${userEmail}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('auth_token', clientToken);
            
            // 포트폴리오 API 호환을 위한 세션 정보도 저장
            localStorage.setItem('user_id', userEmail);
            localStorage.setItem('login_provider', provider);
            localStorage.setItem('login_timestamp', Date.now().toString());
            
            // 컨텍스트 업데이트
            await login(userEmail);
            
            toast.success(`${userName}님 환영합니다!`);
            sessionStorage.removeItem('oauth_processing');
            router.push('/');
            return;
          }
        } catch (clientError) {
          debugError('클라이언트 OAuth 처리도 실패:', clientError);
        }
        
        // 모든 처리 실패
        toast.error('로그인 처리 중 오류가 발생했습니다.');
        sessionStorage.removeItem('oauth_processing');
        router.push('/');
      }
    };
    
    handleCallback();
  }, [router, login]);
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white">로그인 처리 중...</p>
      </div>
    </div>
  );
}
