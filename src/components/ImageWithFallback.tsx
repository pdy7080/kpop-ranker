import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
  artist: string;
  track: string;
  alt?: string;
  className?: string;
  src?: string;  
  width?: number;
  height?: number;
  priority?: boolean;
  shape?: 'square' | 'circle';
  isDetailView?: boolean;
  quality?: 'auto' | 'high' | 'medium' | 'low';
}

const errorCache = new Set<string>();

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist,
  track,
  alt,
  className = '',
  src,
  width,
  height,
  priority = false,
  shape = 'square',
  isDetailView = false,
  quality = 'auto',
}) => {
  const safeArtist = artist || 'Unknown Artist';
  const safeTrack = track || 'Unknown Track';
  
  // 자동 품질 판단
  const getAutoQuality = () => {
    if (isDetailView) return 'high';
    
    // className에서 크기 추정
    if (className.includes('w-16') || className.includes('h-16') || 
        className.includes('w-20') || className.includes('h-20')) {
      return 'medium'; // 64-80px → 중간 해상도
    }
    if (className.includes('w-12') || className.includes('h-12')) {
      return 'low'; // 48px → 기본
    }
    if (width && height) {
      const maxSize = Math.max(width, height);
      if (maxSize >= 200) return 'high';
      if (maxSize >= 80) return 'medium';
      return 'low';
    }
    return 'medium'; // 기본적으로 중간 해상도
  };
  
  const finalQuality = quality === 'auto' ? getAutoQuality() : quality;
  const cacheKey = `${safeArtist}:${safeTrack}:${finalQuality}`;
  
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState('');
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  const mountedRef = useRef(true);

  const getImageUrl = (attempt = 0) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const encodedArtist = encodeURIComponent(safeArtist);
    const encodedTrack = encodeURIComponent(safeTrack);
    
    // 방지 단순화: 존재하는 API만 사용
    if (attempt === 0) {
      // 기본 이미지 API 사용
      return `${baseUrl}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
    } else {
      // 최종 폴백: SVG
      return '/default-album.svg';
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    setFallbackAttempt(0);
    
    if (errorCache.has(cacheKey)) {
      setHasError(true);
      setIsLoading(false);
      setCurrentSrc('/default-album.svg');
      return;
    }

    const imageUrl = getImageUrl(0);
    setCurrentSrc(imageUrl);
    setHasError(false);
    setIsLoading(true);
    
    // 🔍 이미지 로드 테스트 (우선순위: album-image-smart → SVG)
    console.log('🎯 이미지 요청:', {
      artist: safeArtist,
      track: safeTrack, 
      url: imageUrl
    });

    return () => {
      mountedRef.current = false;
    };
  }, [safeArtist, safeTrack, src, finalQuality]);

  const handleImageLoad = () => {
    if (!mountedRef.current) return;
    setIsLoading(false);
    setHasError(false);
    console.log('✅ 이미지 로드 성공:', currentSrc);
  };

  const handleImageError = () => {
    if (!mountedRef.current) return;
    
    console.log('❌ 이미지 로드 실패:', currentSrc);
    
    const nextAttempt = fallbackAttempt + 1;
    
    if (nextAttempt <= 1) {
      // 다음 폴백 시도
      const nextUrl = getImageUrl(nextAttempt);
      setCurrentSrc(nextUrl);
      setFallbackAttempt(nextAttempt);
      setIsLoading(true);
      console.log('🔄 폴백 시도:', nextUrl);
    } else {
      // 모든 시도 실패
      setIsLoading(false);
      setHasError(true);
      errorCache.add(cacheKey);
      console.log('💥 모든 폴백 실패');
    }
  };

  const getFallbackContent = () => {
    const baseClasses = `bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 ${className}`;
    const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
    
    return (
      <div className={`${baseClasses} ${shapeClasses}`}>
        <svg 
          className="w-8 h-8" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  if (hasError && currentSrc === '/default-album.svg') {
    return getFallbackContent();
  }

  const imageClasses = `w-full h-full object-cover transition-opacity duration-300 ${
    isLoading ? 'opacity-0' : 'opacity-100'
  }`;
  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  
  return (
    <div className={`relative overflow-hidden ${shapeClasses} ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center ${shapeClasses}`}>
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt || `${safeArtist} - ${safeTrack}`}
        className={`${imageClasses} ${shapeClasses}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        width={width}
        height={height}
      />
    </div>
  );
};

export default ImageWithFallback;