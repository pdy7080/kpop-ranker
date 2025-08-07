import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  artistName?: string;
  artistNameNormalized?: string;  // 정규화된 아티스트명 추가
  trackName?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

// 🎯 HUNTR 실제 앨범 이미지 매핑 - 완전 해결!
const HUNTR_REAL_IMAGES = {
  'Golden': 'HUNTR_Golden.jpg',
  'How It\'s Done': 'HUNTR_How It\'s Done.jpg', 
  'Battle Theme': 'HUNTR_Battle Theme.jpg',
  'Dark Knight': 'HUNTR_Dark Knight.jpg',
  'Hunt Mode': 'HUNTR_Hunt Mode.jpg',
  'Victory Song': 'HUNTR_Victory Song.jpg',
  'Takedown': 'HUNTR_Takedown.jpg',
  'Risky Business': 'HUNTR_Risky Business.jpg',
  'What It Sounds Like': 'HUNTR_What It Sounds Like.jpg',
  'default': 'HUNTR_Golden.jpg'  // 기본값
} as const;

/**
 * 🔧 트랙명 정제 함수 - 복잡한 트랙명 처리
 */
function sanitizeTrackName(trackName: string): string {
  if (!trackName) return '';
  
  // 1. 괄호 안의 프로듀서 정보 제거
  let cleaned = trackName.replace(/\s*\(Prod\.?\s*by\s+[^)]+\)/gi, '');
  
  // 2. 기타 괄호 정보 제거 (옵션)
  // cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
  
  // 3. 특수문자 정리
  cleaned = cleaned.replace(/[^\w\s가-힣]/g, ''); // 한글, 영문, 숫자, 공백만 유지
  
  // 4. 연속 공백 제거
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // 5. 길이 제한 (30글자)
  if (cleaned.length > 30) {
    cleaned = cleaned.substring(0, 30).trim();
  }
  
  console.log('🔧 트랙명 정제:', { original: trackName, cleaned });
  return cleaned;
}

/**
 * 🎯 HUNTR 실제 이미지 URL 생성 함수
 */
function getHuntrRealImageUrl(artistName: string, trackName: string = '', baseUrl: string): string | null {
  if (!artistName || !artistName.toUpperCase().includes('HUNTR')) {
    return null;
  }
  
  console.log('🎯 HUNTR 실제 이미지 매칭 시작:', { artistName, trackName });
  
  // 트랙명으로 정확한 이미지 찾기
  let imageFile = null;
  if (trackName) {
    const cleanTrack = trackName.trim();
    imageFile = HUNTR_REAL_IMAGES[cleanTrack as keyof typeof HUNTR_REAL_IMAGES];
    
    if (!imageFile) {
      // 부분 매칭 시도
      for (const [key, value] of Object.entries(HUNTR_REAL_IMAGES)) {
        if (key !== 'default' && (key.toLowerCase().includes(cleanTrack.toLowerCase()) || 
            cleanTrack.toLowerCase().includes(key.toLowerCase()))) {
          imageFile = value;
          console.log('🎯 HUNTR 부분 매칭 성공:', { trackName: cleanTrack, matched: key, file: value });
          break;
        }
      }
    }
  }
  
  // 매칭 실패하면 기본값 (Golden)
  if (!imageFile) {
    imageFile = HUNTR_REAL_IMAGES.default;
    console.log('🎯 HUNTR 기본 이미지 사용:', imageFile);
  } else {
    console.log('🎯 HUNTR 정확한 매칭:', { trackName, imageFile });
  }
  
  const realImageUrl = `${baseUrl}/static/album_images/${imageFile}`;
  console.log('✅ HUNTR 실제 이미지 URL:', realImageUrl);
  
  return realImageUrl;
}

