import React from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import SimplePortfolio from '@/components/SimplePortfolio';

export default function PortfolioPage() {
  return (
    <>
      <Head>
        <title>내 포트폴리오 - KPOP Ranker</title>
        <meta name="description" content="좋아하는 K-POP 트랙을 관리하고 차트 순위를 추적하세요" />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <SimplePortfolio />
        </div>
      </Layout>
    </>
  );
}
