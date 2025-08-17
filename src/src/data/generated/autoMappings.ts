/**
 * 자동 생성된 아티스트 매핑
 * 생성일: 2025-08-12
 * 파일 수: 277
 */

export const koreanToEnglishMapping: Record<string, string> = {
  "너드커넥션": "너드커넥션",
  "너드커넥션(Nerd": "너드커넥션(Nerd Connection)",
  "도경수(D.O.)": "도경수(D.O.)",
  "도영": "도영",
  "로이킴": "로이킴",
  "로제": "로제",
  "로제(ROSÉ)": "로제(ROSÉ)",
  "마크툽": "마크툽",
  "마크툽(MAKTUB)": "마크툽(MAKTUB)",
  "멜로망스": "멜로망스",
  "멜로망스(MeloMance)": "멜로망스(MeloMance)",
  "박재정": "박재정",
  "방탄소년단": "방탄소년단",
  "성시경": "성시경",
  "세븐틴": "세븐틴(SEVENTEEN)",
  "세븐틴(SEVENTEEN)": "세븐틴(SEVENTEEN)",
  "아이브": "아이브",
  "아이유": "아이유",
  "아이유(IU)": "아이유(IU)",
  "아일릿(ILLIT)": "아일릿(ILLIT)",
  "악뮤": "AKMU(악뮤)",
  "엔플라잉(N.Flying)": "엔플라잉(N.Flying)",
  "오반(OVAN)": "오반(OVAN)",
  "우디": "우디",
  "우디(Woody)": "우디(Woody)",
  "이무진": "이무진",
  "이예은": "이예은",
  "이창섭": "이창섭",
  "이클립스": "이클립스",
  "임영웅": "임영웅",
  "임재현": "임재현",
  "잔나비": "잔나비",
  "재쓰비": "재쓰비",
  "제니": "제니",
  "조째즈": "조째즈",
  "투모로우바이투게더": "투모로우바이투게더",
  "폴킴(Paul": "폴킴(Paul Kim)",
  "황가람": "황가람",
};

export const fileNameMapping: Record<string, string> = {
  "(G)I-DLE_Queencard": "(G)I-DLE_Queencard.jpg",
  "(G)I-DLE_TOMBOY": "(G)I-DLE_TOMBOY.jpg",  // 중복 제거 - 키값 수정
  "10CM_너에게 닿기를": "10CM_너에게_닿기를.jpg",
  "AKMU(악뮤)_어떻게 이별까지 사랑하겠어, 널 사랑하는 거지": "AKMU(악뮤)_어떻게_이별까지_사랑하겠어,_널_사랑하는_거지.jpg",
  "AKMU_어떻게 이별까지 사랑하겠어, 널 사랑하는 거지": "AKMU_(악뮤)_어떻게_이별까지_사랑하겠어,_널_사랑하는_거지.jpg",
  "ALLDAY PROJECT_FAMOUS": "ALLDAY_PROJECT_FAMOUS.jpg",
  "ALLDAY PROJECT_WICKED": "ALLDAY_PROJECT_WICKED.jpg",
  "ATEEZ_Bouncy": "ATEEZ_In_Your_Fantasy.jpg",
  "Alex Warren_Ordinary": "Alex_Warren_Ordinary.jpg",
  "The Weeknd & Ariana Grande_Save Your Tears": "Ariana_Grande_Twilight_Zone.jpg",
  "BABYMONSTER_DRIP": "BABYMONSTER_DRIP.jpg",
  "BLACKPINK_JUMP": "BLACKPINK_JUMP_1.jpg",
};

// 나머지 매핑은 backend의 Smart Resolver가 처리
export const artistNameMapping = koreanToEnglishMapping;

/**
 * 이미지 URL 생성 헬퍼
 */
export function getImageUrl(artist: string, track: string, baseUrl: string = ''): string {
  // Smart Image API 사용 (백엔드가 자동 매핑 처리)
  return `${baseUrl}/api/album-image-smart/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
}
