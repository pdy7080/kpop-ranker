import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiUrls } from '@/lib/apiConfig';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  artistName?: string;
  artistNameNormalized?: string;
  trackName?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

/**
 * 🎯 한글 아티스트 매핑 - 확장 버전
 */
const KOREAN_ARTIST_MAP: { [key: string]: string } = {
  '뉴진스': 'NewJeans',
  '블랙핑크': 'BLACKPINK',
  '에스파': 'aespa',
  '아이브': 'IVE',
  '르세라핌': 'LE SSERAFIM',
  '세븐틴': 'SEVENTEEN',
  '스트레이키즈': 'Stray Kids',
  '투모로우바이투게더': 'TXT',
  '엔하이픈': 'ENHYPEN',
  '트와이스': 'TWICE',
  '있지': 'ITZY',
  '아이유': 'IU',
  '방탄소년단': 'BTS',
  '이무진': '이무진',
  '임영웅': '임영웅',
  '데이식스': 'DAY6',
  '지드래곤': 'G-DRAGON',
  '로제': 'ROSÉ',
  '제니': 'JENNIE'
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  fill = false,
  artistName,
  artistNameNormalized,
  trackName,
  priority = false,
  unoptimized = true,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const getSmartImageUrl = (): string => {
    // 아티스트명과 트랙명이 있으면 API 사용
    if (artistName && trackName) {
      // 한글 아티스트명 변환
      const artist = KOREAN_ARTIST_MAP[artistName] || artistName;
      
      // album-image-v2 API 사용 (백엔드의 Ultimate Image Service)
      return apiUrls.albumImage(artist, trackName);
    }
    
    // 기본 src 사용
    return src;
  };

  const getFallbackImage = (): string => {
    // SVG 플레이스홀더 URL 생성
    if (artistName) {
      const artist = KOREAN_ARTIST_MAP[artistName] || artistName;
      
      // 백엔드가 SVG 플레이스홀더를 반환하도록
      if (trackName) {
        return apiUrls.albumImage(artist, trackName || 'Unknown');
      }
    }
    
    // 기본 플레이스홀더
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#e0e0e0"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="16">
          No Image
        </text>
      </svg>
    `);
  };

  const handleError = () => {
    console.log(`이미지 로드 실패: ${imgSrc}`);
    
    if (!error) {
      setError(true);
      const smartUrl = getSmartImageUrl();
      
      if (smartUrl !== imgSrc) {
        console.log(`스마트 URL 시도: ${smartUrl}`);
        setImgSrc(smartUrl);
      } else {
        const fallback = getFallbackImage();
        console.log(`폴백 이미지 사용`);
        setImgSrc(fallback);
      }
    }
  };

  // 처음부터 스마트 URL 사용
  useEffect(() => {
    if (artistName && trackName) {
      const smartUrl = getSmartImageUrl();
      if (smartUrl !== src) {
        setImgSrc(smartUrl);
      }
    }
  }, [artistName, trackName]);

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
        priority={priority}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority={priority}
      unoptimized={unoptimized}
    />
  );
};

export default ImageWithFallback;
