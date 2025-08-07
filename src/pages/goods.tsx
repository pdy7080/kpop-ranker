import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaSearch, FaFilter, FaHeart, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface GoodsItem {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  discount_rate?: number;
  image: string;
  shop_link: string;
  in_stock: boolean;
  description?: string;
  mallName?: string;
  sales_rank?: number;
}

interface GoodsCategory {
  key: string;
  name: string;
}

const GOODS_CATEGORIES: GoodsCategory[] = [
  { key: 'all', name: '전체' },
  { key: 'album', name: '앨범' },
  { key: 'lightstick', name: '응원봉' },
  { key: 'photobook', name: '포토북' },
  { key: 'clothing', name: '의류' },
  { key: 'accessories', name: '액세서리' },
  { key: 'stationery', name: '문구류' },
  { key: 'etc', name: '기타' }
];

export default function GoodsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [goodsItems, setGoodsItems] = useState<GoodsItem[]>([]);
  const [trendingGoods, setTrendingGoods] = useState<GoodsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTrendingGoods();
  }, []);

  const fetchTrendingGoods = async () => {
    try {
      const response = await fetch('/api/goods/trending');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrendingGoods(data.goods || []);
        }
      }
    } catch (error) {
      console.error('인기 굿즈 조회 실패:', error);
    }
  };

  const searchGoods = async () => {
    if (!searchQuery.trim()) {
      toast.error('아티스트명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        display: '20'
      });

      const response = await fetch(`/api/goods/${encodeURIComponent(searchQuery)}?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoodsItems(data.goods || []);
          if (data.goods?.length === 0) {
            toast('검색 결과가 없습니다. 다른 아티스트를 검색해보세요.', { icon: 'ℹ️' });
          } else {
            toast.success(`${data.goods.length}개의 굿즈를 찾았습니다!`);
          }
        } else {
          toast.error('굿즈 검색에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('굿즈 검색 오류:', error);
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchGoods();
    }
  };

  const toggleFavorite = (goodsId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(goodsId)) {
      newFavorites.delete(goodsId);
      toast.success('관심 굿즈에서 제거했습니다.');
    } else {
      newFavorites.add(goodsId);
      toast.success('관심 굿즈에 추가했습니다.');
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const openShopLink = (link: string, name: string) => {
    window.open(link, '_blank');
    toast.success(`${name} 구매 페이지로 이동합니다.`);
  };

  const GoodsCard: React.FC<{ item: GoodsItem; showRank?: boolean }> = ({ item, showRank = false }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-morphism rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* 이미지 섹션 */}
      <div className="relative aspect-square">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/300x300/667eea/ffffff?text=${encodeURIComponent(item.name.slice(0, 10))}`;
          }}
        />
        
        {/* 순위 배지 */}
        {showRank && item.sales_rank && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            #{item.sales_rank}
          </div>
        )}
        
        {/* 할인율 배지 */}
        {item.discount_rate && item.discount_rate > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {item.discount_rate}%
          </div>
        )}
        
        {/* 품절 오버레이 */}
        {!item.in_stock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">품절</span>
          </div>
        )}
        
        {/* 관심 버튼 */}
        <button
          onClick={() => toggleFavorite(item.id)}
          className={`absolute bottom-2 right-2 p-2 rounded-full transition-colors ${
            favorites.has(item.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
          }`}
        >
          <FaHeart className="w-4 h-4" />
        </button>
      </div>

      {/* 정보 섹션 */}
      <div className="p-4">
        <h3 className="font-bold text-sm mb-2 line-clamp-2 h-10">
          {item.name}
        </h3>
        
        {/* 쇼핑몰 정보 */}
        {item.mallName && (
          <p className="text-xs text-gray-500 mb-2">{item.mallName}</p>
        )}
        
        {/* 가격 정보 */}
        <div className="mb-3">
          {item.original_price && item.original_price > item.price ? (
            <div>
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(item.original_price)}원
              </span>
              <div className="text-lg font-bold text-red-500">
                {formatPrice(item.price)}원
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold">
              {formatPrice(item.price)}원
            </div>
          )}
        </div>

        {/* 설명 */}
        {item.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* 구매 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openShopLink(item.shop_link, item.name)}
          disabled={!item.in_stock}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
            item.in_stock
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FaShoppingBag className="w-4 h-4" />
          <span>{item.in_stock ? '구매하기' : '품절'}</span>
          {item.in_stock && <FaExternalLinkAlt className="w-3 h-3" />}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <>
      <Head>
        <title>K-POP 굿즈 쇼핑 - KPOP FANfolio</title>
        <meta name="description" content="좋아하는 K-POP 아티스트의 공식 굿즈를 찾아보세요. 앨범, 응원봉, 의류 등 다양한 굿즈 정보를 제공합니다." />
      </Head>

      <Layout>
        {/* 헤더 섹션 */}
        <section className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaShoppingBag className="w-8 h-8 text-primary-500" />
              <h1 className="text-3xl md:text-4xl font-bold">
                K-POP <span className="gradient-text">굿즈 쇼핑</span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              좋아하는 아티스트의 공식 굿즈를 찾아보세요
            </p>
          </motion.div>
        </section>

        {/* 검색 섹션 */}
        <section className="max-w-4xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-2xl p-6"
          >
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {GOODS_CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* 검색 입력 */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="아티스트명을 입력하세요 (예: BLACKPINK, BTS, NewJeans)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={searchGoods}
                disabled={isLoading}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-medium"
              >
                {isLoading ? '검색 중...' : '검색'}
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* 인기 굿즈 섹션 */}
        {trendingGoods.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <FaStar className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">인기 굿즈</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {trendingGoods.map((item) => (
                <GoodsCard key={item.id} item={item} showRank={true} />
              ))}
            </div>
          </section>
        )}

        {/* 검색 결과 섹션 */}
        {goodsItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                "{searchQuery}" 검색 결과 ({goodsItems.length}개)
              </h2>
              <div className="text-sm text-gray-500">
                카테고리: {GOODS_CATEGORIES.find(c => c.key === selectedCategory)?.name}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {goodsItems.map((item) => (
                <GoodsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* 빈 상태 */}
        {!isLoading && goodsItems.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-400">다른 아티스트명으로 검색해보세요</p>
          </motion.div>
        )}

        {/* 안내 메시지 */}
        {!searchQuery && trendingGoods.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">K-POP 굿즈를 검색해보세요</h3>
            <p className="text-gray-400">
              좋아하는 아티스트의 공식 굿즈, 앨범, 응원봉 등을 찾을 수 있습니다
            </p>
          </motion.div>
        )}
      </Layout>
    </>
  );
}