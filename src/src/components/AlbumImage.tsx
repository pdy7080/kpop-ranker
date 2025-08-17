import React from 'react';
import ImageWithFallback from './ImageWithFallback';

interface AlbumImageProps {
  src?: string;
  artist: string;
  artistNormalized?: string;
  track?: string;
  size?: 'sm' | 'small' | 'md' | 'medium' | 'lg' | 'large' | 'xl' | 'xlarge';
  className?: string;
  priority?: boolean;
  shape?: 'square' | 'rounded' | 'circle';
  showArtistName?: boolean;
  onClick?: () => void;
  alt?: string;
}

/**
 * 🎵 AlbumImage - 무한 루프 방지 버전
 * placeholder-album.png 제거, SVG 사용
 */
const AlbumImage: React.FC<AlbumImageProps> = ({
  src,
  artist,
  artistNormalized,
  track = '',
  size = 'medium',
  className = '',
  priority = false,
  shape = 'rounded',
  showArtistName = false,
  onClick,
  alt
}) => {
  // 크기별 스타일 정의
  const sizeStyles = {
    sm: { width: 48, height: 48, className: 'w-12 h-12' },
    small: { width: 48, height: 48, className: 'w-12 h-12' },
    md: { width: 64, height: 64, className: 'w-16 h-16' },
    medium: { width: 64, height: 64, className: 'w-16 h-16' },
    lg: { width: 96, height: 96, className: 'w-24 h-24' },
    large: { width: 96, height: 96, className: 'w-24 h-24' },
    xl: { width: 128, height: 128, className: 'w-32 h-32' },
    xlarge: { width: 128, height: 128, className: 'w-32 h-32' }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  // 모양별 클래스
  const shapeClasses = {
    square: '',
    rounded: 'rounded-lg',
    circle: 'rounded-full'
  };

  const currentShape = shapeClasses[shape] || shapeClasses.rounded;

  // API URL 생성 (placeholder-album.png 사용하지 않음)
  const generateImageUrl = () => {
    if (src && !src.includes('placeholder-album.png')) {
      return src;
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const useArtist = artistNormalized || artist;
    
    if (track) {
      return `${apiUrl}/api/album-image-v2/${encodeURIComponent(useArtist)}/${encodeURIComponent(track)}`;
    }
    return `${apiUrl}/api/album-image-v2/${encodeURIComponent(useArtist)}`;
  };

  const imageUrl = generateImageUrl();
  const altText = alt || `${artist}${track ? ` - ${track}` : ''} 앨범 이미지`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const containerClass = `
    relative inline-block overflow-hidden 
    ${currentShape} 
    ${currentSize.className} 
    ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} 
    shadow-md hover:shadow-lg transition-shadow
    ${className}
  `.trim();

  return (
    <div 
      className={containerClass}
      onClick={handleClick}
      style={{ width: currentSize.width, height: currentSize.height }}
    >
      <ImageWithFallback
        src={imageUrl}
        alt={altText}
        width={currentSize.width}
        height={currentSize.height}
        className={`${currentShape} object-cover`}
        artistName={artist}
        artistNameNormalized={artistNormalized}
        trackName={track}
        priority={priority}
        fill={false}
      />
      
      {showArtistName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs font-medium truncate">
            {artist}
          </p>
        </div>
      )}
    </div>
  );
};

export default AlbumImage;