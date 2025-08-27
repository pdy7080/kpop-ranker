// 자동완성 클릭 핸들러 수정 패치
import { useRouter } from 'next/router';

export const handleAutocompleteClick = (suggestion: any, router: any) => {
  console.log('🎯 자동완성 클릭:', suggestion);
  
  // 포트폴리오 추천 클릭 무시
  if (suggestion.special) {
    return;
  }
  
  // 즉시 라우팅
  if (suggestion.type === 'artist') {
    const artistName = suggestion.name || suggestion.artist || suggestion.display;
    router.push(`/artist/${encodeURIComponent(artistName)}`);
  } else if (suggestion.type === 'track') {
    const artistName = suggestion.artist || 'Unknown';
    const trackName = suggestion.track || suggestion.name || suggestion.display;
    router.push(`/track/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`);
  } else {
    router.push(`/search?q=${encodeURIComponent(suggestion.display)}`);
  }
};
