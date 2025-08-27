import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaSearch, FaMusic, FaUser, FaFire } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';

interface Suggestion {
  type: 'artist' | 'track';
  artist?: string;
  track?: string;
  name?: string;
  display: string;
  track_count?: number;
  best_rank?: number;
  chart_count?: number;
}

interface UnifiedSearchProps {
  initialQuery?: string;
}

// 더미 자동완성 데이터 (배포 버전과 동일한 형태)
const MOCK_SUGGESTIONS: Record<string, Suggestion[]> = {
  '블': [
    { type: 'artist', name: 'BLACKPINK', display: 'BLACKPINK', track_count: 1 },
    { type: 'track', artist: 'BLACKPINK', track: '뛰어(JUMP)', display: 'BLACKPINK - 뛰어(JUMP)' }
  ],
  '블랙': [
    { type: 'artist', name: 'BLACKPINK', display: 'BLACKPINK', track_count: 1 },
    { type: 'track', artist: 'BLACKPINK', track: '뛰어(JUMP)', display: 'BLACKPINK - 뛰어(JUMP)' }
  ],
  '블랙핑크': [
    { type: 'artist', name: 'BLACKPINK', display: 'BLACKPINK', track_count: 1 },
    { type: 'track', artist: 'BLACKPINK', track: 'JUMP', display: 'BLACKPINK - JUMP' },
    { type: 'track', artist: 'BLACKPINK', track: '뛰어(JUMP)', display: 'BLACKPINK - 뛰어(JUMP)' }
  ],
  'BLACKPINK': [
    { type: 'artist', name: 'BLACKPINK', display: 'BLACKPINK', track_count: 1 },
    { type: 'track', artist: 'BLACKPINK', track: 'JUMP', display: 'BLACKPINK - JUMP' },
    { type: 'track', artist: 'BLACKPINK', track: '뛰어(JUMP)', display: 'BLACKPINK - 뛰어(JUMP)' }
  ],
  'blackpink': [
    { type: 'artist', name: 'BLACKPINK', display: 'BLACKPINK', track_count: 1 },
    { type: 'track', artist: 'BLACKPINK', track: 'JUMP', display: 'BLACKPINK - JUMP' }
  ],
  '지민': [
    { type: 'artist', name: 'Jimin', display: 'Jimin', track_count: 1 },
    { type: 'track', artist: 'Jimin', track: 'Like Crazy', display: 'Jimin - Like Crazy' }
  ],
  'jimin': [
    { type: 'artist', name: 'Jimin', display: 'Jimin', track_count: 1 },
    { type: 'track', artist: 'Jimin', track: 'Like Crazy', display: 'Jimin - Like Crazy' }
  ],
  '에스파': [
    { type: 'artist', name: 'aespa', display: 'aespa', track_count: 3 },
    { type: 'track', artist: 'aespa', track: 'Supernova', display: 'aespa - Supernova' },
    { type: 'track', artist: 'aespa', track: 'Whiplash', display: 'aespa - Whiplash' }
  ],
  'aespa': [
    { type: 'artist', name: 'aespa', display: 'aespa', track_count: 3 },
    { type: 'track', artist: 'aespa', track: 'Supernova', display: 'aespa - Supernova' },
    { type: 'track', artist: 'aespa', track: 'Whiplash', display: 'aespa - Whiplash' },
    { type: 'track', artist: 'aespa', track: 'Dirty Work', display: 'aespa - Dirty Work' }
  ]
};

