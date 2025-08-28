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
  shape?: 'square' | 'circle';  // 추가: 모양 선택 옵션
}

const errorCache = new Set<string>();

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist,
  track,
  alt,
  className = '',
  width = 160,
  height = 160,
  priority = false,
  shape = 'square',  // 기본값: 사각형
}) => {
  const safeArtist = artist || 'Unknown Artist';
  const safeTrack = track || 'Unknown Track';
  const cacheKey = `${safeArtist}:${safeTrack}`;
  
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  const getImageUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const encodedArtist = encodeURIComponent(safeArtist);
    const encodedTrack = encodeURIComponent(safeTrack);
    
    return `${baseUrl}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  };

  useEffect(() => {
    mountedRef.current = true;
    
    if (errorCache.has(cacheKey)) {
      setHasError(true);
      setIsLoading(false);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [cacheKey]);

  const handleError = () => {
    errorCache.add(cacheKey);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  // 에러 발생시 폴백 UI
  if (hasError) {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
    ];
    
    const hashCode = (safeArtist + safeTrack).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const gradientIndex = Math.abs(hashCode) % gradients.length;
    const gradient = gradients[gradientIndex];
    
    return (
      <div 
        className={`relative ${shapeClasses} bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className={`absolute inset-0 bg-black bg-opacity-10 ${shapeClasses}`}></div>
        <div className="relative z-10 text-center p-2">
          <FaCompactDisc className="w-6 h-6 text-white opacity-80 mx-auto mb-1" />
          <div className="text-white text-xs font-medium truncate max-w-full">
            {safeArtist.slice(0, 8)}
          </div>
          {safeTrack && safeTrack !== 'Unknown Track' && (
            <div className="text-white text-xs truncate max-w-full opacity-70">
              {safeTrack.slice(0, 8)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 정상 이미지 표시
  return (
    <div 
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${shapeClasses} ${className}`} 
      style={{ width, height }}
    >
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${shapeClasses} flex items-center justify-center`}>
          <FaCompactDisc className="w-8 h-8 text-gray-400 dark:text-gray-600 opacity-50" />
        </div>
      )}
      
      <img
        src={getImageUrl()}
        alt={alt || `${safeArtist} - ${safeTrack}`}
        width={width}
        height={height}
        className={`w-full h-full object-cover ${shapeClasses} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoadStart={() => setIsLoading(true)}
        style={{ 
          objectFit: 'cover',
          objectPosition: 'center center'
        }}
      />
    </div>
  );
};

export const clearImageCache = () => {
  errorCache.clear();
};

export const prefetchImage = (artist: string, track: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const encodedArtist = encodeURIComponent(artist);
  const encodedTrack = encodeURIComponent(track);
  const url = `${baseUrl}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'image';
  document.head.appendChild(link);
};

export const prefetchImages = (items: Array<{artist: string, track: string}>) => {
  items.slice(0, 10).forEach(item => {
    prefetchImage(item.artist, item.track);
  });
};

export default ImageWithFallback;