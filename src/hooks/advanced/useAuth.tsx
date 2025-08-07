// hooks/useAuth.ts
// 인증 상태 관리 훅

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  email: string;
  name: string;
  profile_image?: string;
  provider: string;
  search_count?: number;
  portfolio_count?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 사용자 정보 가져오기
  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      } else if (response.status === 401) {
        // 토큰 만료 또는 무효
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // 로그인
  const login = async (token: string) => {
    localStorage.setItem('token', token);
    await fetchUser(token);
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  // 토큰 갱신
  const refreshToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        await fetchUser(data.token);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  // 초기 로드 시 토큰 확인
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetchUser(token);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Kakao 로그인 콜백 처리
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        await login(token);
        // URL에서 토큰 파라미터 제거
        router.replace(router.pathname);
      }
    };

    if (router.pathname === '/auth/callback') {
      handleCallback();
    }
  }, [router]);

  // 토큰 자동 갱신 (6일마다)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 6 * 24 * 60 * 60 * 1000); // 6일

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증이 필요한 페이지를 위한 HOC
export const withAuth = (Component: React.ComponentType) => {
  return (props: any) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/');
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
};
