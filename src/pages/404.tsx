import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - 페이지를 찾을 수 없습니다 | KPOP FANfolio</title>
        <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <FaExclamationTriangle className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-purple-200 mb-4">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-purple-300 mb-8">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <FaHome className="w-5 h-5 mr-2" />
              홈으로 돌아가기
            </Link>
            
            <Link
              href="/search"
              className="block w-full bg-transparent border-2 border-purple-400 hover:bg-purple-400 text-purple-200 hover:text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <FaSearch className="w-5 h-5 mr-2" />
              검색하기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// 정적 생성 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;
