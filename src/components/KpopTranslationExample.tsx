// K-POP 콘텐츠 번역 사용 예시
import React from 'react';
import { useKpopTranslation } from '@/contexts/KpopTranslation';

// 트렌딩 차트 컴포넌트
export const TrendingChart = ({ data }) => {
  const { translateArtist, translateSong, language } = useKpopTranslation();
  
  return (
    <div className="trending-chart">
      {data.map((item, index) => (
        <div key={item.id} className="chart-item">
          <span className="rank">#{index + 1}</span>
          
          {/* 아티스트명 자동 번역 */}
          <span className="artist">
            {translateArtist(item.artist)}
          </span>
          
          {/* 곡 제목 자동 번역 */}
          <span className="title">
            {translateSong(item.title)}
          </span>
        </div>
      ))}
    </div>
  );
};

// 실제 사용 예시
// "방탄소년단" → 영어: "BTS", 일본어: "防弾少年団", 중국어: "防弹少年团"
// "봄날" → 영어: "Spring Day", 일본어: "春の日", 중국어: "春日"

// 새로운 아티스트 추가 시
// 1. KpopTranslation.tsx의 artistNameMap에 추가
// 2. 또는 백엔드 API에서 자동 업데이트

// 검색 컴포넌트
export const SearchBox = () => {
  const { translateArtist, language } = useKpopTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (term: string) => {
    // 검색어를 한국어로 변환하여 검색
    // 예: "BTS" 입력 → "방탄소년단"으로도 검색
    const koreanTerm = translateArtist(term);
    const englishTerm = artistNameMap[term]?.en || term;
    
    // 두 가지 모두로 검색
    searchAPI([koreanTerm, englishTerm]);
  };
  
  return (
    <input
      placeholder={
        language === 'ko' ? '아티스트 검색...' :
        language === 'en' ? 'Search artist...' :
        language === 'ja' ? 'アーティスト検索...' :
        '搜索艺人...'
      }
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
};