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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 관리자 로그인
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      if (data.success) {
        setIsAdmin(true);
        toast.success('관리자 로그인 성공');
        loadDashboard();
        loadSchedulerStatus();
      } else {
        toast.error('비밀번호가 일치하지 않습니다');
      }
    } catch (error) {
      toast.error('로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  // 대시보드 데이터 로드
  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.dashboard);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  // 스케줄러 상태 로드
  const loadSchedulerStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/scheduler/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSchedulerStatus(data.scheduler);
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
        credentials: 'include'
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
        credentials: 'include'
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
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        toast.success('캐시가 초기화되었습니다');
      }
    } catch (error) {
      toast.error('캐시 초기화 실패');
    }
  };

  // 자동 새로고침
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        loadDashboard();
        loadSchedulerStatus();
      }, 30000); // 30초마다
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

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
        </div>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">🎛️ KPOP Ranker 관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">시스템 모니터링 및 관리</p>
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
                <span className="text-red-600">❌ 오류</span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">DB 상태</span>
              <span className="text-2xl">💾</span>
            </div>
            <div className="text-xl font-bold">
              {dashboardData?.db_stats ? (
                <span className="text-green-600">연결됨</span>
              ) : (
                <span className="text-red-600">오류</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardData?.db_stats?.size_mb ? `${dashboardData.db_stats.size_mb}MB` : ''}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">메모리</span>
              <span className="text-2xl">🧠</span>
            </div>
            <div className="text-xl font-bold">
              {dashboardData?.system_status?.memory_usage || 'N/A'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">활성 사용자</span>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-xl font-bold">
              {dashboardData?.api_stats?.active_users || 0}
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
                {schedulerStatus?.charts?.map((chart) => (
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
                <span className="font-bold">{dashboardData?.api_stats?.total_requests || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>오늘 요청 수</span>
                <span className="font-bold">{dashboardData?.api_stats?.today_requests || 0}</span>
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
