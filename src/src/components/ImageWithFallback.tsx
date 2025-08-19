import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  artistName?: string;
  trackName?: string;
  priority?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  fill = false,
  artistName = '',
  trackName = '',
  priority = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Enhanced SVG placeholder with gradient and animation
  const generatePlaceholder = (text: string = '🎵') => {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9333EA;stop-opacity:1">
              <animate attributeName="stop-color" values="#9333EA;#EC4899;#3B82F6;#9333EA" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1">
              <animate attributeName="stop-color" values="#EC4899;#3B82F6;#9333EA;#EC4899" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)" opacity="0.2"/>
        <rect width="${width}" height="${height}" fill="#0A0A0F"/>
        <circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height) * 0.3}" fill="url(#grad)" opacity="0.3" filter="url(#blur)">
          <animate attributeName="r" values="${Math.min(width, height) * 0.3};${Math.min(width, height) * 0.35};${Math.min(width, height) * 0.3}" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="${Math.min(width, height) * 0.25}" fill="white" text-anchor="middle" dy="0.35em" opacity="0.8">${text}</text>
      </svg>`
    );
  };

  const DEFAULT_PLACEHOLDER = generatePlaceholder();

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    
    // API URL 결정
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    let imageUrl = '';
    
    // src가 이미 완전한 URL인 경우
    if (src && src.startsWith('http')) {
      imageUrl = src;
    }
    // src가 /api로 시작하는 경우 (상대 경로)
    else if (src && src.startsWith('/api')) {
      // 프로덕션에서는 절대 경로로 변환
      imageUrl = `${baseUrl}${src}`;
    }
    // artistName과 trackName이 있는 경우
    else if (artistName && trackName) {
      // album-image-smart를 사용 (Smart Resolver 활용)
      imageUrl = `${baseUrl}/api/album-image-smart/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`;
    }
    // src가 상대 경로인 경우
    else if (src) {
      imageUrl = src.startsWith('/') ? `${baseUrl}${src}` : src;
    }
    
    setCurrentSrc(imageUrl || DEFAULT_PLACEHOLDER);
  }, [src, artistName, trackName]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    // Silent error handling - no console logging in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Image load error:', currentSrc);
    }
    
    // Try fallback strategies
    if (!hasError && artistName) {
      // First fallback: try with just artist name
      const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/album-image-smart/${encodeURIComponent(artistName)}/default`;
      setCurrentSrc(fallbackUrl);
      setHasError(true);
    } else {
      // Final fallback: use placeholder
      setCurrentSrc(generatePlaceholder(artistName ? artistName[0].toUpperCase() : '🎵'));
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden bg-black/50 ${className}`}
      style={{ 
        width: fill ? '100%' : width, 
        height: fill ? '100%' : height 
      }}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : hasError ? 'opacity-70' : 'opacity-100'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {hasError && !isLoading && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-50">🎵</div>
            <div className="text-xs text-gray-400 px-2">{alt}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageWithFallback;