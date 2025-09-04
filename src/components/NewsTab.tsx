import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Newspaper, AlertCircle, Clock, Link2, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  originallink?: string;
  thumbnail?: string;
}

interface OptimizedNewsTabProps {
  artistName: string;
}

// 스켈레톤 로더 컴포넌트
const NewsItemSkeleton = memo(() => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
    <div className="flex gap-4">
      <div className="w-24 h-24 bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-700 rounded animate-pulse w-4/5" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
        <div className="flex items-center gap-2 mt-2">
          <div className="h-3 bg-gray-700 rounded animate-pulse w-20" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  </div>
));

const OptimizedNewsTab: React.FC<OptimizedNewsTabProps> = ({ artistName }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  // 뉴스 로딩 함수 - 최적화된 API 사용
  const fetchNews = useCallback(async () => {
    if (!artistName) return;
    
    try {
      setLoading(true);
      setError('');
      
      const startTime = Date.now();
      
      // 최적화된 빠른 뉴스 API 사용
      const url = `${API_URL}/api/artist/${encodeURIComponent(artistName)}/news/fast`;
      const response = await fetch(url);
      
      const loadTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error('뉴스를 불러올 수 없습니다');
      }
      
      const data = await response.json();
      
      setNews(data.news || []);
      setCached(data.cached || false);
      setResponseTime(data.response_time ? Math.round(data.response_time * 1000) : loadTime);
      
      // 성능 로깅
      console.log(`📰 News loaded: ${data.news?.length || 0} items in ${loadTime}ms (cached: ${data.cached})`);
      
    } catch (err) {
      console.error('뉴스 로딩 실패:', err);
      setError('뉴스를 불러오는 중 오류가 발생했습니다');
      setNews([]);
      setCached(false);
    } finally {
      setLoading(false);
    }
  }, [artistName]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 날짜 포맷팅 함수 - 메모이제이션
  const formatDate = useCallback((dateStr: string) => {
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
  }, []);

  // 텍스트 정리 함수 - 메모이제이션
  const cleanText = useCallback((text: string) => {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '')
               .replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&nbsp;/g, ' ');
  }, []);

  // 메모이제이션된 뉴스 아이템 렌더링
  const newsItems = useMemo(() => {
    return news.map((item, index) => (
      <motion.a
        key={`${item.link}-${index}`}
        href={item.originallink || item.link}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.5) }}
        className="block bg-gray-800/50 hover:bg-gray-800/70 rounded-lg overflow-hidden transition-all border border-gray-700 hover:border-purple-500 group"
      >
        <div className="p-4">
          <div className="flex gap-4">
            {/* 썸네일 영역 */}
            <div className="flex-shrink-0 w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={cleanText(item.title)}
                  className="w-full h-full object-cover"
                  loading={index < 5 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.parentElement?.querySelector('.news-placeholder');
                    if (placeholder) {
                      (placeholder as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className="news-placeholder w-full h-full flex items-center justify-center" style={{display: item.thumbnail ? 'none' : 'flex'}}>
                <Newspaper className="w-12 h-12 text-gray-600" />
              </div>
            </div>
            
            {/* 콘텐츠 영역 */}
            <div className="flex-1 min-w-0">
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
    ));
  }, [news, cleanText, formatDate]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-purple-400" />
            최신 뉴스
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Clock className="w-4 h-4 animate-spin" />
              로딩 중...
            </div>
          </h3>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <NewsItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchNews}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-12 text-center">
        <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-4">최신 뉴스가 없습니다</p>
        <button
          onClick={fetchNews}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          다시 검색
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-purple-400" />
          최신 뉴스
          {cached && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <Zap className="w-4 h-4" />
              캐시됨
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>총 {news.length}개</span>
          <span>⚡ {responseTime}ms</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {newsItems}
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
      
      {/* 성능 정보 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-500 bg-gray-900/50 p-2 rounded">
          응답시간: {responseTime}ms | 캐시: {cached ? '적용' : '미적용'} | 최적화: 활성
        </div>
      )}
    </div>
  );
};

export default OptimizedNewsTab;