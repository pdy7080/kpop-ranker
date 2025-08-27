import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, ExternalLink, ShoppingBag, Package, Star } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface NewsGoodsTabsProps {
  artistName: string;
}

export default function NewsGoodsTabs({ artistName }: NewsGoodsTabsProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'goods'>('news');
  const [newsData, setNewsData] = useState<any[]>([]);
  const [goodsData, setGoodsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    fetchGoods();
  }, [artistName]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/news`);
      if (response.ok) {
        const data = await response.json();
        setNewsData(data.news || []);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const fetchGoods = async () => {
    try {
      const response = await fetch(`${API_URL}/api/artist/${encodeURIComponent(artistName)}/goods`);
      if (response.ok) {
        const data = await response.json();
        setGoodsData(data.goods || []);
      }
    } catch (error) {
      console.error('Failed to fetch goods:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'news'
              ? 'bg-purple-900/30 text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>뉴스</span>
        </button>
        <button
          onClick={() => setActiveTab('goods')}
          className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'goods'
              ? 'bg-purple-900/30 text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>굿즈</span>
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-700/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'news' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {newsData.length > 0 ? (
                  newsData.map((news, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4 }}
                      className="p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{news.title}</h4>
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{news.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(news.published_at).toLocaleDateString('ko-KR')}
                            </span>
                            <span>{news.source}</span>
                            <span className="text-purple-400">{news.category}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    최근 뉴스가 없습니다
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'goods' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {goodsData.length > 0 ? (
                  goodsData.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-purple-400 uppercase">{item.category}</span>
                        </div>
                        {item.stock === 'limited' && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                            한정판
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-white mb-2">{item.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-400">{item.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-400">4.8</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-400 py-8">
                    굿즈 정보가 없습니다
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
