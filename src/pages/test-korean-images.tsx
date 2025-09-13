import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TestCase {
  artist: string;
  track: string;
}

interface TestResult {
  success: boolean;
  loadTime?: number;
  error?: string;
  url?: string;
}

const KoreanImageTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [isRunning, setIsRunning] = useState(false);

  const testCases: TestCase[] = [
    { artist: '임영웅', track: '순간을 영원처럼' },
    { artist: '임영웅', track: '사랑은 늘 도망가' },
    { artist: '임영웅', track: '보금자리' },
    { artist: '임영웅', track: '무지개' },
    { artist: '이찬혁', track: '멸종위기사랑' },
    { artist: 'BLACKPINK', track: '뛰어(JUMP)' },
    { artist: 'IVE', track: 'XOXZ' },
    { artist: '박다혜', track: '시작의 아이 ❍' },
  ];

  const runTest = async (testCase: TestCase) => {
    const key = `${testCase.artist}-${testCase.track}`;
    const encodedArtist = encodeURIComponent(testCase.artist.replace(/\//g, ''));
    const encodedTrack = encodeURIComponent(testCase.track.replace(/\//g, ''));
    const imageUrl = `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;

    const startTime = Date.now();

    return new Promise<TestResult>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const loadTime = Date.now() - startTime;
        resolve({
          success: true,
          loadTime,
          url: imageUrl
        });
      };

      img.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to load image',
          url: imageUrl
        });
      };

      img.src = imageUrl;
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults(new Map());

    for (const testCase of testCases) {
      const result = await runTest(testCase);
      const key = `${testCase.artist}-${testCase.track}`;
      
      setTestResults(prev => {
        const newMap = new Map(prev);
        newMap.set(key, result);
        return newMap;
      });

      // 각 테스트 사이에 짧은 딜레이
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <Layout>
      <Head>
        <title>한국어 이미지 테스트 | KPOP Ranker</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-400">
            🎵 한국어 아티스트 이미지 API 테스트
          </h1>

          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded mr-4 disabled:opacity-50"
            >
              {isRunning ? '테스트 진행중...' : '모든 테스트 실행'}
            </button>
            <button
              onClick={() => setTestResults(new Map())}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              결과 초기화
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {testCases.map((testCase) => {
              const key = `${testCase.artist}-${testCase.track}`;
              const result = testResults.get(key);
              const encodedArtist = encodeURIComponent(testCase.artist.replace(/\//g, ''));
              const encodedTrack = encodeURIComponent(testCase.track.replace(/\//g, ''));
              const imageUrl = `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;

              return (
                <div key={key} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-400 mb-2">
                    {testCase.artist} - {testCase.track}
                  </h3>
                  
                  <div className="aspect-square bg-gray-700 rounded mb-2 flex items-center justify-center overflow-hidden">
                    {result ? (
                      result.success ? (
                        <img
                          src={imageUrl}
                          alt={`${testCase.artist} - ${testCase.track}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-red-500 text-center p-4">
                          ❌ 로드 실패
                        </div>
                      )
                    ) : (
                      <div className="text-yellow-400">
                        테스트 대기중...
                      </div>
                    )}
                  </div>

                  <div className="text-xs">
                    {result && (
                      <>
                        <div className={result.success ? 'text-green-400' : 'text-red-400'}>
                          {result.success ? `✅ 성공 (${result.loadTime}ms)` : '❌ 실패'}
                        </div>
                        <div className="text-gray-500 mt-1 break-all">
                          {result.url}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">테스트 요약</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">총 테스트:</span>
                <span className="ml-2 text-white font-bold">{testCases.length}개</span>
              </div>
              <div>
                <span className="text-gray-400">성공:</span>
                <span className="ml-2 text-green-400 font-bold">
                  {Array.from(testResults.values()).filter(r => r.success).length}개
                </span>
              </div>
              <div>
                <span className="text-gray-400">실패:</span>
                <span className="ml-2 text-red-400 font-bold">
                  {Array.from(testResults.values()).filter(r => !r.success).length}개
                </span>
              </div>
              <div>
                <span className="text-gray-400">평균 로드 시간:</span>
                <span className="ml-2 text-white font-bold">
                  {testResults.size > 0
                    ? Math.round(
                        Array.from(testResults.values())
                          .filter(r => r.success && r.loadTime)
                          .reduce((acc, r) => acc + (r.loadTime || 0), 0) /
                        Array.from(testResults.values()).filter(r => r.success).length
                      )
                    : 0}ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KoreanImageTest;