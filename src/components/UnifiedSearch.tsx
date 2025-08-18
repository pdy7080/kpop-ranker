import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  id: string;
  type: 'artist' | 'track' | 'popular';
  artist: string;
  track: string | null;
  display: string;
  matched_text: string;
  score: number;
}

interface UnifiedSearchProps {
  initialQuery?: string;
}

export default function UnifiedSearch({ initialQuery = '' }: UnifiedSearchProps) {
  const router = useRouter();
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/autocomplete/unified?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
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

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === 'artist') {
      router.push(`/artist/${encodeURIComponent(suggestion.artist)}`);
    } else if (suggestion.track) {
      router.push(`/track/${encodeURIComponent(suggestion.artist)}/${encodeURIComponent(suggestion.track)}`);
    } else {
      handleSearch(suggestion.display);
    }
  };

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
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
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
          placeholder="아티스트, 트랙 검색..."
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

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full glass-card rounded-2xl overflow-hidden z-50"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-6 py-4 cursor-pointer transition-all flex items-center gap-3
                  ${selectedIndex === index ? 'bg-white/20' : 'hover:bg-white/10'}
                  ${index > 0 ? 'border-t border-white/10' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${suggestion.type === 'artist' 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                    : suggestion.type === 'track'
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                  <span className="text-xs">
                    {suggestion.type === 'artist' ? '👤' : suggestion.type === 'track' ? '🎵' : '⭐'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {suggestion.display}
                  </div>
                  {suggestion.score && (
                    <div className="text-xs text-white/60 mt-1">
                      관련도: {suggestion.score}%
                    </div>
                  )}
                </div>
                {suggestion.type === 'popular' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                    인기
                  </span>
                )}
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