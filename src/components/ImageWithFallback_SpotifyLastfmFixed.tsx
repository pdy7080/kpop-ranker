import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  artist: string;
  track: string;
  src?: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  isDetailView?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist,
  track,
  src,
  className = '',
  alt,
  width = 200,
  height = 200,
  isDetailView = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageData, setImageData] = useState<any>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 이미지 URL 결정 로직 - 스포티파이/Last.fm 개선
  const imageUrl = useMemo(() => {
    // 에러 상태면 기본 이미지
    if (imageError) {
      return '/images/default-album.svg';
    }

    // 외부 URL 데이터가 있으면 사용
    if (imageData?.use_external && imageData?.image_url) {
      // 스포티파이/Last.fm은 직접 사용
      if (imageData.chart === 'spotify' || imageData.chart === 'lastfm') {
        return imageData.image_url;
      }
      // CORS 문제가 있을 수 있으므로 프록시 사용
      return `${API_URL}/api/image-proxy?url=${encodeURIComponent(imageData.image_url)}`;
    }

    // src가 제공되었고 유효하면 사용
    if (src) {
      // 전체 URL
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
      }
      // 상대 경로
      if (src.startsWith('/')) {
        return `${API_URL}${src}`;
      }
    }

    // 기본: Smart API 호출
    const encodedArtist = encodeURIComponent(artist.replace(/\//g, ''));
    const encodedTrack = encodeURIComponent(track.replace(/\//g, ''));
    
    return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  }, [src, artist, track, API_URL, imageError, imageData]);

  // Smart API 응답 처리
  useEffect(() => {
    // src가 있거나 에러 상태면 스킵
    if (src || imageError) return;

    const fetchImageData = async () => {
      try {
        const encodedArtist = encodeURIComponent(artist.replace(/\//g, ''));
        const encodedTrack = encodeURIComponent(track.replace(/\//g, ''));
        const response = await fetch(
          `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`
        );

        // JSON 응답 체크 (외부 URL 정보)
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          if (data.use_external) {
            setImageData(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch image data:', error);
      }
    };

    // 스포티파이/Last.fm 트랙인 경우 데이터 가져오기
    const isSpecialChart = artist.toLowerCase().includes('spotify') || 
                          artist.toLowerCase().includes('lastfm') ||
                          track.toLowerCase().includes('spotify') ||
                          track.toLowerCase().includes('lastfm');
    
    if (isSpecialChart || !src) {
      fetchImageData();
    }
  }, [artist, track, src, API_URL, imageError]);

  const handleImageError = () => {
    console.log(`Image load failed for: ${artist} - ${track}`);
    setImageError(true);
  };

  // Next.js Image 컴포넌트 사용 여부
  const useNextImage = !imageUrl.startsWith('http') && !imageUrl.includes('api/');

  if (useNextImage) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <Image
          src={imageUrl}
          alt={alt || `${artist} - ${track}`}
          fill
          className="object-cover"
          onError={handleImageError}
          priority={isDetailView}
        />
      </div>
    );
  }

  // 일반 img 태그 (외부 URL, API 등)
  return (
    <img
      src={imageUrl}
      alt={alt || `${artist} - ${track}`}
      className={className}
      onError={handleImageError}
      loading={isDetailView ? 'eager' : 'lazy'}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        objectFit: 'cover'
      }}
    />
  );
};

export default ImageWithFallback;
