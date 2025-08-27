import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  artist?: string;
  track?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  artist,
  track,
  priority = false,
  style
}) => {
  const [imgSrc, setImgSrc] = useState<string>('/images/default-album.svg');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 이미지 소스 결정 로직
    let finalSrc = '/images/default-album.svg';
    
    if (src) {
      // src가 제공된 경우
      if (src.startsWith('http')) {
        finalSrc = src;
      } else if (src.startsWith('/static') || src.startsWith('/api')) {
        finalSrc = `${API_URL}${src}`;
      } else if (src.startsWith('/')) {
        finalSrc = src;
      } else {
        finalSrc = `${API_URL}/static/album_images/${src}`;
      }
    } else if (artist && track) {
      // Smart API 사용
      finalSrc = `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
    }
    
    setImgSrc(finalSrc);
    setError(false);
    setIsLoading(true);
  }, [src, artist, track]);

  const handleError = () => {
    console.log('Image load error:', imgSrc);
    setError(true);
    
    // Fallback 시도
    if (artist && track && !imgSrc.includes('album-image-smart')) {
      const smartUrl = `${API_URL}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
      setImgSrc(smartUrl);
      setError(false);
    } else {
      // 최종 fallback - 그라디언트 플레이스홀더
      setImgSrc('/images/default-album.svg');
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // 플레이스홀더 컴포넌트
  const PlaceholderImage = () => (
    <div 
      className={`${className} bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center relative overflow-hidden`}
      style={{ width, height, ...style }}
    >
      {/* 애니메이션 배경 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-blue-900/50 animate-gradient" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/30 rounded-full filter blur-xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/30 rounded-full filter blur-xl animate-pulse delay-1000" />
        </div>
      </div>
      
      {/* 음표 아이콘 */}
      <svg 
        className="w-1/3 h-1/3 text-white/50 relative z-10" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500/50 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );

  // 기본 플레이스홀더 반환
  if (!imgSrc || imgSrc === '/images/default-album.svg' || error) {
    return <PlaceholderImage />;
  }

  return (
    <div className={`relative ${className}`} style={{ width, height, ...style }}>
      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <PlaceholderImage />
        </div>
      )}
      
      {/* 실제 이미지 */}
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        style={{ ...style, objectFit: 'cover' }}
      />
    </div>
  );
};

export default ImageWithFallback;