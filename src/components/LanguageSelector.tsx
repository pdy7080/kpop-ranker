import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaCheck } from 'react-icons/fa';
import { useTranslation } from '@/contexts/TranslationContext';

interface Language {
  code: 'ko' | 'en' | 'ja' | 'zh';
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

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

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

  const handleLanguageChange = (langCode: 'ko' | 'en' | 'ja' | 'zh') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg 
                   bg-gray-800/50 hover:bg-gray-700/50 
                   transition-all duration-200 border border-gray-700"
        aria-label="Language selector"
      >
        <FaGlobe className="text-gray-400" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:block text-sm font-medium text-gray-300">
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
            className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl 
                     bg-gray-900 border border-gray-700 overflow-hidden z-50"
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full px-4 py-2 text-left flex items-center justify-between
                    hover:bg-gray-800 transition-colors
                    ${language === lang.code ? 'bg-purple-900/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-100">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {language === lang.code && (
                    <FaCheck className="text-purple-400 text-sm" />
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

export default LanguageSelector;