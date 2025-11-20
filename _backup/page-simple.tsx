import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6">
            <span className="text-pink-400">KPOP</span>{' '}
            <span className="text-purple-400">RANKER</span>
          </h1>
          
          <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto">
            전 세계 8개 글로벌 차트를 실시간으로 추적하는 차세대 K-POP 모니터링 플랫폼
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <input
              type="text"
              placeholder="아티스트, 곡명을 검색하세요..."
              className="w-full px-6 py-4 bg-gray-900 text-white rounded-2xl border border-gray-700 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
              실시간 트렌딩
            </button>
            
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              포트폴리오
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-900 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">실시간 트렌딩</h3>
            <p className="text-gray-400">8개 글로벌 차트의 실시간 순위를 한눈에 확인하세요</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">통합 검색</h3>
            <p className="text-gray-400">한글/영어 자동 변환으로 원하는 곡을 쉽게 찾으세요</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">포트폴리오</h3>
            <p className="text-gray-400">개인화된 K-POP 취향 분석과 맞춤 추천을 받아보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
