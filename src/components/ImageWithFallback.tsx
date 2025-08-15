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
 * 🚨 긴급 수정 v2: placeholder-album.png 완전 제거
 * - Base64 인코딩된 SVG 직접 사용
 * - 외부 파일 의존성 제거
 * - 무한 루프 완전 차단
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

  // Base64로 인코딩된 기본 SVG 이미지 (한글 안전 버전)
  // btoa는 Latin1 범위만 지원하므로 템플릿 리터럴 대신 문자열 연결 사용
  const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,' + btoa(
    '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />' +
    '<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="200" height="200" fill="url(#bg)"/>' +
    '<text x="100" y="100" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy="0.35em">\u266A</text>' +
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
    setIsLoading(false);
    setHasError(false);
  };

  // 이미지 로드 실패
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const failedUrl = e.currentTarget.src;
    
    console.log('❌ 이미지 로드 실패:', failedUrl);
    
    // 이미 시도한 URL이면 무시 (무한 루프 방지)
    if (attemptedUrlsRef.current.has(DEFAULT_PLACEHOLDER)) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Base64 SVG로 폴백
    if (failedUrl !== DEFAULT_PLACEHOLDER) {
      console.log('🔄 기본 SVG 사용');
      setCurrentSrc(DEFAULT_PLACEHOLDER);
      attemptedUrlsRef.current.add(DEFAULT_PLACEHOLDER);
    } else {
      // SVG도 실패하면 렌더링된 폴백 사용
      setHasError(true);
      setIsLoading(false);
    }
  };

  // 에러 발생 시 렌더링된 플레이스홀더
  if (hasError) {
    const useArtist = artistNameNormalized || artistName;
    const displayChar = useArtist ? useArtist.charAt(0).toUpperCase() : '♪';

    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-2xl rounded-lg ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        {displayChar}
      </div>
    );
  }

  // 이미지 렌더링
  if (currentSrc) {
    const imgStyle = fill 
      ? { width: '100%', height: '100%', objectFit: 'cover' as const }
      : { maxWidth: '100%', height: 'auto' };

    return (
      <div className={fill ? 'relative w-full h-full' : ''} style={fill ? {} : { width, height }}>
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          style={imgStyle}
          loading="lazy"
          referrerPolicy="no-referrer"
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
        />
        {isLoading && currentSrc !== DEFAULT_PLACEHOLDER && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-lg pointer-events-none"
            style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
          >
            <div className="text-gray-600 text-xs">...</div>
          </div>
        )}
      </div>
    );
  }

  // 초기 로딩 상태
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 animate-pulse rounded-lg ${className}`}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
    >
      <div className="text-gray-400 text-sm">♪</div>
    </div>
  );
};

export default ImageWithFallback;