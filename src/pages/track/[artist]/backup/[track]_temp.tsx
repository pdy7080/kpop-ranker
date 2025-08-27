import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaPlus, FaHeart } from 'react-icons/fa';

interface ChartData {
  chart: string;
  rank: number;
  views: string;
}

interface TrackData {
  artist: string;
  track: string;
  charts: ChartData[];
}

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, track } = router.query;
  const { isAuthenticated } = useAuth();
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToPortfolio, setIsAddingToPortfolio] = useState(false);

  const addToPortfolio = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!trackData) return;

    setIsAddingToPortfolio(true);
    try {
      const response = await portfolioAPI.add(trackData.artist, trackData.track);
      
      if (response.success) {
        toast.success('포트폴리오에 추가되었습니다!');
      } else {
        toast.error(response.error || '추가에 실패했습니다');
      }
    } catch (error) {
      console.error('Portfolio add error:', error);
      toast.error('포트폴리오 추가 중 오류가 발생했습니다');
    } finally {
      setIsAddingToPortfolio(false);
    }
  };

  useEffect(() => {
    if (artist && track) {
      // 임시 데이터로 테스트
      setTrackData({
        artist: artist as string,
        track: track as string,
        charts: [
          { chart: 'Melon', rank: 3, views: '1,234,567' },
          { chart: 'Genie', rank: 2, views: '987,654' },
          { chart: 'Bugs', rank: 5, views: '543,210' }
        ]
      });
      setLoading(false);
    }
  }, [artist, track]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (!trackData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">트랙을 찾을 수 없습니다</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{trackData.track} - {trackData.artist} | KPOP Ranker</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* 헤더 섹션 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold mb-2">{trackData.track}</h1>
            <p className="text-xl text-gray-600 mb-6">{trackData.artist}</p>
            
            {/* 포트폴리오 추가 버튼 - 여기가 핵심! */}
            <button
              onClick={addToPortfolio}
              disabled={isAddingToPortfolio || !isAuthenticated}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-semibold"
            >
              <FaPlus className="w-5 h-5" />
              {isAddingToPortfolio ? '추가중...' : '포트폴리오 추가'}
            </button>

            {/* 인증 상태 디버그 */}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm">
                로그인 상태: {isAuthenticated ? '✅ 로그인됨' : '❌ 로그아웃됨'}
              </p>
              <p className="text-sm">
                버튼 활성화: {!isAddingToPortfolio && isAuthenticated ? '✅ 활성화' : '❌ 비활성화'}
              </p>
            </div>
          </div>

          {/* 차트 정보 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">차트 순위</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trackData.charts.map((chart, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{chart.chart}</h3>
                  <p className="text-2xl font-bold text-purple-600">#{chart.rank}</p>
                  <p className="text-sm text-gray-500">{chart.views}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
