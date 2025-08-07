import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

/**
 * 아티스트명 정규화 훅 (수정 버전)
 * 리다이렉트 대신 백엔드가 처리하도록 함
 */
export function useNormalizedArtist() {
  const router = useRouter();
  const { artist } = router.query;
  const artistName = Array.isArray(artist) ? artist[0] : artist || '';
  const [normalizedName, setNormalizedName] = useState(artistName);

  useEffect(() => {
    if (!artistName || !router.isReady) return;

    // 한글 -> 영어 매핑 (UI 표시용으로만 사용)
    const artistMappings: Record<string, string> = {
      '에스파': 'aespa',
      '뉴진스': 'NewJeans',
      '블랙핑크': 'BLACKPINK',
      '세븐틴': 'SEVENTEEN',
      '엔시티드림': 'NCT DREAM',
      '아이브': 'IVE',
      '르세라핌': 'LE SSERAFIM',
      '스트레이키즈': 'Stray Kids',
      '엔하이픈': 'ENHYPEN',
      '투모로우바이투게더': 'TOMORROW X TOGETHER',
      '에이티즈': 'ATEEZ',
      '트레저': 'TREASURE',
      '더보이즈': 'THE BOYZ',
      '아이유': 'IU',
      '태연': 'TAEYEON',
      '지드래곤': 'G-DRAGON',
      '빅뱅': 'BIGBANG',
      '방탄소년단': 'BTS',
      '엑소': 'EXO',
      '샤이니': 'SHINee',
      '몬스타엑스': 'MONSTA X',
      '갓세븐': 'GOT7',
      '비투비': 'BTOB',
      '아스트로': 'ASTRO',
      '원어스': 'ONEUS',
      '크래비티': 'CRAVITY',
      '더뉴식스': 'THE NEW SIX',
      '엑스디너리히어로즈': 'Xdinary Heroes',
      '엔믹스': 'NMIXX',
      '케플러': 'Kep1er',
      '라이즈': 'RIIZE',
      '제로베이스원': 'ZEROBASEONE',
      '보이넥스트도어': 'BOYNEXTDOOR',
      '피프티피프티': 'FIFTY FIFTY',
      '트와이스': 'TWICE',
      '있지': 'ITZY',
      '스테이씨': 'STAYC',
      '에버글로우': 'EVERGLOW',
      '위클리': 'Weeekly',
      '체리블렛': 'Cherry Bullet',
      '프로미스나인': 'fromis_9',
      '오마이걸': 'OH MY GIRL',
      '우주소녀': 'WJSN',
      '이달의소녀': 'LOONA',
      '드림캐쳐': 'Dreamcatcher',
      '마마무': 'MAMAMOO',
      '레드벨벳': 'Red Velvet',
      '소녀시대': 'Girls\' Generation',
      '카라': 'KARA',
      '블랙스완': 'BLACKSWAN',
      '퍼플키스': 'PURPLE KISS',
      '라잇썸': 'LIGHTSUM',
      '트라이비': 'TRI.BE',
      '비비즈': 'VIVIZ',
      '클라씨': 'CLASS:y',
      '미연': 'MIYEON',
      '유주': 'YUJU',
      '권은비': 'KWON EUN BI',
      '조유리': 'JO YURI',
      '김채원': 'KIM CHAEWON',
      '이채연': 'LEE CHAEYEON',
      '최예나': 'CHOI YENA',
      '강혜원': 'KANG HYEWON'
    };

    // 정규화된 이름 설정 (UI 표시용)
    if (artistMappings[artistName]) {
      setNormalizedName(artistMappings[artistName]);
    } else {
      setNormalizedName(artistName);
    }

    // 리다이렉트 제거 - 백엔드가 처리하도록 함
    // 아이유의 경우 백엔드가 "아이유"로 검색해야 찾을 수 있음
  }, [artistName, router]);

  // URL의 아티스트명 그대로 반환 (리다이렉트 하지 않음)
  return artistName;
}

/**
 * UI 표시용 정규화된 이름 가져오기
 */
export function getDisplayArtistName(artistName: string): string {
  const artistMappings: Record<string, string> = {
    '에스파': 'aespa',
    '뉴진스': 'NewJeans',
    '블랙핑크': 'BLACKPINK',
    '아이유': 'IU',
    // ... 나머지 매핑
  };

  return artistMappings[artistName] || artistName;
}
