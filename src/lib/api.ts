// src/lib/api.ts
// 프록시(/api/*) 경유 전제: CORS 없이 동일 오리진으로 호출

export const API_BASE = ''; // 상대경로 사용

export const API_ENDPOINTS = {
  // 검색
  search: '/api/search',
  search2: '/api/search2',
  autocomplete: '/api/autocomplete/unified',

  // 트렌딩
  trending: '/api/trending',

  // 아티스트
  artist: (name: string) => `/api/artist/${encodeURIComponent(name)}/complete`,
  artistTracks: (name: string) => `/api/artist/${encodeURIComponent(name)}/tracks`,

  // 이미지 (한글 인코딩)
  albumImage: (artist: string, track: string) =>
    `/api/album-image-v2/${encodeURIComponent(artist ?? '')}/${encodeURIComponent(track ?? '')}`,

  // 포트폴리오
  portfolio: '/api/portfolio',

  // 인증
  auth: {
    login: '/api/auth/demo-login',
    logout: '/api/auth/logout',
    status: '/api/auth/status',
    user: '/api/auth/user',
  },

  // 차트
  chartHistory: (chart: string, artist: string, track: string) =>
    `/api/chart/history/${chart}/${encodeURIComponent(artist ?? '')}/${encodeURIComponent(track ?? '')}`,
  chartSummary: (artist: string, track: string) =>
    `/api/charts/summary/${encodeURIComponent(artist ?? '')}/${encodeURIComponent(track ?? '')}`,
  chartUpdateStatus: '/api/chart/update-status',

  // 인사이트
  insights: {
    daily: '/api/insights/daily',
    marketPulse: '/api/insights/market-pulse',
    recommendations: '/api/insights/recommendations',
    artist: (name: string) => `/api/insights/artist/${encodeURIComponent(name ?? '')}`,
  },

  // 뉴스/굿즈
  news: '/api/news',
  goods: '/api/goods',
};

// 공통 호출
export async function apiCall<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json() as Promise<T>;
}

// 프록시 경유 이미지 URL
export function getImageUrl(artist: string, track: string): string {
  return API_ENDPOINTS.albumImage(artist, track);
}

/* ------------------ Named APIs ------------------ */

// 내부 헬퍼: 검색 오버로드 (1개/2개 인자 모두 지원)
function _search(q: string): Promise<any>;
function _search(artist: string, track: string): Promise<any>;
function _search(a: string, b?: string) {
  if (typeof b === 'string') {
    // 아티스트+트랙 쿼리
    return apiCall(
      `${API_ENDPOINTS.search2}?artist=${encodeURIComponent(a ?? '')}&track=${encodeURIComponent(b ?? '')}`
    );
  }
  // 자유 입력 검색
  return apiCall(`${API_ENDPOINTS.search}?q=${encodeURIComponent(a ?? '')}`);
}

// SmartSearchBox 등에서 사용
export const searchApi = {
  autocomplete(q: string) {
    return apiCall(`${API_ENDPOINTS.autocomplete}?q=${encodeURIComponent(q ?? '')}`);
  },
  search: _search,
  searchByArtist(artist: string) {
    return _search(artist);
  },
  searchByTrack(track: string) {
    return _search(track);
  },
  getArtistTracks(artist: string) {
    return apiCall(API_ENDPOINTS.artistTracks(artist));
  },
};

export const chartApi = {
  getHistory(chart: string, artist: string, track: string, days = 30) {
    return apiCall(`${API_ENDPOINTS.chartHistory(chart, artist, track)}?days=${days}`);
  },
  getSummary(artist: string, track: string) {
    return apiCall(API_ENDPOINTS.chartSummary(artist, track));
  },
  getUpdateStatus() {
    return apiCall(API_ENDPOINTS.chartUpdateStatus);
  },
};

export const autocompleteApi = {
  complete(q: string) {
    return apiCall(`${API_ENDPOINTS.autocomplete}?q=${encodeURIComponent(q ?? '')}`);
  },
};

export const trendingApi = {
  getTrending(type = 'hot', limit = 20) {
    return apiCall(`${API_ENDPOINTS.trending}?type=${type}&limit=${limit}`);
  },
};

export const portfolioApi = {
  getPortfolio() {
    return apiCall(API_ENDPOINTS.portfolio);
  },
  addToPortfolio(data: { artist: string; track: string }) {
    return apiCall(API_ENDPOINTS.portfolio, { method: 'POST', body: JSON.stringify(data) });
  },
  removeFromPortfolio(id: number) {
    return apiCall(`${API_ENDPOINTS.portfolio}/${id}`, { method: 'DELETE' });
  },
};

export const authApi = {
  demoLogin(name = 'Demo User', email = 'demo@kpopranker.com') {
    return apiCall(API_ENDPOINTS.auth.login, { method: 'POST', body: JSON.stringify({ name, email }) });
  },
  logout() {
    return apiCall(API_ENDPOINTS.auth.logout, { method: 'POST' });
  },
  getStatus() {
    return apiCall(API_ENDPOINTS.auth.status);
  },
  getUser() {
    return apiCall(API_ENDPOINTS.auth.user);
  },
  login(provider: string, code?: string) {
    return apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify({ provider, code }) });
  },
};

export const insightsApi = {
  getDailyInsights() {
    return apiCall(API_ENDPOINTS.insights.daily);
  },
  getMarketPulse() {
    return apiCall(API_ENDPOINTS.insights.marketPulse);
  },
  getRecommendations() {
    return apiCall(API_ENDPOINTS.insights.recommendations);
  },
};

export const checkApiStatus = async () => {
  try {
    const data = await apiCall('/api/health');
    return { status: 'ok', data };
  } catch (error) {
    return { status: 'error', error };
  }
};

// default (혼합 import 호환)
const api = {
  API_BASE,
  API_ENDPOINTS,
  apiCall,
  getImageUrl,
  searchApi,
  chartApi,
  autocompleteApi,
  trendingApi,
  portfolioApi,
  authApi,
  insightsApi,
  checkApiStatus,
};
export default api;
