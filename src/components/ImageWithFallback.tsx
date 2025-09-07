import React, { useState, useMemo } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ImageWithFallbackProps {
  artist: string;
  track: string;
  src?: string;  // 외부 URL (무시됨)
  className?: string;
  isDetailView?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  artist, 
  track, 
  src,  // 무시하고 항상 로컬 API 사용
  className = '',
  isDetailView = false
}) => {
  const [imageError, setImageError] = useState(false);

  // 항상 로컬 고화질 API 사용
  const imageUrl = useMemo(() => {
    if (imageError) {
      return '/images/default-album.svg';
    }

    // src가 있어도 무시하고 항상 로컬 API 호출
    // 이렇게 하면 메인페이지의 저화질 CDN URL을 무시하고 고화질 로컬 이미지 사용
    const encodedArtist = encodeURIComponent(artist.replace(/\//g, ''));
    const encodedTrack = encodeURIComponent(track.replace(/\//g, ''));
    return `${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`;
  }, [artist, track, API_URL, imageError]);

  const handleImageError = () => {
    console.log(`Image load failed for ${artist} - ${track}`);
    setImageError(true);
  };

  return (
    <img
      src={imageUrl}
      alt={`${artist} - ${track}`}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;
