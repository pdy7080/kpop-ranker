import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  artistName?: string;
  trackName?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  fill = false,
  artistName = '',
  trackName = '',
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // SVG 플레이스홀더
  const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" style="stop-color:#9333EA;stop-opacity:1" />' +
    '<stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="200" height="200" fill="url(#bg)"/>' +
    '<text x="100" y="100" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy="0.35em">🎵</text>' +
    '</svg>'
  );

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    
    // API URL 결정
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    let imageUrl = '';
    
    // src가 이미 완전한 URL인 경우
    if (src && (src.startsWith('http') || src.startsWith('/api'))) {
      // /api/album-image-v2를 /api/album-image-smart로 변경
      if (src.includes('/api/album-image-v2/')) {
        imageUrl = src.replace('/api/album-image-v2/', '/api/album-image-smart/');
      } else {
        imageUrl = src;
      }
    }
    // artistName과 trackName이 있는 경우
    else if (artistName && trackName) {
      imageUrl = `${baseUrl}/api/album-image-smart/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`;
    }
    // src가 상대 경로인 경우
    else if (src) {
      imageUrl = src.startsWith('/') ? `${baseUrl}${src}` : src;
    }
    
    setCurrentSrc(imageUrl || DEFAULT_PLACEHOLDER);
  }, [src, artistName, trackName]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setCurrentSrc(DEFAULT_PLACEHOLDER);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: fill ? '100%' : width, 
        height: fill ? '100%' : height 
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover ${hasError ? 'opacity-50' : ''}`}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;