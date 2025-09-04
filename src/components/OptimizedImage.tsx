import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  artist?: string;
  track?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  artist, 
  track,
  width = 300, 
  height = 300,
  className = '',
  priority = false,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [priority]);
  
  // Build image URL
  useEffect(() => {
    if (!isInView) return;
    
    // If src is already a full URL, use it
    if (src && (src.startsWith('http') || src.startsWith('/'))) {
      setImageSrc(src);
      return;
    }
    
    // Build smart image URL from artist and track
    if (artist && track) {
      const encodedArtist = encodeURIComponent(artist);
      const encodedTrack = encodeURIComponent(track);
      setImageSrc(`${API_URL}/api/album-image-smart/${encodedArtist}/${encodedTrack}`);
    } else {
      setImageSrc('/images/default-album.svg');
    }
  }, [artist, track, src, API_URL, isInView]);
  
  const handleError = () => {
    setImageSrc('/images/default-album.svg');
    setIsLoading(false);
    onError?.();
  };
  
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };
  
  // Blur placeholder for skeleton
  const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzY2NjY2NiI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=";
  
  return (
    <div 
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {!isInView ? (
        // Placeholder before lazy loading
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-gray-600">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      ) : (
        <>
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          )}
          
          {/* Actual image */}
          <Image
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleError}
            onLoad={handleLoad}
            placeholder="blur"
            blurDataURL={blurDataURL}
            priority={priority}
            unoptimized // API 이미지는 최적화 비활성화
          />
        </>
      )}
    </div>
  );
};

export default OptimizedImage;