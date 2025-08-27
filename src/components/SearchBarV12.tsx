import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import api from '@/lib/api';

interface Suggestion {
  type: 'artist' | 'track';
  display: string;
  normalized: string;
  count?: number;
}

export default function SearchBarV12() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 자동완성 fetch
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 1) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.autocomplete(searchQuery);
        setSuggestions(data.suggestions || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    fetchSuggestions(value);
  };

  // 검색 실행
  const handleSearch = () => {
    if (!query.trim()) return;
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // 자동완성 선택
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowDropdown(false);
    
    if (suggestion.type === 'artist') {
      router.push(`/artist/${encodeURIComponent(suggestion.normalized)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion.display)}`);
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* 검색 입력 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="아티스트, 곡 검색..."
          className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 
                     rounded-lg text-white placeholder-gray-400 
                     focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 
                     text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* 자동완성 드롭다운 */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 
                       rounded-lg shadow-xl overflow-hidden z-50"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.normalized}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3
                  ${selectedIndex === index ? 'bg-gray-700' : 'hover:bg-gray-700/50'}
                  ${index > 0 ? 'border-t border-gray-700/50' : ''}`}
              >
                {/* 아이콘 */}
                <span className={`px-2 py-1 text-xs rounded ${
                  suggestion.type === 'artist' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {suggestion.type === 'artist' ? '아티스트' : '트랙'}
                </span>
                
                {/* 텍스트 */}
                <span className="flex-1 text-white">
                  {suggestion.display}
                </span>
                
                {/* 카운트 */}
                {suggestion.count && (
                  <span className="text-gray-400 text-sm">
                    {suggestion.count}곡
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 로딩 */}
      {loading && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 
                        rounded-lg p-4 flex justify-center">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent 
                          rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}