import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  last_updated: string;
  error?: string;
}

const ChartMonitoringDashboard: React.FC = () => {
  const [statusData, setStatusData] = useState<ChartStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/chart/update-status');
      if (!response.ok) {
        throw new Error('Failed to fetch chart status');
      }
      const data = await response.json();
      setStatusData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'retrying':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'retrying':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '정보 없음';
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChartDisplayName = (chartName: string) => {
    const displayNames: { [key: string]: string } = {
      'melon': '🍈 멜론',
      'genie': '🧞 지니',
      'bugs': '🐛 벅스',
      'vibe': '💜 바이브',
      'flo': '🌊 플로',
      'youtube': '📺 유튜브',
      'spotify': '🎵 스포티파이',
      'billboard': '📊 빌보드'
    };
    return displayNames[chartName] || chartName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">차트 상태를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          차트 상태를 불러올 수 없습니다: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!statusData) return null;

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 차트 업데이트 모니터링</h2>
        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      {/* 요약 정보 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{statusData.summary.total}</div>
              <div className="text-sm text-gray-500">전체 차트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusData.summary.success}</div>
              <div className="text-sm text-gray-500">정상</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusData.summary.failed}</div>
              <div className="text-sm text-gray-500">실패</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusData.summary.pending}</div>
              <div className="text-sm text-gray-500">진행중</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 차트별 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusData.charts.map((chart) => (
          <Card key={chart.chart_name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {getChartDisplayName(chart.chart_name)}
                </CardTitle>
                {getStatusIcon(chart.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chart.status)}`}>
                  {chart.status === 'success' && '정상'}
                  {chart.status === 'failed' && '실패'}
                  {chart.status === 'retrying' && '재시도 중'}
                  {chart.status === 'pending' && '대기 중'}
                  {chart.status === 'unknown' && '알 수 없음'}
                  {chart.status === 'error' && '오류'}
                </div>
                
                {chart.tracks_collected !== undefined && chart.tracks_collected > 0 && (
                  <div className="text-sm text-gray-600">
                    수집된 트랙: {chart.tracks_collected}개
                  </div>
                )}
                
                {chart.last_success && (
                  <div className="text-xs text-gray-500">
                    마지막 성공: {formatTime(chart.last_success)}
                  </div>
                )}
                
                {chart.retry_count !== undefined && chart.retry_count > 0 && (
                  <div className="text-xs text-yellow-600">
                    재시도: {chart.retry_count}회
                  </div>
                )}
                
                {chart.error_message && (
                  <div className="text-xs text-red-600 truncate" title={chart.error_message}>
                    오류: {chart.error_message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 마지막 업데이트 시간 */}
      <div className="text-center text-sm text-gray-500">
        마지막 업데이트: {formatTime(statusData.last_updated)}
      </div>
    </div>
  );
};

export default ChartMonitoringDashboard;
