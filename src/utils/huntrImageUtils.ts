// 🎯 HUNTR 실제 앨범 이미지 공통 유틸리티
// 모든 컴포넌트에서 동일한 HUNTR 이미지 로직을 사용하기 위한 공통 함수

// 🎯 HUNTR 실제 앨범 이미지 매핑 테이블
export const HUNTR_REAL_IMAGES = {
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
 * 🎯 HUNTR 실제 이미지 URL 생성 함수
 * @param artistName 아티스트명
 * @param trackName 트랙명 (선택)
 * @param baseUrl API 베이스 URL
 * @returns HUNTR 실제 이미지 URL 또는 null
 */
export function getHuntrRealImageUrl(artistName: string, trackName: string = '', baseUrl: string): string | null {
  if (!artistName || !artistName.toUpperCase().includes('HUNTR')) {
    return null;
  }
  
  console.log('🎯 HUNTR 실제 이미지 매칭:', { artistName, trackName });
  
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
    } else {
      console.log('🎯 HUNTR 정확한 매칭:', { trackName, imageFile });
    }
  }
  
  // 매칭 실패하면 기본값 (Golden)
  if (!imageFile) {
    imageFile = HUNTR_REAL_IMAGES.default;
    console.log('🎯 HUNTR 기본 이미지 사용:', imageFile);
  }
  
  const realImageUrl = `${baseUrl}/static/album_images/${imageFile}`;
  console.log('✅ HUNTR 실제 이미지 URL:', realImageUrl);
  
  return realImageUrl;
}

/**
 * 🖼️ 통합 앨범 이미지 URL 생성 함수 - HUNTR 특별 처리 포함
 * @param artist 아티스트명
 * @param track 트랙명 (선택)
 * @param baseUrl API 베이스 URL (기본값: localhost:5000)
 * @returns 최적화된 이미지 URL
 */
export function getUnifiedAlbumImageUrl(artist: string, track?: string, baseUrl?: string): string {
  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // 🎯 HUNTR 특별 처리 - 실제 이미지 파일 직접 요청!
  if (artist && artist.toUpperCase().includes('HUNTR')) {
    const huntrRealUrl = getHuntrRealImageUrl(artist, track || '', apiUrl);
    if (huntrRealUrl) {
      console.log('🎯 통합 함수에서 HUNTR 실제 이미지 사용!');
      return huntrRealUrl;
    }
  }
  
  // 기존 로직 (다른 아티스트들)
  if (track) {
    return `${apiUrl}/api/album-image-v2/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  }
  return `${apiUrl}/api/album-image-v2/${encodeURIComponent(artist)}`;
}

/**
 * 🎵 아티스트명 정규화 함수
 * @param artistName 원본 아티스트명
 * @returns 정규화된 아티스트명
 */
export function normalizeArtistName(artistName: string): string {
  if (!artistName) return artistName;
  
  // HUNTR 변형들을 모두 HUNTR로 통일
  if (artistName.includes('HUNTR')) {
    return 'HUNTR';
  }
  
  // 기타 정규화 로직 추가 가능
  return artistName;
}

/**
 * 🎯 이미지 로드 성공/실패 로깅
 */
export function logImageLoad(success: boolean, artist: string, track?: string, url?: string) {
  if (success) {
    console.log('✅ 이미지 로드 성공:', { 
      artist, 
      track, 
      url: url?.substring(0, 50) + '...', 
      isHuntrReal: url?.includes('/static/album_images/HUNTR') 
    });
  } else {
    console.log('❌ 이미지 로드 실패:', { artist, track, url });
  }
}

/**
 * 🔄 이미지 폴백 처리
 */
export function handleImageFallback(
  currentSrc: string, 
  artist: string, 
  track?: string,
  onFallback?: (newSrc: string) => void
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // HUNTR인데 실패했으면 Golden으로 폴백
  if (artist.toUpperCase().includes('HUNTR') && currentSrc.includes('/static/album_images/')) {
    const fallbackUrl = `${apiUrl}/static/album_images/HUNTR_Golden.jpg`;
    console.log('🔄 HUNTR 폴백 시도: Golden.jpg');
    onFallback?.(fallbackUrl);
    return fallbackUrl;
  }
  
  // 일반 아티스트는 아티스트만으로 재시도
  if (track) {
    const artistOnlyUrl = getUnifiedAlbumImageUrl(artist, undefined, apiUrl);
    console.log('🔄 트랙 제거하고 아티스트만으로 재시도:', artistOnlyUrl);
    onFallback?.(artistOnlyUrl);
    return artistOnlyUrl;
  }
  
  return null;
}

export default {
  HUNTR_REAL_IMAGES,
  getHuntrRealImageUrl,
  getUnifiedAlbumImageUrl,
  normalizeArtistName,
  logImageLoad,
  handleImageFallback
};
