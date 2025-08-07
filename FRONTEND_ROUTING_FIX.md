/**
 * 프론트엔드 라우팅 문제 해결 가이드
 * 
 * 문제:
 * 1. 트렌딩에서 곡 클릭 시 URL이 http:/http://localhost:3007/... 으로 중복
 * 2. 검색 후 클릭 시 artist 파라미터가 빈 문자열
 * 
 * 해결 방법:
 */

// ===============================
// 1. 트렌딩 페이지 수정 (src/pages/trending.tsx)
// ===============================

// 현재 코드 (문제 있음):
const handleItemClick = (artist: string, track?: string) => {
  if (track) {
    // 이 부분이 문제일 수 있음 - router.push 사용법 확인 필요
    router.push(`/search?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`);
  } else {
    router.push(`/artist/${encodeURIComponent(artist)}`);
  }
};

// 수정된 코드:
const handleItemClick = (artist: string, track?: string) => {
  if (track) {
    // pathname과 query를 분리하여 전달
    router.push({
      pathname: '/search',
      query: { 
        artist: artist || '',  // artist가 undefined인 경우 빈 문자열
        track: track || ''
      }
    });
  } else {
    router.push(`/artist/${encodeURIComponent(artist)}`);
  }
};

// ===============================
// 2. 검색 컴포넌트 수정 (src/components/UnifiedSearchFixed.tsx 찾기)
// ===============================

// 검색 결과 클릭 시 artist와 track을 모두 전달하도록 수정
const handleSearchResultClick = (item: any) => {
  // artist와 track이 모두 있는지 확인
  const artistName = item.artist || item.artist_name || '';
  const trackName = item.track || item.track_title || '';
  
  if (trackName) {
    // track이 있으면 search 페이지로
    router.push({
      pathname: '/search',
      query: { 
        artist: artistName,
        track: trackName 
      }
    });
  } else if (artistName) {
    // artist만 있으면 artist 페이지로
    router.push(`/artist/${encodeURIComponent(artistName)}`);
  }
};

// ===============================
// 3. 메인 페이지 트렌딩 섹션 수정 (만약 있다면)
// ===============================

// URL 중복 문제 해결
const navigateToSearch = (artist: string, track: string) => {
  // 절대 경로 대신 상대 경로 사용
  const searchUrl = `/search?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`;
  
  // window.location.href 대신 router.push 사용
  router.push(searchUrl);
  
  // 또는 객체 형태로 전달
  router.push({
    pathname: '/search',
    query: { artist, track }
  });
};

// ===============================
// 4. 아티스트 상세 페이지 수정
// ===============================

// 곡 리스트 클릭 시 artist 정보 포함
const handleTrackClick = (track: string) => {
  const artistName = router.query.name || '';  // 현재 아티스트 페이지의 아티스트명
  
  router.push({
    pathname: '/search',
    query: { 
      artist: artistName,
      track: track 
    }
  });
};

// ===============================
// 5. 공통 유틸리티 함수 생성
// ===============================

// src/utils/navigation.ts
export const navigateToTrackSearch = (router: any, artist: string, track: string) => {
  // artist와 track 모두 필수
  if (!artist || !track) {
    console.error('Artist and track are required for search navigation');
    return;
  }
  
  router.push({
    pathname: '/search',
    query: { 
      artist: artist.trim(),
      track: track.trim()
    }
  });
};

export const navigateToArtist = (router: any, artist: string) => {
  if (!artist) {
    console.error('Artist is required for artist page navigation');
    return;
  }
  
  router.push(`/artist/${encodeURIComponent(artist.trim())}`);
};
