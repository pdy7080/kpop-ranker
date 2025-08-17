// components/NewsSection.tsx
// 아티스트 관련 뉴스 표시 컴포넌트

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pub_date_iso: string;
  thumbnail?: string;
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface NewsSectionProps {
  artist: string;
  track?: string;
  albumImage?: string; // 앨범 이미지 추가
}

const NewsSection: React.FC<NewsSectionProps> = ({ artist, track, albumImage }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentimentStats, setSentimentStats] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });

  useEffect(() => {
    fetchNews();
  }, [artist, track]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ artist });
      if (track) params.append('track', track);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/news/artist?${params}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.articles || []);
        setSentimentStats(data.sentiment_stats || {
          positive: 0,
          neutral: 0,
          negative: 0
        });
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffHours < 48) return '어제';
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">관련 뉴스</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">관련 뉴스</h3>
        <p className="text-gray-500">최근 뉴스가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* 앨범 이미지 표시 */}
          {albumImage && (
            <div className="flex-shrink-0">
              <Image
                src={albumImage}
                alt={`${artist} - ${track || 'News'}`}
                width={60}
                height={60}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold">관련 뉴스</h3>
            <p className="text-sm text-gray-600">{artist} {track && `- ${track}`}</p>
          </div>
        </div>
        
        {/* 감성 분석 통계 */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center">
            <span className="mr-1">😊</span>
            <span className="text-green-600">{sentimentStats.positive}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">😐</span>
            <span className="text-gray-600">{sentimentStats.neutral}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">😞</span>
            <span className="text-red-600">{sentimentStats.negative}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {news.map((article, index) => (
          <motion.a
            key={index}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-base font-semibold text-gray-800 flex-1 line-clamp-2">
                {article.title}
              </h4>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs flex items-center ${getSentimentColor(article.sentiment)}`}>
                {getSentimentIcon(article.sentiment)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {article.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(article.pub_date_iso)}</span>
              <span className="truncate max-w-[150px]">
                {new URL(article.link).hostname.replace('www.', '')}
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <motion.button
        className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.open(`https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(artist + ' ' + (track || ''))}`, '_blank')}
      >
        더 많은 뉴스 보기 →
      </motion.button>
    </div>
  );
};

export default NewsSection;
