import React, { useState, useEffect } from 'react';

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
 * 🚀 스마트 이미지 컴포넌트 - 하드코딩 완전 제거!
 * 백엔드 SmartImageResolver와 연동하여 100% 자동 이미지 매칭
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
  priority = false,
  unoptimized = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // 스마트 이미지 URL 생성 - 백엔드 SmartImageResolver 사용
  const generateSmartImageUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const useArtist = artistNameNormalized || artistName || '알수없음';
    const useTrack = trackName || '알수없음';
    
    // 🎯 핵심: 하드코딩 없이 백엔드에 모든 매칭 로직 위임
    const smartUrl = `${baseUrl}/api/album-image-smart/${encodeURIComponent(useArtist)}/${encodeURIComponent(useTrack)}`;
    
    console.log('🎯 스마트 이미지 요청:', {
      artist: useArtist,
      track: useTrack,
      url: smartUrl
    });
    
    return smartUrl;
  };

  // 컴포넌트 마운트 시 스마트 URL 설정
  useEffect(() => {
    if (artistName || artistNameNormalized) {
      const smartUrl = generateSmartImageUrl();
      setCurrentSrc(smartUrl);
    } else if (src) {
      setCurrentSrc(src);
    }
  }, [artistName, artistNameNormalized, trackName, src]);

  // 이미지 로드 에러 시 - 폴백 처리 없음 (백엔드에서 모든 처리)
  const handleError = () => {
    console.log('❌ 이미지 로드 실패:', currentSrc);
    setHasError(true);
    setIsLoading(false);
  };

  // 이미지 로드 성공 시
  const handleLoad = () => {
    console.log('✅ 스마트 이미지 로드 성공:', {
      url: currentSrc,
      artist: artistNameNormalized || artistName,
      track: trackName
    });
    setIsLoading(false);
    setHasError(false);
  };

  // 에러 발생 시 텍스트 플레이스홀더
  if (hasError || (!isLoading && !currentSrc)) {
    const useArtist = artistNameNormalized || artistName;
    let displayChar = '♪';
    
    if (useArtist) {
      displayChar = useArtist.charAt(0).toUpperCase();
    }
    
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-2xl rounded-lg ${className}`}
        style={{ width, height }}
      >
        {displayChar}
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 animate-pulse rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-sm">로딩중...</div>
      </div>
    );
  }

  // 정상 이미지 표시
  if (fill) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default ImageWithFallback;
