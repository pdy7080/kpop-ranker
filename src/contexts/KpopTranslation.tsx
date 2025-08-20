// K-POP 아티스트/곡 자동 번역 시스템
import { useTranslation } from './TranslationContext';

// 아티스트 공식 명칭 매핑
const artistNameMap = {
  // 그룹
  '방탄소년단': {
    ko: '방탄소년단',
    en: 'BTS',
    ja: '防弾少年団',
    zh: '防弹少年团'
  },
  'BTS': {
    ko: '방탄소년단',
    en: 'BTS',
    ja: 'BTS',
    zh: 'BTS'
  },
  '블랙핑크': {
    ko: '블랙핑크',
    en: 'BLACKPINK',
    ja: 'BLACKPINK',
    zh: 'BLACKPINK'
  },
  'BLACKPINK': {
    ko: '블랙핑크',
    en: 'BLACKPINK',
    ja: 'BLACKPINK',
    zh: 'BLACKPINK'
  },
  '세븐틴': {
    ko: '세븐틴',
    en: 'SEVENTEEN',
    ja: 'SEVENTEEN',
    zh: 'SEVENTEEN'
  },
  '스트레이키즈': {
    ko: '스트레이키즈',
    en: 'Stray Kids',
    ja: 'Stray Kids',
    zh: 'Stray Kids'
  },
  '엔하이픈': {
    ko: '엔하이픈',
    en: 'ENHYPEN',
    ja: 'ENHYPEN',
    zh: 'ENHYPEN'
  },
  '투모로우바이투게더': {
    ko: '투모로우바이투게더',
    en: 'TOMORROW X TOGETHER',
    ja: 'TOMORROW X TOGETHER',
    zh: 'TOMORROW X TOGETHER'
  },
  'TXT': {
    ko: 'TXT',
    en: 'TXT',
    ja: 'TXT',
    zh: 'TXT'
  },
  '에이티즈': {
    ko: '에이티즈',
    en: 'ATEEZ',
    ja: 'ATEEZ',
    zh: 'ATEEZ'
  },
  '아이브': {
    ko: '아이브',
    en: 'IVE',
    ja: 'IVE',
    zh: 'IVE'
  },
  '르세라핌': {
    ko: '르세라핌',
    en: 'LE SSERAFIM',
    ja: 'LE SSERAFIM',
    zh: 'LE SSERAFIM'
  },
  '뉴진스': {
    ko: '뉴진스',
    en: 'NewJeans',
    ja: 'NewJeans',
    zh: 'NewJeans'
  },
  '에스파': {
    ko: '에스파',
    en: 'aespa',
    ja: 'aespa',
    zh: 'aespa'
  },
  'NCT': {
    ko: 'NCT',
    en: 'NCT',
    ja: 'NCT',
    zh: 'NCT'
  },
  'NCT DREAM': {
    ko: 'NCT DREAM',
    en: 'NCT DREAM',
    ja: 'NCT DREAM',
    zh: 'NCT DREAM'
  },
  '엑소': {
    ko: '엑소',
    en: 'EXO',
    ja: 'EXO',
    zh: 'EXO'
  },
  
  // 솔로
  '아이유': {
    ko: '아이유',
    en: 'IU',
    ja: 'IU',
    zh: 'IU'
  },
  'IU': {
    ko: '아이유',
    en: 'IU',
    ja: 'IU',
    zh: 'IU'
  },
  '지드래곤': {
    ko: '지드래곤',
    en: 'G-DRAGON',
    ja: 'G-DRAGON',
    zh: 'G-DRAGON'
  },
  'G-DRAGON': {
    ko: '지드래곤',
    en: 'G-DRAGON',
    ja: 'G-DRAGON',
    zh: 'G-DRAGON'
  },
  '태양': {
    ko: '태양',
    en: 'TAEYANG',
    ja: 'SOL',
    zh: '太阳'
  },
  '제니': {
    ko: '제니',
    en: 'JENNIE',
    ja: 'JENNIE',
    zh: 'JENNIE'
  },
  '리사': {
    ko: '리사',
    en: 'LISA',
    ja: 'LISA',
    zh: 'LISA'
  },
  '로제': {
    ko: '로제',
    en: 'ROSÉ',
    ja: 'ROSÉ',
    zh: 'ROSÉ'
  },
  '지수': {
    ko: '지수',
    en: 'JISOO',
    ja: 'JISOO',
    zh: 'JISOO'
  }
};

