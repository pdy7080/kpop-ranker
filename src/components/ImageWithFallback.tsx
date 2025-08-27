import React, { useState, useEffect, useRef } from 'react';
import { FaCompactDisc } from 'react-icons/fa';

interface ImageWithFallbackProps {
  artist: string;
  track: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// 글로벌 에러 캐시 (실패한 이미지만 기록)
const errorCache = new Set<string>();

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist,
  track,
  alt,
  className = '',
  width = 160,
  height = 160,
  priority = false,
}) => {
  const cacheKey = `${artist}:${track}`;
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 기본값 false로 변경
  const mountedRef = useRef(true);

  // 이미지 URL 직접 생성 (빠른 로딩을 위해)
  const getImageUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    
    // Fast API 사용
    return `${baseUrl}/api/album-image-fast/${encodedArtist}/${encodedTrack}`;
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // 에러 캐시에 있으면 바로 폴백 표시
    if (errorCache.has(cacheKey)) {
      setHasError(true);
      setIsLoading(false);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [cacheKey]);

  // 이미지 로드 에러 처리
  const handleError = () => {
    errorCache.add(cacheKey);
    setHasError(true);
    setIsLoading(false);
  };

  // 이미지 로드 완료
  const handleLoad = () => {
    setIsLoading(false);
  };

  // 에러 발생시 폴백 UI
  if (hasError) {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-teal-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-pink-400',
      'from-indigo-400 to-purple-400',
    ];
    
    const hashCode = (artist + track).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const gradientIndex = Math.abs(hashCode) % gradients.length;
    const gradient = gradients[gradientIndex];
    
    return (
      <div 
        className={`relative bg-gradient-to-br ${gradient} ${className}`}
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10 flex flex-col items-center justify-center p-2">
          <FaCompactDisc className="w-10 h-10 text-white opacity-60 mb-1" />
          <div className="text-white text-xs font-medium truncate max-w-full px-2 text-center opacity-90">
            {artist}
          </div>
          {track && (
            <div className="text-white text-xs truncate max-w-full px-2 text-center opacity-70">
              {track}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 정상 이미지 표시 (즉시 렌더링)
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} style={{ width, height }}>
      {/* 로딩 중일 때 스켈레톤 (옵션) */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <FaCompactDisc className="w-8 h-8 text-gray-400 dark:text-gray-600 opacity-50" />
        </div>
      )}
      
      {/* 이미지는 항상 렌더링 (빠른 표시) */}
      <img
        src={getImageUrl()}
        alt={alt || `${artist} - ${track}`}
        width={width}
        height={height}
        className={`object-cover w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoadStart={() => setIsLoading(true)}
      />
    </div>
  );
};

// 에러 캐시 클리어
export const clearImageCache = () => {
  errorCache.clear();
};

// 이미지 프리페치 (선택적)
export const prefetchImage = (artist: string, track: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const encodedArtist = encodeURIComponent(artist);
  const encodedTrack = encodeURIComponent(track);
  const url = `${baseUrl}/api/album-image-fast/${encodedArtist}/${encodedTrack}`;
  
  // 브라우저 프리페치 힌트
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'image';
  document.head.appendChild(link);
};

// 배치 프리페치 (페이지 로드시 사용)
export const prefetchImages = (items: Array<{artist: string, track: string}>) => {
  // 상위 10개만 프리페치
  items.slice(0, 10).forEach(item => {
    prefetchImage(item.artist, item.track);
  });
};

export default ImageWithFallback;
