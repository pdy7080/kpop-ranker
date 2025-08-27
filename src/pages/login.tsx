import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import LoginModal from '@/components/LoginModal';

export default function LoginPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <Layout>
      <Head>
        <title>로그인 - KPOP Ranker</title>
      </Head>
      
      <LoginModal isOpen={true} onClose={handleClose} />
    </Layout>
  );
}
