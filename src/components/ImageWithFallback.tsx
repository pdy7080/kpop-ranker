import React, { useState, useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ImageWithFallbackProps {
  artist?: string;  // optional로 변경
  track?: string;   // optional로 변경
  src?: string;
  className?: string;
  isDetailView?: boolean;
  imageSize?: 'small' | 'medium' | 'large';  // 이미지 크기 옵션
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  artist = '',
  track = '',
  src,
  className = '',
  isDetailView = false,
  imageSize = 'large'  // 기본값: large (고화질)
}) => {
  const [imageError, setImageError] = useState(false);

  // 이미지 크기 맵핑 (Spotify 이미지 크기)
  const getSizeParam = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'small': return 300;   // 300x300
      case 'medium': return 640;  // 640x640 (기본)
      case 'large': return 640;   // 640x640 (Spotify 최대 크기)
      default: return 640;
    }
  };

  // 안전한 이미지 URL 생성
  const imageUrl = useMemo(() => {
    // 직접 제공된 src가 있으면 우선 사용 (http 또는 https로 시작)
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      return src;
    }

    // 에러 상태면 기본 이미지
    if (imageError) {
      return '/images/default-album.svg';
    }

    // artist나 track이 없으면 기본 이미지
    if (!artist || !track) {
      console.warn('ImageWithFallback: Missing artist or track', { artist, track });
      return '/images/default-album.svg';
    }

    try {
      // 안전한 인코딩 (undefined 체크)
      const safeArtist = String(artist || '').replace(/\//g, '');
      const safeTrack = String(track || '').replace(/\//g, '');

      // 빈 문자열 체크
      if (!safeArtist || !safeTrack) {
        return '/images/default-album.svg';
      }

      const encodedArtist = encodeURIComponent(safeArtist);
      const encodedTrack = encodeURIComponent(safeTrack);
      const sizeParam = getSizeParam(imageSize);

      // 고화질 이미지 요청 파라미터 추가
      return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}?size=${sizeParam}`;
    } catch (error) {
      console.error('ImageWithFallback: Error encoding URL', error);
      return '/images/default-album.svg';
    }
  }, [artist, track, src, imageError, imageSize]);

  const handleImageError = () => {
    if (artist && track) {
      console.log(`Image load failed for ${artist} - ${track}`);
    }
    setImageError(true);
  };

  return (
    <img
      src={imageUrl}
      alt={artist && track ? `${artist} - ${track}` : 'Album cover'}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;
