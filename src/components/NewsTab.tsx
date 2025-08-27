import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Newspaper, AlertCircle, Clock, Link2 } from 'lucide-react';
import Image from 'next/image';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  originallink?: string;
  thumbnail?: string;
}

interface NewsTabProps {
  artistName: string;
}

const NewsTab: React.FC<NewsTabProps> = ({ artistName }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, [artistName]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = `${API_URL}/api/artist/${encodeURIComponent(artistName)}/news`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('뉴스를 불러올 수 없습니다');
      }
      
      const data = await response.json();
      setNews(data.news || []);
    } catch (err) {
      console.error('뉴스 로딩 실패:', err);
      setError('뉴스를 불러오는 중 오류가 발생했습니다');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      
      if (diffHours < 1) return '방금 전';
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffHours < 48) return '어제';
      if (diffHours < 168) return `${Math.floor(diffHours / 24)}일 전`;
      
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const cleanText = (text: string) => {
    if (!text) return '';
    // HTML 태그 및 특수문자 제거
    return text.replace(/<[^>]*>/g, '')
               .replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&nbsp;/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-12 text-center">
        <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">최신 뉴스가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-purple-400" />
          최신 뉴스
        </h3>
        <span className="text-sm text-gray-400">총 {news.length}개</span>
      </div>
      
      <div className="space-y-4">
        {news.map((item, index) => (
          <motion.a
            key={index}
            href={item.originallink || item.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="block bg-gray-800/50 hover:bg-gray-800/70 rounded-lg overflow-hidden transition-all border border-gray-700 hover:border-purple-500 group"
          >
            <div className="p-4">
              <div className="flex gap-4">
                {/* 썸네일 영역 - 추출된 이미지 또는 플레이스홀더 */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={cleanText(item.title)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // 이미지 로드 실패시 플레이스홀더로 교체
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
                
                {/* 콘텐츠 영역 */}
                <div className="flex-1">
                  <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
                    {cleanText(item.title)}
                  </h4>
                  
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {cleanText(item.description)}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.pubDate)}
                      </span>
                      {item.originallink && (
                        <span className="flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {new URL(item.originallink).hostname.replace('www.', '')}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
      
      {/* 네이버 뉴스 더보기 */}
      <motion.button
        className="mt-6 w-full py-3 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-colors border border-purple-800 hover:border-purple-600"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.open(`https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(artistName + ' K-POP')}`, '_blank')}
      >
        네이버에서 더 많은 뉴스 보기 →
      </motion.button>
    </div>
  );
};

export default NewsTab;
