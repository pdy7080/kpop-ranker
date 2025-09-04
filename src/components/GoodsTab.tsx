import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Package, AlertCircle, Store, Tag, Zap, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface GoodsItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productType: string;
  brand?: string;
}

interface OptimizedGoodsTabProps {
  artistName: string;
}

// 스켈레톤 로더
const GoodsItemSkeleton = memo(() => (
  <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
    <div className="aspect-square bg-gray-700 animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-700 rounded animate-pulse" />
      <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
      <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
    </div>
  </div>
));

const OptimizedGoodsTab: React.FC<OptimizedGoodsTabProps> = ({ artistName }) => {
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  // 굿즈 로딩 함수 - 최적화된 API 사용
  const fetchGoods = useCallback(async () => {
    if (!artistName) return;
    
    try {
      setLoading(true);
      setError('');
      
      const startTime = Date.now();
      
      // 최적화된 빠른 굿즈 API 사용
      const url = `${API_URL}/api/artist/${encodeURIComponent(artistName)}/goods/fast`;
      const response = await fetch(url);
      
      const loadTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error('굿즈를 불러올 수 없습니다');
      }
      
      const data = await response.json();
      
      setGoods(data.goods || []);
      setCached(data.cached || false);
      setResponseTime(data.response_time ? Math.round(data.response_time * 1000) : loadTime);
      
      // 성능 로깅
      console.log(`🛍️ Goods loaded: ${data.goods?.length || 0} items in ${loadTime}ms (cached: ${data.cached})`);
      
    } catch (err) {
      console.error('굿즈 로딩 실패:', err);
      setError('굿즈를 불러오는 중 오류가 발생했습니다');
      setGoods([]);
      setCached(false);
    } finally {
      setLoading(false);
    }
  }, [artistName]);

  useEffect(() => {
    fetchGoods();
  }, [fetchGoods]);

  // 가격 포맷팅 - 메모이제이션
  const formatPrice = useCallback((price: string) => {
    if (!price) return '0';
    try {
      return parseInt(price).toLocaleString('ko-KR');
    } catch {
      return price;
    }
  }, []);

  // 제목 정리 - 메모이제이션
  const cleanTitle = useCallback((title: string) => {
    if (!title) return '';
    return title.replace(/<[^>]*>/g, '')
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&nbsp;/g, ' ');
  }, []);

  // 메모이제이션된 굿즈 아이템 렌더링
  const goodsItems = useMemo(() => {
    return goods.map((item, index) => (
      <motion.a
        key={`${item.link}-${index}`}
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: Math.min(index * 0.03, 0.5) }}
        className="group bg-gray-800/50 hover:bg-gray-800/70 rounded-lg overflow-hidden transition-all border border-gray-700 hover:border-purple-500 flex flex-col"
      >
        {/* 상품 이미지 */}
        <div className="aspect-square relative overflow-hidden bg-gray-900">
          {item.image ? (
            <>
              <img 
                src={item.image} 
                alt={cleanTitle(item.title)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading={index < 8 ? 'eager' : 'lazy'}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.parentElement?.querySelector('.goods-placeholder');
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div 
                className="goods-placeholder w-full h-full flex items-center justify-center bg-gray-800" 
                style={{display: 'none'}}
              >
                <Package className="w-16 h-16 text-gray-700" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Package className="w-16 h-16 text-gray-700" />
            </div>
          )}
          
          {/* 호버시 아이콘 */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/70 rounded-full p-1">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        
        {/* 상품 정보 */}
        <div className="p-3 flex-1 flex flex-col">
          <h4 className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors line-clamp-2 mb-2">
            {cleanTitle(item.title)}
          </h4>
          
          {/* 쇼핑몰 정보 */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Store className="w-3 h-3" />
            <span>{item.mallName || '네이버쇼핑'}</span>
          </div>
          
          {/* 가격 정보 */}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-purple-400 font-bold text-sm">
                  ₩{formatPrice(item.lprice)}
                </span>
                {item.hprice && item.hprice !== item.lprice && (
                  <span className="text-gray-500 text-xs line-through ml-1">
                    ₩{formatPrice(item.hprice)}
                  </span>
                )}
              </div>
            </div>
            
            {/* 상품 타입 */}
            {item.productType && (
              <div className="mt-1">
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {item.productType}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.a>
    ));
  }, [goods, cleanTitle, formatPrice]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            관련 굿즈
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Clock className="w-4 h-4 animate-spin" />
              로딩 중...
            </div>
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <GoodsItemSkeleton key={i} />
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
          onClick={fetchGoods}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (goods.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-12 text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-4">관련 굿즈가 없습니다</p>
        <button
          onClick={fetchGoods}
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
          <ShoppingBag className="w-6 h-6 text-purple-400" />
          관련 굿즈
          {cached && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <Zap className="w-4 h-4" />
              캐시됨
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>총 {goods.length}개</span>
          <span>⚡ {responseTime}ms</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {goodsItems}
      </div>
      
      {/* 네이버 쇼핑 더보기 */}
      <motion.button
        className="mt-6 w-full py-3 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-colors border border-purple-800 hover:border-purple-600"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(artistName + ' 굿즈 앨범')}`, '_blank')}
      >
        네이버 쇼핑에서 더 많은 굿즈 보기 →
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

export default OptimizedGoodsTab;