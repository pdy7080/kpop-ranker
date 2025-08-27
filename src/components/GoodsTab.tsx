import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Package, AlertCircle, Store, Tag } from 'lucide-react';

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

interface GoodsTabProps {
  artistName: string;
}

const GoodsTab: React.FC<GoodsTabProps> = ({ artistName }) => {
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoods();
  }, [artistName]);

  const fetchGoods = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = `${API_URL}/api/artist/${encodeURIComponent(artistName)}/goods`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('굿즈를 불러올 수 없습니다');
      }
      
      const data = await response.json();
      setGoods(data.goods || []);
    } catch (err) {
      console.error('굿즈 로딩 실패:', err);
      setError('굿즈를 불러오는 중 오류가 발생했습니다');
      setGoods([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    if (!price) return '0';
    return parseInt(price).toLocaleString('ko-KR');
  };

  const cleanTitle = (title: string) => {
    if (!title) return '';
    // HTML 태그 및 특수문자 제거
    return title.replace(/<[^>]*>/g, '')
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

  if (goods.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-12 text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">관련 굿즈가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-purple-400" />
          관련 굿즈
        </h3>
        <span className="text-sm text-gray-400">총 {goods.length}개</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {goods.map((item, index) => (
          <motion.a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-gray-800/50 hover:bg-gray-800/70 rounded-lg overflow-hidden transition-all border border-gray-700 hover:border-purple-500 flex flex-col"
          >
            {/* 상품 이미지 */}
            <div className="aspect-square relative overflow-hidden bg-gray-900">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={cleanTitle(item.title)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-product.svg';
                  }}
                />
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
        ))}
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
    </div>
  );
};

export default GoodsTab;
