import React, { useState, useEffect } from 'react';

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
    if (src && src.startsWith('http')) {
      imageUrl = src;
    }
    // src가 /api로 시작하는 경우 (상대 경로)
    else if (src && src.startsWith('/api')) {
      // 프로덕션에서는 절대 경로로 변환
      imageUrl = `${baseUrl}${src}`;
    }
    // artistName과 trackName이 있는 경우
    else if (artistName && trackName) {
      // album-image-smart를 사용 (Smart Resolver 활용)
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
    console.log('Image load error:', currentSrc);
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