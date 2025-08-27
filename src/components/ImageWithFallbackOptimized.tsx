import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaCompactDisc } from 'react-icons/fa';

interface ImageWithFallbackProps {
  artist: string;
  track: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// 이미지 캐시
const imageCache = new Map<string, string>();

// 로딩 상태 관리
const loadingImages = new Set<string>();

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist,
  track,
  alt,
  className = '',
  width = 160,
  height = 160,
  priority = false,
}) => {
  const cacheKey = `${artist}:${track}`;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // API URL 생성
  const getImageUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const encodedArtist = encodeURIComponent(artist);
    const encodedTrack = encodeURIComponent(track);
    return `${baseUrl}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  }, [artist, track]);

  useEffect(() => {
    // 캐시 확인
    if (imageCache.has(cacheKey)) {
      setImageSrc(imageCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    // 이미 로딩 중인지 확인
    if (loadingImages.has(cacheKey)) {
      // 로딩 완료 대기
      const checkInterval = setInterval(() => {
        if (!loadingImages.has(cacheKey) && imageCache.has(cacheKey)) {
          setImageSrc(imageCache.get(cacheKey)!);
          setIsLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);

      // 5초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!imageCache.has(cacheKey)) {
          setHasError(true);
          setIsLoading(false);
        }
      }, 5000);
      return;
    }

    // 새로운 이미지 로드
    loadingImages.add(cacheKey);
    const imageUrl = getImageUrl();

    // 이미지 프리로드
    const img = new window.Image();
    img.onload = () => {
      imageCache.set(cacheKey, imageUrl);
      loadingImages.delete(cacheKey);
      setImageSrc(imageUrl);
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      loadingImages.delete(cacheKey);
      setHasError(true);
      setIsLoading(false);
    };
    img.src = imageUrl;

    // 클린업
    return () => {
      loadingImages.delete(cacheKey);
    };
  }, [artist, track, cacheKey, getImageUrl]);

  // 에러 핸들러
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div 
        className={`relative bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`}
        style={{ width, height }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <FaCompactDisc className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  // 에러 발생시 기본 이미지
  if (hasError || !imageSrc) {
    return (
      <div 
        className={`relative bg-gradient-to-br from-purple-500 to-pink-500 ${className}`}
        style={{ width, height }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <FaCompactDisc className="w-12 h-12 text-white opacity-50" />
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-white text-xs truncate opacity-75">
          {artist}
        </div>
      </div>
    );
  }

  // 정상 이미지 표시
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={imageSrc}
        alt={alt || `${artist} - ${track}`}
        width={width}
        height={height}
        className="object-cover w-full h-full"
        onError={handleError}
        priority={priority}
        unoptimized={true} // 외부 이미지이므로 최적화 건너뛰기
      />
    </div>
  );
};

// 캐시 클리어 함수 (필요시 사용)
export const clearImageCache = () => {
  imageCache.clear();
  loadingImages.clear();
};

export default ImageWithFallback;
