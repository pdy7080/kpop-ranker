import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { searchApi } from '@/lib/api'; // ✅ named export 사용

// API 응답에서 실제로 쓰는 필드 반영
interface SearchSuggestion {
  type: 'artist' | 'track';
  query?: string;
  official?: string;
  score?: number;
  artist?: string;
  track?: string;
  display?: string;
  artist_normalized?: string;
}

interface SmartSearchBoxProps {
  onSearch?: (artist: string, track: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'normal' | 'large';
}

const SmartSearchBox: React.FC<SmartSearchBoxProps> = ({
  onSearch, // ✅ null 기본값 제거
  placeholder = '아티스트와 곡명을 아무렇게나 입력하세요 (예: 뉴진스 하입보이, 방탄 버터)',
  className = '',
  size = 'normal',
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

  // 검색 예시
  const searchExamples = [
    { text: '뉴진스 하입보이', artist: 'NewJeans', track: 'Hype Boy' },
    { text: '방탄 버터', artist: 'BTS', track: 'Butter' },
    { text: '블핑 뚜두뚜두', artist: 'BLACKPINK', track: 'DDU-DU DDU-DU' },
    { text: '아이브 러다', artist: 'IVE', track: 'Love Dive' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery) {
      toast.error('검색어를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      // 0) 한글 아티스트 바로 매핑
      const koreanToEnglish: Record<string, string> = {
        르세라핌: 'LE SSERAFIM',
        뉴진스: 'NewJeans',
        에스파: 'aespa',
        블랙핑크: 'BLACKPINK',
        아이브: 'IVE',
        세븐틴: 'SEVENTEEN',
        아이유: 'IU',
        트와이스: 'TWICE',
        있지: 'ITZY',
        스테이씨: 'STAYC',
        엔하이픈: 'ENHYPEN',
        스트레이키즈: 'Stray Kids',
        에이티즈: 'ATEEZ',
        트레저: 'TREASURE',
        피프티피프티: 'FIFTY FIFTY',
        데이식스: 'DAY6',
        키스오브라이프: 'KISS OF LIFE',
        투모로우바이투게더: 'TXT',
        방탄소년단: 'BTS',
        엔시티: 'NCT',
        엔시티드림: 'NCT DREAM',
        엔믹스: 'NMIXX',
        케플러: 'Kep1er',
        라이즈: 'RIIZE',
        제로베이스원: 'ZEROBASEONE',
        헌트릭스: "HUNTR",
        보이넥스트도어: 'BOYNEXTDOOR',
      };
      if (koreanToEnglish[trimmedQuery]) {
        const englishName = koreanToEnglish[trimmedQuery];
        if (onSearch) onSearch(englishName, '');
        else await router.push(`/artist/${encodeURIComponent(englishName)}`);
        setQuery('');
        return;
      }

      // 1) 자동완성으로 우선 판별 (프록시 경유: /api/*)
      const ac = await searchApi.autocomplete(trimmedQuery);
      if (ac?.suggestions?.length) {
        for (const suggestion of ac.suggestions as SearchSuggestion[]) {
          if (
            suggestion.type === 'artist' &&
            (suggestion.artist?.toLowerCase() === trimmedQuery.toLowerCase() ||
              suggestion.display?.toLowerCase() === trimmedQuery.toLowerCase())
          ) {
            const artistForRoute =
              suggestion.artist_normalized || suggestion.artist || trimmedQuery;
            if (onSearch) onSearch(artistForRoute, '');
            else await router.push(`/artist/${encodeURIComponent(artistForRoute)}`);
            setQuery('');
            return;
          }
          if (
            suggestion.type === 'track' &&
            (suggestion.track?.toLowerCase() === trimmedQuery.toLowerCase() ||
              suggestion.display?.toLowerCase().includes(trimmedQuery.toLowerCase()))
          ) {
            const artistForRoute =
              suggestion.artist_normalized || suggestion.artist || '';
            if (onSearch) onSearch(artistForRoute, suggestion.track || '');
            else
              await router.push(
                `/track/${encodeURIComponent(artistForRoute)}/${encodeURIComponent(
                  suggestion.track || ''
                )}`
              );
            setQuery('');
            return;
          }
        }
      }

      // 2) 일반 검색
      const searchData = await searchApi.search(trimmedQuery);
      if (searchData?.results?.length) {
        const first = searchData.results[0];
        const firstTrack = first?.tracks?.[0];
        if (firstTrack) {
          if (firstTrack.artist?.toLowerCase() === trimmedQuery.toLowerCase()) {
            const artistForRoute =
              firstTrack.artist_normalized || firstTrack.artist;
            if (onSearch) onSearch(artistForRoute, '');
            else await router.push(`/artist/${encodeURIComponent(artistForRoute)}`);
            setQuery('');
            return;
          }
          if (firstTrack.track?.toLowerCase() === trimmedQuery.toLowerCase()) {
            const artistForRoute =
              firstTrack.artist_normalized || firstTrack.artist || '';
            if (onSearch) onSearch(artistForRoute, firstTrack.track || '');
            else
              await router.push(
                `/track/${encodeURIComponent(artistForRoute)}/${encodeURIComponent(
                  firstTrack.track || ''
                )}`
              );
            setQuery('');
            return;
          }
        }
        // 검색 결과 페이지로
        if (onSearch) onSearch(trimmedQuery, '');
        else await router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      } else {
        toast.error('검색 결과가 없습니다. 다시 검색해주세요.');
      }
    } catch (err) {
      console.error('검색 중 오류:', err);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleExampleClick = (example: (typeof searchExamples)[0]) => {
    setQuery(example.text);
    if (!onSearch) {
      router.push(
        `/track/${encodeURIComponent(example.artist)}/${encodeURIComponent(
          example.track
        )}`
      );
    } else {
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
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const suggestion = suggestions[selectedIndex];
      // TODO: Handle suggestion selection
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

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

  const sizeClasses =
    size === 'large' ? 'h-14 text-lg pl-14 pr-12' : 'h-12 text-base pl-12 pr-10';

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FaSearch
            className={`absolute left-4 ${size === 'large' ? 'top-4' : 'top-3.5'} text-gray-400 ${size === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`}
          />
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
                오타나 줄임말도 정확히 찾아드려요!
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
                      "{example.text}" → {example.artist} - {example.track}
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
                onClick={() => {/* TODO */}}
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

export default SmartSearchBox;
