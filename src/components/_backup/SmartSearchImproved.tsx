import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUser, FaMusic, FaArrowRight } from 'react-icons/fa';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Suggestion {
  type: 'artist' | 'track';
  name: string;
  artist?: string;
  original: string;
  display: string;
  track_count?: number;
  chart_count: number;
  best_rank?: number;
  album_image?: string;
  preview: string;
  match_type: 'direct' | 'variation';
}

interface SmartSearchProps {
  placeholder?: string;
  className?: string;
  size?: 'normal' | 'large';
  autoFocus?: boolean;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ 
  placeholder = "가수이름이나 곡이름을 입력하세요",
  className = "",
  size = 'normal',
  autoFocus = false
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // API URL 설정
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 개선된 자동완성 API 호출 (한글자씩 타이핑할 때마다)
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 1) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/autocomplete/unified?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('자동완성 에러:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200), // 더 빠른 응답을 위해 debounce 시간 단축
    []
  );

  // 입력 변경시 자동완성 호출
  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  // 검색 결과 라우팅 개선
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    if (suggestion.type === 'artist') {
      // 가수이름 → 아티스트 상세 페이지
      router.push(`/artist/${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === 'track') {
      // 곡이름 → 곡 차트 페이지
      router.push(`/search?artist=${encodeURIComponent(suggestion.artist!)}&track=${encodeURIComponent(suggestion.name)}`);
    }
    setQuery('');
    setShowDropdown(false);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSuggestionSelect(suggestions[0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 엔터키로 첫 번째 결과 선택
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionSelect(suggestions[0]);
    }
  };

  const inputSize = size === 'large' ? 'text-lg px-6 py-4' : 'text-base px-4 py-3';

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setShowDropdown(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`w-full ${inputSize} pr-12 bg-white dark:bg-gray-800 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
          />
          
          {/* 검색 아이콘 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            ) : (
              <FaSearch className="text-gray-400" />
            )}
          </div>
        </div>
      </form>

      {/* 개선된 자동완성 드롭다운 */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-30 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.name}-${index}`}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* 앨범 이미지 또는 타입 아이콘 */}
                  <div className="flex-shrink-0">
                    {suggestion.album_image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <Image 
                          src={suggestion.album_image} 
                          alt={suggestion.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 이미지 로드 실패시 기본 아이콘으로 대체
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        suggestion.type === 'artist' 
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                          : 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300'
                      }`}>
                        {suggestion.type === 'artist' ? (
                          <FaUser className="w-5 h-5" />
                        ) : (
                          <FaMusic className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* 텍스트 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {suggestion.type === 'track' ? suggestion.name : suggestion.display}
                      </span>
                      {suggestion.type === 'track' && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">- {suggestion.artist}</span>
                      )}
                      {/* 타입 배지 */}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.type === 'artist' 
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
                      }`}>
                        {suggestion.type === 'artist' ? '아티스트' : '곡'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.preview}
                    </div>
                  </div>

                  {/* 화살표 아이콘 */}
                  <div className="flex-shrink-0">
                    <FaArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 클릭 외부 영역 처리 */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowDropdown(false);
            setSelectedIndex(-1);
          }}
        />
      )}
    </div>
  );
};

export default SmartSearch;
