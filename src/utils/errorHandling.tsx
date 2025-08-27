// 디버깅 및 에러 처리 강화를 위한 업데이트
// pages/index.tsx에 추가할 에러 바운더리와 로딩 상태 개선

import { useEffect, useState } from 'react';

// 에러 로깅 유틸리티
export const logError = (context: string, error: any) => {
  console.error(`[${context}]`, error);
  
  // 개발 환경에서만 상세 로그
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error in ${context}`);
    console.error('Message:', error.message || 'Unknown error');
    console.error('Stack:', error.stack || 'No stack trace');
    console.error('Full error:', error);
    console.groupEnd();
  }
};

// API 호출 재시도 로직
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      logError(`API retry attempt ${i + 1}`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// 로딩 상태 컴포넌트
export const LoadingSpinner = ({ text = '로딩 중...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px]">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <div className="absolute inset-0 rounded-full h-12 w-12 border-2 border-gray-200"></div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
  </div>
);

// 에러 상태 컴포넌트
export const ErrorDisplay = ({ 
  error, 
  retry,
  context = '데이터를 불러오는 중 오류가 발생했습니다'
}: {
  error: any;
  retry?: () => void;
  context?: string;
}) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
    <div className="text-red-500 mb-4">
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      오류 발생
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
      {context}
    </p>
    {process.env.NODE_ENV === 'development' && (
      <details className="text-sm text-gray-500 mb-4">
        <summary className="cursor-pointer">상세 정보</summary>
        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-w-md">
          {JSON.stringify(error, null, 2)}
        </pre>
      </details>
    )}
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        다시 시도
      </button>
    )}
  </div>
);

// API 상태 모니터
export const ApiStatusMonitor = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/health`);
        setApiStatus(response.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };
    
    checkApi();
    const interval = setInterval(checkApi, 30000); // 30초마다 체크
    
    return () => clearInterval(interval);
  }, []);
  
  if (apiStatus === 'checking') return null;
  
  return (
    <div className={`fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
      apiStatus === 'online' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }`}>
      API: {apiStatus === 'online' ? '정상' : '오프라인'}
    </div>
  );
};
