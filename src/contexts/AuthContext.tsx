/*
개선된 AuthContext - 백엔드 인증 상태 동기화
*/
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  user_id: string;
  email: string;
  name: string;
  profile_image?: string;
  provider: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: string, code?: string) => Promise<boolean>;
  demoLogin: (name?: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userEmail = localStorage.getItem('user_email');
      const userName = localStorage.getItem('user_name');
      const userPicture = localStorage.getItem('user_picture');
      
      if (!token || !userEmail || !userName) {
        setUser(null);
        return;
      }

      // 백엔드에서 인증 상태 확인 (조용히 체크)
      try {
        const response = await fetch(`${API_URL}/api/auth/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            // 백엔드에서 인증 확인됨
            const user = {
              user_id: data.user.email || userEmail,
              email: data.user.email || userEmail,
              name: data.user.name || userName,
              profile_image: userPicture || undefined,
              provider: data.user.provider || 'oauth'
            };
            
            setUser(user);
            console.log('✅ AuthContext: 백엔드 인증 확인 성공', user);
            return;
          }
        }
        
        // 백엔드 인증 실패 - 로그 없이 fallback
        console.log('⚠️ AuthContext: 백엔드 인증 실패, 로컬 모드 사용');
        
      } catch (backendError) {
        // 백엔드 연결 실패 - 조용히 로컬 모드 사용
        console.log('⚠️ AuthContext: 백엔드 연결 실패, 로컬 모드 사용');
      }

      // localStorage 데이터를 사용해서 사용자 상태 복원 (fallback)
      const user = {
        user_id: userEmail,
        email: userEmail,
        name: userName,
        profile_image: userPicture || undefined,
        provider: 'local'
      };
      
      setUser(user);
      console.log('✅ AuthContext: 로컬 사용자 상태 복원 성공', user);
      
    } catch (error) {
      console.error('❌ AuthContext: 인증 체크 실패:', error);
      // 오류 발생 시 localStorage 청소
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_picture');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (provider: string, code?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // 데모 로그인 처리
      if (provider === 'demo') {
        return await demoLogin();
      }
      
      // OAuth 사용자 정보로 직접 로그인 (콜백에서 이미 처리됨)
      // provider가 이메일 주소인 경우 (콜백에서 호출)
      if (provider.includes('@')) {
        const userEmail = provider;
        
        // localStorage에서 사용자 정보 가져오기 (콜백에서 저장됨)
        const token = localStorage.getItem('auth_token');
        const userName = localStorage.getItem('user_name');
        const userPicture = localStorage.getItem('user_picture');
        
        if (token && userName) {
          const user = {
            user_id: userEmail,
            email: userEmail,
            name: userName,
            profile_image: userPicture,
            provider: 'oauth'
          };
          
          setUser(user);
          console.log('✅ AuthContext: OAuth 로그인 성공', user);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ AuthContext: 로그인 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (name = 'Demo User', email = 'demo@kpopranker.com'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // 클라이언트 사이드에서 데모 로그인 처리
      const demoUser = {
        user_id: email,
        email: email,
        name: name,
        provider: 'demo'
      };
      
      // 토큰과 사용자 정보 저장
      localStorage.setItem('auth_token', 'demo_token');
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', name);
      
      // 상태 업데이트
      setUser(demoUser);
      
      console.log('✅ AuthContext: 데모 로그인 성공', demoUser);
      return true;
    } catch (error) {
      console.error('❌ AuthContext: 데모 로그인 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // 백엔드 로그아웃 시도 (조용히 실행)
      const token = localStorage.getItem('auth_token');
      if (token && token !== 'demo_token') {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
        } catch (logoutError) {
          // 백엔드 로그아웃 실패해도 계속 진행
          console.log('⚠️ 백엔드 로그아웃 실패 (계속 진행)');
        }
      }
      
      console.log('🚪 로그아웃 처리 중...');
    } catch (error) {
      console.error('❌ 로그아웃 오류:', error);
    } finally {
      // 항상 로컬 데이터 청소
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_picture');
      setUser(null);
      setIsLoading(false);
      console.log('✅ 로그아웃 완료');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    demoLogin,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
