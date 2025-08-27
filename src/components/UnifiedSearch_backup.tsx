import React, { useState, useCallback, useEffect, useRef } from 'react';
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

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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
        
        const unifiedResponse = await fetch(unifiedUrl);
        if (!unifiedResponse.ok) {
          throw new Error(`자동완성 API 응답 실패: ${unifiedResponse.status}`);
        }
        
        const unifiedData = await unifiedResponse.json();
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
        
        // 추가 검색 결과도 시도
        try {
          const searchUrl = `${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}`;
          const searchResponse = await fetch(searchUrl);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            
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
          console.error('검색 API 오류:', searchError);
        }
        
        // 점수 기준으로 정렬
        suggestions.sort((a, b) => b.score - a.score);
        setSuggestions(suggestions.slice(0, 10));
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
  };

  const handleSearch = useCallback((searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }, [query, router]);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (suggestion.type === 'artist') {
      const artistPath = suggestion.artist_normalized || suggestion.artist;
      setQuery('');
      router.push(`/artist/${encodeURIComponent(artistPath)}`);
    } else if (suggestion.type === 'track' && suggestion.track) {
      const artistPath = suggestion.artist_normalized || suggestion.artist;
      const trackPath = suggestion.track;
      setQuery('');
      router.push(`/track/${encodeURIComponent(artistPath)}/${encodeURIComponent(trackPath)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion.display)}`);
    }
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
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (query.trim()) {
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

      {/* 자동완성 드롭다운 - Portal 제거, 직접 렌더링 */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full max-h-[400px] overflow-y-auto z-50
                       bg-[#11111b]/95 backdrop-blur-xl border-2 border-purple-500/50
                       rounded-2xl shadow-2xl"
            style={{
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 60px rgba(139, 92, 246, 0.3)'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-6 py-4 cursor-pointer flex items-center gap-3 transition-all
                           ${selectedIndex === index ? 'bg-white/20' : 'hover:bg-white/10'}
                           ${index > 0 ? 'border-t border-white/10' : ''}`}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                ${suggestion.type === 'artist' 
                                  ? 'bg-gradient-to-br from-purple-600 to-purple-700'
                                  : 'bg-gradient-to-br from-pink-600 to-pink-700'}`}>
                  {suggestion.type === 'artist' ? (
                    <FaUser className="text-white text-sm" />
                  ) : (
                    <FaMusic className="text-white text-sm" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {suggestion.display}
                  </div>
                  {suggestion.chart_count && (
                    <div className="text-xs text-white/60 mt-1">
                      {suggestion.chart_count} {t('chart.tracks')}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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