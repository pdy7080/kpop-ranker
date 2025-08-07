import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useDebounce } from '@/hooks/useDebounce';
import { searchApi } from '@/lib/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface SearchSuggestion {
  type: 'artist' | 'track';
  query: string;
  official: string;
  score: number;
}

interface SmartSearchBoxProps {
  onSearch?: (artist: string, track: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'normal' | 'large';
}

const SmartSearchBoxFixed: React.FC<SmartSearchBoxProps> = ({ 
  onSearch = null, 
  placeholder = "아티스트와 곡명을 아무렇게나 입력하세요 (예: 뉴진스 하입보이, 방탄 버터)",
  className = "",
  size = 'normal'
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showExamples, setShowExamples] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // 검색 예시
  const searchExamples = [
    { text: "뉴진스 하입보이", artist: "NewJeans", track: "Hype Boy" },
    { text: "방탄 버터", artist: "BTS", track: "Butter" },
    { text: "블핑 뚜두뚜두", artist: "BLACKPINK", track: "DDU-DU DDU-DU" },
    { text: "아이브 러다", artist: "IVE", track: "Love Dive" },
  ];

  // 🔥 메인 페이지와 동일한 스마트 라우팅 로직 적용 + 곡명 검색 개선
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query?.trim() || '';
    if (!trimmedQuery) {
      toast.error('검색어를 입력해주세요');
      return;
    }
    
    // 🎯 메인 페이지와 동일한 스마트 라우팅 로직 적용
    // onSearch가 있으면 onSearch 사용 (기존 동작 유지)
    if (onSearch) {
      const parts = trimmedQuery.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        onSearch(parts[0], '');
      } else {
        onSearch(trimmedQuery, '');
      }
      return;
    }
    
    // onSearch가 없으면 스마트 라우팅 적용
    try {
      console.log('🔍 스마트 검색 시작:', trimmedQuery);
      
      // 🎯 1단계: 실시간 자동완성으로 아티스트/곡 확인
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const autocompleteUrl = `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(trimmedQuery)}&limit=10`;
      
      console.log('🔍 실시간 자동완성 확인:', autocompleteUrl);
      
      let realTimeSuggestions = [];
      try {
        const response = await fetch(autocompleteUrl);
        if (response.ok) {
          const data = await response.json();
          realTimeSuggestions = data.suggestions || [];
          console.log('✅ 실시간 자동완성 결과:', realTimeSuggestions);
        }
      } catch (e) {
        console.log('⚠️ 실시간 자동완성 실패, 직접 검색 진행:', e);
      }
      
      // 🎯 2단계: 정확한 매칭 확인 - 아티스트와 곡 모두 체크
      const exactArtistMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'artist' && 
        s.artist.toLowerCase() === trimmedQuery.toLowerCase()
      );
      
