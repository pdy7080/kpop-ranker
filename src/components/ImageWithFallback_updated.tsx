
import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  artist: string;
  track: string;
  className?: string;
  alt?: string;
  isDetailView?: boolean; // 새로운 prop: 상세 페이지 여부
  priority?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist,
  track,
  className = '',
  alt,
  isDetailView = false, // 기본값: false (썸네일)
  priority = false
}) => {
  const [src, setSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!artist || !track) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // 이미지 URL 선택 (상세 페이지 vs 썸네일)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    
    let imageUrl: string;
    
    if (isDetailView) {
      // 곡 상세 페이지: 고해상도 우선
      imageUrl = `${baseUrl}/api/track-image-detail/${encodedArtist}/${encodedTrack}`;
    } else {
      // 썸네일: 기존 API 또는 썸네일 API
      imageUrl = `${baseUrl}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
    }

    setSrc(imageUrl);
    setIsLoading(true);
    setHasError(false);
  }, [artist, track, isDetailView]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // 폴백 순서
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    
    if (isDetailView && !src.includes('album-image-smart')) {
      // 상세 페이지에서 실패하면 기존 API로 폴백
      setSrc(`${baseUrl}/api/album-image-smart/${encodedArtist}/${encodedTrack}`);
      setHasError(false);
      setIsLoading(true);
    } else {
      // 최종 폴백: SVG
      setSrc('/images/default-album.svg');
    }
  };

  if (hasError && src === '/images/default-album.svg') {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <img
        src={src}
        alt={alt || `${artist} - ${track}`}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default ImageWithFallback;
