import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaSearch, FaMusic, FaUser } from 'react-icons/fa';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';

interface Suggestion {
  type: 'artist' | 'track';
  artist?: string;
  track?: string;
  name?: string;
  display: string;
  track_count?: number;
}

interface UnifiedSearchProps {
  initialQuery?: string;
}

export default function UnifiedSearch({ initialQuery = '' }: UnifiedSearchProps) {
  const router = useRouter();
  const { t } = useTranslation();
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(
          `${apiUrl}/api/autocomplete/unified?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 자동완성 응답:', data);
        
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('자동완성 에러:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'artist' && suggestion.name) {
      router.push(`/artist/${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === 'track' && suggestion.artist && suggestion.track) {
      router.push(`/track/${encodeURIComponent(suggestion.artist)}/${encodeURIComponent(suggestion.track)}`);
    } else {
      // 검색 페이지로 이동
      router.push(`/search?q=${encodeURIComponent(suggestion.display)}`);
    }
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder="아티스트, 트랙 검색..."
          className="w-full px-4 py-3 pl-12 pr-12 text-lg bg-gray-800/80 backdrop-blur-sm
                     border border-gray-600/30 rounded-xl
                     text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     transition-all duration-200"
        />
        
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 
                           text-gray-400 w-5 h-5" />
        
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
          </div>
        )}
      </form>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-gray-800/95 backdrop-blur-sm
                       border border-gray-600/30 rounded-xl shadow-2xl
                       max-h-96 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150
                          ${selectedIndex === index 
                            ? 'bg-purple-500/20 border-l-4 border-purple-500' 
                            : 'hover:bg-gray-700/50'
                          }
                          ${index === 0 ? 'rounded-t-xl' : ''}
                          ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}
                          border-b border-gray-600/20`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-3">
                  {suggestion.type === 'artist' ? (
                    <FaUser className="text-blue-400 w-4 h-4 flex-shrink-0" />
                  ) : (
                    <FaMusic className="text-green-400 w-4 h-4 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {suggestion.display}
                    </div>
                    
                    {suggestion.type === 'artist' && suggestion.track_count && (
                      <div className="text-gray-400 text-sm">
                        {suggestion.track_count}개 트랙
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 uppercase font-mono">
                    {suggestion.type}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
