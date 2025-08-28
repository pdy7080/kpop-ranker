import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
  artist: string;
  track: string;
  alt?: string;
  className?: string;
  src?: string;  // 외부에서 URL 직접 전달 가능
  width?: number;
  height?: number;
  priority?: boolean;
  shape?: 'square' | 'circle';
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
}) => {
  const safeArtist = artist || 'Unknown Artist';
  const safeTrack = track || 'Unknown Track';
  const cacheKey = `${safeArtist}:${safeTrack}`;
  
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const getImageUrl = () => {
    // 외부에서 전달된 src가 있으면 우선 사용
    if (src) return src;
    
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

  const handleImageLoad = () => {
    if (mountedRef.current) {
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleImageError = () => {
    if (mountedRef.current) {
      setHasError(true);
      setIsLoading(false);
      errorCache.add(cacheKey);
    }
  };

  // 에러 상태면 폴백 표시 - 개선된 디자인
  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm flex flex-col items-center justify-center text-center relative overflow-hidden`}>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600"></div>
        </div>
        
        {/* 음악 아이콘 */}
        <div className="relative z-10 w-16 h-16 mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        
        {/* 텍스트 정보 */}
        <div className="relative z-10 px-3">
          <div className="text-white text-sm font-bold line-clamp-1 mb-1 drop-shadow-lg">
            {safeArtist}
          </div>
          <div className="text-gray-200 text-xs line-clamp-1 drop-shadow-lg">
            {safeTrack}
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl();
  const altText = alt || `${safeArtist} - ${safeTrack} 앨범 커버`;

  // width/height props가 있을 때만 인라인 스타일 적용
  const imageStyle = (width || height) ? {
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
  } : undefined;

  return (
    <div className={`relative ${className}`}>
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {/* 실제 이미지 - className이 우선 적용되도록 */}
      <img
        src={imageUrl}
        alt={altText}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={imageStyle}
      />
    </div>
  );
};

export default ImageWithFallback;