// 곡 제목 매핑 (주요 히트곡)
const songTitleMap = {
  // BTS
  '봄날': {
    ko: '봄날',
    en: 'Spring Day',
    ja: '春の日',
    zh: '春日'
  },
  '피 땀 눈물': {
    ko: '피 땀 눈물',
    en: 'Blood Sweat & Tears',
    ja: '血、汗、涙',
    zh: '血汗泪'
  },
  '작은 것들을 위한 시': {
    ko: '작은 것들을 위한 시',
    en: 'Boy With Luv',
    ja: '作은 것들을 위한 시',
    zh: '致小事物的诗'
  },
  
  // BLACKPINK
  '뚜두뚜두': {
    ko: '뚜두뚜두',
    en: 'DDU-DU DDU-DU',
    ja: 'DDU-DU DDU-DU',
    zh: 'DDU-DU DDU-DU'
  },
  '마지막처럼': {
    ko: '마지막처럼',
    en: 'AS IF IT\'S YOUR LAST',
    ja: '最後のように',
    zh: '最后的样子'
  },
  
  // 영어 제목은 그대로
  'Dynamite': {
    ko: 'Dynamite',
    en: 'Dynamite',
    ja: 'Dynamite',
    zh: 'Dynamite'
  },
  'Butter': {
    ko: 'Butter',
    en: 'Butter',
    ja: 'Butter',
    zh: 'Butter'
  }
};

// 스마트 번역 함수
export function translateKpopContent(
  content: string,
  type: 'artist' | 'song' | 'text',
  targetLang: 'ko' | 'en' | 'ja' | 'zh'
): string {
  
  // 1. 아티스트명 번역
  if (type === 'artist') {
    // 정확한 매칭 시도
    const mapping = artistNameMap[content];
    if (mapping) {
      return mapping[targetLang];
    }
    
    // 대소문자 무시 매칭
    const lowerContent = content.toLowerCase();
    for (const [key, value] of Object.entries(artistNameMap)) {
      if (key.toLowerCase() === lowerContent) {
        return value[targetLang];
      }
    }
    
    // 매핑이 없으면 원본 반환 (대부분 영어명)
    return content;
  }
  
  // 2. 곡 제목 번역
  if (type === 'song') {
    const mapping = songTitleMap[content];
    if (mapping) {
      return mapping[targetLang];
    }
    
    // feat. 처리
    if (content.includes('feat.') || content.includes('Feat.')) {
      const parts = content.split(/feat\.|Feat\./i);
      const mainTitle = parts[0].trim();
      const featuring = parts[1]?.trim();
      
      const translatedMain = songTitleMap[mainTitle]?.[targetLang] || mainTitle;
      if (featuring) {
        return `${translatedMain} feat. ${featuring}`;
      }
      return translatedMain;
    }
    
    // 매핑이 없으면 원본 반환
    return content;
  }
  
  // 3. 일반 텍스트는 원본 반환
  return content;
}

// React Hook
export function useKpopTranslation() {
  const { language } = useTranslation();
  
  const translateArtist = (artist: string) => {
    return translateKpopContent(artist, 'artist', language);
  };
  
  const translateSong = (song: string) => {
    return translateKpopContent(song, 'song', language);
  };
  
  return {
    translateArtist,
    translateSong,
    language
  };
}

// 자동 업데이트를 위한 API 연동 (선택적)
export async function updateTranslationMap() {
  try {
    // 백엔드에서 최신 매핑 데이터 가져오기
    const response = await fetch('/api/translation-map');
    const data = await response.json();
    
    // 로컬 스토리지에 캐싱
    localStorage.setItem('artistNameMap', JSON.stringify(data.artists));
    localStorage.setItem('songTitleMap', JSON.stringify(data.songs));
    localStorage.setItem('lastUpdated', new Date().toISOString());
    
    return data;
  } catch (error) {
    console.error('Translation map update failed:', error);
    return null;
  }
}

// 초기화 시 캐시된 데이터 로드
export function loadCachedTranslations() {
  const cachedArtists = localStorage.getItem('artistNameMap');
  const cachedSongs = localStorage.getItem('songTitleMap');
  const lastUpdated = localStorage.getItem('lastUpdated');
  
  // 24시간 이상 지났으면 업데이트
  if (lastUpdated) {
    const updateTime = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      updateTranslationMap();
    }
  } else {
    updateTranslationMap();
  }
  
  if (cachedArtists) {
    Object.assign(artistNameMap, JSON.parse(cachedArtists));
  }
  if (cachedSongs) {
    Object.assign(songTitleMap, JSON.parse(cachedSongs));
  }
}