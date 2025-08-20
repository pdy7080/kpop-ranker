import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { additionalTranslations } from '@/translations/additionalTranslations';

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translations: Record<string, string>;
  isLoading: boolean;
  t: (key: string, fallback?: string, params?: Record<string, string>) => string;
  translateText: (text: string, targetLang?: string) => Promise<string>;
  getTranslatedName: (name: string, category: 'artists' | 'tracks') => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// 기본 번역 데이터 (기존 번역과 추가 번역 병합)
const defaultTranslations: Record<string, any> = {
  ko: {
    ...additionalTranslations.ko,
    // Site Info
    'site.title': 'KPOP Ranker',
    'site.tagline': '실시간 K-POP 차트 분석',
    
    // Navigation
    'nav.home': '홈',
    'nav.trending': '트렌딩',
    'nav.search': '검색',
    'nav.portfolio': '포트폴리오',
    'nav.about': '소개',
    
    // Footer
    'footer.brand.description': '전 세계 K-POP 팬들을 위한\n실시간 차트 모니터링 플랫폼',
    'footer.service': '서비스',
    'footer.service.trending': '실시간 트렌딩',
    'footer.service.portfolio': '포트폴리오 관리',
    'footer.service.about': '서비스 소개',
    'footer.service.api': 'API 문서',
    'footer.company': '회사',
    'footer.company.about': '회사 소개',
    'footer.company.blog': '블로그',
    'footer.company.careers': '채용',
    'footer.company.contact': '문의하기',
    'footer.legal': '법적 고지',
    'footer.legal.privacy': '개인정보처리방침',
    'footer.legal.terms': '이용약관',
    'footer.legal.cookies': '쿠키 정책',
    'footer.newsletter.title': '뉴스레터',
    'footer.newsletter.description': '최신 K-POP 소식을 받아보세요',
    'footer.newsletter.placeholder': '이메일 주소',
    'footer.newsletter.button': '구독하기',
    'footer.copyright': '© 2025 KPOP FANfolio. All rights reserved.',
    'footer.made.with': 'Made with',
    'footer.made.for': 'for K-POP fans worldwide',
    
    // Main page
    'main.title': '전 세계 K-POP 차트를 한눈에',
    'main.stats.albums': '앨범 이미지',
    'main.stats.artists': '아티스트',
    'main.stats.charts': '차트',
    'tab.hot': '인기',
    'tab.rising': '급상승',
    'tab.global': '글로벌',
    'section.realtime': '실시간 차트',
    'section.bubble': '버블 차트',
    'section.trending': '트렌딩',
    'section.update': '업데이트 현황',
    
    // Common
    'button.play': '재생',
    'button.add': '추가',
    'button.remove': '제거',
    'button.share': '공유',
    'button.login': '로그인',
    'button.logout': '로그아웃',
    'chart.rank': '순위',
    'chart.artist': '아티스트',
    'chart.track': '곡명',
    'chart.change': '변동',
    'message.loading': '로딩 중...',
    'message.nodata': '데이터가 없습니다',
    'user.role': '포트폴리오 관리자',
    
    // Chart Update
    'chart.update.schedule': '[차트별 업데이트시간]',
    'chart.update.realtime': '[실시간 DB 업데이트 현황]',
    'chart.korea3': '한국 3사',
    'chart.schedule.korea': '(멜론, 지니, 벅스) → 하루 4회: 01시 / 07시 / 13시 / 19시',
    'chart.schedule.vibe': '→ 하루 2회: 01시 / 13시',
    'chart.schedule.flo': '→ 하루 4회: 01시 / 07시 / 13시 / 19시',
    'chart.schedule.spotify': '→ 매일 09:00 KST',
    'chart.schedule.youtube': '→ 매일 12:00 KST',
    'chart.schedule.billboard': '→ 매주 화요일 14:00 KST 경',
    'chart.tracks': '트랙',
    'chart.nodata': '데이터 없음',
    'chart.connecting': 'API 연결 중...',
    'chart.loading.crawl': '실제 크롤링 시간을 불러오는 중입니다',
    
    // Chart Elements (추가)
    'chart.score': '스코어',
    'chart.trend.score': '트렌드 스코어',
    'chart.trending.score': '트렌딩 스코어',
    'chart.out': '차트 아웃',
    
    // Interaction (추가)
    'click.detail': '클릭하여 상세보기',
    'click.navigate': '클릭하여 상세 페이지로 이동',
    
    // Temperature Descriptions (추가)
    'temp.very.hot': '매우 뜨거움 🔥',
    'temp.hot': '뜨거움 🔥',
    'temp.warm': '따뜻함 ☀️',
    'temp.cool': '차가움 ❄️',
    'temp.cold': '매우 차가움 ❄️',
    
    // Artist/Track Detail (추가)
    'detail.view': '상세보기',
    'artist.page': '아티스트 페이지',
    'portfolio.add': '포트폴리오에 추가',
    'chart.tabs.overview': '📊 개요',
    'chart.tabs.chart': '🏆 차트',
    'chart.tabs.history': '📈 히스토리',
    'chart.current.rank': '현재 차트 순위',
    'artist.tracks': '트랙',
    'artist.charts': '차트',
    'artist.peak': '최고 순위',
    'artist.popularity': '인기도',
  },
  en: {
    ...additionalTranslations.en,
    // Site Info
    'site.title': 'KPOP Ranker',
    'site.tagline': 'Real-time K-POP Chart Analysis',
    
    // Navigation
    'nav.home': 'Home',
    'nav.trending': 'Trending',
    'nav.search': 'Search',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'About',
    
    // Footer
    'footer.brand.description': 'Real-time chart monitoring platform\nfor K-POP fans worldwide',
    'footer.service': 'Service',
    'footer.service.trending': 'Real-time Trending',
    'footer.service.portfolio': 'Portfolio Management',
    'footer.service.about': 'About Service',
    'footer.service.api': 'API Documentation',
    'footer.company': 'Company',
    'footer.company.about': 'About Us',
    'footer.company.blog': 'Blog',
    'footer.company.careers': 'Careers',
    'footer.company.contact': 'Contact',
    'footer.legal': 'Legal',
    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.terms': 'Terms of Service',
    'footer.legal.cookies': 'Cookie Policy',
    'footer.newsletter.title': 'Newsletter',
    'footer.newsletter.description': 'Get the latest K-POP news',
    'footer.newsletter.placeholder': 'Email address',
    'footer.newsletter.button': 'Subscribe',
    'footer.copyright': '© 2025 KPOP FANfolio. All rights reserved.',
    'footer.made.with': 'Made with',
    'footer.made.for': 'for K-POP fans worldwide',
    
    // Main page
    'main.title': 'Real-time K-POP Charts at a Glance',
    'main.stats.albums': 'Album Images',
    'main.stats.artists': 'Artists',
    'main.stats.charts': 'Charts',
    'tab.hot': 'Hot',
    'tab.rising': 'Rising',
    'tab.global': 'Global',
    'section.realtime': 'Real-time Charts',
    'section.bubble': 'Bubble Chart',
    'section.trending': 'Trending',
    'section.update': 'Update Status',
    
    // Common
    'button.play': 'Play',
    'button.add': 'Add',
    'button.remove': 'Remove',
    'button.share': 'Share',
    'button.login': 'Login',
    'button.logout': 'Logout',
    'chart.rank': 'Rank',
    'chart.artist': 'Artist',
    'chart.track': 'Track',
    'chart.change': 'Change',
    'message.loading': 'Loading...',
    'message.nodata': 'No data available',
    'user.role': 'Portfolio Manager',
    
    // Chart Update
    'chart.update.schedule': '[Chart Update Schedule]',
    'chart.update.realtime': '[Real-time DB Update Status]',
    'chart.korea3': 'Korean Big 3',
    'chart.schedule.korea': '(Melon, Genie, Bugs) → 4 times daily: 01:00 / 07:00 / 13:00 / 19:00',
    'chart.schedule.vibe': '→ 2 times daily: 01:00 / 13:00',
    'chart.schedule.flo': '→ 4 times daily: 01:00 / 07:00 / 13:00 / 19:00',
    'chart.schedule.spotify': '→ Daily at 09:00 KST',
    'chart.schedule.youtube': '→ Daily at 12:00 KST',
    'chart.schedule.billboard': '→ Every Tuesday around 14:00 KST',
    'chart.tracks': 'tracks',
    'chart.nodata': 'No data',
    'chart.connecting': 'Connecting to API...',
    'chart.loading.crawl': 'Loading actual crawl times',
    
    // Chart Elements (Added)
    'chart.score': 'Score',
    'chart.trend.score': 'Trend Score',
    'chart.trending.score': 'Trending Score',
    'chart.out': 'Out of Chart',
    
    // Interaction (Added)
    'click.detail': 'Click for details',
    'click.navigate': 'Click to navigate to detail page',
    
    // Temperature Descriptions (Added)
    'temp.very.hot': 'Very Hot 🔥',
    'temp.hot': 'Hot 🔥',
    'temp.warm': 'Warm ☀️',
    'temp.cool': 'Cool ❄️',
    'temp.cold': 'Very Cold ❄️',
    
    // Artist/Track Detail (Added)
    'detail.view': 'View Details',
    'artist.page': 'Artist Page',
    'portfolio.add': 'Add to Portfolio',
    'chart.tabs.overview': '📊 Overview',
    'chart.tabs.chart': '🏆 Charts',
    'chart.tabs.history': '📈 History',
    'chart.current.rank': 'Current Chart Rankings',
    'artist.tracks': 'Tracks',
    'artist.charts': 'Charts',
    'artist.peak': 'Peak Position',
    'artist.popularity': 'Popularity',
  },
  ja: {
    ...additionalTranslations.ja,
    // Site Info
    'site.title': 'KPOP Ranker',
    'site.tagline': 'リアルタイムK-POPチャート分析',
    
    // Navigation
    'nav.home': 'ホーム',
    'nav.trending': 'トレンド',
    'nav.search': '検索',
    'nav.portfolio': 'ポートフォリオ',
    'nav.about': '紹介',
    
    // Footer
    'footer.brand.description': '世界中のK-POPファンのための\nリアルタイムチャート監視プラットフォーム',
    'footer.service': 'サービス',
    'footer.service.trending': 'リアルタイムトレンド',
    'footer.service.portfolio': 'ポートフォリオ管理',
    'footer.service.about': 'サービス紹介',
    'footer.service.api': 'APIドキュメント',
    'footer.company': '会社',
    'footer.company.about': '会社紹介',
    'footer.company.blog': 'ブログ',
    'footer.company.careers': '採用',
    'footer.company.contact': 'お問い合わせ',
    'footer.legal': '法的事項',
    'footer.legal.privacy': 'プライバシーポリシー',
    'footer.legal.terms': '利用規約',
    'footer.legal.cookies': 'クッキーポリシー',
    'footer.newsletter.title': 'ニュースレター',
    'footer.newsletter.description': '最新のK-POPニュースを受け取る',
    'footer.newsletter.placeholder': 'メールアドレス',
    'footer.newsletter.button': '購読',
    'footer.copyright': '© 2025 KPOP FANfolio. All rights reserved.',
    'footer.made.with': 'Made with',
    'footer.made.for': 'for K-POP fans worldwide',
    
    // Main page
    'main.title': 'リアルタイムK-POPチャート',
    'main.stats.albums': 'アルバム画像',
    'main.stats.artists': 'アーティスト',
    'main.stats.charts': 'チャート',
    'tab.hot': '人気',
    'tab.rising': '急上昇',
    'tab.global': 'グローバル',
    'section.realtime': 'リアルタイムチャート',
    'section.bubble': 'バブルチャート',
    'section.trending': 'トレンディング',
    'section.update': 'アップデート状況',
    
    // Common
    'button.play': '再生',
    'button.add': '追加',
    'button.remove': '削除',
    'button.share': 'シェア',
    'button.login': 'ログイン',
    'button.logout': 'ログアウト',
    'chart.rank': 'ランク',
    'chart.artist': 'アーティスト',
    'chart.track': '曲名',
    'chart.change': '変動',
    'message.loading': '読み込み中...',
    'message.nodata': 'データがありません',
    'user.role': 'ポートフォリオマネージャー',
    
    // Chart Update
    'chart.update.schedule': '[チャート更新スケジュール]',
    'chart.update.realtime': '[リアルタイムDB更新状況]',
    'chart.korea3': '韓国3社',
    'chart.schedule.korea': '(Melon, Genie, Bugs) → 1日4回: 01時 / 07時 / 13時 / 19時',
    'chart.schedule.vibe': '→ 1日2回: 01時 / 13時',
    'chart.schedule.flo': '→ 1日4回: 01時 / 07時 / 13時 / 19時',
    'chart.schedule.spotify': '→ 毎日 09:00 KST',
    'chart.schedule.youtube': '→ 毎日 12:00 KST',
    'chart.schedule.billboard': '→ 毎週火曜日 14:00 KST頃',
    'chart.tracks': 'トラック',
    'chart.nodata': 'データなし',
    'chart.connecting': 'API接続中...',
    'chart.loading.crawl': '実際のクロール時間を読み込み中',
    
    // Chart Elements (追加)
    'chart.score': 'スコア',
    'chart.trend.score': 'トレンドスコア',
    'chart.trending.score': 'トレンディングスコア',
    'chart.out': 'チャートアウト',
    
    // Interaction (追加)
    'click.detail': 'クリックして詳細を見る',
    'click.navigate': '詳細ページへ移動',
    
    // Temperature Descriptions (追加)
    'temp.very.hot': 'とても熱い 🔥',
    'temp.hot': '熱い 🔥',
    'temp.warm': '暖かい ☀️',
    'temp.cool': '涼しい ❄️',
    'temp.cold': 'とても寒い ❄️',
    
    // Artist/Track Detail (追加)
    'detail.view': '詳細を見る',
    'artist.page': 'アーティストページ',
    'portfolio.add': 'ポートフォリオに追加',
    'chart.tabs.overview': '📊 概要',
    'chart.tabs.chart': '🏆 チャート',
    'chart.tabs.history': '📈 履歴',
    'chart.current.rank': '現在のチャート順位',
    'artist.tracks': 'トラック',
    'artist.charts': 'チャート',
    'artist.peak': '最高位',
    'artist.popularity': '人気度',
  },
  zh: {
    ...additionalTranslations.zh,
    // Site Info
    'site.title': 'KPOP Ranker',
    'site.tagline': '实时K-POP榜单分析',
    
    // Navigation
    'nav.home': '首页',
    'nav.trending': '热门',
    'nav.search': '搜索',
    'nav.portfolio': '收藏',
    'nav.about': '介绍',
    
    // Footer
    'footer.brand.description': '为全球K-POP粉丝打造的\n实时榜单监控平台',
    'footer.service': '服务',
    'footer.service.trending': '实时热门',
    'footer.service.portfolio': '收藏管理',
    'footer.service.about': '服务介绍',
    'footer.service.api': 'API文档',
    'footer.company': '公司',
    'footer.company.about': '关于我们',
    'footer.company.blog': '博客',
    'footer.company.careers': '招聘',
    'footer.company.contact': '联系我们',
    'footer.legal': '法律',
    'footer.legal.privacy': '隐私政策',
    'footer.legal.terms': '服务条款',
    'footer.legal.cookies': 'Cookie政策',
    'footer.newsletter.title': '订阅',
    'footer.newsletter.description': '获取最新K-POP资讯',
    'footer.newsletter.placeholder': '电子邮件地址',
    'footer.newsletter.button': '订阅',
    'footer.copyright': '© 2025 KPOP FANfolio. 版权所有',
    'footer.made.with': 'Made with',
    'footer.made.for': 'for K-POP fans worldwide',
    
    // Main page
    'main.title': '实时K-POP排行榜',
    'main.stats.albums': '专辑图片',
    'main.stats.artists': '艺人',
    'main.stats.charts': '榜单',
    'tab.hot': '热门',
    'tab.rising': '急升',
    'tab.global': '全球',
    'section.realtime': '实时榜单',
    'section.bubble': '气泡图',
    'section.trending': '趋势',
    'section.update': '更新状态',
    
    // Common
    'button.play': '播放',
    'button.add': '添加',
    'button.remove': '删除',
    'button.share': '分享',
    'button.login': '登录',
    'button.logout': '退出',
    'chart.rank': '排名',
    'chart.artist': '艺人',
    'chart.track': '歌曲',
    'chart.change': '变化',
    'message.loading': '加载中...',
    'message.nodata': '暂无数据',
    'user.role': '收藏夹管理员',
    
    // Chart Update
    'chart.update.schedule': '[榜单更新时间表]',
    'chart.update.realtime': '[实时数据库更新状态]',
    'chart.korea3': '韩国三大',
    'chart.schedule.korea': '(Melon, Genie, Bugs) → 每日4次: 01:00 / 07:00 / 13:00 / 19:00',
    'chart.schedule.vibe': '→ 每日2次: 01:00 / 13:00',
    'chart.schedule.flo': '→ 每日4次: 01:00 / 07:00 / 13:00 / 19:00',
    'chart.schedule.spotify': '→ 每日 09:00 KST',
    'chart.schedule.youtube': '→ 每日 12:00 KST',
    'chart.schedule.billboard': '→ 每周二 14:00 KST左右',
    'chart.tracks': '曲目',
    'chart.nodata': '无数据',
    'chart.connecting': 'API连接中...',
    'chart.loading.crawl': '正在加载实际抓取时间',
    
    // Chart Elements (添加)
    'chart.score': '分数',
    'chart.trend.score': '趋势分数',
    'chart.trending.score': '热门分数',
    'chart.out': '未上榜',
    
    // Interaction (添加)
    'click.detail': '点击查看详情',
    'click.navigate': '点击进入详情页',
    
    // Temperature Descriptions (添加)
    'temp.very.hot': '非常热门 🔥',
    'temp.hot': '热门 🔥',
    'temp.warm': '温热 ☀️',
    'temp.cool': '冷门 ❄️',
    'temp.cold': '非常冷门 ❄️',
    
    // Artist/Track Detail (添加)
    'detail.view': '查看详情',
    'artist.page': '艺人页面',
    'portfolio.add': '添加到收藏',
    'chart.tabs.overview': '📊 概览',
    'chart.tabs.chart': '🏆 榜单',
    'chart.tabs.history': '📈 历史',
    'chart.current.rank': '当前榜单排名',
    'artist.tracks': '曲目',
    'artist.charts': '榜单',
    'artist.peak': '最高排名',
    'artist.popularity': '人气度',
  }
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('ko');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 언어 변경 함수
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    loadTranslations(lang);
    
    // 전역 이벤트 발생
    const event = new CustomEvent('languageChanged', {
      detail: { 
        lang,
        translations: defaultTranslations[lang] || defaultTranslations['ko']
      }
    });
    window.dispatchEvent(event);
  };

  // 번역 로드 함수
  const loadTranslations = async (lang: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/translation/ui-translations?lang=${lang}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        // API 번역과 기본 번역 병합
        const merged = { ...defaultTranslations[lang], ...data.translations };
        setTranslations(merged);
      } else {
        setTranslations(defaultTranslations[lang] || defaultTranslations['ko']);
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      setTranslations(defaultTranslations[lang] || defaultTranslations['ko']);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 언어 설정
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ko';
    setLanguageState(savedLang);
    loadTranslations(savedLang);
  }, []);

  // 번역 함수 (파라미터 지원 추가)
  const t = (key: string, fallback?: string, params?: Record<string, string>): string => {
    let text = '';
    
    if (translations[key]) {
      text = translations[key];
    } else if (defaultTranslations[language] && defaultTranslations[language][key]) {
      text = defaultTranslations[language][key];
    } else {
      text = fallback || key;
    }
    
    // 파라미터 치환
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
    }
    
    return text;
  };

  // 동적 텍스트 번역
  const translateText = async (text: string, targetLang?: string): Promise<string> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/translation/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          target: targetLang || language,
        }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        return data.translated;
      }
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // 아티스트/트랙명 번역
  const getTranslatedName = async (name: string, category: 'artists' | 'tracks'): Promise<string> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/translation/get-translation/${category}/${encodeURIComponent(name)}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.translations) {
        return data.translations[language] || name;
      }
      return name;
    } catch (error) {
      console.error('Failed to get translation:', error);
      return name;
    }
  };

  const value = {
    language,
    setLanguage,
    translations,
    isLoading,
    t,
    translateText,
    getTranslatedName,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};
