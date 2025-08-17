import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  artistName?: string;
  artistNameNormalized?: string;
  trackName?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

/**
 * 🚨 v7.0 수정: 이미지 로드 에러 처리 개선
 * - 불필요한 console.log 제거
 * - 실제 에러만 처리
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  fill = false,
  artistName = '',
  artistNameNormalized = '',
  trackName = '',
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const attemptedUrlsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef<boolean>(true);

  // SVG 직접 인코딩 (btoa 대신 encodeURIComponent 사용)
  const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />' +
    '<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="200" height="200" fill="url(#bg)"/>' +
    '<text x="100" y="100" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy="0.35em">♪</text>' +
    '</svg>'
  );

  // 스마트 이미지 URL 생성
  const generateSmartImageUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const useArtist = artistNameNormalized || artistName || '알수없음';
    const useTrack = trackName || '알수없음';
    
    // smart API 사용
    return `${baseUrl}/api/album-image-smart/${encodeURIComponent(useArtist)}/${encodeURIComponent(useTrack)}`;
  };

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 소스 결정
  useEffect(() => {
    // URL 시도 기록 초기화
    attemptedUrlsRef.current.clear();
    setHasError(false);
    setIsLoading(true);

    let imageUrl = '';
    
    if (artistName || artistNameNormalized) {
      // 아티스트 정보가 있으면 스마트 API 사용
      imageUrl = generateSmartImageUrl();
    } else if (src && !src.includes('placeholder')) {
      // placeholder가 포함되지 않은 유효한 src
      imageUrl = src;
    }

    if (imageUrl) {
      setCurrentSrc(imageUrl);
      attemptedUrlsRef.current.add(imageUrl);
    } else {
      // 유효한 소스가 없으면 바로 기본 이미지 사용
      setCurrentSrc(DEFAULT_PLACEHOLDER);
      setIsLoading(false);
    }
  }, [artistName, artistNameNormalized, trackName, src]);

  // 이미지 로드 성공
  const handleLoad = () => {
    if (!isMountedRef.current) return;
    
    // 실제 이미지 로드 성공
    setIsLoading(false);
    setHasError(false);
  };

  // 이미지 로드 실패
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!isMountedRef.current) return;
    
    const failedUrl = e.currentTarget.src;
    
    // data URL은 에러 처리하지 않음
    if (failedUrl.startsWith('data:')) {
      return;
    }
    
    // 이미 시도한 URL이면 무시 (무한 루프 방지)
    if (attemptedUrlsRef.current.has(failedUrl) && attemptedUrlsRef.current.size > 1) {
      // 실제 에러인 경우에만 로그 (디버그 레벨)
      if (process.env.NODE_ENV === 'development') {
        console.debug('이미지 로드 실패 (재시도 안함):', failedUrl);
      }
      setCurrentSrc(DEFAULT_PLACEHOLDER);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    attemptedUrlsRef.current.add(failedUrl);
    
    // 기본 SVG로 폴백
    if (process.env.NODE_ENV === 'development') {
      console.debug('이미지 로드 실패, 기본 이미지 사용');
    }
    setCurrentSrc(DEFAULT_PLACEHOLDER);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div 
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ 
        width: fill ? '100%' : width, 
        height: fill ? '100%' : height 
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gradient-to-r from-purple-400 to-pink-400 w-full h-full" />
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`object-cover w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};

export default ImageWithFallback;