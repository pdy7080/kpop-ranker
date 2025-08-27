import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioAPI, trackAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaPlus, FaMusic, FaClock, FaChartLine, FaHeart } from 'react-icons/fa';
import axios from 'axios';

interface ChartPosition {
  rank: number;
  updated_at: string;
  views?: string;
}

interface TrackInfo {
  artist: string;
  title: string;
  chart_positions?: {
    [key: string]: ChartPosition;
  };
  image_url?: string;
  album?: string;
  release_date?: string;
  genre?: string;
}

const CHART_COLORS: { [key: string]: string } = {
  melon: '#00CD3C',
  genie: '#1E40AF',
  bugs: '#F97316',
  flo: '#AA40FC',
  spotify: '#1DB954',
  apple_music: '#FA243C',
  youtube: '#FF0000',
  lastfm: '#D51007'
};

const CHART_NAMES: { [key: string]: string } = {
  melon: 'Melon',
  genie: 'Genie',
  bugs: 'Bugs',
  flo: 'FLO',
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  youtube: 'YouTube',
  lastfm: 'Last.fm'
};

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, title } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToPortfolio, setIsAddingToPortfolio] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (artist && title) {
      fetchTrackData();
    }
  }, [artist, title]);

  const fetchTrackData = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출 - trackAPI 사용
      const response = await trackAPI.getDetails(String(artist), String(title));
      
      if (response && response.track) {
        setTrackInfo(response.track);
      } else if (response) {
        // response 자체가 트랙 정보일 수 있음
        setTrackInfo(response);
      } else {
        // API 응답이 없으면 기본 구조로
        setTrackInfo({
          artist: String(artist),
          title: String(title),
          chart_positions: {}
        });
      }
    } catch (error) {
      console.error('Track data fetch error:', error);
      // 에러 시에도 기본 정보는 표시
      setTrackInfo({
        artist: String(artist),
        title: String(title),
        chart_positions: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    if (!trackInfo) return;

    setIsAddingToPortfolio(true);
    try {
      const response = await portfolioAPI.add(trackInfo.artist, trackInfo.title);
      
      if (response.success) {
        toast.success('포트폴리오에 추가되었습니다!');
        setIsFavorite(true);
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
          <div className="text-white text-xl">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  if (!trackInfo) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
          <div className="text-white text-xl">트랙을 찾을 수 없습니다</div>
        </div>
      </Layout>
    );
  }

  const hasChartData = trackInfo.chart_positions && Object.keys(trackInfo.chart_positions).length > 0;

  return (
    <Layout>
      <Head>
        <title>{trackInfo.title} - {trackInfo.artist} | KPOP Ranker</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 메인 카드 */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* 앨범 이미지 */}
              <div className="md:w-1/3">
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg overflow-hidden">
                  <ImageWithFallback
                    artist={trackInfo.artist}
                    track={trackInfo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 트랙 정보 */}
              <div className="md:w-2/3 text-white">
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
                  <FaMusic />
                  <span>TRACK</span>
                </div>
                
                <h1 className="text-4xl font-bold mb-2">{trackInfo.title}</h1>
                <p className="text-2xl text-gray-300 mb-4">{trackInfo.artist}</p>
                
                <div className="space-y-2 text-gray-400 mb-6">
                  {trackInfo.album && (
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500">앨범:</span> K-POP Album
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <FaClock className="text-sm" />
                    <span className="text-gray-500">발매년도:</span> 2024
                  </p>
                  <p className="flex items-center gap-2">
                    <FaMusic className="text-sm" />
                    <span className="text-gray-500">장르:</span> K-POP
                  </p>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-3">
                  {/* 포트폴리오 추가 버튼 */}
                  <button
                    onClick={addToPortfolio}
                    disabled={isAddingToPortfolio || isFavorite}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                      ${isAuthenticated 
                        ? isFavorite 
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                      ${isAddingToPortfolio ? 'opacity-50 cursor-wait' : ''}
                    `}
                  >
                    {isFavorite ? (
                      <>
                        <FaHeart className="text-lg" />
                        포트폴리오에 추가됨
                      </>
                    ) : (
                      <>
                        <FaPlus className="text-lg" />
                        {isAddingToPortfolio ? '추가 중...' : '포트폴리오에 추가'}
                      </>
                    )}
                  </button>
                </div>

                {!isAuthenticated && (
                  <p className="text-gray-500 text-sm mt-2">로그인 후 포트폴리오에 추가할 수 있습니다</p>
                )}
              </div>
            </div>
          </div>

          {/* 차트 순위 섹션 */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-2 text-white mb-6">
              <FaChartLine />
              <h2 className="text-2xl font-bold">
                {hasChartData ? '현재 차트 순위' : '현재 차트 순위 없음'}
              </h2>
            </div>
            
            {hasChartData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(trackInfo.chart_positions!).map(([chartName, data]) => {
                  const displayName = CHART_NAMES[chartName] || chartName;
                  const color = CHART_COLORS[chartName] || '#6B7280';
                  
                  // YouTube는 조회수 표시
                  if (chartName === 'youtube' && data.views) {
                    return (
                      <div key={chartName} className="bg-gray-700/50 rounded-lg p-4 text-center border-2" style={{ borderColor: color }}>
                        <div className="text-gray-400 text-sm mb-1">{displayName}</div>
                        <div className="text-2xl font-bold" style={{ color }}>
                          {data.views}
                        </div>
                        <div className="text-xs text-gray-500">조회수</div>
                      </div>
                    );
                  }
                  
                  // 다른 차트는 순위 표시
                  return data.rank > 0 ? (
                    <div key={chartName} className="bg-gray-700/50 rounded-lg p-4 text-center border-2" style={{ borderColor: color }}>
                      <div className="text-gray-400 text-sm mb-1">{displayName}</div>
                      <div className="text-3xl font-bold" style={{ color }}>
                        #{data.rank}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                이 트랙은 현재 차트에 진입하지 않았습니다.
              </p>
            )}
          </div>

          {/* 순위 히스토리 섹션 */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mt-6">
            <div className="flex items-center gap-2 text-white mb-6">
              <FaClock />
              <h2 className="text-2xl font-bold">순위 히스토리</h2>
            </div>
            <p className="text-gray-500 text-center py-8">
              이 트랙의 차트 히스토리 데이터가 없습니다.
            </p>
          </div>

          {/* 관련 트랙 섹션 */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mt-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              더 많은 {trackInfo.artist} 트랙 보기
            </h2>
            <p className="text-gray-500 text-center py-8">
              아티스트의 다른 히트곡들을 확인해보세요
            </p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => router.push(`/artist/${encodeURIComponent(trackInfo.artist)}`)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
              >
                아티스트 페이지 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
