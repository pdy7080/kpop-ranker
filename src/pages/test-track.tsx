import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

export default function TestTrackPage() {
  const { isAuthenticated, demoLogin, logout, user } = useAuth();
  const router = useRouter();

  const handleDemoLogin = async () => {
    const success = await demoLogin('Test User', 'test@kpopranker.com');
    if (success) {
      toast.success('로그인 성공!');
    } else {
      toast.error('로그인 실패');
    }
  };

  const goToTrackPage = () => {
    // 테스트용 트랙 페이지로 이동
    router.push('/track/BLACKPINK/뛰어');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">포트폴리오 버튼 테스트</h1>
            
            {/* 현재 상태 */}
            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
              <h2 className="font-bold mb-2">현재 상태:</h2>
              <p>로그인: {isAuthenticated ? '✅ 로그인됨' : '❌ 로그아웃됨'}</p>
              {user && (
                <div className="mt-2">
                  <p>사용자: {user.name}</p>
                  <p>이메일: {user.email}</p>
                </div>
              )}
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-4">
              {!isAuthenticated ? (
                <button
                  onClick={handleDemoLogin}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  테스트 로그인
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  로그아웃
                </button>
              )}

              <button
                onClick={goToTrackPage}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                트랙 상세 페이지로 이동 (BLACKPINK - 뛰어)
              </button>
            </div>

            {/* 안내 메시지 */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">테스트 방법:</h3>
              <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                <li>먼저 "테스트 로그인" 버튼을 클릭</li>
                <li>로그인 상태 확인</li>
                <li>"트랙 상세 페이지로 이동" 클릭</li>
                <li>포트폴리오 추가 버튼이 활성화되어 있는지 확인</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
