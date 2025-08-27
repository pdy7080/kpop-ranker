import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { artistAPI } from '@/lib/api';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion } from 'framer-motion';
import { FaMusic, FaChartLine } from 'react-icons/fa';

export default function ArtistDetailPage() {
  const router = useRouter();
  const { name } = router.query;
  const [artistData, setArtistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (name && typeof name === 'string') {
      fetchArtistData(name);
    }
  }, [name]);

  const fetchArtistData = async (artistName: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await artistAPI.getDetails(artistName);
      setArtistData(data);
    } catch (err) {
      console.error('Failed to fetch artist data:', err);
      setError('아티스트 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">로딩 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !artistData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">오류 발생</h2>
            <p className="text-white/60 mb-8">{error || '데이터를 불러올 수 없습니다.'}</p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{artistData.artist} - KPOP Ranker</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-black py-8">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {artistData.artist}
            </h1>
            <div className="flex gap-4 text-white/60">
              <span className="flex items-center gap-2">
                <FaMusic /> {artistData.tracks?.length || 0} 트랙
              </span>
              <span className="flex items-center gap-2">
                <FaChartLine /> {artistData.active_charts || 0} 차트
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artistData.tracks?.map((track: any, index: number) => (
              <motion.div
                key={`${track.track}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => router.push(`/track/${encodeURIComponent(artistData.artist)}/${encodeURIComponent(track.track)}`)}
              >
                <div className="aspect-square relative">
                  <ImageWithFallback
                    artist={artistData.artist}
                    track={track.track}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white mb-2">{track.track}</h3>
                  <div className="flex flex-wrap gap-2">
                    {track.charts?.map((chart: string) => (
                      <span key={chart} className="px-2 py-1 bg-purple-600/50 rounded text-xs">
                        {chart}
                      </span>
                    ))}
                  </div>
                  {track.best_rank && (
                    <p className="mt-2 text-sm text-white/60">
                      최고 순위: #{track.best_rank}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {(!artistData.tracks || artistData.tracks.length === 0) && (
            <div className="text-center py-16">
              <p className="text-white/60">트랙 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}