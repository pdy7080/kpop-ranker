import React, { useState, useMemo } from 'react';

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
  lazy?: boolean;
  unoptimized?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist,
  track,
  alt,
  className = "w-16 h-16 rounded-lg object-cover",
  src,
  width = 64,
  height = 64,
  priority = false,
  shape = 'square',
  isDetailView = false,
  quality = 'auto',
  lazy = true,
  unoptimized = false
}) => {
  const [imageError, setImageError] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 🔥 핵심 개선: 트렌딩 페이지와 동일한 로직으로 단순화
  const imageUrl = useMemo(() => {
    // 이미 에러가 발생했으면 기본 이미지
    if (imageError) {
      return '/images/default-album.svg';
    }
    
    // 1. 이미 전체 URL이 있으면 사용
    if (src && src.startsWith('http')) {
      return src;
    }
    
    // 2. 상대경로면 백엔드 URL 추가
    if (src && src.startsWith('/')) {
      if (src.includes('/api/') || src.includes('/static/')) {
        return `${API_URL}${src}`;
      }
    }
    
    // 3. 기본적으로 스마트 API 호출 (트렌딩과 동일)
    const cleanArtist = (artist || '').replace(/\//g, '');
    const cleanTrack = (track || '').replace(/\//g, '');
    
    if (!cleanArtist || !cleanTrack) {
      return '/images/default-album.svg';
    }
    
    const encodedArtist = encodeURIComponent(cleanArtist);
    const encodedTrack = encodeURIComponent(cleanTrack);
    
    return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  }, [src, artist, track, API_URL, imageError]);

  const handleImageError = () => {
    setImageError(true);
  };

  // 모양별 클래스 적용
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  const finalClassName = `${className} ${shapeClass}`.trim();

  return (
    <img
      src={imageUrl}
      alt={alt || `${artist} - ${track}`}
      className={finalClassName}
      width={width}
      height={height}
      onError={handleImageError}
      loading={lazy ? 'lazy' : undefined}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    />
  );
};

export default ImageWithFallback;
