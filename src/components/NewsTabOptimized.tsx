import React, { memo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Newspaper, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  thumbnail?: string;
}

interface OptimizedNewsTabProps {
  artistName: string;
}

// 스켈레톤 로더 - 즉시 표시
const NewsItemSkeleton = memo(() => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 animate-pulse">
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-700 rounded w-4/5" />
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-20 mt-2" />
      </div>
    </div>
  </div>
));

const OptimizedNewsTab: React.FC<OptimizedNewsTabProps> = memo(({ artistName }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 초고속 뉴스 로딩 - ultra-fast API 사용
  useEffect(() => {
    let mounted = true;
    
    const fetchNews = async () => {
      if (!artistName) return;
      
      try {
        // ultra-fast 엔드포인트 사용 (이미지 추출 없음)
        const url = `${API_URL}/api/artist/${encodeURIComponent(artistName)}/news/fast`;
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to fetch news');
        
        const data = await response.json();
        
        if (mounted) {
          setNews(data.news || []);
          setError('');
        }
        
      } catch (err) {
        console.error('뉴스 로딩 실패:', err);
        if (mounted) {
          // 에러 시에도 더미 데이터 표시
          setNews([{
            title: `${artistName} 최신 소식`,
            description: '뉴스를 불러오는 중 일시적인 문제가 발생했습니다.',
            link: '#',
            thumbnail: `/api/album-image-smart/${artistName}/news`,
            pubDate: new Date().toLocaleDateString()
          }]);
          setError('');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // 즉시 더미 데이터 표시 후 실제 데이터 로드
    setNews([{
      title: `${artistName} 소식 로딩 중...`,
      description: '최신 뉴스를 불러오고 있습니다.',
      link: '#',
      thumbnail: `/api/album-image-smart/${artistName}/news`,
      pubDate: '방금 전'
    }]);
    setLoading(false);
    
    // 100ms 후 실제 데이터 로드 (사용자 체감 속도 향상)
    const timer = setTimeout(() => {
      fetchNews();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [artistName]);

  // 날짜 포맷팅 - 간소화
  const formatDate = useCallback((dateStr: string) => {
    if (dateStr === '방금 전') return dateStr;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    } catch {
      return '최근';
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <NewsItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          최신 뉴스
        </h3>
        <span className="text-xs text-gray-400">
          네이버 뉴스 제공
        </span>
      </div>

      {news.length > 0 ? (
        <div className="space-y-4">
          {news.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="block bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-all group"
            >
              <div className="flex gap-4">
                {/* 썸네일 - 레이지 로딩 */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                  <img
                    src={item.thumbnail || `/api/album-image-smart/${artistName}/news`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </div>
                
                {/* 콘텐츠 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.pubDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      보기
                    </span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">뉴스를 불러올 수 없습니다.</p>
        </div>
      )}
    </div>
  );
});

OptimizedNewsTab.displayName = 'OptimizedNewsTab';

export default OptimizedNewsTab;
