import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaMusic, FaHeart, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

interface SimplePortfolioItem {
  id: number;
  artist: string;
  track: string;
  added_date: string;
  notes: string;
  album_image: string;
}

const SimplePortfolio: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<SimplePortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newArtist, setNewArtist] = useState('');
  const [newTrack, setNewTrack] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // 포트폴리오 조회 - useCallback으로 메모이제이션
  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/portfolio/simple');
      const data = await response.json();
      
      if (data.status === 'success') {
        setItems(data.items || []);
        console.log('✅ 포트폴리오 조회 성공:', data);
      } else {
        console.error('❌ 포트폴리오 조회 실패:', data);
        // unique id로 중복 방지
        toast.error('포트폴리오를 불러올 수 없습니다', { 
          id: 'portfolio-load-error',
          duration: 3000 
        });
      }
    } catch (error) {
      console.error('❌ 포트폴리오 조회 오류:', error);
      toast.error('네트워크 오류가 발생했습니다', { 
        id: 'portfolio-network-error',
        duration: 3000 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 포트폴리오 추가
  const addToPortfolio = async () => {
    if (!newArtist.trim() || !newTrack.trim()) {
      toast.error('아티스트명과 곡명을 입력해주세요', { 
        id: 'portfolio-input-error',
        duration: 3000 
      });
      return;
    }

    try {
      setAdding(true);
      const response = await fetch('/api/portfolio/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist: newArtist.trim(),
          track: newTrack.trim(),
          notes: newNotes.trim()
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('포트폴리오에 추가되었습니다!', { 
          id: 'portfolio-add-success',
          duration: 3000 
        });
        setNewArtist('');
        setNewTrack('');
        setNewNotes('');
        await fetchPortfolio(); // 새로고침
      } else if (data.status === 'info') {
        toast(data.message, { 
          id: 'portfolio-info',
          duration: 3000 
        });
      } else {
        toast.error(data.message || '추가에 실패했습니다', { 
          id: 'portfolio-add-error',
          duration: 3000 
        });
      }
    } catch (error) {
      console.error('❌ 포트폴리오 추가 오류:', error);
      toast.error('추가 중 오류가 발생했습니다', { 
        id: 'portfolio-add-exception',
        duration: 3000 
      });
    } finally {
      setAdding(false);
    }
  };

  // 포트폴리오 삭제
  const removeFromPortfolio = async (itemId: number, artist: string, track: string) => {
    if (!confirm(`${artist} - ${track}을(를) 포트폴리오에서 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio/simple/${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('삭제되었습니다', { 
          id: 'portfolio-delete-success',
          duration: 3000 
        });
        await fetchPortfolio(); // 새로고침
      } else {
        toast.error(data.message || '삭제에 실패했습니다', { 
          id: 'portfolio-delete-error',
          duration: 3000 
        });
      }
    } catch (error) {
      console.error('❌ 포트폴리오 삭제 오류:', error);
      toast.error('삭제 중 오류가 발생했습니다', { 
        id: 'portfolio-delete-exception',
        duration: 3000 
      });
    }
  };

  // 데모 데이터 추가
  const addDemoData = async () => {
    try {
      const response = await fetch('/api/portfolio/simple/add-demo', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('데모 데이터가 추가되었습니다!', { 
          id: 'portfolio-demo-success',
          duration: 3000 
        });
        await fetchPortfolio(); // 새로고침
      } else {
        toast.error(data.message || '데모 데이터 추가 실패', { 
          id: 'portfolio-demo-error',
          duration: 3000 
        });
      }
    } catch (error) {
      console.error('❌ 데모 데이터 추가 오류:', error);
      toast.error('데모 데이터 추가 중 오류가 발생했습니다', { 
        id: 'portfolio-demo-exception',
        duration: 3000 
      });
    }
  };

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      fetchPortfolio();
    }
    
    return () => {
      mounted = false;
    };
  }, []); // 빈 의존성 배열 - 한 번만 실행

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <span className="ml-2">포트폴리오 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <FaHeart className="text-red-500 mr-2" />
          내 포트폴리오
        </h2>
        <p className="text-gray-600">
          좋아하는 K-POP 트랙을 저장하고 관리하세요
        </p>
      </div>

      {/* 추가 폼 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaPlus className="text-green-500 mr-2" />
          새 곡 추가
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="아티스트명 (예: BLACKPINK)"
            value={newArtist}
            onChange={(e) => setNewArtist(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="곡명 (예: Pink Venom)"
            value={newTrack}
            onChange={(e) => setNewTrack(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="메모 (선택사항)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={addToPortfolio}
            disabled={adding}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {adding ? '추가 중...' : '포트폴리오에 추가'}
          </button>
          
          {items.length === 0 && (
            <button
              onClick={addDemoData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              데모 데이터 추가
            </button>
          )}
        </div>
      </motion.div>

      {/* 포트폴리오 목록 */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 rounded-lg"
        >
          <FaMusic className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            포트폴리오가 비어있습니다
          </h3>
          <p className="text-gray-500">
            좋아하는 K-POP 트랙을 추가해보세요!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* 앨범 이미지 */}
              <div className="aspect-square bg-gradient-to-br from-red-100 to-pink-100 relative">
                <img
                  src={item.album_image}
                  alt={`${item.artist} - ${item.track}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/album-image-v2/' + encodeURIComponent(item.artist) + '/' + encodeURIComponent(item.track);
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <FaMusic className="text-white text-2xl opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              {/* 곡 정보 */}
              <div className="p-4">
                <h4 
                  className="font-bold text-lg text-gray-900 mb-1 truncate cursor-pointer hover:text-red-600 transition-colors flex items-center"
                  onClick={() => router.push(`/track/${encodeURIComponent(item.artist)}/${encodeURIComponent(item.track)}`)}
                >
                  {item.track}
                  <FaExternalLinkAlt className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-gray-600 mb-2 truncate">
                  {item.artist}
                </p>
                
                {item.notes && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {item.notes}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {new Date(item.added_date).toLocaleDateString('ko-KR')}
                  </span>
                  
                  <button
                    onClick={() => removeFromPortfolio(item.id, item.artist, item.track)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="삭제"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 통계 */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4"
        >
          <div className="flex justify-center items-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{items.length}</div>
              <div className="text-sm text-gray-600">총 곡 수</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">
                {new Set(items.map(item => item.artist)).size}
              </div>
              <div className="text-sm text-gray-600">아티스트 수</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SimplePortfolio;