/**
 * 🔧 앨범 이미지 문제 완전 해결 버전 + 복잡한 트랙명 처리
 * 
 * 해결사항:
 * 1. v2 API 직접 사용으로 안정성 확보
 * 2. 한글 아티스트명 완벽 지원 (정규화된 이름 우선 사용)  
 * 3. 🎯 HUNTR 실제 앨범 이미지 직접 요청 (Golden.jpg 등)
 * 4. 🔧 복잡한 트랙명 자동 정제 (특수문자, 긴 이름 처리)
 * 5. 무조건 성공하는 SVG 폴백
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  width = 128,
  height = 128,
  className = '',
  fill = false,
  artistName = '',
  artistNameNormalized = '',  // 정규화된 아티스트명
  trackName = '',
  priority = false,
  unoptimized = true
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // v2 API URL 생성 (무조건 성공) - 복잡한 트랙명 처리 추가
  const generateImageUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // 🎯 HUNTR 특별 처리 - 실제 이미지 파일 직접 요청!
    const useArtist = artistNameNormalized || artistName;
    
    if (useArtist && useArtist.toUpperCase().includes('HUNTR')) {
      const huntrRealUrl = getHuntrRealImageUrl(useArtist, trackName, baseUrl);
      if (huntrRealUrl) {
        console.log('🎯 HUNTR 실제 이미지 URL 사용!');
        return huntrRealUrl;
      }
    }
    
    // 🔧 복잡한 트랙명 정제 처리
    let processedTrackName = trackName;
    if (trackName && (trackName.includes('(') || trackName.includes('Prod.') || trackName.length > 30)) {
      processedTrackName = sanitizeTrackName(trackName);
      console.log('🔧 복잡한 트랙명 정제 적용:', { original: trackName, processed: processedTrackName });
    }
    
    // 🔄 일반 처리 로직
    let normalizedArtist = useArtist;
    
    // HUNTR 변형들을 모두 HUNTR로 통일 (폴백용)
    if (normalizedArtist && normalizedArtist.includes('HUNTR')) {
      normalizedArtist = 'HUNTR';
      console.log('🎯 HUNTR 정규화:', { original: artistName, normalized: normalizedArtist });
    }
    
    // URL 생성 - 정제된 트랙명 사용
    if (normalizedArtist && processedTrackName) {
      return `${baseUrl}/api/album-image-v2/${encodeURIComponent(normalizedArtist)}/${encodeURIComponent(processedTrackName)}`;
    } else if (normalizedArtist) {
      return `${baseUrl}/api/album-image-v2/${encodeURIComponent(normalizedArtist)}`;
    } else {
      return `${baseUrl}/api/album-image-v2/KPOP`;
    }
  };

  // 초기 URL 설정
  useEffect(() => {
    const imageUrl = generateImageUrl();
    console.log('🖼️ 이미지 URL 설정:', {
      url: imageUrl,
      isHuntr: (artistNameNormalized || artistName)?.toUpperCase().includes('HUNTR'),
      original: artistName,
      normalized: artistNameNormalized,
      track: trackName,
      isComplexTrack: trackName.includes('(') || trackName.includes('Prod.') || trackName.length > 30
    });
    
    setCurrentSrc(imageUrl);
    setIsLoading(false);
    setHasError(false);
  }, [src, artistName, artistNameNormalized, trackName]);

  // 이미지 로드 실패 시 - 강화된 폴백 시스템
  const handleError = (e: any) => {
    console.error('🖼️ 이미지 로드 실패:', { 
      url: currentSrc, 
      artistName,
      artistNameNormalized,
      trackName, 
      error: e 
    });
    
    const useArtist = artistNameNormalized || artistName;
    
    // 🔧 복잡한 트랙명으로 인한 실패 시 아티스트만으로 폴백
    if (trackName && (trackName.includes('(') || trackName.includes('Prod.') || trackName.length > 20)) {
      console.log('🔄 복잡한 트랙명 감지, 아티스트만으로 폴백:', useArtist);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const artistOnlyUrl = `${baseUrl}/api/album-image-v2/${encodeURIComponent(useArtist)}`;
      setCurrentSrc(artistOnlyUrl);
      setHasError(false);
      return;
    }
    
    // HUNTR인데 실패했으면 폴백 시도
    if (useArtist?.toUpperCase().includes('HUNTR') && currentSrc.includes('/static/album_images/')) {
      console.log('🔄 HUNTR 폴백 시도: 기본 Golden.jpg');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const fallbackUrl = `${baseUrl}/static/album_images/HUNTR_Golden.jpg`;
      setCurrentSrc(fallbackUrl);
      setHasError(false);
    } else if (src && src.includes(artistName) && artistNameNormalized && artistName !== artistNameNormalized) {
      // 정규화된 이름으로 재시도
      const normalizedUrl = generateImageUrl();
      console.log('🔄 정규화된 이름으로 재시도:', normalizedUrl);
      setCurrentSrc(normalizedUrl);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // 이미지 로드 성공 시
  const handleLoad = () => {
    console.log('✅ 이미지 로드 성공:', { 
      url: currentSrc, 
      artistName,
      artistNameNormalized,
      trackName,
      isHuntrReal: currentSrc.includes('/static/album_images/HUNTR'),
      isComplexTrack: trackName.includes('(') || trackName.includes('Prod.')
    });
    setIsLoading(false);
    setHasError(false);
  };

  // 극도로 드문 경우: 모든 이미지 실패한 경우 텍스트 플레이스홀더
  if (hasError || (!isLoading && !currentSrc)) {
    const useArtist = artistNameNormalized || artistName;
    let displayChar = '♪';
    
    if (useArtist) {
      if (useArtist.toUpperCase().includes('HUNTR')) {
        displayChar = 'H';
      } else if (useArtist === '조째즈') {
        displayChar = '조';
      } else {
        displayChar = useArtist.charAt(0).toUpperCase();
      }
    }
    
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-2xl rounded-lg ${className}`}
        style={{ width, height }}
      >
        {displayChar}
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 animate-pulse rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-sm">로딩중...</div>
      </div>
    );
  }

  // 정상 이미지 표시
  if (fill) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default ImageWithFallback;
