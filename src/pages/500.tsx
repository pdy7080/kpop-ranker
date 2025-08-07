import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaHome, FaSearch, FaExclamationCircle } from 'react-icons/fa';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - 서버 오류 | KPOP FANfolio</title>
        <meta name="description" content="서버에서 오류가 발생했습니다." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <FaExclamationCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
            <h1 className="text-6xl font-bold text-white mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-pink-200 mb-4">
              서버 오류
            </h2>
            <p className="text-pink-300 mb-8">
              서버에서 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <FaHome className="w-5 h-5 mr-2" />
              홈으로 돌아가기
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="block w-full bg-transparent border-2 border-red-400 hover:bg-red-400 text-red-200 hover:text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// 정적 생성 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;
