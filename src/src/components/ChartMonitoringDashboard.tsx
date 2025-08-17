import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Clock, AlertCircle } from 'lucide-react';

interface ChartStatus {
  chart_name: string;
  status: 'success' | 'failed' | 'pending' | 'retrying' | 'unknown' | 'error';
  last_success?: string;
  last_attempt?: string;
  retry_count?: number;
  error_message?: string;
  tracks_collected?: number;
}

interface ChartStatusData {
  charts: ChartStatus[];
  summary: {
    total: number;
    success: number;
    failed: number;
    pending: number;
  };
}

export default function ChartMonitoringDashboard() {
  const [chartData, setChartData] = useState<ChartStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartStatus();
    const interval = setInterval(fetchChartStatus, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const fetchChartStatus = async () => {
    try {
      const response = await fetch('/api/chart/status');
      if (!response.ok) throw new Error('Failed to fetch chart status');
      const data = await response.json();
      setChartData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'retrying':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
      case 'retrying':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">차트 상태를 불러올 수 없습니다: {error}</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4">차트 모니터링 대시보드</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{chartData.summary.total}</div>
            <div className="text-sm text-gray-500">전체 차트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{chartData.summary.success}</div>
            <div className="text-sm text-gray-500">정상</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{chartData.summary.failed}</div>
            <div className="text-sm text-gray-500">실패</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{chartData.summary.pending}</div>
            <div className="text-sm text-gray-500">대기중</div>
          </div>
        </div>

        {/* Chart List */}
        <div className="space-y-2">
          {chartData.charts.map((chart) => (
            <div
              key={chart.chart_name}
              className={`p-4 rounded-lg border ${getStatusColor(chart.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(chart.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {chart.chart_name.toUpperCase()}
                    </h3>
                    {chart.last_success && (
                      <p className="text-sm text-gray-500">
                        마지막 성공: {new Date(chart.last_success).toLocaleString('ko-KR')}
                      </p>
                    )}
                    {chart.error_message && (
                      <p className="text-sm text-red-600 mt-1">
                        오류: {chart.error_message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {chart.tracks_collected !== undefined && (
                    <div className="text-sm text-gray-600">
                      {chart.tracks_collected}개 트랙
                    </div>
                  )}
                  {chart.retry_count !== undefined && chart.retry_count > 0 && (
                    <div className="text-sm text-yellow-600">
                      재시도: {chart.retry_count}회
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Update */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            마지막 업데이트: {new Date().toLocaleString('ko-KR')}
          </div>
          <button
            onClick={fetchChartStatus}
            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
}
