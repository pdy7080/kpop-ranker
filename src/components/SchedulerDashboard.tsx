import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaRobot, FaDatabase, FaPlay, FaPause, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface SchedulerStatus {
  scheduler_running: boolean;
  jobs: Array<{
    id: string;
    name: string;
    next_run: string | null;
    trigger: string;
  }>;
  crawl_status: Record<string, {
    status: string;
    track_count: number;
    last_update: string;
    error?: string;
  }>;
}

const SchedulerDashboard: React.FC = () => {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualCrawling, setManualCrawling] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/scheduler/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCrawl = async (chart: string) => {
    setManualCrawling(chart);
    try {
      const response = await fetch(`/api/scheduler/crawl/${chart}`, {
        method: 'POST',
        headers: {
          'Authorization': 'admin-secret-token' // 실제로는 더 강력한 인증 필요
        }
      });
      
      if (response.ok) {
        toast.success(`${chart} 크롤링이 시작되었습니다!`);
        setTimeout(fetchStatus, 5000); // 5초 후 상태 업데이트
      } else {
        toast.error('크롤링 시작 실패');
      }
    } catch (error) {
      console.error('Manual crawl failed:', error);
      toast.error('크롤링 요청 실패');
    } finally {
      setManualCrawling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'failed': case 'error': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <FaCheckCircle />;
      case 'failed': case 'error': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 스케줄러 상태 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaRobot className="mr-2" />
          자동 크롤링 시스템
        </h2>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${status?.scheduler_running ? 'text-green-500' : 'text-red-500'}`}>
            {status?.scheduler_running ? <FaPlay /> : <FaPause />}
            <span className="font-semibold">
              {status?.scheduler_running ? '실행 중' : '중지됨'}
            </span>
          </div>
          
          {status?.jobs && (
            <span className="text-gray-500">
              {status.jobs.length}개 작업 예약됨
            </span>
          )}
        </div>
      </motion.div>

      {/* 예약된 작업 목록 */}
      {status?.jobs && status.jobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <FaClock className="mr-2" />
            예약된 크롤링 작업
          </h3>
          
          <div className="space-y-3">
            {status.jobs.map((job, index) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{job.name}</p>
                  <p className="text-sm text-gray-500">{job.trigger}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {job.next_run ? new Date(job.next_run).toLocaleString('ko-KR') : '예약 없음'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 차트별 크롤링 상태 */}
      {status?.crawl_status && Object.keys(status.crawl_status).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <FaDatabase className="mr-2" />
            차트별 크롤링 상태
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(status.crawl_status).map(([chart, data]) => (
              <div key={chart} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{chart}</h4>
                  <div className={`flex items-center gap-1 ${getStatusColor(data.status)}`}>
                    {getStatusIcon(data.status)}
                    <span className="text-sm">{data.status}</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>수집 곡수: {data.track_count}</p>
                  <p>마지막 업데이트: {new Date(data.last_update).toLocaleString('ko-KR')}</p>
                  {data.error && (
                    <p className="text-red-500 text-xs">{data.error}</p>
                  )}
                </div>
                
                <button
                  onClick={() => handleManualCrawl(chart)}
                  disabled={manualCrawling === chart}
                  className="mt-3 w-full px-3 py-2 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
                >
                  {manualCrawling === chart ? '크롤링 중...' : '수동 크롤링'}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 스케줄러가 실행되지 않은 경우 안내 */}
      {!status?.scheduler_running && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-400"
        >
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <FaExclamationTriangle />
            <p className="font-semibold">자동 크롤링 시스템이 중지되어 있습니다.</p>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            서버 재시작이 필요할 수 있습니다. 관리자에게 문의하세요.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SchedulerDashboard;
