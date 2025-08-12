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
  priority?: boolean;    // (미사용) Next/Image 대비 호환 보존
  unoptimized?: boolean; // (미사용) Next/Image 대비 호환 보존
}

/**
 * 🚀 스마트 이미지 컴포넌트 - 수정됨
 * - 백엔드 SmartImageResolver 연동 (album-image-smart)
 * - 하드코딩/폴더의존 제거, 100% 자동 매칭
 * - 🔧 렌더링 로직 수정: URL 있으면 즉시 img 태그 렌더링
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

  // 스마트 이미지 URL 생성
  const generateSmartImageUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const useArtist = artistNameNormalized || artistName || '알수없음';
    const useTrack = trackName || '알수없음';

    const smartUrl = `${baseUrl}/api/album-image-smart/${encodeURIComponent(useArtist)}/${encodeURIComponent(useTrack)}`;

    // 🔎 인코딩 및 최종 URL 로깅
    console.log('🎯 스마트 이미지 요청:', { artist: useArtist, track: useTrack, url: smartUrl });
    console.log('🔧 인코딩된 URL:', smartUrl);

    return smartUrl;
  };

  // 소스 결정
  useEffect(() => {
    // 초기화
    setHasError(false);
    setIsLoading(true);

    if (artistName || artistNameNormalized) {
      const smartUrl = generateSmartImageUrl();
      setCurrentSrc(smartUrl);
    } else if (src) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc('');
      setIsLoading(false); // 소스가 없으면 로딩 종료
    }
  }, [artistName, artistNameNormalized, trackName, src]);

  // 상태 로깅 (디버깅 강화)
  useEffect(() => {
    console.log('🔧 ImageWithFallback 상태:', {
      currentSrc,
      isLoading,
      hasError,
      artist: artistName || artistNameNormalized,
      track: trackName,
    });
  }, [currentSrc, isLoading, hasError, artistName, artistNameNormalized, trackName]);

  // 이미지 로드 성공
  const handleLoad = () => {
    console.log('✅ 이미지 로드 성공:', currentSrc);
    setIsLoading(false);
    setHasError(false);
  };

  // 이미지 로드 실패
  const handleError = () => {
    console.log('❌ 이미지 로드 실패:', currentSrc);
    setHasError(true);
    setIsLoading(false);
  };

  // 에러 또는 소스 없음 → 텍스트 플레이스홀더
  if (hasError || (!currentSrc && !isLoading)) {
    const useArtist = artistNameNormalized || artistName;
    const displayChar = useArtist ? useArtist.charAt(0).toUpperCase() : '♪';

    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-2xl rounded-lg ${className}`}
        style={{ width, height }}
      >
        {displayChar}
      </div>
    );
  }

  // 🔧 중요한 수정: currentSrc가 있으면 이미지 렌더링 (로딩 상태와 무관)
  if (currentSrc) {
    const imageElement = fill ? (
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        crossOrigin="anonymous"   // ✅ CORS
        loading="eager"           // ✅ 즉시 로드
        style={{ maxWidth: '100%', height: '100%' }}
        referrerPolicy="no-referrer" // CORS 환경 보조
      />
    ) : (
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        crossOrigin="anonymous"     // ✅ CORS
        loading="eager"             // ✅ 즉시 로드
        style={{ maxWidth: '100%', height: 'auto' }}
        referrerPolicy="no-referrer" // CORS 환경 보조
      />
    );

    // 로딩 중이면 이미지 위에 로딩 오버레이 표시
    if (isLoading) {
      return (
        <div className="relative" style={{ width, height }}>
          {imageElement}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg"
          >
            <div className="text-gray-600 text-sm">로딩중...</div>
          </div>
        </div>
      );
    }

    return imageElement;
  }

  // 최종 폴백: 소스가 없고 로딩중인 경우
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 animate-pulse rounded-lg ${className}`}
      style={{ width, height }}
    >
      <div className="text-gray-400 text-sm">로딩중...</div>
    </div>
  );
};

export default ImageWithFallback;