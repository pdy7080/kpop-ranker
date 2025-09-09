import React, { useState, useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ImageWithFallbackProps {
  artist?: string;  // optional로 변경
  track?: string;   // optional로 변경
  src?: string;
  className?: string;
  isDetailView?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  artist = '', 
  track = '', 
  src,
  className = '',
  isDetailView = false
}) => {
  const [imageError, setImageError] = useState(false);

  // 안전한 이미지 URL 생성
  const imageUrl = useMemo(() => {
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
      
      return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
    } catch (error) {
      console.error('ImageWithFallback: Error encoding URL', error);
      return '/images/default-album.svg';
    }
  }, [artist, track, imageError]);

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
