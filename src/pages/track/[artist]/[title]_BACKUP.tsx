import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion } from 'framer-motion';
import { FaChartLine, FaClock, FaMusic, FaTrophy, FaCalendarAlt, FaCompactDisc } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TrackDetailPage() {
  const router = useRouter();
  const { artist, title } = router.query;
  const [trackData, setTrackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artist && title && typeof artist === 'string' && typeof title === 'string') {
      fetchTrackData(artist, title);
    }
  }, [artist, title]);

  const fetchTrackData = async (artistName: string, trackTitle: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_URL}/api/track/${encodeURIComponent(artistName)}/${encodeURIComponent(trackTitle)}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🎵 트랙 데이터:', data);
      setTrackData(data);
    } catch (err) {
      console.error('Failed to fetch track data:', err);
      setError('트랙 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">트랙 정보 로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !trackData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
          <div className="text-center">
            <FaMusic className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error || '트랙을 찾을 수 없습니다.'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const artistName = trackData.artist || (typeof artist === 'string' ? decodeURIComponent(artist) : 'Unknown Artist');
  const trackTitle = trackData.title || trackData.track || trackData.name || (typeof title === 'string' ? decodeURIComponent(title) : 'Unknown Track');
  // charts 배열 또는 chart_positions 객체 처리
  const charts = trackData.charts || [];
  const chartPositions = trackData.chart_positions || {};
  
  // charts 배열을 chartPositions 객체로 변환
  if (charts.length > 0 && Object.keys(chartPositions).length === 0) {
    charts.forEach((chart: any) => {
      const chartName = chart.chart ? chart.chart.toLowerCase() : 'unknown';
      chartPositions[chartName] = {
        rank: chart.rank,
        updated: chart.last_updated || chart.updated
      };
    });
  }
  const hasChartData = Object.keys(chartPositions).length > 0;
  const hasHistory = trackData.history && Array.isArray(trackData.history) && trackData.history.length > 0;
  
  return (
    <Layout>
      <Head>
        <title>{artistName} - {trackTitle} - KPOP Ranker</title>
        <meta name="description" content={`${artistName}의 ${trackTitle} 차트 순위와 상세 정보를 확인하세요.`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Album Image */}
              <div className="w-64 h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
                <ImageWithFallback
                  artist={artistName}
                  track={trackTitle}
                  imageUrl={trackData.image_url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Track Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <FaMusic className="text-purple-400 text-xl" />
                  <span className="text-gray-400 text-sm uppercase tracking-wide font-medium">TRACK</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">{trackTitle}</h1>
                <p className="text-2xl lg:text-3xl text-purple-300 mb-6 font-medium">{artistName}</p>
                
                {/* Basic Track Info */}
                <div className="space-y-3 mb-6">
                  {trackData.album && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <FaCompactDisc className="text-gray-400" />
                      <span><strong>앨범:</strong> {trackData.album}</span>
                    </div>
                  )}
                  
                  {trackData.release_date && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <FaCalendarAlt className="text-gray-400" />
                      <span><strong>발매년도:</strong> {trackData.release_date}</span>
                    </div>
                  )}
                  
                  {trackData.genre && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <FaMusic className="text-gray-400" />
                      <span><strong>장르:</strong> {trackData.genre}</span>
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                {trackData.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {trackData.stats.best_rank && (
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-3 rounded-xl border border-yellow-500/30">
                        <div className="flex items-center gap-2 text-yellow-400 font-medium">
                          <FaTrophy />
                          <span>최고 순위: {trackData.stats.best_rank}위</span>
                        </div>
                      </div>
                    )}
                    
                    {trackData.stats.chart_count && (
                      <div className="bg-blue-500/20 px-4 py-3 rounded-xl border border-blue-500/30">
                        <div className="flex items-center gap-2 text-blue-400 font-medium">
                          <FaChartLine />
                          <span>진출 차트: {trackData.stats.chart_count}개</span>
                        </div>
                      </div>
                    )}
                    
                    {trackData.stats.days_on_chart && (
                      <div className="bg-purple-500/20 px-4 py-3 rounded-xl border border-purple-500/30">
                        <div className="flex items-center gap-2 text-purple-400 font-medium">
                          <FaClock />
                          <span>차트 기간: {trackData.stats.days_on_chart}일</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Chart Positions */}
          {hasChartData ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <FaChartLine className="text-green-400" />
                현재 차트 순위
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(chartPositions).map(([chart, data]: [string, any]) => (
                  <motion.div
                    key={chart}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6
                             hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-white mb-3 capitalize">
                        {chart.toUpperCase()}
                      </h3>
                      
                      <div className="text-4xl font-bold text-purple-400 mb-3">
                        #{data.rank || data}
                      </div>
                      
                      {data.updated && (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                          <FaClock />
                          <span>{data.updated}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center">
                <FaChartLine className="text-4xl text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">현재 차트 순위 없음</h3>
                <p className="text-gray-400">이 트랙은 현재 차트에 진입하지 않았습니다.</p>
              </div>
            </motion.div>
          )}

          {/* History */}
          {hasHistory ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <FaClock className="text-blue-400" />
                순위 히스토리
              </h2>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="space-y-3">
                  {trackData.history.slice(0, 15).map((entry: any, index: number) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm min-w-[80px]">{entry.date || entry.updated}</span>
                        <span className="text-white capitalize font-medium">{entry.chart}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-bold text-lg">
                          #{entry.rank || entry.position}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center">
                <FaClock className="text-4xl text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">순위 히스토리 없음</h3>
                <p className="text-gray-400">이 트랙의 차트 히스토리 데이터가 없습니다.</p>
              </div>
            </motion.div>
          )}

          {/* 관련 트랙 제안 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-3">더 많은 {artistName} 트랙 보기</h3>
              <p className="text-gray-400 mb-6">아티스트의 다른 히트곡들을 확인해보세요</p>
              <button
                onClick={() => router.push(`/artist/${encodeURIComponent(artistName)}`)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl
                         hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
              >
                {artistName} 아티스트 페이지로
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
