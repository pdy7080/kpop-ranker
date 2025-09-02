import React, { useState, useEffect, useRef, useMemo } from 'react';

// 이미지 캐시를 위한 전역 Map
const imageCache = new Map<string, string>();
const errorCache = new Set<string>();

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
  lazy?: boolean; // 지연 로딩 옵션
}

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
  lazy = true, // 기본적으로 지연 로딩 활성화
}) => {
  const safeArtist = artist || 'Unknown Artist';
  const safeTrack = track || 'Unknown Track';
  
  // 메모이제이션으로 URL 생성 최적화
  const imageUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const encodedArtist = encodeURIComponent(safeArtist);
    const encodedTrack = encodeURIComponent(safeTrack);
    return `${baseUrl}/api/track-image-detail/${encodedArtist}/${encodedTrack}`;
  }, [safeArtist, safeTrack]);
  
  const cacheKey = `${safeArtist}:${safeTrack}`;
  
  const [hasError, setHasError] = useState(() => errorCache.has(cacheKey));
  const [isLoading, setIsLoading] = useState(() => !imageCache.has(cacheKey) && !errorCache.has(cacheKey));
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey)!;
    if (errorCache.has(cacheKey)) return '/default-album.svg';
    return imageUrl;
  });
  
  const mountedRef = useRef(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const intersectionRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(!lazy || priority);

  // 지연 로딩 설정 (Intersection Observer)
  useEffect(() => {
    if (!lazy || priority || isVisible) return;
    
    if (imgRef.current) {
      intersectionRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              intersectionRef.current?.disconnect();
            }
          });
        },
        { rootMargin: '100px' } // 100px 전에 미리 로드 시작
      );
      
      intersectionRef.current.observe(imgRef.current);
    }
    
    return () => {
      intersectionRef.current?.disconnect();
    };
  }, [lazy, priority, isVisible]);

  const handleLoad = () => {
    if (!mountedRef.current) return;
    
    setIsLoading(false);
    setHasError(false);
    
    // 성공적으로 로드된 URL을 캐시에 저장
    imageCache.set(cacheKey, currentSrc);
    
    console.log('✅ 이미지 로드 성공:', { artist: safeArtist, track: safeTrack });
  };

  const handleError = () => {
    if (!mountedRef.current) return;
    
    console.log('❌ 이미지 로드 실패:', { artist: safeArtist, track: safeTrack, url: currentSrc });
    
    // 에러 캐시에 추가
    errorCache.add(cacheKey);
    
    setHasError(true);
    setIsLoading(false);
    setCurrentSrc('/default-album.svg');
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  const finalClassName = `${className} ${shapeClass} transition-all duration-200`;

  // 지연 로딩이 활성화되어 있고 아직 보이지 않는 경우
  if (lazy && !isVisible && !priority) {
    return (
      <div 
        ref={imgRef}
        className={`${finalClassName} bg-gray-200 animate-pulse flex items-center justify-center`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-xs">로딩중...</div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${finalClassName} bg-gray-200 animate-pulse flex items-center justify-center absolute inset-0`}>
          <div className="text-gray-400 text-xs">로딩중...</div>
        </div>
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt || `${safeArtist} - ${safeTrack}`}
        className={finalClassName}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out',
          width,
          height,
        }}
      />
    </>
  );
};

export default ImageWithFallback;
