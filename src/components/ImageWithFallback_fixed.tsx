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
  artistNameNormalized?: string;
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
  'default': 'HUNTR_Golden.jpg'
} as const;

/**
 * 🔧 트랙명 정제 함수 - 복잡한 트랙명 처리
 */
function sanitizeTrackName(trackName: string): string {
  if (!trackName) return '';
  
  // 1. 괄호 안의 프로듀서 정보 제거
  let cleaned = trackName.replace(/\s*\(Prod\.?\s*by\s+[^)]+\)/gi, '');
  
  // 2. 연속 공백 제거
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // 3. 길이 제한 (30글자)
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
 * 🔥 핵심 수정: 한글 그대로 전송!
 * 한글→영어 변환을 제거하고 원본 그대로 사용
 */
function generateSafeUrl(artist: string, track: string = '', baseUrl: string): string {
  console.log('🚀 URL 생성 시작 (한글 그대로):', { artist, track });
  
  // 한글 변환 제거! 원본 그대로 사용
  let finalArtist = artist;
  let finalTrack = track;
  
  // 공백과 특수문자만 URL 인코딩
  if (finalArtist) {
    finalArtist = encodeURIComponent(finalArtist);
  }
  if (finalTrack) {
    finalTrack = encodeURIComponent(finalTrack);
  }
  
  const finalUrl = `${baseUrl}/api/album-image-v2/${finalArtist}/${finalTrack}`;
  
  console.log('✅ 최종 URL 생성 (한글 유지):', { 
    originalArtist: artist,
    finalArtist,
    originalTrack: track,
    finalTrack,
    finalUrl
  });
  
  return finalUrl;
}

/**
 * 🔧 앨범 이미지 문제 완전 해결 버전 - 한글 그대로 전송!
 * 
 * 해결사항:
 * 1. 🔥 한글 아티스트명 그대로 전송 (변환 제거)
 * 2. 백엔드 파일명과 일치하도록 함
 * 3. HUNTR은 특별 처리 유지
 * 4. 복잡한 트랙명 자동 정제
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
  artistNameNormalized = '',
  trackName = '',
  priority = false,
  unoptimized = true
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // v2 API URL 생성 - 한글 그대로!
  const generateImageUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // 🎯 HUNTR 특별 처리 - 실제 이미지 파일 직접 요청!
    const useArtist = artistName; // 정규화 사용 안함, 원본 사용
    
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
    
    // 🔥 핵심: 한글 그대로 전송
    return generateSafeUrl(useArtist, processedTrackName, baseUrl);
  };

  // 초기 URL 설정
  useEffect(() => {
    const imageUrl = generateImageUrl();
    console.log('🖼️ 이미지 URL 설정 (한글 유지):', {
      url: imageUrl,
      isHuntr: artistName?.toUpperCase().includes('HUNTR'),
      original: artistName,
      track: trackName,
      isComplexTrack: trackName?.includes('(') || trackName?.includes('Prod.') || trackName?.length > 30
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
      trackName, 
      error: e 
    });
    
    // 🔧 복잡한 트랙명으로 인한 실패 시 아티스트만으로 폴백
    if (trackName && (trackName.includes('(') || trackName.includes('Prod.') || trackName.length > 20)) {
      console.log('🔄 복잡한 트랙명 감지, 아티스트만으로 폴백:', artistName);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const artistOnlyUrl = generateSafeUrl(artistName, '', baseUrl);
      setCurrentSrc(artistOnlyUrl);
      setHasError(false);
      return;
    }
    
    // HUNTR인데 실패했으면 폴백 시도
    if (artistName?.toUpperCase().includes('HUNTR') && currentSrc.includes('/static/album_images/')) {
      console.log('🔄 HUNTR 폴백 시도: 기본 Golden.jpg');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const fallbackUrl = `${baseUrl}/static/album_images/HUNTR_Golden.jpg`;
      setCurrentSrc(fallbackUrl);
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
      trackName,
      isHuntrReal: currentSrc.includes('/static/album_images/HUNTR'),
      isComplexTrack: trackName?.includes('(') || trackName?.includes('Prod.')
    });
    setIsLoading(false);
    setHasError(false);
  };

  // 극도로 드문 경우: 모든 이미지 실패한 경우 텍스트 플레이스홀더
  if (hasError || (!isLoading && !currentSrc)) {
    let displayChar = '♪';
    
    if (artistName) {
      if (artistName.toUpperCase().includes('HUNTR')) {
        displayChar = 'H';
      } else if (artistName === '조째즈') {
        displayChar = '조';
      } else {
        // 한글 처리
        const firstChar = artistName.charAt(0);
        if (/[가-힣]/.test(firstChar)) {
          displayChar = firstChar;
        } else {
          displayChar = firstChar.toUpperCase();
        }
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
