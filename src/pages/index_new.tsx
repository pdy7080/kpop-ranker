import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api_v12';
import ChartUpdateStatus from '@/components/ChartUpdateStatus';
import UnifiedSearch from '@/components/UnifiedSearch';
import { FaFire, FaChartLine, FaGlobeAsia, FaPlay, FaTrophy, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';

interface TrendingTrack {
  id: number;
  rank: number;
  artist: string;
  title: string;
  album_image?: string;
  trending_score?: number;
  rank_change?: number;
  charts?: {
    melon?: number;
    genie?: number;
    bugs?: number;
    spotify?: number;
    youtube?: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [trendingData, setTrendingData] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hot' | 'rising' | 'global'>('hot');

  useEffect(() => {
    fetchTrendingData();
  }, [activeTab]);

  const fetchTrendingData = async () => {
    setIsLoading(true);
    try {
      const response = await api.getTrending(20);
      
      if (response?.tracks) {
        const formattedData = response.tracks.map((track: any, idx: number) => ({
          id: track.id || idx,
          rank: idx + 1,
          artist: track.artist,
          title: track.title || track.track,
          album_image: track.album_image,
          trending_score: track.trending_score || Math.floor(Math.random() * 100),
          rank_change: track.rank_change || 0,
          charts: {
            melon: track.melon_rank,
            genie: track.genie_rank,
            bugs: track.bugs_rank,
            spotify: track.spotify_rank,
            youtube: track.youtube_rank
          }
        }));
        
        setTrendingData(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'hot', label: '🔥 HOT 100', icon: FaFire },
    { id: 'rising', label: '📈 급상승', icon: FaChartLine },
    { id: 'global', label: '🌏 글로벌', icon: FaGlobeAsia }
  ];

  return (
    <Layout>
      <Head>
        <title>KPOP Ranker - 실시간 K-POP 차트 통합 플랫폼</title>
        <meta name="description" content="실시간 K-POP 차트 통합 모니터링 - Melon, Genie, Bugs, Spotify, YouTube, Billboard" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse" />
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient"
              initial={{ y: -50, opacity: 