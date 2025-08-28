import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ImageWithFallback from '@/components/ImageWithFallback';
import ChartRankDisplay from '@/components/ChartRankDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { artistAPI } from '@/lib/api';
import NewsTab from '@/components/NewsTab';
import GoodsTab from '@/components/GoodsTab';
import { 
  Music, TrendingUp, Award, Clock, BarChart3, 
  Globe, Play, Star, Activity, Disc, Mic,
  Calendar, Hash, Users, Zap, Trophy,
  ArrowUp, ArrowDown, Sparkles, Target,
  ChevronUp, ChevronDown, Eye, Heart, Flame,
  Newspaper, ShoppingBag, Crown
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Track {
  title?: string;
  track?: string;
  unified_track?: string;
  charts?: Record<string, number | string>;
  best_rank?: number;
  peak_position?: number;
  album_image?: string;
  image_url?: string;
  local_image?: string;
  trend_score?: number;
  created_at?: string;
  days_on_chart?: number;
  top10_count?: number;
  trend?: 'up' | 'down' | 'stable' | 'new';
  change?: string;
  is_rising?: boolean;
  is_new?: boolean;
  views?: string;
}

interface ArtistData {
  artist?: string;
  tracks?: Track[];
  stats?: {
    total_tracks?: number;
    active_tracks?: number;
    top10_hits?: number;
    best_peak?: number;
    success_rate?: number;
    trending_up?: number;
    trending_down?: number;
    longest_charting?: number;
    most_successful_track?: string;
    newest_entry?: string;
    chart_diversity?: number;
  };
  ai_data?: any;
}

// 조회수 포맷팅 함수
const formatViews = (views: string | number): string => {
  if (!views) return '';
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, '')) : views;
  if (isNaN(num)) return '';
  
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
};

// 차트 로고 정보
const getChartInfo = (chartName: string) => {
  const chartConfig: Record<string, { icon: string; name: string; bgColor: string }> = {
    melon: { icon: '🍈', name: 'Melon', bgColor: 'bg-green-600' },
    genie: { icon: '🧞', name: 'Genie', bgColor: 'bg-blue-600' },
    bugs: { icon: '🐛', name: 'Bugs', bgColor: 'bg-orange-500' },
    flo: { icon: '🌊', name: 'FLO', bgColor: 'bg-purple-500' },
    spotify: { icon: '🎧', name: 'Spotify', bgColor: 'bg-green-500' },
    apple_music: { icon: '🍎', name: 'Apple Music', bgColor: 'bg-gray-800' },
    youtube: { icon: '▶️', name: 'YouTube', bgColor: 'bg-red-500' },
    lastfm: { icon: '🎼', name: 'Last.fm', bgColor: 'bg-red-600' }
  };
  
  return chartConfig[chartName.toLowerCase()] || { 
    icon: '🎵', 
    name: chartName, 
    bgColor: 'bg-gray-600' 
  };
};

// AI 인사이트 - 글 형식
const AIInsightsSection = ({ artistName, stats }: { artistName: string; stats: any }) => {
  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        AI 분석가 리포트
      </h3>
      
      <div className="text-gray-300 leading-relaxed space-y-4">
        <p className="text-base">
          현재 <strong className="text-purple-400">{artistName}</strong>는 K-POP 시장에서 
          <strong className="text-yellow-400"> {stats.total_tracks || 0}개의 트랙</strong>을 통해 
          <strong className="text-blue-400"> {stats.active_charts || 0}개 차트</strong>에서 활동하고 있습니다.
        </p>
        
        <p className="text-base">
          최고 순위 <strong className="text-yellow-400">#{stats.best_peak || '-'}</strong>를 기록하며, 
          TOP 10 진입 성공률은 <strong className="text-green-400">{stats.success_rate || 0}%</strong>로 
          {(stats.success_rate || 0) > 70 ? '매우 우수한' : (stats.success_rate || 0) > 40 ? '양호한' : '안정적인'} 
          성과를 보이고 있습니다.
        </p>
        
        <p className="text-base">
          최장 차트인 기록인 <strong className="text-cyan-400">{stats.longest_charting || 0}일</strong>을 달성하여 
          지속적인 인기를 입증하고 있으며, 
          {(stats.top10_hits || 0) > 3 ? '추세는 상승세' : (stats.top10_hits || 0) > 1 ? '안정적 성장' : '성장 잠재 보유'}를 보여주고 있습니다.
        </p>
        
        <p className="text-base">
          차트 다양성 측면에서는 국내 주요 차트에서의 안정적 성과와 
          함께 글로벌 플랫폼 확장 가능성을 보여주며, 
          특히 <strong className="text-pink-400">{stats.most_successful_track || '대표곡'}</strong>을 통해 
          탄탄한 팬덤 기반을 구축하고 있습니다.
        </p>
        
        <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
          <p className="text-sm text-purple-200">
            💡 <strong>AI 분석 요약:</strong> {artistName}은(는) 
            {(stats.top10_hits || 0) > 2 ? '상위권 진입 능력이 입증된' : '성장 잠재력이 높은'} 
            아티스트로, 지속적인 차트 활동을 통해 
            {(stats.success_rate || 0) > 50 ? '안정적인 시장 지위를 확보' : '시장 진입을 확대'}하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
