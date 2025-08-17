import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSearch, FaMusic, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { toast } from 'react-hot-toast';

interface Suggestion {
  id: string;
  type: 'artist' | 'track' | 'popular';
  artist: string;
  artist_normalized?: string;  // 🎯 추가
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

export default function UnifiedSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // API 호출 - 실제 백엔드 DB 기반 검색만 사용
  const fetchSuggestions = async (searchQuery: string) => {
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
              artist_normalized: item.artist_normalized || item.normalized,  // 🎯 추가
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
              artist_normalized: item.artist_normalized || item.normalized,  // 🎯 추가
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
          
          // 검색 결과에서 발견된 트랙들을 자동완성에 추가
          if (searchData.charts) {
            const foundTracks = new Set();
            Object.values(searchData.charts).forEach((chart: any) => {
              if (chart.found && chart.track && chart.artist) {
                const trackKey = `${chart.artist}-${chart.track}`;
                if (!foundTracks.has(trackKey)) {
                  foundTracks.add(trackKey);
                  suggestions.push({
                    id: `track_${chart.artist}_${chart.track}`,
                    type: 'track',
                    artist: chart.artist,
                    artist_normalized: chart.artist_normalized,  // 🎯 추가
                    track: chart.track,
                    display: `${chart.artist} - ${chart.track}`,
                    matched_text: chart.track,
                    score: 90 - (chart.rank || 0),
                    chart: chart.chart,
                    rank: chart.rank
                  });
                }
              }
            });
          }
        }
      } catch (trackError) {
        console.log('트랙 검색 중 오류 (무시):', trackError);
      }
      
      // 점수 순으로 정렬하여 최종 결과 설정
      suggestions.sort((a, b) => b.score - a.score);
      setSuggestions(suggestions.slice(0, 10));
      
      console.log('최종 자동완성 결과:', suggestions.slice(0, 10));
      
    } catch (error) {
      console.error('자동완성 에러:', error);
      setSuggestions([]); // 에러 시 빈 배열 (더미 데이터 사용하지 않음)
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

  // 검색 실행 함수 - 🎯 수정: 타입에 따라 다른 페이지로 이동
  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query.trim();
    if (!queryToSearch) return;

    console.log('검색 실행:', queryToSearch);
    setSearchLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // 한글 아티스트명 매핑 체크
      const koreanToEnglish: Record<string, string> = {
        '르세라핌': 'LE SSERAFIM',
        '뉴진스': 'NewJeans',
        '에스파': 'aespa',
        '블랙핑크': 'BLACKPINK',
        '아이브': 'IVE',
        '세븐틴': 'SEVENTEEN',
        '아이유': 'IU',
        '트와이스': 'TWICE',
        '있지': 'ITZY',
        '스테이씨': 'STAYC',
        '엔하이픈': 'ENHYPEN',
        '스트레이키즈': 'Stray Kids',
        '에이티즈': 'ATEEZ',
        '트레저': 'TREASURE',
        '피프티피프티': 'FIFTY FIFTY',
        '데이식스': 'DAY6',
        '키스오브라이프': 'KISS OF LIFE',
        '투모로우바이투게더': 'TXT',
        '방탄소년단': 'BTS',
        '엔시티': 'NCT',
        '엔시티드림': 'NCT DREAM',
        '엔믹스': 'NMIXX',
        '케플러': 'Kep1er',
        '라이즈': 'RIIZE',
        '제로베이스원': 'ZEROBASEONE',
        '보이넥스트도어': 'BOYNEXTDOOR'
      };
      
      // 한글 아티스트명이면 바로 아티스트 페이지로
      if (koreanToEnglish[queryToSearch]) {
        const englishName = koreanToEnglish[queryToSearch];
        console.log(`한글 아티스트 감지: ${queryToSearch} -> ${englishName}`);
        await router.push(`/artist/${encodeURIComponent(englishName)}`);
        setShowSuggestions(false);
        setQuery('');
        setSearchLoading(false);
        return;
      }
      
      // 1. 먼저 자동완성 API로 타입 확인
      const checkUrl = `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(queryToSearch)}&limit=5`;
      const response = await fetch(checkUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          // 정확히 일치하는 것 찾기
          for (const suggestion of data.suggestions) {
            // 아티스트 타입이고 이름이 일치하면
            if (suggestion.type === 'artist') {
              // name, original, artist, display 순서로 확인
              const artistName = suggestion.name || suggestion.original || suggestion.artist || suggestion.display;
              
              if (artistName && 
                  (artistName.toLowerCase() === queryToSearch.toLowerCase() ||
                   suggestion.display?.toLowerCase() === queryToSearch.toLowerCase())) {
                console.log(`아티스트 매칭: ${queryToSearch} -> ${artistName}`);
                await router.push(`/artist/${encodeURIComponent(artistName)}`);
                setShowSuggestions(false);
                setQuery('');
                return;
              }
            }
            // 트랙 타입이고 곡명이 일치하면
            if (suggestion.type === 'track' && suggestion.artist && suggestion.track) {
              if (suggestion.track.toLowerCase() === queryToSearch.toLowerCase() ||
                  suggestion.display?.toLowerCase().includes(queryToSearch.toLowerCase())) {
                console.log(`트랙 매칭: ${queryToSearch} -> ${suggestion.artist} - ${suggestion.track}`);
                await router.push(`/track/${encodeURIComponent(suggestion.artist)}/${encodeURIComponent(suggestion.track)}`);
                setShowSuggestions(false);
                setQuery('');
                return;
              }
            }
          }
        }
      }
      
      // 2. 자동완성에 없으면 일반 검색 API로 확인
      const searchUrl = `${apiUrl}/api/search?q=${encodeURIComponent(queryToSearch)}`;
      const searchResponse = await fetch(searchUrl);
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        // 검색 결과가 있는지 확인
        if (searchData.results && searchData.results.length > 0) {
          // 차트별 결과가 있는 경우
          const firstResult = searchData.results[0];
          if (firstResult.tracks && firstResult.tracks.length > 0) {
            const firstTrack = firstResult.tracks[0];
            
            // 아티스트명과 일치하면 아티스트 페이지로
            if (firstTrack.artist?.toLowerCase() === queryToSearch.toLowerCase()) {
              await router.push(`/artist/${encodeURIComponent(firstTrack.artist)}`);
              setShowSuggestions(false);
              setQuery('');
              return;
            }
            
            // 곡명과 일치하면 트랙 페이지로
            if (firstTrack.track?.toLowerCase() === queryToSearch.toLowerCase()) {
              await router.push(`/track/${encodeURIComponent(firstTrack.artist)}/${encodeURIComponent(firstTrack.track)}`);
              setShowSuggestions(false);
              setQuery('');
              return;
            }
          }
          
          // 일치하는 것이 없으면 검색 결과 페이지로
          await router.push(`/search?q=${encodeURIComponent(queryToSearch)}`);
        } else {
          // 검색 결과가 없으면 알림
          toast.error('검색 결과가 없습니다. 다시 검색해주세요.');
        }
      } else {
        // API 오류 시 기본 검색 페이지로
        await router.push(`/search?q=${encodeURIComponent(queryToSearch)}`);
      }
      
      setShowSuggestions(false);
      setQuery('');
      
    } catch (error) {
      console.error('검색 중 오류:', error);
      // 오류 발생 시도 기본 검색 페이지로
      await router.push(`/search?q=${encodeURIComponent(queryToSearch)}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // 항목 선택 - 개선된 라우팅
  const handleSelect = useCallback((suggestion: Suggestion) => {
    console.log('handleSelect 호출:', suggestion);
    
    try {
      if (suggestion.type === 'artist') {
        // 아티스트는 아티스트 상세 페이지로 이동
        // 🎯 artist_normalized 우선 사용
        const artistName = suggestion.artist_normalized || suggestion.artist || suggestion.matched_text || suggestion.display;
        const artistPath = `/artist/${encodeURIComponent(artistName)}`;
        console.log('아티스트 상세 페이지로 이동:', artistPath);
        router.push(artistPath);
      } else if (suggestion.type === 'track' || suggestion.type === 'popular') {
        // 트랙은 트랙 상세 페이지로 이동
        // 🎯 artist_normalized 우선 사용
        const artistForRoute = suggestion.artist_normalized || suggestion.artist;
        const trackPath = `/track/${encodeURIComponent(artistForRoute)}/${encodeURIComponent(suggestion.track || '')}`;
        console.log('트랙 상세 페이지로 이동:', trackPath);
        router.push(trackPath);
      } else {
        // 기본적으로 검색 페이지로 이동
        const defaultPath = `/search?q=${encodeURIComponent(suggestion.display)}`;
        console.log('기본 검색 페이지로 이동:', defaultPath);
        router.push(defaultPath);
      }
    } catch (error) {
      console.error('페이지 이동 중 오류:', error);
      // 오류 발생 시 기본 검색 페이지로 이동
      router.push(`/search?q=${encodeURIComponent(suggestion.display)}`);
    }
    
    setShowSuggestions(false);
    setQuery('');
  }, [router]);

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
        handleSelect(suggestions[selectedIndex]);
      } else if (query.trim()) {
        // 🎯 수정: 엔터 키는 검색 결과 페이지로
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
    } else {
      return <FaMusic className="w-5 h-5 text-blue-500" />;
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
          placeholder="아티스트명 또는 곡명을 검색하세요..."
          className="w-full px-4 py-3 pl-12 pr-16 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={searchLoading}
        />
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {/* 🎯 수정: 검색 버튼 - 검색 결과 페이지로 */}
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim() || searchLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-2 rounded-md transition-colors"
          title="검색하기"
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

      {/* 자동완성 드롭다운 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer flex items-center space-x-3 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {renderIcon(suggestion.type)}
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {suggestion.type === 'artist' ? (
                    <div>
                      <span>{highlightText(suggestion.artist, query)}</span>
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
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{suggestion.artist}</div>
                      <div className="flex items-center">
                        {highlightText(suggestion.track || '', query)}
                        {suggestion.rank && (
                          <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                            {suggestion.chart} {suggestion.rank}위
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {suggestion.type === 'popular' && (
                  <span className="text-xs text-orange-500 ml-2">인기</span>
                )}
              </div>
              {suggestion.year && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{suggestion.year}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}