import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSearch, FaMusic, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';

// 🔥 Phase 2 Step 3: 검색 시스템 완전 개편
// 새로운 백엔드 통합 API 응답 구조 완전 지원

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

// 🔥 새로운 통합 자동완성 API 응답 구조
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
  // 레거시 지원
  results?: any[];
  count?: number;
  unified_search?: boolean;
}

export default function UnifiedSearchFixed() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 🔥 완전히 새로운 통합 자동완성 API 호출 함수
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // 🎯 통합 자동완성 API 사용
      const unifiedUrl = `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(searchQuery)}&limit=10`;
      console.log('🔥 통합 자동완성 API 호출:', unifiedUrl);
      
      const unifiedResponse = await fetch(unifiedUrl);
      if (!unifiedResponse.ok) {
        throw new Error(`자동완성 API 응답 실패: ${unifiedResponse.status}`);
      }
      
      const unifiedData: UnifiedAutocompleteResponse = await unifiedResponse.json();
      console.log('🔥 통합 자동완성 API 응답:', unifiedData);
      
      const suggestions: Suggestion[] = [];
      
      // 🎯 새로운 통합 API 응답 구조 처리
      if (unifiedData.data_source && unifiedData.suggestions) {
        console.log('✅ 통합 데이터소스 자동완성 감지:', unifiedData.data_source);
        
        unifiedData.suggestions.forEach((item: any, index: number) => {
          suggestions.push({
            id: item.id || `${item.type}_${index}`,
            type: item.type,  // 'artist' 또는 'track'
            artist: item.artist,
            track: item.track || null,
            display: item.display,
            matched_text: item.matched_text || item.name || item.display,
            score: item.score || (100 - index),
            chart_count: item.chart_count,
            best_rank: item.best_rank
          });
        });
      }
      // 기존 레거시 API 응답 구조 지원
      else if (unifiedData.suggestions) {
        console.log('✅ 레거시 자동완성 구조 감지');
        
        unifiedData.suggestions.forEach((item: any, index: number) => {
          suggestions.push({
            id: item.id || `${item.type}_${index}`,
            type: item.type,
            artist: item.artist,
            track: item.track || null,
            display: item.display,
            matched_text: item.matched_text || item.name || item.display,
            score: item.score || (100 - index),
            chart_count: item.chart_count,
            best_rank: item.best_rank
          });
        });
      }
      // 간단한 배열 응답 처리
      else if (unifiedData.results && Array.isArray(unifiedData.results)) {
        console.log('✅ 간단한 배열 응답 처리');
        
        unifiedData.results.forEach((item: any, index: number) => {
          suggestions.push({
            id: `item_${index}`,
            type: item.type || 'artist',
            artist: item.artist || item.name || item.display,
            track: item.track || null,
            display: item.display || item.name || item.artist,
            matched_text: item.matched_text || item.name || item.display,
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
      // 오류 시에도 사용자에게 검색 옵션 제공
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

  // 🎯 곡 클릭 시 바로 곡 상세 페이지로 이동 (사용자 요구사항)
  const handleSelect = useCallback((suggestion: Suggestion) => {
    console.log('🔥 선택된 항목:', suggestion);
    
    try {
      if (suggestion.type === 'artist') {
        // 🎯 아티스트 선택 → 아티스트 상세 페이지 (기존 유지)
        const artistPath = `/artist/${encodeURIComponent(suggestion.artist)}`;
        console.log('🎯 아티스트 상세 페이지로 이동:', artistPath);
        router.push(artistPath);
      } else if (suggestion.type === 'track' && suggestion.track) {
        // 🎯 트랙 선택 → 곡 상세 페이지로 바로 이동 (사용자 요구사항)
        if (suggestion.artist && suggestion.artist.trim()) {
          // ✅ 아티스트 정보 있음 → 곡 상세 페이지
          const trackPath = `/track/${encodeURIComponent(suggestion.artist)}/${encodeURIComponent(suggestion.track)}`;
          console.log('🎯 곡 상세 페이지로 바로 이동:', trackPath);
          router.push(trackPath);
        } else {
          // 🚨 아티스트 정보 없음 → 자동완성에서 아티스트 찾아서 매칭 시도
          const artistFromSuggestions = suggestions.find(s => 
            s.type === 'artist' && s.artist && s.artist.trim()
          );
          
          if (artistFromSuggestions) {
            const trackPath = `/track/${encodeURIComponent(artistFromSuggestions.artist)}/${encodeURIComponent(suggestion.track)}`;
            console.log('🎯 아티스트 매칭 성공, 곡 상세 페이지로 이동:', trackPath);
            router.push(trackPath);
          } else {
            // 최후 수단: 검색 페이지로
            console.log('⚠️ 아티스트 매칭 실패, 검색 페이지로 이동');
            router.push(`/search?q=${encodeURIComponent(suggestion.track)}`);
          }
        }
      } else {
        // 🎯 기본 검색 결과 페이지 (기존 유지)
        const searchPath = `/search?q=${encodeURIComponent(suggestion.display)}`;
        console.log('🎯 기본 검색 페이지로 이동:', searchPath);
        router.push(searchPath);
      }
    } catch (error) {
      console.error('🚨 페이지 이동 중 오류:', error);
      const fallbackPath = `/search?q=${encodeURIComponent(suggestion.display)}`;
      router.push(fallbackPath);
    }
    
    // 🚨 상태 완전 초기화 (기존 유지)
    setShowSuggestions(false);
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
  }, [router, suggestions]);

  // 🔥 완전히 수정된 스마트 검색 실행 함수 - 곡 상세 페이지 이동 수정
  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query.trim();
    if (!queryToSearch) return;

    console.log('🔥 스마트 검색 실행:', queryToSearch);
    setSearchLoading(true);
    
    try {
      // 🔥 실시간 자동완성으로 아티스트/곡 확인 (상태 의존성 제거)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const autocompleteUrl = `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(queryToSearch)}&limit=10`;
      
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
      
      // 정확한 매칭 확인 - 아티스트와 곡 모두 체크 + 빈 artist 필드 처리
      const exactArtistMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'artist' && 
        s.artist.toLowerCase() === queryToSearch.toLowerCase()
      );
      
      const exactTrackMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'track' && 
        s.track && s.track.toLowerCase() === queryToSearch.toLowerCase()
      );
      
      const similarArtistMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'artist' && 
        (s.artist.toLowerCase().includes(queryToSearch.toLowerCase()) ||
         queryToSearch.toLowerCase().includes(s.artist.toLowerCase()))
      );
      
      const similarTrackMatch = realTimeSuggestions.find((s: any) => 
        s.type === 'track' && s.track &&
        (s.track.toLowerCase().includes(queryToSearch.toLowerCase()) ||
         queryToSearch.toLowerCase().includes(s.track.toLowerCase()))
      );
      
      // 🔥 특별 처리: 트랙 매칭에서 artist가 비어있으면 동일한 suggestions에서 아티스트 찾기
      const fixTrackMatch = (trackMatch: any) => {
        if (!trackMatch || trackMatch.artist) return trackMatch;
        
        console.log('🚨 트랙 매칭에서 artist 필드 비어있음:', trackMatch);
        
        // 동일한 자동완성 결과에서 아티스트 찾기
        const artistFromSuggestions = realTimeSuggestions.find((s: any) => 
          s.type === 'artist' && s.artist && s.artist.trim()
        );
        
        if (artistFromSuggestions) {
          console.log('✅ 빈 artist 필드 수정:', trackMatch.track, '+ 아티스트:', artistFromSuggestions.artist);
          return {
            ...trackMatch,
            artist: artistFromSuggestions.artist
          };
        }
        
        console.log('⚠️ 아티스트 매칭 실패, 범용 검색으로 대체');
        return trackMatch;
      };
      
      const fixedExactTrackMatch = fixTrackMatch(exactTrackMatch);
      const fixedSimilarTrackMatch = fixTrackMatch(similarTrackMatch);
      
      // 🎯 곡 우선 라우팅 - 곡 상세 페이지로 바로 이동 (사용자 요구사항)
      if (exactTrackMatch) {
        // 🎯 정확한 곡 매칭: 곡 상세 페이지로 바로 이동
        if (exactTrackMatch.artist && exactTrackMatch.artist.trim()) {
          const trackPath = `/track/${encodeURIComponent(exactTrackMatch.artist)}/${encodeURIComponent(exactTrackMatch.track)}`;
          console.log('🎯 정확한 곡 매칭: 곡 상세 페이지로 이동:', trackPath);
          router.push(trackPath);
        } else {
          // 아티스트 정보가 비어있는 경우 자동완성에서 아티스트 찾기
          const artistFromSuggestions = realTimeSuggestions.find((s: any) => 
            s.type === 'artist' && s.artist && s.artist.trim()
          );
          
          if (artistFromSuggestions) {
            const trackPath = `/track/${encodeURIComponent(artistFromSuggestions.artist)}/${encodeURIComponent(exactTrackMatch.track)}`;
            console.log('🎯 아티스트 매칭 성공: 곡 상세 페이지로 이동:', trackPath);
            router.push(trackPath);
          } else {
            console.log('⚠️ 아티스트 매칭 실패: 검색 페이지로 이돐');
            router.push(`/search?q=${encodeURIComponent(exactTrackMatch.track)}`);
          }
        }
      } else if (exactArtistMatch) {
        // 🎯 정확한 아티스트 매칭: 아티스트 상세 페이지
        const artistPath = `/artist/${encodeURIComponent(exactArtistMatch.artist)}`;
        console.log('🎯 정확한 아티스트 매칭: 아티스트 상세 페이지로 이동:', artistPath);
        router.push(artistPath);
      } else if (similarTrackMatch) {
        // 🎯 비슷한 곡 매칭: 곡 상세 페이지로 바로 이동
        if (similarTrackMatch.artist && similarTrackMatch.artist.trim()) {
          const trackPath = `/track/${encodeURIComponent(similarTrackMatch.artist)}/${encodeURIComponent(similarTrackMatch.track)}`;
          console.log('🎯 비슷한 곡 매칭: 곡 상세 페이지로 이동:', trackPath);
          router.push(trackPath);
        } else {
          // 아티스트 정보가 비어있는 경우 자동완성에서 아티스트 찾기
          const artistFromSuggestions = realTimeSuggestions.find((s: any) => 
            s.type === 'artist' && s.artist && s.artist.trim()
          );
          
          if (artistFromSuggestions) {
            const trackPath = `/track/${encodeURIComponent(artistFromSuggestions.artist)}/${encodeURIComponent(similarTrackMatch.track)}`;
            console.log('🎯 아티스트 매칭 성공: 곡 상세 페이지로 이동:', trackPath);
            router.push(trackPath);
          } else {
            console.log('⚠️ 아티스트 매칭 실패: 검색 페이지로 이돐');
            router.push(`/search?q=${encodeURIComponent(similarTrackMatch.track)}`);
          }
        }
      } else if (similarArtistMatch) {
        // 🎯 비슷한 아티스트 매칭: 아티스트 상세 페이지
        const artistPath = `/artist/${encodeURIComponent(similarArtistMatch.artist)}`;
        console.log('🎯 비슷한 아티스트 매칭: 아티스트 상세 페이지로 이동:', artistPath);
        router.push(artistPath);
      } else {
        // 🎯 매칭이 없으면 범용 검색 결과 페이지
        console.log('🔥 매칭 없음: 범용 검색 페이지로 이동');
        router.push(`/search?q=${encodeURIComponent(queryToSearch)}`);
      }
      
      // 🚨 상태 완전 초기화
      setShowSuggestions(false);
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(-1);
      
    } catch (error) {
      console.error('🚨 검색 페이지 이동 중 오류:', error);
      router.push(`/search?q=${encodeURIComponent(queryToSearch)}`);
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
        // 🎯 자동완성 항목 선택 → 타입에 따라 올바른 페이지로
        handleSelect(suggestions[selectedIndex]);
      } else if (query.trim()) {
        // 🎯 엔터로 일반 검색 → 스마트 라우팅 적용 (안내창 없이)
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

  // 아이콘 렌더링 - 타입별 구분
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
    
    try {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <span key={index} className="font-bold text-blue-600">{part}</span> : 
          part
      );
    } catch (error) {
      console.error('highlightText 오류:', error);
      return text;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="아티스트명 또는 곡명을 검색하세요... (예: BLACKPINK, NewJeans)"
          className="w-full px-4 py-3 pl-12 pr-16 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={searchLoading}
        />
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {/* 🔥 개선된 검색 버튼 - 스마트 라우팅 */}
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim() || searchLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-2 rounded-md transition-colors"
          title="스마트 검색하기"
        >
          {searchLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FaSearch className="w-4 h-4" />
          )}
        </button>
        
        {loading && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* 🔥 완전히 개선된 자동완성 드롭다운 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer flex items-center space-x-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {renderIcon(suggestion.type)}
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {suggestion.type === 'artist' ? (
                    <div>
                      <span className="text-purple-600 dark:text-purple-400">👤 </span>
                      <span className="text-lg">{highlightText(suggestion.artist, query)}</span>
                      {suggestion.chart_count && suggestion.chart_count > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          ({suggestion.chart_count}개 차트)
                        </span>
                      )}
                      {suggestion.best_rank && (
                        <span className="text-sm text-green-600 dark:text-green-400 ml-2">
                          최고 {suggestion.best_rank}위
                        </span>
                      )}
                      <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                        → 아티스트 상세 페이지로 이동
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-blue-600 dark:text-blue-400">🎵 </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{suggestion.artist}</div>
                      <div className="flex items-center">
                        <span className="text-lg">{highlightText(suggestion.track || '', query)}</span>
                        {suggestion.best_rank && (
                          <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                            최고 {suggestion.best_rank}위
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                        → 곡 차트 상세 페이지로 이동
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* 🔥 새로운 기능: 라우팅 타입 표시 */}
              <div className="text-xs text-gray-400 text-right">
                {suggestion.type === 'artist' ? (
                  <div className="flex flex-col items-end">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">아티스트</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">곡</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 개선된 검색 결과 없음 메시지 */}
      {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-3">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm">검색 결과가 없습니다</div>
          </div>
          <button
            onClick={() => handleSearch(query)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            "{query}" 직접 검색하기
          </button>
        </div>
      )}

      {/* 🔥 새로운 기능: 검색 팁 표시 */}
      {showSuggestions && query.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            <div className="font-semibold mb-2">💡 검색 팁</div>
            <div className="space-y-1">
              <div>• 아티스트명: BLACKPINK, NewJeans, BTS</div>
              <div>• 곡명: Pink Venom, Hype Boy, Dynamite</div>
              <div>• 한글도 가능: 블랙핑크, 뉴진스, 방탄소년단</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
