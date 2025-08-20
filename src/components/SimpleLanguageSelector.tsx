import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaCheck } from 'react-icons/fa';

interface Language {
  code: string;
  flag: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어' },
  { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
];

const SimpleLanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ko');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'ko';
    setCurrentLang(savedLang);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    localStorage.setItem('selectedLanguage', langCode);
    setCurrentLang(langCode);
    document.cookie = `selectedLanguage=${langCode}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg 
                   bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 
                   dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Language selector"
      >
        <FaGlobe className="text-gray-600 dark:text-gray-400" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.nativeName}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg 
                     bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 
                     overflow-hidden z-50"
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full px-4 py-2 text-left flex items-center justify-between
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                    ${currentLang === lang.code ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {currentLang === lang.code && (
                    <FaCheck className="text-purple-600 dark:text-purple-400 text-sm" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleLanguageSelector;