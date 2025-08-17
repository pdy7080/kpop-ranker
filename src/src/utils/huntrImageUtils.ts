// 🎯 스마트 이미지 유틸리티 - 하드코딩 완전 제거!
// 모든 이미지 처리를 백엔드 SmartImageResolver에 위임

/**
 * 🖼️ 통합 앨범 이미지 URL 생성 함수 - 스마트 API 사용
 * @param artist 아티스트명
 * @param track 트랙명 (선택)
 * @param baseUrl API 베이스 URL (기본값: localhost:5001)
 * @returns 스마트 이미지 API URL
 */
export function getUnifiedAlbumImageUrl(artist: string, track?: string, baseUrl?: string): string {
  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // 🎯 핵심: 모든 이미지 처리를 백엔드 스마트 API에 위임
  if (track) {
    return `${apiUrl}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
  }
  return `${apiUrl}/api/album-image-smart/${encodeURIComponent(artist)}`;
}

/**
 * 🎵 아티스트명 정규화 함수
 * @param artistName 원본 아티스트명
 * @returns 정규화된 아티스트명
 */
export function normalizeArtistName(artistName: string): string {
  if (!artistName) return artistName;
  
  // 백엔드에서 모든 정규화 처리
  return artistName;
}

/**
 * 🎯 이미지 로드 성공/실패 로깅
 */
export function logImageLoad(success: boolean, artist: string, track?: string, url?: string) {
  if (success) {
    console.log('✅ 스마트 이미지 로드 성공:', { 
      artist, 
      track, 
      url: url?.substring(0, 50) + '...'
    });
  } else {
    console.log('❌ 스마트 이미지 로드 실패:', { artist, track, url });
  }
}

/**
 * 🔄 이미지 폴백 처리 - 백엔드에서 자동 처리됨
 */
export function handleImageFallback(
  currentSrc: string, 
  artist: string, 
  track?: string,
  onFallback?: (newSrc: string) => void
) {
  // 스마트 API는 자체적으로 폴백을 처리하므로
  // 프론트엔드에서는 추가 폴백 처리가 필요 없음
  console.log('🔄 스마트 API가 폴백을 자동 처리합니다');
  return null;
}

export default {
  getUnifiedAlbumImageUrl,
  normalizeArtistName,
  logImageLoad,
  handleImageFallback
};
