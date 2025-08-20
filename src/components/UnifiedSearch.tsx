import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaSearch, FaMusic, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';

interface Suggestion {
  id: string;
  type: 'artist' | 'track' | 'popular';
  artist: string;
  artist_normalized?: string;
  track: string | null;
  display: string;
  matched_text: string;
  score: number;
  year?: number;
  genre?: string;
  chart_count?: number;
  best_rank?: number;
  chart?: string;
  rank?: number;
}

interface UnifiedSearchProps {
  initialQuery?: string;
}

export default function UnifiedSearch({ initialQuery = '' }: UnifiedSearchProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputPosition, setInputPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setInputPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 1) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // 통합 자동완성 API 사용
        const unifiedUrl = `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(searchQuery)}&limit=10`;
        console.log('통합 자동완성 API 호출:', unifiedUrl);
        
        const unifiedResponse = await fetch(unifiedUrl);
        if (!unifiedResponse.ok) {
          throw new Error(`통합 자동완성 API 응답 실패: ${unifiedResponse.status}`);
        }
        
        const unifiedData = await unifiedResponse.json();
        console.log('통합 자동완성 API 응답:', unifiedData);
        
        const suggestions: Suggestion[] = [];
        
        // 통합 자동완성 결과 추가
        if (unifiedData.suggestions) {
          unifiedData.suggestions.forEach((item: any, index: number) => {
            if (item.type === 'artist') {
              const artistName = item.name || item.display || item.original || item.artist;
              suggestions.push({
                id: `artist_${index}`,
                type: 'artist',
                artist: artistName,
                artist_normalized: item.artist_normalized || item.normalized,
                track: null,
                display: item.display || artistName,
                matched_text: artistName,
                score: 100 - index,
                chart_count: item.track_count || item.chart_count
              });
            } else if (item.type === 'track') {
              const artistName = item.artist || item.name;
              suggestions.push({
                id: `track_${index}`,
                type: 'track',
                artist: artistName,
                artist_normalized: item.artist_normalized || item.normalized,
                track: item.matched_by || item.track || '',
                display: item.display,
                matched_text: item.matched_by || item.track || '',
                score: 90 - index
              });
            }
          });
        }
        
        // 실제 DB에서 트랙 검색도 시도 (일반 검색 API 사용)
        try {
          const searchUrl = `${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}`;
          console.log('일반 검색 API 호출:', searchUrl);
          
          const searchResponse = await fetch(searchUrl);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log('일반 검색 API 응답:', searchData);
            
            // 검색 결과에서 아티스트와 트랙 추가
            if (searchData.results) {
              searchData.results.slice(0, 5).forEach((item: any, index: number) => {
                const existingTrack = suggestions.find(s => 
                  s.type === 'track' && 
                  s.artist === item.artist && 
                  s.track === item.track
                );
                
                if (!existingTrack) {
                  suggestions.push({
                    id: `search_track_${index}`,
                    type: 'track',
                    artist: item.artist,
                    artist_normalized: item.artist_normalized,
                    track: item.track || item.title,
                    display: `${item.artist} - ${item.track || item.title}`,
                    matched_text: item.track || item.title,
                    score: 80 - index
                  });
                }
              });
            }
          }
        } catch (searchError) {
          console.error('일반 검색 API 오류:', searchError);
        }
        
        // 점수 기준으로 정렬
        suggestions.sort((a, b) => b.score - a.score);
        
        const finalSuggestions = suggestions.slice(0, 10);
        setSuggestions(finalSuggestions);
        console.log(`🎯 자동완성 설정됨: ${finalSuggestions.length}개 항목`);
        console.log('showSuggestions:', true);
        console.log('suggestions:', finalSuggestions);
      } catch (error) {
        console.error('자동완성 API 오류:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    fetchSuggestions(newQuery);
    console.log(`🔍 검색어 변경: "${newQuery}", 자동완성 표시 상태: true`);
  };

  const handleSearch = useCallback((searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }, [query, router]);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    console.log('🎯 자동완성 클릭:', suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    
    setTimeout(() => {
      if (suggestion.type === 'artist') {
        // 아티스트 타입 -> 아티스트 상세 페이지
        const artistPath = suggestion.artist_normalized || suggestion.artist;
        console.log('🎤 아티스트 페이지로 이동:', `/artist/${artistPath}`);
        setQuery(''); // 검색창 초기화
        router.push(`/artist/${encodeURIComponent(artistPath)}`);
      } else if (suggestion.type === 'track' && suggestion.track) {
        // 트랙 타입 -> 트랙(곡) 차트 페이지
        const artistPath = suggestion.artist_normalized || suggestion.artist;
        const trackPath = suggestion.track;
        console.log('🎵 트랙 차트 페이지로 이동:', `/track/${artistPath}/${trackPath}`);
        setQuery(''); // 검색창 초기화
        router.push(`/track/${encodeURIComponent(artistPath)}/${encodeURIComponent(trackPath)}`);
      } else {
        // 그 외의 경우 -> 일반 검색 페이지
        console.log('🔍 일반 검색 페이지로 이동:', `/search?q=${suggestion.display}`);
        router.push(`/search?q=${encodeURIComponent(suggestion.display)}`);
      }
    }, 50); // 라우팅 지연
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // 선택된 자동완성 항목이 있으면 해당 항목으로 이동
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (query.trim()) {
        // 선택된 항목이 없고 검색어가 있으면 일반 검색 페이지로
        console.log('🔍 엔터키 입력 -> 일반 검색 페이지로 이동');
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <motion.div 
        className="relative"
        whileFocus={{ scale: 1.02 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={t('search.placeholder')}
          className="w-full px-6 py-4 pr-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl 
                     text-white placeholder-white/50 outline-none focus:border-purple-400 transition-all
                     hover:bg-white/15"
        />
        <motion.button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl
                     bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                     transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaSearch className="text-white" />
        </motion.button>
      </motion.div>

      {/* 디버그용 텍스트 */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'green', 
          color: 'white', 
          padding: '10px',
          zIndex: 999999,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Portal로 자동완성 {suggestions.length}개 렌더링중!
        </div>
      )}

      {/* Portal로 자동완성 렌더링 */}
      {mounted && showSuggestions && suggestions.length > 0 && ReactDOM.createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: `${inputPosition.top + 8}px`,
              left: `${inputPosition.left}px`,
              width: `${inputPosition.width}px`,
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 2147483647, // 최대 z-index
              backgroundColor: 'rgba(17, 17, 27, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(139, 92, 246, 0.5)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              borderRadius: '16px'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 클릭 이벤트 발생!');
                  console.log('🔥 suggestion:', suggestion);
                  handleSuggestionClick(suggestion);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSuggestionClick(suggestion);
                }}
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: selectedIndex === index ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderTop: index > 0 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: suggestion.type === 'artist' 
                    ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                    : suggestion.type === 'track'
                    ? 'linear-gradient(135deg, #ec4899, #db2777)'
                    : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                }}>
                  {suggestion.type === 'artist' ? (
                    <FaUser style={{ color: 'white', fontSize: '14px' }} />
                  ) : suggestion.type === 'track' ? (
                    <FaMusic style={{ color: 'white', fontSize: '14px' }} />
                  ) : (
                    <span style={{ fontSize: '12px' }}>⭐</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: 'white' }}>
                    {suggestion.display}
                  </div>
                  {suggestion.chart_count && (
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                      {suggestion.chart_count} {t('chart.tracks')}
                    </div>
                  )}
                </div>
                {suggestion.type === 'popular' && (
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)'
                  }}>
                    {t('tab.hot')}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {showSuggestions && loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full mt-2 w-full glass-card rounded-2xl p-4 flex justify-center"
        >
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  );
}