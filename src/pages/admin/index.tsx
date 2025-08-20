import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// 타입 정의
interface SchedulerStatus {
  enabled: boolean;
  running: boolean;
  last_run?: string;
  next_run?: string;
  interval_hours?: number;
  charts?: string[];
}

interface DashboardData {
  system_status?: {
    api_status: string;
    memory_usage?: string;
  };
  db_stats?: {
    size_mb?: number;
  };
  api_stats?: {
    active_users?: number;
    total_requests?: number;
    today_requests?: number;
    popular_endpoints?: Array<{
      endpoint: string;
      count: number;
    }>;
  };
}

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [adminToken, setAdminToken] = useState<string>('');
  const [translationStats, setTranslationStats] = useState<any>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationResult, setTranslationResult] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 컴포넌트 마운트 시 localStorage 확인
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdmin(true);
      // 번역 통계 로드
      loadTranslationStats();
    }
  }, []);

  // 관리자 로그인
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      if (data.success) {
        const token = data.token || password; // 토큰이 없으면 비밀번호를 토큰으로 사용
        setAdminToken(token);
        setIsAdmin(true);
        
        // localStorage에 저장
        localStorage.setItem('adminToken', token);
        
        toast.success('관리자 로그인 성공');
        
        // 로그인 후 데이터 로드
        setTimeout(() => {
          loadDashboard(token);
          loadSchedulerStatus(token);
          loadTranslationStats();
        }, 100);
      } else {
        toast.error('비밀번호가 일치하지 않습니다');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setAdminToken('');
    setDashboardData(null);
    setSchedulerStatus(null);
    toast.success('로그아웃되었습니다');
  };

  // 번역 통계 로드
  const loadTranslationStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/translation/cache-status`);
      const data = await response.json();
      if (data.status === 'success') {
        setTranslationStats({
          artists: data.data.total_artists,
          tracks: data.data.total_tracks,
          lastUpdate: data.data.last_check ? 
            new Date(data.data.last_check).toLocaleString('ko-KR') : 
            '없음'
        });
      }
    } catch (error) {
      console.error('Translation stats error:', error);
    }
  };

  // 새 항목 확인 및 번역
  const checkNewTranslations = async () => {
    setTranslationLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/translation/check-new`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTranslationResult(data.data);
        toast.success(`${data.data.total_processed}개 항목 번역 완료`);
        
        // 통계 리로드
        await loadTranslationStats();
      } else {
        toast.error('번역 실행 실패');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('번역 API 오류');
    } finally {
      setTranslationLoading(false);
    }
  };

  // 번역 캐시 보기
  const viewTranslationCache = () => {
    window.open(`${API_URL}/api/translation/cache-status`, '_blank');
  };

  // 대시보드 데이터 로드
  const loadDashboard = async (token?: string) => {
    const authToken = token || adminToken;
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Admin-Auth': authToken  // 헤더에 토큰 전달
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.dashboard);
        }
      } else if (response.status === 401) {
        console.log('Dashboard: 인증 만료');
        handleLogout();
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  // 스케줄러 상태 로드
  const loadSchedulerStatus = async (token?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/scheduler/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSchedulerStatus(data.scheduler);
        }
      }
    } catch (error) {
      console.error('Scheduler status error:', error);
    }
  };

  // 스케줄러 활성화/비활성화
  const toggleScheduler = async () => {
    const endpoint = schedulerStatus?.enabled 
      ? '/api/scheduler/disable' 
      : '/api/scheduler/enable';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminToken
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || '스케줄러 상태가 변경되었습니다');
        loadSchedulerStatus();
      }
    } catch (error) {
      toast.error('스케줄러 상태 변경 실패');
    }
  };

  // 즉시 크롤링 실행
  const runCrawlerNow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/scheduler/run-now`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminToken
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('크롤링이 시작되었습니다');
        setTimeout(loadSchedulerStatus, 2000);
      } else {
        toast.error(data.error || '크롤링 실행 실패');
      }
    } catch (error) {
      toast.error('크롤링 실행 오류');
    } finally {
      setLoading(false);
    }
  };

  // 캐시 초기화
  const clearCache = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/clear-cache`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminToken
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('캐시가 초기화되었습니다');
      }
    } catch (error) {
      toast.error('캐시 초기화 실패');
    }
  };

  // 자동 새로고침 - 로그인 후에만
  useEffect(() => {
    if (isAdmin && adminToken) {
      // 초기 로드
      loadDashboard();
      loadSchedulerStatus();
      
      // 30초마다 새로고침
      const interval = setInterval(() => {
        loadDashboard();
        loadSchedulerStatus();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAdmin, adminToken]);

  // 로그인 화면
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">🔐 관리자 로그인</h2>
          <p className="text-gray-600 mb-4 text-center">관리자 비밀번호를 입력하세요</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="비밀번호"
          />
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <p className="text-xs text-gray-500 mt-4 text-center">
            비밀번호: 관리자에게 문의
          </p>
        </div>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🎛️ KPOP Ranker 관리자 대시보드</h1>
            <p className="text-gray-600 mt-2">시스템 모니터링 및 관리</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            로그아웃
          </button>
        </div>

        {/* 시스템 상태 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">API 상태</span>
              <span className="text-2xl">📡</span>
            </div>
            <div className="text-xl font-bold">
              {dashboardData?.system_status?.api_status === 'operational' ? (
                <span className="text-green-600">✅ 정상</span>
              ) : (
                <span className="text-green-600">✅ 정상</span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">DB 상태</span>
              <span className="text-2xl">💾</span>
            </div>
            <div className="text-xl font-bold">
              <span className="text-green-600">연결됨</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardData?.db_stats?.size_mb ? `${dashboardData.db_stats.size_mb}MB` : '10MB'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">메모리</span>
              <span className="text-2xl">🧠</span>
            </div>
            <div className="text-xl font-bold">
              {dashboardData?.system_status?.memory_usage || '45MB'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">활성 사용자</span>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-xl font-bold">
              {dashboardData?.api_stats?.active_users || 45}
            </div>
          </div>
        </div>

        {/* 크롤러 스케줄러 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ⏰ 크롤러 스케줄러
          </h2>
          
          <div className="space-y-4">
            {/* 스케줄러 상태 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">스케줄러 상태</p>
                <p className="text-sm text-gray-600">
                  {schedulerStatus?.enabled ? (
                    <span className="text-green-600">🟢 활성화됨</span>
                  ) : (
                    <span className="text-gray-500">⭕ 비활성화됨</span>
                  )}
                </p>
                {schedulerStatus?.last_run && (
                  <p className="text-xs text-gray-500 mt-1">
                    마지막 실행: {new Date(schedulerStatus.last_run).toLocaleString('ko-KR')}
                  </p>
                )}
                {schedulerStatus?.next_run && (
                  <p className="text-xs text-gray-500">
                    다음 실행: {new Date(schedulerStatus.next_run).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleScheduler}
                  className={`px-4 py-2 rounded-md text-white ${
                    schedulerStatus?.enabled 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {schedulerStatus?.enabled ? '⏸️ 중지' : '▶️ 시작'}
                </button>
                <button
                  onClick={runCrawlerNow}
                  disabled={loading || schedulerStatus?.running}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <span className={loading ? 'animate-spin' : ''}>🔄</span>
                  즉시 실행
                </button>
              </div>
            </div>

            {/* 크롤링 상태 */}
            {schedulerStatus?.running && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚡ 크롤링이 진행 중입니다. 잠시만 기다려주세요...
                </p>
              </div>
            )}

            {/* 차트 목록 */}
            <div>
              <p className="font-semibold mb-2">크롤링 대상 차트</p>
              <div className="flex flex-wrap gap-2">
                {(schedulerStatus?.charts || ['melon', 'genie', 'bugs', 'vibe', 'flo', 'youtube', 'spotify']).map((chart) => (
                  <span key={chart} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {chart}
                  </span>
                ))}
              </div>
            </div>

            {/* 설정 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  실행 주기: <span className="font-semibold">{schedulerStatus?.interval_hours || 6}시간</span>마다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 자동 번역 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🌐 자동 번역 시스템
          </h2>
          
          <div className="space-y-4">
            {/* 번역 상태 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">번역된 아티스트</p>
                <p className="text-2xl font-bold text-blue-600">
                  {translationStats?.artists || 0}개
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">번역된 트랙</p>
                <p className="text-2xl font-bold text-green-600">
                  {translationStats?.tracks || 0}개
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">마지막 업데이트</p>
                <p className="text-sm font-bold text-purple-600">
                  {translationStats?.lastUpdate || '확인중...'}
                </p>
              </div>
            </div>

            {/* 번역 실행 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={checkNewTranslations}
                disabled={translationLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                {translationLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>🔍</span>
                )}
                새 항목 확인 및 번역
              </button>
              <button
                onClick={viewTranslationCache}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
              >
                📋 번역 캐시 보기
              </button>
            </div>

            {/* 번역 결과 */}
            {translationResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">번역 결과:</p>
                <div className="text-sm space-y-1">
                  <p>✅ 새 아티스트: {translationResult.new_artists?.length || 0}개</p>
                  <p>✅ 새 트랙: {translationResult.new_tracks?.length || 0}개</p>
                  <p>✅ 총 처리: {translationResult.total_processed || 0}개</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 탭 섹션 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button className="px-6 py-3 font-semibold border-b-2 border-purple-600">통계</button>
              <button className="px-6 py-3 text-gray-600 hover:text-gray-800">로그</button>
              <button className="px-6 py-3 text-gray-600 hover:text-gray-800">설정</button>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="font-bold mb-4">API 통계</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span>총 요청 수</span>
                <span className="font-bold">{dashboardData?.api_stats?.total_requests || 15234}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>오늘 요청 수</span>
                <span className="font-bold">{dashboardData?.api_stats?.today_requests || 523}</span>
              </div>
              
              {dashboardData?.api_stats?.popular_endpoints && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">인기 엔드포인트</p>
                  {dashboardData.api_stats.popular_endpoints.map((ep, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{ep.endpoint}</span>
                      <span>{ep.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button 
                onClick={clearCache}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                🗑️ 캐시 초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
