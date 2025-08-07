import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import AlbumImage from '@/components/AlbumImage';
import SmartSearchBox from '@/components/SmartSearchBox';
import { motion } from 'framer-motion';
import { FaMusic, FaTrophy, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface TrackData {
  artist: string;
  track: string;
  charts: {
    [chartName: string]: {
      rank: number | null;
      views: string;
      previous_rank?: number;
      album_image?: string;
    };
  };
}

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, track } = router.query;
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 트랙 데이터 가져오기
  const fetchTrackData = async () => {
    if (!artist || !track) return;

    setIsLoading(true);
    try {
      // 백엔드에서 트랙별 차트 데이터 가져오기
      const response = await fetch(`/api/search?artist=${encodeURIComponent(artist as string)}&track=${encodeURIComponent(track as string)}`);
      
      if (!response.ok) {
        throw new Error('트랙 정보를 불러올 수 없습니다');
      }

      const data = await response.json();
      
      // 응답 데이터를 TrackData 형식으로 변환
      const formattedData: TrackData = {
        artist: artist as string,
        track: track as string,
        charts: {}
      };

      // 차트별로 데이터 정리
      if (data.results && data.results.length > 0) {
        data.results.forEach((chartResult: any) => {
          if (chartResult.tracks && chartResult.tracks.length > 0) {
            const trackInfo = chartResult.tracks[0]; // 첫 번째 트랙 정보 사용
            formattedData.charts[chartResult.chart] = {
              rank: trackInfo.rank,
              views: trackInfo.views || '',
              album_image: trackInfo.album_image
            };
          }
        });
      }

      setTrackData(formattedData);
    } catch (error) {
      console.error('트랙 정보 로드 오류:', error);
      toast.error('트랙 정보를 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (artist && track) {
      fetchTrackData();
    }
  }, [artist, track]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">트랙 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!trackData || Object.keys(trackData.charts).length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">트랙 정보를 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // 첫 번째 차트의 앨범 이미지 사용
  const albumImage = Object.values(trackData.charts).find(chart => chart.album_image)?.album_image;

  return (
    <Layout>
      <Head>
        <title>{trackData.track} - {trackData.artist} | K-POP Ranker</title>
        <meta name="description" content={`${trackData.artist}의 ${trackData.track} 차트 순위`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* 앨범 이미지 */}
                <div className="flex-shrink-0">
                  <AlbumImage
                    src={albumImage}
                    alt={`${trackData.artist} - ${trackData.track}`}
                    size="xl"
                    artist={trackData.artist}
                    track={trackData.track}
                  />
                </div>
                
                {/* 트랙 정보 */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{trackData.track}</h1>
                  <button
                    onClick={() => router.push(`/artist/${encodeURIComponent(trackData.artist)}`)}
                    className="text-xl text-purple-600 hover:text-purple-700 mt-1 transition-colors"
                  >
                    {trackData.artist}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    {Object.keys(trackData.charts).length}개 차트 진입
                  </p>
                </div>
              </div>
              
              <SmartSearchBox />
            </div>
          </div>
        </div>

        {/* 차트별 순위 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaChartLine className="mr-2 text-purple-600" />
            차트별 순위
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(trackData.charts).map(([chartName, chartInfo]) => (
              <motion.div
                key={chartName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
                  <h3 className="text-white font-semibold">{chartName}</h3>
                </div>
                
                <div className="p-6">
                  <div className="text-center">
                    {chartInfo.rank ? (
                      <>
                        <div className="text-4xl font-bold text-purple-600 mb-2">
                          #{chartInfo.rank}
                        </div>
                        {chartInfo.views && (
                          <div className="text-sm text-gray-600">
                            {chartInfo.views}
                          </div>
                        )}
                        {chartInfo.previous_rank && (
                          <div className="mt-2 flex items-center justify-center">
                            {chartInfo.rank < chartInfo.previous_rank ? (
                              <span className="text-green-600 flex items-center">
                                <FaArrowUp className="mr-1" />
                                {chartInfo.previous_rank - chartInfo.rank}
                              </span>
                            ) : chartInfo.rank > chartInfo.previous_rank ? (
                              <span className="text-red-600 flex items-center">
                                <FaArrowDown className="mr-1" />
                                {chartInfo.rank - chartInfo.previous_rank}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400">
                        순위 없음
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 추가 정보 섹션 */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaTrophy className="mr-2 text-yellow-500" />
              차트 성과 요약
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(trackData.charts).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">진입 차트 수</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.min(...Object.values(trackData.charts).map(c => c.rank || 999))}
                </div>
                <div className="text-sm text-gray-600 mt-1">최고 순위</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(
                    Object.values(trackData.charts)
                      .filter(c => c.rank)
                      .reduce((sum, c) => sum + (c.rank || 0), 0) /
                    Object.values(trackData.charts).filter(c => c.rank).length
                  ) || '-'}
                </div>
                <div className="text-sm text-gray-600 mt-1">평균 순위</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
