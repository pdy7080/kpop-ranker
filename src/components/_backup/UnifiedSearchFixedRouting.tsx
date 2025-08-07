import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSearch, FaMusic, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';

// 🔧 엔터키 라우팅 문제 해결 버전

interface Suggestion {
  id: string;
  type: 'artist' | 'track' | 'popular';
  artist: string;
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

interface UnifiedAutocompleteResponse {
  data_source?: string;
  suggestions?: Array<{
    id?: string;
    type: 'artist' | 'track';
    artist: string;
    track?: string | null;
    display: string;
    matched_text?: string;
    name?: string;
    score?: number;
    chart_count?: number;
    best_rank?: number;
  }>;
  results?: any[];
  count?: number;
  unified_search?: boolean;
}

export default function UnifiedSearchFixedRouting() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 자동완성 API 호출
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const unifiedUrl = `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(searchQuery)}&limit=10`;
      console.log('🔥 자동완성 API 호출:', unifiedUrl);
      
      const unifiedResponse = await fetch(unifiedUrl);
      if (!unifiedResponse.ok) {
        throw new Error(`자동완성 API 응답 실패: ${unifiedResponse.status}`);
      }
      
      const unifiedData: UnifiedAutocompleteResponse = await unifiedResponse.json();
      console.log('🔥 자동완성 API 응답:', unifiedData);
      
      const suggestions: Suggestion[] = [];
      
      if (unifiedData.suggestions) {
        unifiedData.suggestions.forEach((item: any, index: number) => {
          suggestions.push({
            id: item.id || `${item.type}_${index}`,
            type: item.type || 'artist',
            artist: item.artist || item.display,
            track: item.track || null,
            display: item.display || item.artist,
            matched_text: item.matched_text || item.display,
            score: item.score || (100 - index),
            chart_count: item.chart_count,
            best_rank: item.best_rank
          });
        });
      }
      
      setSuggestions(suggestions);
      console.log('🔥 최종 자동완성 결과:', suggestions);
      
    } catch (error) {
      console.error('🚨 자동완성 에러:', error);
      setSuggestions([]);
      // 오류 시 폴백 제안
      const fallbackSuggestion: Suggestion = {
        id: 'fallback',
        type: 'artist',
        artist: searchQuery,
        track: null,
        display: `"${searchQuery}" 검색하기`,
        matched_text: searchQuery,
        score: 0
      };
      setSuggestions([fallbackSuggestion]);
    } finally {
      setLoading(false);
    }
  };

  // debounced 함수
  const debouncedFetch = useCallback(
    debounce((searchQuery: string) => {
      fetchSuggestions(searchQuery);
    }, 300),
    []
  );

  // 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    debouncedFetch(value);
  };

  // 자동완성 항목 선택
  const handleSelect = useCallback((suggestion: Suggestion) => {
    console.log('🔥 선택된 항목:', suggestion);
    
    try {
      // 🎯 자동완성 클릭 → 아티스트 상세 페이지
      const artistPath = `/artist/${encodeURIComponent(suggestion.artist)}`;
      console.log('🎯 아티스트 상세 페이지로 이동:', artistPath);
      router.push(artistPath);
    } catch (error) {
      console.error('🚨 페이지 이동 중 오류:', error);
      const fallbackPath = `/artist/${encodeURIComponent(suggestion.artist)}`;
      router.push(fallbackPath);
    }
    
    setShowSuggestions(false);
    setQuery('');
  }, [router]);

  // 🔧 수정된 검색 실행 함수 - 엔터키 → 무조건 아티스트 페이지
  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query.trim();
    if (!queryToSearch) return;

    console.log('🎯 엔터키 검색 - 아티스트 페이지로 이동:', queryToSearch);
    setSearchLoading(true);
    
    try {
      // 🎯 엔터키 → 무조건 아티스트 상세 페이지로 이동
      const artistPath = `/artist/${encodeURIComponent(queryToSearch)}`;
      console.log('🔥 아티스트 상세 페이지로 이동:', artistPath);
      router.push(artistPath);
      
      setShowSuggestions(false);
      setQuery('');
      
    } catch (error) {
      console.error('🚨 검색 페이지 이동 중 오류:', error);
      // 오류 시에도 아티스트 페이지로 시도
      router.push(`/artist/${encodeURIComponent(queryToSearch)}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // 🎯 자동완성 항목 선택 → 아티스트 페이지
        handleSelect(suggestions[selectedIndex]);
      } else if (query.trim()) {
        // 🎯 엔터로 검색 → 아티스트 페이지 (수정됨!)
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 아이콘 렌더링
  const renderIcon = (type: string) => {
    if (type === 'artist') {
      return <FaUser className="w-5 h-5 text-purple-500" />;
    } else if (type === 'track') {
      return <FaMusic className="w-5 h-5 text-blue-500" />;
    } else {
      return <FaSearch className="w-5 h-5 text-gray-500" />;
    }
  };

  // 하이라이트 텍스트
  const highlightText = (text: string, highlight: string) => {
    if (!text || !highlight) return text || '';
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={index} className="bg-yellow-200 font-bold">{part}</span>
        : part
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      {/* 🔍 검색 입력창 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder="아티스트 검색 (헌트릭스, 뷔, 사자보이즈, BLACKPINK...)"
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     text-lg placeholder-gray-500 bg-white shadow-sm"
        />
        
        {(loading || searchLoading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
          </div>
        )}
      </div>

      {/* 🎯 자동완성 드롭다운 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`px-4 py-3 cursor-pointer flex items-center space-x-3 hover:bg-gray-50 
                         ${index === selectedIndex ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}
              onClick={() => handleSelect(suggestion)}
            >
              {/* 아이콘 */}
              <div className="flex-shrink-0">
                {renderIcon(suggestion.type)}
              </div>
              
              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {highlightText(suggestion.display, query)}
                </div>
                
                {suggestion.chart_count && (
                  <div className="text-xs text-gray-500">
                    {suggestion.chart_count}개 차트에서 활동 중
                    {suggestion.best_rank && ` • 최고 ${suggestion.best_rank}위`}
                  </div>
                )}
              </div>
              
              {/* 타입 배지 */}
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                ${suggestion.type === 'artist' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'}`}>
                  {suggestion.type === 'artist' ? '아티스트' : '곡'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 사용법 안내 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        💡 엔터키 또는 클릭 → 아티스트 상세 페이지로 이동
      </div>
    </div>
  );
}
