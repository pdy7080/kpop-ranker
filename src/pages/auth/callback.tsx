import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import type { NextRouter } from 'next/router';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [router, setRouter] = useState<NextRouter | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Router를 동적으로 로드
  useEffect(() => {
    setMounted(true);
    import('next/router').then(({ useRouter }) => {
      const routerInstance = useRouter();
      setRouter(routerInstance);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !router || !router.isReady || isProcessing) return;

    const handleCallback = async () => {
      setIsProcessing(true);
      const { token, error } = router.query;

      if (error) {
        toast.error('로그인 중 오류가 발생했습니다');
        router.push('/');
        return;
      }

      if (token && typeof token === 'string') {
        try {
          // 토큰을 로컬 스토리지에 저장
          localStorage.setItem('auth_token', token);
          toast.success('로그인되었습니다!');
          
          // 이전 페이지로 돌아가기 또는 포트폴리오로 이동
          const returnUrl = sessionStorage.getItem('authReturnUrl') || '/portfolio';
          sessionStorage.removeItem('authReturnUrl');
          router.push(returnUrl);
        } catch (error) {
          toast.error('로그인 처리 중 오류가 발생했습니다');
          router.push('/');
        }
      } else {
        router.push('/');
      }
    };

    handleCallback();
  }, [mounted, router, isProcessing]);

  // 마운트되지 않았으면 로딩 표시
  if (!mounted) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">로그인 처리 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>로그인 처리 중... - KPOP FANfolio</title>
      </Head>
      
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">로그인 처리 중...</p>
            <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요...</p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AuthCallback;

// 정적 생성 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;