      const exactTrackMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'track' && 
        s.track && s.track.toLowerCase() === trimmedQuery.toLowerCase()
      );
      
      const similarArtistMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'artist' && 
        (s.artist.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
         trimmedQuery.toLowerCase().includes(s.artist.toLowerCase()))
      );
      
      const similarTrackMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'track' && s.track &&
        (s.track.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
         trimmedQuery.toLowerCase().includes(s.track.toLowerCase()))
      );
      
      // 🎯 3단계: 곡 우선 라우팅 - 곡 상세 페이지로 바로 이동 (메인 페이지와 동일)
      if (exactTrackMatch) {
        // 🎯 정확한 곡 매칭: 곡 상세 페이지로 바로 이동
        if (exactTrackMatch.artist && exactTrackMatch.artist.trim()) {
          console.log('🎯 정확한 곡 매칭: 곡 상세 페이지로 이동:', exactTrackMatch);
          router.push(`/track/${encodeURIComponent(exactTrackMatch.artist)}/${encodeURIComponent(exactTrackMatch.track)}`);
        } else {
          // 🚨 아티스트 정보 없음 → 자동완성에서 아티스트 찾아서 매칭 시도
          const artistFromSuggestions = realTimeSuggestions.find((s: any) => 
            s.type === 'artist' && s.artist && s.artist.trim()
          );
          
          if (artistFromSuggestions) {
            console.log('🎯 아티스트 매칭 성공: 곡 상세 페이지로 이동:', artistFromSuggestions.artist, exactTrackMatch.track);
            router.push(`/track/${encodeURIComponent(artistFromSuggestions.artist)}/${encodeURIComponent(exactTrackMatch.track)}`);
          } else {
            console.log('⚠️ 아티스트 매칭 실패: 검색 페이지로 이돐');
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
          }
        }
      } else if (exactArtistMatch) {
        // 🎯 정확한 아티스트 매칭: 아티스트 상세 페이지
        console.log('🎯 정확한 아티스트 매칭: 아티스트 상세 페이지로 이동:', exactArtistMatch);
        router.push(`/artist/${encodeURIComponent(exactArtistMatch.artist)}`);
      } else if (similarTrackMatch) {
        // 🎯 비슷한 곡 매칭: 곡 상세 페이지로 바로 이동
        if (similarTrackMatch.artist && similarTrackMatch.artist.trim()) {
          console.log('🎯 비슷한 곡 매칭: 곡 상세 페이지로 이동:', similarTrackMatch);
          router.push(`/track/${encodeURIComponent(similarTrackMatch.artist)}/${encodeURIComponent(similarTrackMatch.track)}`);
        } else {
          // 🚨 아티스트 정보 없음 → 자동완성에서 아티스트 찾아서 매칭 시도
          const artistFromSuggestions = realTimeSuggestions.find((s: any) => 
            s.type === 'artist' && s.artist && s.artist.trim()
          );
          
          if (artistFromSuggestions) {
            console.log('🎯 아티스트 매칭 성공: 곡 상세 페이지로 이동:', artistFromSuggestions.artist, similarTrackMatch.track);
            router.push(`/track/${encodeURIComponent(artistFromSuggestions.artist)}/${encodeURIComponent(similarTrackMatch.track)}`);
          } else {
            console.log('⚠️ 아티스트 매칭 실패: 검색 페이지로 이돐');
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
          }
        }
      } else if (similarArtistMatch) {
        // 🎯 비슷한 아티스트 매칭: 아티스트 상세 페이지
        console.log('🎯 비슷한 아티스트 매칭: 아티스트 상세 페이지로 이동:', similarArtistMatch);
        router.push(`/artist/${encodeURIComponent(similarArtistMatch.artist)}`);
      } else {
        // 🎯 매칭이 없으면 범용 검색 결과 페이지
        console.log('🔥 매칭 없음: 범용 검색 페이지로 이동');
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
      
    } catch (error) {
      console.error('🚨 검색 페이지 이동 중 오류:', error);
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  // 🔥 예시 클릭도 곡 상세 페이지로 수정
  const handleExampleClick = (example: typeof searchExamples[0]) => {
    setQuery(example.text);
    
    // 🔥 포트폴리오 검색도 곡 상세 페이지로 바로 이동 (메인 페이지와 동일)
    if (!onSearch) {
      console.log('🎯 포트폴리오에서 곡 상세 페이지로 이동: →', `${example.artist} - ${example.track}`);
      router.push(`/track/${encodeURIComponent(example.artist)}/${encodeURIComponent(example.track)}`);
    } else {
      // 🔥 포트폴리오에서 onSearch 사용 (기존 동작 유지)
      onSearch(example.artist, example.track);
    }
    
    setShowExamples(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const suggestion = suggestions[selectedIndex];
      // Handle suggestion selection
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowExamples(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = size === 'large' 
    ? 'h-14 text-lg pl-14 pr-12' 
    : 'h-12 text-base pl-12 pr-10';

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FaSearch className={`absolute left-4 ${size === 'large' ? 'top-4' : 'top-3.5'} text-gray-400 ${size === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowExamples(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full ${sizeClasses} rounded-full bg-white dark:bg-dark-200 border-2 border-gray-200 dark:border-dark-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute right-14 ${size === 'large' ? 'top-4' : 'top-3.5'} text-gray-400 hover:text-gray-600`}
            >
              <FaTimes className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />
            </button>
          )}
          
          <button
            type="submit"
            className={`absolute right-2 ${size === 'large' ? 'top-2' : 'top-1.5'} ${size === 'large' ? 'w-10 h-10' : 'w-9 h-9'} bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-colors`}
          >
            <FaSearch className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        </div>
      </form>

      {/* 검색 예시 */}
      <AnimatePresence>
        {showExamples && !query && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-200 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-400 overflow-hidden z-50"
          >
            <div className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                <FaInfoCircle className="w-4 h-4 mr-2" />
                🔥 곡명 검색도 완벽 지원! 아티스트/곡 모두 스마트 라우팅!
              </p>
              <div className="space-y-2">
                {searchExamples.map((example, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      "{example.text}" → {example.artist} - {example.track} 곡 차트
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 추천 검색어 (API 구현 시 활성화) */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-200 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-400 overflow-hidden z-50"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                onClick={() => {/* Handle suggestion click */}}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedIndex === index ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <p className="font-medium">{suggestion.official}</p>
                <p className="text-sm text-gray-500">
                  {suggestion.type === 'artist' ? '아티스트' : '트랙'}
                </p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBoxFixed;
