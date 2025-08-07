// useRouter를 안전하게 사용하는 Hook
import { useRouter as useNextRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function useRouter() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 사이드에서는 mock router 반환
  if (!mounted) {
    return {
      pathname: '/',
      route: '/',
      query: {},
      asPath: '/',
      push: () => Promise.resolve(true),
      replace: () => Promise.resolve(true),
      reload: () => {},
      back: () => {},
      prefetch: () => Promise.resolve(),
      beforePopState: () => {},
      events: {
        on: () => {},
        off: () => {},
        emit: () => {},
      },
      isFallback: false,
      isReady: false,
      isPreview: false,
    };
  }

  // 클라이언트 사이드에서는 실제 router 반환
  return useNextRouter();
}
