import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { debounce } from 'lodash';

interface Suggestion {
  original: string;
  display: string;
  best_rank: number;
  chart_count: number;
  preview: string;
}

interface SearchWithAutocompleteProps {
  onSearch: (artist: string, track: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'normal' | 'large';
}

const SearchWithAutocomplete: React.FC<SearchWithAutocompleteProps> = ({ 
  onSearch,
  placeholder = "아티스트명을 입력하세요",
  className = "",
  size = 'normal'
}) => {
  const [artist, setArtist] = useState('');
  const [track, setTrack] = useState('');
  const [artistSuggestions, setArtistSuggestions] = useState<Suggestion[]>([]);
  const [trackSuggestions, setTrackSuggestions] = useState<Suggestion[]>([]);
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);
  const [showTrackDropdown, setShowTrackDropdown] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [loading, setLoading] = useState(false);

  // API URL 설정
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 아티스트 자동완성 API 호출
  const fetchArtistSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 1) {
        setArtistSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/autocomplete/unified?q=${encodeURIComponent(query)}&limit=10`
        );
        const data = await response.json();
        setArtistSuggestions(data.suggestions || []);
        setShowArtistDropdown(true);
      } catch (error) {
        console.error('자동완성 에러:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // 트랙 자동완성 API 호출
  const fetchTrackSuggestions = useCallback(
    debounce(async (artistName: string, query: string) => {
      if (!artistName) {
        setTrackSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/autocomplete/unified?q=${encodeURIComponent(
            artistName + ' ' + query
          )}&limit=10`
        );
        const data = await response.json();
        setTrackSuggestions(data.suggestions || []);
        setShowTrackDropdown(true);
      } catch (error) {
        console.error('트랙 자동완성 에러:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // 아티스트 입력 변경
  useEffect(() => {
    fetchArtistSuggestions(artist);
  }, [artist, fetchArtistSuggestions]);

  // 트랙 입력 변경
  useEffect(() => {
    if (selectedArtist) {
      fetchTrackSuggestions(selectedArtist, track);
    }
  }, [track, selectedArtist, fetchTrackSuggestions]);

  // 아티스트 선택
  const selectArtist = (suggestion: Suggestion) => {
    setArtist(suggestion.display);
    setSelectedArtist(suggestion.original);
    setShowArtistDropdown(false);
    setTrack(''); // 트랙 초기화
    
    // 해당 아티스트의 모든 트랙 표시
    fetchTrackSuggestions(suggestion.original, '');
  };

  // 트랙 선택
  const selectTrack = (suggestion: Suggestion) => {
    setTrack(suggestion.display);
    setSelectedTrack(suggestion.original);
    setShowTrackDropdown(false);
  };

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArtist && track) {
      onSearch(selectedArtist, track);
    }
  };

  const inputSize = size === 'large' ? 'text-lg px-6 py-4' : 'text-base px-4 py-3';

  return (
    <form onSubmit={handleSearch} className={`w-full ${className}`}>
      <div className="space-y-3">
        {/* 아티스트 입력 */}
        <div className="relative">
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            onFocus={() => artist && setShowArtistDropdown(true)}
            placeholder={placeholder}
            className={`w-full ${inputSize} pr-10 bg-white dark:bg-gray-800 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
          />
          
          {/* 아티스트 자동완성 드롭다운 */}
          <AnimatePresence>
            {showArtistDropdown && artistSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
              >
                {artistSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectArtist(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
                  >
                    <div className="font-medium text-white">
                      {suggestion.display}
                    </div>
                    <div className="text-sm text-gray-400">
                      {suggestion.preview}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 트랙 입력 */}
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="relative"
          >
            <input
              type="text"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              onFocus={() => setShowTrackDropdown(true)}
              placeholder="곡명을 입력하세요"
              className={`w-full ${inputSize} pr-10 bg-white dark:bg-gray-800 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
            />
            
            {/* 트랙 자동완성 드롭다운 */}
            <AnimatePresence>
              {showTrackDropdown && trackSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                >
                  {trackSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectTrack(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <div className="font-medium text-white">
                        {suggestion.display}
                      </div>
                      <div className="text-sm text-gray-400">
                        {suggestion.preview}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 검색 버튼 */}
        <button
          type="submit"
          disabled={!selectedArtist || !track || loading}
          className={`w-full ${inputSize} bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2`}
        >
          <FaSearch />
          <span>검색</span>
        </button>
      </div>

      {/* 클릭 외부 영역 처리 */}
      {(showArtistDropdown || showTrackDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowArtistDropdown(false);
            setShowTrackDropdown(false);
          }}
        />
      )}
    </form>
  );
};

export default SearchWithAutocomplete;
