import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userInfo = localStorage.getItem('user_info');
      
      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      // 먼저 localStorage에 저장된 user_info 사용
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          setUser({
            user_id: parsedUser.email || 'user',
            email: parsedUser.email,
            name: parsedUser.name,
            profile_image: parsedUser.picture || parsedUser.profile_image,
            provider: parsedUser.provider || 'oauth'
          });
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse user info:', e);
        }
      }

      // user_info가 없으면 API 호출
      const response = await authAPI.getStatus();
      // safeApiCall로 래핑된 응답이므로 직접 접근
      if (response && 'authenticated' in response && response.authenticated) {
        const userResponse = await authAPI.getUser();
        if (userResponse && 'user' in userResponse && userResponse.user) {
          setUser(userResponse.user);
        } else {
          // 백엔드에 /api/auth/user API가 없는 경우 임시 사용자 정보
          setUser({
            user_id: 'demo_user',
            email: 'demo@kpopranker.com',
            name: 'Demo User',
            provider: 'demo'
          });
        }
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
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
      
      // OAuth 로그인 처리는 실제 구현 시 추가
      console.warn('OAuth 로그인은 아직 구현되지 않았습니다.');
      return false;
    } catch (error) {
      console.error('Login failed:', error);
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
      localStorage.setItem('user_info', JSON.stringify(demoUser));
      localStorage.setItem('user_email', email);
      
      // 상태 업데이트
      setUser(demoUser);
      
      console.log('✅ AuthContext: 데모 로그인 성공', demoUser);
      return true;
    } catch (error) {
      console.error('AuthContext: 데모 로그인 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      setUser(null);
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
