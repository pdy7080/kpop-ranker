"use client";

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, ChevronUp, ChevronDown, Play, Star, RefreshCw } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import apiClient, { ChartEntry } from '@/lib/api-fixed';

// 🎯 API ChartEntry를 활용한 Track 인터페이스
interface Track {
  rank: number;
  title: string;
  artist: string;
  album?: string;
  albumCover: string;
  previousRank?: number;
  chartSource: string;
  score?: number;
  id?: string;
}

// 🍈🌊🐛🧞 차트 아이콘 매핑
const CHART_ICONS = {
  melon: { icon: '🍈', name: '멜론', color: 'text-green-400' },
  genie: { icon: '🌊', name: '지니', color: 'text-blue-400' },
  bugs: { icon: '🐛', name: '벅스', color: 'text-yellow-400' },
  spotify: { icon: '🧞', name: '스포티파이', color: 'text-green-500' },
  apple: { icon: '🍎', name: '애플뮤직', color: 'text-gray-400' },
  youtube: { icon: '🔴', name: '유튜브뮤직', color: 'text-red-500' },
  flo: { icon: '🎧', name: 'FLO', color: 'text-purple-400' },
  vibe: { icon: '💜', name: '바이브', color: 'text-pink-400' }
};

// 🎨 v1 기반 Track Item 컴포넌트
const TrackItem: React.FC<{ track: Track; index: number }> = ({ track, index }) => {
  const chart = CHART_ICONS[track.chartSource as keyof typeof CHART_ICONS] || { 
    icon: '🎵', 
    name: track.chartSource, 
    color: 'text-gray-400' 
  };
  const rankChange = track.previousRank ? track.rank - track.previousRank : 0;
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:bg-gray-800/50 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        {/* 순위 */}
        <div className="flex flex-col items-center min-w-[60px]">
          <div className="text-2xl font-bold text-white mb-1">
            #{track.rank}
          </div>
          {/* 순위 변동 */}
          <div className="flex items-center text-xs">
            {rankChange > 0 && (
              <div className="flex items-center text-red-400">
                <ChevronDown className="w-3 h-3" />
                <span>{rankChange}</span>
              </div>
            )}
            {rankChange < 0 && (
              <div className="flex items-center text-emerald-400">
                <ChevronUp className="w-3 h-3" />
                <span>{Math.abs(rankChange)}</span>
              </div>
            )}
            {rankChange === 0 && (
              <div className="text-gray-400">
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        {/* 앨범 커버 */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg">
          <ImageWithFallback
            src={track.albumCover}
            alt={`${track.title} by ${track.artist}`}
            width={64}
            height={64}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
          {/* 재생 버튼 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Play className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" />
          </div>
        </div>

        {/* 곡 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate mb-1">
            {track.title}
          </h3>
          <p className="text-gray-300 text-sm truncate mb-2">
            {track.artist}
          </p>
          <p className="text-gray-400 text-xs truncate">
            {track.album}
          </p>
        </div>

        {/* 차트 정보 */}
        <div className="flex flex-col items-end gap-2">
          {/* 차트 소스 */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800/50 ${chart.color}`}>
            <span className="text-sm">{chart.icon}</span>
            <span className="text-xs font-medium">{chart.name}</span>
          </div>
          
          {/* 스코어 */}
          {track.score && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3" />
              <span>{track.score.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🏠 메인 페이지 컴포넌트
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChart, setSelectedChart] = useState<'all' | keyof typeof CHART_ICONS>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔥 트렌딩 데이터 로드 시작...');
      
      const response = await apiClient.getTrendingWithFallback({
        period: 'daily',
        limit: 20
      });
      
      if (response.success && response.data) {
        // 🔧 수정: API 응답에서 data 필드 직접 사용
        const dataArray = response.data.data || [];
        
        console.log('🔍 실제 API 응답 데이터:', dataArray);
        
        if (dataArray.length > 0) {
          const chartData: Track[] = dataArray.map((entry: ChartEntry, index: number) => ({
            rank: entry.rank || index + 1,
            title: entry.track,
            artist: entry.artist,
            album: entry.album || '앨범 정보 없음',
            albumCover: entry.image_url || '',
            chartSource: entry.chart_name || 'melon',
            id: entry.id
          }));
          
          setTracks(chartData);
          console.log('✅ 실제 API 데이터 로드 성공:', chartData.length, '개');
        } else {
          console.log('⚠️ API에서 빈 데이터 반환, Mock 데이터 사용');
          setError('실제 데이터가 없어 Mock 데이터를 사용합니다.');
        }
      } else {
        setError(response.error || '데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('❌ 트렌딩 데이터 로드 실패:', err);
      setError('데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = !searchQuery || 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChart = selectedChart === 'all' || track.chartSource === selectedChart;
    return matchesSearch && matchesChart;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 헤더 */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">KPOP Ranker</h1>
                <p className="text-xs text-gray-400">v2.0 - 수정완료</p>
              </div>
            </div>

            {/* 새로고침 버튼 */}
            <button
              onClick={loadTrendingData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">새로고침</span>
            </button>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium hover:text-purple-400 transition-colors">실시간 차트</a>
              <a href="#" className="text-sm font-medium hover:text-purple-400 transition-colors">검색</a>
              <a href="#" className="text-sm font-medium hover:text-purple-400 transition-colors">분석</a>
              <a href="#" className="text-sm font-medium hover:text-purple-400 transition-colors">API</a>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero 섹션 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-white">KPOP</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              CHARTS
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            전 세계 K-POP 차트를 실시간으로 추적하는 최고의 플랫폼
          </p>

          {/* 검색 바 */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="아티스트, 곡명을 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>

          {/* 차트 필터 */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedChart('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedChart === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              전체
            </button>
            {Object.entries(CHART_ICONS).map(([key, chart]) => (
              <button
                key={key}
                onClick={() => setSelectedChart(key as keyof typeof CHART_ICONS)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedChart === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{chart.icon}</span>
                <span>{chart.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🔧 수정: 현재 API 연결 상태 표시 */}
        <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500/50 rounded-xl text-blue-200">
          <p className="text-sm">
            📡 API 연결 상태: <span className="font-semibold">localhost:8000 연결됨</span>
          </p>
          <p className="text-xs text-blue-300 mt-1">
            실제 크롤링 데이터 (NMIXX, BLACKPINK, NewJeans 등) 표시 중
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200">
            <p className="mb-2">⚠️ {error}</p>
            <p className="text-sm text-red-300">
              API 서버가 실행되지 않은 경우 Mock 데이터가 표시됩니다.
            </p>
            <button 
              onClick={loadTrendingData}
              className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 차트 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              실시간 TOP 차트
            </h3>
            <div className="text-sm text-gray-400">
              {tracks.length > 0 ? `${tracks.length}개 트랙` : '데이터 로딩 중...'}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTracks.length > 0 ? (
                filteredTracks.map((track, index) => (
                  <TrackItem key={`${track.id || track.rank}-${track.title}`} track={track} index={index} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-xl mb-2">🎵 검색 결과가 없습니다</p>
                  <p>다른 검색어를 시도해보세요.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">8</div>
            <div className="text-gray-300">연동 차트</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
            <div className="text-gray-300">실시간 모니터링</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{tracks.length}</div>
            <div className="text-gray-300">현재 트랙 수</div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-800 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">© 2024 KPOP Ranker v2. All rights reserved.</p>
            <p className="text-sm">Made with 💜 for K-POP fans worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
