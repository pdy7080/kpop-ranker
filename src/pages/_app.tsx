import '@/styles/globals.css';
import '@/styles/kpop-theme.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext';

// 개발 환경에서만 디버그 툴 로드
if (process.env.NODE_ENV === 'development') {
  import('@/utils/authDebug');
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      // 다크모드 초기화
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <TranslationProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </AuthProvider>
    </TranslationProvider>
  );
}
