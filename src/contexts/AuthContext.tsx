import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

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
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getStatus();
      // safeApiCall로 래핑된 응답이므로 직접 접근
      if (response && 'authenticated' in response && response.authenticated) {
        const userResponse = await authApi.getUser();
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
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (provider: string, code?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // OAuth 로그인은 아직 구현되지 않았으므로 데모 로그인 사용
      const response = await authApi.demoLogin(provider);
      
      // 백엔드는 'token'을 반환하고, 'access_token'이 아님
      if (response && response.data) {
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        } else if (response.data.access_token) {
          localStorage.setItem('auth_token', response.data.access_token);
        }
        
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        if (response.data.user) {
          setUser(response.data.user);
        }
        return true;
      }
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
      const response = await authApi.demoLogin(name || 'Demo User');
      
      // 백엔드는 'token'을 반환하고, 'access_token'이 아님
      if (response && response.data) {
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        } else if (response.data.access_token) {
          localStorage.setItem('auth_token', response.data.access_token);
        }
        
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        console.log('✅ AuthContext: 데모 로그인 성공');
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext: 데모 로그인 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
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
