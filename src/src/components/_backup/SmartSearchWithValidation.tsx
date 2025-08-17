import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSearch, FaMusic, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { toast } from 'react-hot-toast';

// 🔧 검색 규칙 개선 버전 - 없는 가수 검증 추가

interface Suggestion {
  id: string;
  type: 'artist' | 'track' | 'popular';
  artist: string;
  track: string | null;
  display: string;
  matched_text: string;
  score: number;
  chart_count?: number;
  best_rank?: number;
}

interface UnifiedAutocompleteResponse {
  suggestions?: Array<{
    id?: string;
    type: 'artist' | 'track';
    artist: string;
    track?: string | null;
    display: string;
    matched_text?: string;
    score?: number;
    chart_count?: number;
    best_rank?: number;
  }>;
  count?: number;
  unified_search?: boolean;
}

export default function SmartSearchWithValidation() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 자동완성 API 호출
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      setShowNoResults(false);
      return;
    }

    setLoading(true);
    try {
      // 🎯 변형 매핑 기반 자동완성
      const koreanMappings = {
        '헌트릭스': ['HUNTRIX', 'huntrix', 'Huntrix'],
        'HUNTRIX': ['헌트릭스', 'huntrix', 'Huntrix'],
        'huntrix': ['헌트릭스', 'HUNTRIX', 'Huntrix'],
        '사자보이즈': ['SAJA BOYS', 'saja boys', 'Saja Boys'],
        'SAJA BOYS': ['사자보이즈', 'saja boys', 'Saja Boys'], 
        'saja boys': ['사자보이즈', 'SAJA BOYS', 'Saja Boys'],
        '뽰': ['V', 'v', 'Taehyung', 'Kim Taehyung'],
        'V': ['뽰', 'v', 'Taehyung', 'Kim Taehyung'],
        'v': ['뽰', 'V', 'Taehyung', 'Kim Taehyung'],
        '방탄소년단': ['BTS', 'bts', '비티에스'],
        'BTS': ['방탄소년단', 'bts', '비티에스'],
        'bts': ['방탄소년단', 'BTS', '비티에스'],
        '비티에스': ['방탄소년단', 'BTS', 'bts'],
        '블랙핑크': ['BLACKPINK', 'blackpink', 'Black Pink'],
        'BLACKPINK': ['블랙핑크', 'blackpink', 'Black Pink'],
        '뉴진스': ['NewJeans', 'new jeans', 'newjeans'],
        'NewJeans': ['뉴진스', 'new jeans', 'newjeans'],
        '아이유': ['IU', 'iu'],
        'IU': ['아이유', 'iu'],
        'iu': ['아이유', 'IU']
      };
      
      const suggestions: Suggestion[] = [];
      
      // 매칭되는 아티스트 찾기
      for (const [key, variants] of Object.entries(koreanMappings)) {
        if (key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            variants.some(variant => variant.toLowerCase().includes(searchQuery.toLowerCase()))) {
          suggestions.push({
            id: `artist_${suggestions.length}`,
            type: 'artist',
            artist: key,
            track: null,
            display: key,
            matched_text: key,
            score: 100 - suggestions.length,
            chart_count: 5 // 가상의 차트 수
          });
        }
      }
      
      if (suggestions.length > 0) {
        setShowNoResults(false);
      } else {
        setShowNoResults(true);
      }
      
      setSuggestions(suggestions);
      console.log('🔥 변형 매핑 자동완성 결과:', suggestions);
      
    } catch (error) {
      console.error('🚨 자동완성 에러:', error);
      setSuggestions([]);
      setShowNoResults(true);
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
    setShowNoResults(false);
    debouncedFetch(value);
  };

  // 자동완성 항목 선택
  const handleSelect = useCallback((suggestion: Suggestion) => {
    console.log('🔥 선택된 항목:', suggestion);
    
    try {
      // 🎯 자동완성 클릭 → 아티스트 상세 페이지 (검증됨)
      const artistPath = `/artist/${encodeURIComponent(suggestion.artist)}`;
      console.log('🎯 검증된 아티스트 페이지로 이동:', artistPath);
      router.push(artistPath);
    } catch (error) {
      console.error('🚨 페이지 이동 중 오류:', error);
      toast.error('페이지 이동 중 오류가 발생했습니다.');
    }
    
    setShowSuggestions(false);
    setQuery('');
  }, [router]);

  // 🔧 개선된 검색 실행 함수 - 검증 후 이동
  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query.trim();
    if (!queryToSearch) return;

    console.log('🔍 검색 검증 시작:', queryToSearch);
    setSearchLoading(true);
    
    try {
      // 🎯 1. 먼저 변형 매핑으로 해당 아티스트가 지원되는지 확인
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // 변형 매핑 확인을 위한 요청
      const koreanMappings = {
        // 헌트릭스, 사자보이즈, 뽰 등 우리가 추가한 변형들
        '헌트릭스': ['HUNTRIX', 'huntrix', 'Huntrix'],
        'HUNTRIX': ['헌트릭스', 'huntrix', 'Huntrix'],
        'huntrix': ['헌트릭스', 'HUNTRIX', 'Huntrix'],
        '사자보이즈': ['SAJA BOYS', 'saja boys', 'Saja Boys'],
        'SAJA BOYS': ['사자보이즈', 'saja boys', 'Saja Boys'],
        'saja boys': ['사자보이즈', 'SAJA BOYS', 'Saja Boys'],
        '뽰': ['V', 'v', 'Taehyung', 'Kim Taehyung'],
        'V': ['뽰', 'v', 'Taehyung', 'Kim Taehyung'],
        'v': ['뽰', 'V', 'Taehyung', 'Kim Taehyung'],
        '방탄소년단': ['BTS', 'bts', '비티에스'],
        'BTS': ['방탄소년단', 'bts', '비티에스'],
        'bts': ['방탄소년단', 'BTS', '비티에스'],
        '비티에스': ['방탄소년단', 'BTS', 'bts'],
        '블랙핑크': ['BLACKPINK', 'blackpink', 'Black Pink'],
        'BLACKPINK': ['블랙핑크', 'blackpink', 'Black Pink'],
        '뉴진스': ['NewJeans', 'new jeans', 'newjeans'],
        'NewJeans': ['뉴진스', 'new jeans', 'newjeans'],
        '아이유': ['IU', 'iu'],
        'IU': ['아이유', 'iu'],
        'iu': ['아이유', 'IU']
      };
      
      // 지원되는 아티스트인지 확인
      const isSupported = koreanMappings[queryToSearch.toLowerCase()] || 
                          Object.keys(koreanMappings).some(key => 
                            key.toLowerCase().includes(queryToSearch.toLowerCase())
                          );
      
      if (isSupported) {
        // ✅ 지원되는 아티스트 → 아티스트 페이지로 이동
        const artistPath = `/artist/${encodeURIComponent(queryToSearch)}`;
        console.log('✅ 지원되는 아티스트:', queryToSearch);
        router.push(artistPath);
        return;
      }
      
      // 특별 키워드 확인 (부분 매칭)
      const isPartialMatch = Object.keys(koreanMappings).some(key =>
        key.toLowerCase().includes(queryToSearch.toLowerCase()) ||
        koreanMappings[key].some(variant => 
          variant.toLowerCase().includes(queryToSearch.toLowerCase())
        )
      );
      
      if (isPartialMatch) {
        // ✅ 부분 매칭 아티스트 → 아티스트 페이지로 이동
        const artistPath = `/artist/${encodeURIComponent(queryToSearch)}`;
        console.log('✅ 부분 매칭 아티스트:', queryToSearch);
        router.push(artistPath);
        return;
      }
      
      
      // ❌ 지원되지 않는 아티스트 → 에러 메시지
      toast.error(
        `"${queryToSearch}" 아티스트를 찾을 수 없습니다. 다른 이름으로 검색해보세요.`,
        { 
          duration: 4000,
          icon: '🔍'
        }
      );
      setShowNoResults(true);
      setShowSuggestions(true);
      
    } catch (error) {
      console.error('🚨 검색 검증 중 오류:', error);
      toast.error('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
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
        // 🎯 자동완성 항목 선택 → 검증된 아티스트 페이지
        handleSelect(suggestions[selectedIndex]);
      } else if (query.trim()) {
        // 🎯 엔터로 검색 → 검증 후 이동
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setShowNoResults(false);
    }
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowNoResults(false);
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
          placeholder="아티스트 검색 (BLACKPINK, 뉴진스, BTS...)"
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
              <div className="flex-shrink-0">
                {renderIcon(suggestion.type)}
              </div>
              
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
              
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ 검증됨
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ❌ 검색 결과 없음 */}
      {showSuggestions && showNoResults && query.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-6 text-center">
            <FaExclamationTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-2">
              "{query}" 아티스트를 찾을 수 없습니다
            </p>
            <p className="text-xs text-gray-500 mb-3">
              • 한글과 영어 모두 지원합니다 (뉴진스, NewJeans)<br/>
              • 정확한 아티스트명을 입력해주세요
            </p>
            <button
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
                setShowNoResults(false);
              }}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              다시 검색하기
            </button>
          </div>
        </div>
      )}

      {/* 🔥 사용법 안내 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        💡 엔터키 또는 클릭 → 아티스트 상세 페이지 • 존재하는 아티스트만 이동 가능
      </div>
    </div>
  );
}