const getMockSuggestions = (searchQuery: string): Suggestion[] => {
  const normalizedQuery = searchQuery.toLowerCase().trim();
  let results: Suggestion[] = [];
  
  // 정확 매칭 우선
  if (MOCK_SUGGESTIONS[normalizedQuery]) {
    results = [...MOCK_SUGGESTIONS[normalizedQuery]];
  } else {
    // 부분 매칭
    for (const [key, suggestions] of Object.entries(MOCK_SUGGESTIONS)) {
      if (key.toLowerCase().includes(normalizedQuery) || 
          normalizedQuery.includes(key.toLowerCase())) {
        results.push(...suggestions);
      }
    }
  }
  
  // 포트폴리오 추천 배너 추가 (배포 버전 스타일)
  if (results.length > 0 && (normalizedQuery.includes('블') || normalizedQuery.includes('blackpink'))) {
    results.unshift({
      type: 'portfolio' as any,
      display: 'Portal 자동완성 3개 렌더링중!',
      name: '포트폴리오 추천',
      special: true
    } as any);
  }
  
  // 중복 제거 및 제한
  const seen = new Set();
  return results.filter(item => {
    const key = item.display;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
};

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
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        // 실제 API 호출 시도
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(
          `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 자동완성 응답:', data);
        
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          // API 응답이 있으면 사용
          const enrichedSuggestions = data.suggestions.map((s: any) => ({
            ...s,
            display: s.display || s.name || `${s.artist} - ${s.track}`
          }));
          
          // 포트폴리오 추천 배너 추가
          if (enrichedSuggestions.length > 0 && (searchQuery.includes('블') || searchQuery.includes('BLACKPINK'))) {
            enrichedSuggestions.unshift({
              type: 'portfolio' as any,
              display: 'Portal 자동완성 3개 렌더링중!',
              name: '포트폴리오 추천',
              special: true
            });
          }
          
          setSuggestions(enrichedSuggestions);
          setShowSuggestions(true);
        } else {
          // API 응답이 없으면 더미 데이터 사용
          console.log('🔄 더미 데이터 사용');
          const mockResults = getMockSuggestions(searchQuery);
          setSuggestions(mockResults);
          setShowSuggestions(mockResults.length > 0);
        }
      } catch (error) {
        console.error('자동완성 에러, 더미 데이터 사용:', error);
        // 에러 시 더미 데이터 사용
        const mockResults = getMockSuggestions(searchQuery);
        setSuggestions(mockResults);
        setShowSuggestions(mockResults.length > 0);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  // 통합된 자동완성 항목 클릭 처리
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    console.log('🎯 자동완성 클릭:', suggestion);
    
    // 포트폴리오 추천 클릭 무시
    if ((suggestion as any).special) {
      return;
    }
    
    // 자동완성 창 닫기
    setShowSuggestions(false);
    setSuggestions([]);
    
    // 타임아웃으로 라우팅 지연 (클릭 이벤트 보호)
    setTimeout(() => {
      if (suggestion.type === 'artist') {
        const artistName = suggestion.name || suggestion.artist || suggestion.display;
        setQuery(artistName);
        router.push(`/artist/${encodeURIComponent(artistName)}`);
      } else if (suggestion.type === 'track') {
        const artistName = suggestion.artist || 'Unknown';
        const trackName = suggestion.track || suggestion.name || suggestion.display;
        setQuery(`${artistName} - ${trackName}`);
        router.push(`/track/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`);
      } else {
        setQuery(suggestion.display);
        router.push(`/search?q=${encodeURIComponent(suggestion.display)}`);
      }
    }, 100);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder="아티스트, 트랙 검색..."
          className="w-full px-4 py-3 pl-12 pr-12 text-lg bg-gray-800/80 backdrop-blur-sm
                     border border-gray-600/30 rounded-xl
                     text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     transition-all duration-200"
        />
        
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 
                           text-gray-400 w-5 h-5" />
        
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
          </div>
        )}
      </form>

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
            {suggestions.map((suggestion, index) => {
              const isSpecial = (suggestion as any).special;
              const isSelected = selectedIndex === index;
              
              return (
                <motion.div
                  key={`${suggestion.type}-${index}`}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-150
                            ${isSelected 
                              ? 'bg-purple-500/20 border-l-4 border-purple-500' 
                              : 'hover:bg-gray-700/50'
                            }
                            ${index === 0 ? 'rounded-t-xl' : ''}
                            ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}
                            ${isSpecial ? 'bg-green-500/20 border-l-4 border-green-500' : ''}
                            border-b border-gray-600/20`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSuggestionClick(suggestion);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isSpecial ? (
                      <FaFire className="text-green-400 w-4 h-4 flex-shrink-0" />
                    ) : suggestion.type === 'artist' ? (
                      <FaUser className="text-blue-400 w-4 h-4 flex-shrink-0" />
                    ) : (
                      <FaMusic className="text-green-400 w-4 h-4 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${
                        isSpecial ? 'text-green-400' : 'text-white'
                      }`}>
                        {suggestion.display}
                      </div>
                      
                      {!isSpecial && (
                        <>
                          {suggestion.type === 'artist' && suggestion.track_count && (
                            <div className="text-gray-400 text-sm">
                              {suggestion.track_count}개 트랙
                            </div>
                          )}
                          
                          {suggestion.type === 'track' && suggestion.best_rank && (
                            <div className="text-gray-400 text-sm">
                              최고 {suggestion.best_rank}위
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 uppercase font-mono">
                      {isSpecial ? 'HOT' : suggestion.type}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
