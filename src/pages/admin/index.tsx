import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminIndex() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Admin 비밀번호 (환경변수 또는 하드코딩)
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin2024!';

  useEffect(() => {
    // 로컬 스토리지에서 인증 상태 확인
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuthenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 틀렸습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '30px',
            textAlign: 'center',
            color: '#1a1a1a'
          }}>
            🎵 KPOP Ranker Admin
          </h1>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#495057'
              }}>
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>
            
            {error && (
              <div style={{
                padding: '10px',
                marginBottom: '20px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              로그인
            </button>
          </form>
          
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#004085'
          }}>
            <strong>힌트:</strong> 기본 비밀번호는 admin2024! 입니다.
            <br/>프로덕션 환경에서는 .env 파일에서 변경하세요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 헤더 with 로그아웃 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1a1a1a'
        }}>
          🎵 KPOP Ranker Admin
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* 중복 관리 시스템 (새로운 통합 버전) */}
        <div style={{
          padding: '30px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '2px solid #28a745',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '15px',
            color: '#28a745'
          }}>
            ✅ 중복 관리 시스템
          </h2>
          <p style={{ 
            marginBottom: '20px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            AI 분석 + 수동 매핑을 통한 중복 해결
          </p>
          <Link href="/admin/duplicates">
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%'
            }}>
              중복 관리 시작 →
            </button>
          </Link>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            • AI 중복 분석 결과 검토<br/>
            • 수동 매핑 추가/관리<br/>
            • 실시간 중복 제거 적용
          </div>
        </div>

        {/* 차트 업데이트 현황 */}
        <div style={{
          padding: '30px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '15px',
            color: '#495057'
          }}>
            📊 차트 업데이트 현황
          </h2>
          <p style={{ 
            marginBottom: '20px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            8개 차트 크롤링 상태 모니터링
          </p>
          <button
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chart/update-status`, '_blank')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            API 상태 확인 →
          </button>
        </div>

        {/* 데이터베이스 통계 */}
        <div style={{
          padding: '30px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '15px',
            color: '#495057'
          }}>
            💾 데이터베이스 통계
          </h2>
          <p style={{ 
            marginBottom: '20px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            전체 트랙 및 매핑 현황
          </p>
          <div style={{ fontSize: '14px', color: '#666' }}>
            • 총 트랙 수: 10,000+<br/>
            • 활성 매핑: 확인 필요<br/>
            • AI 제안: 대기 중
          </div>
        </div>
      </div>

      {/* 시스템 정보 */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#6c757d'
      }}>
        <strong>시스템 정보</strong><br/>
        • 환경: {process.env.NODE_ENV === 'production' ? '프로덕션' : '개발'}<br/>
        • API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}<br/>
        • 버전: v1.0.0
      </div>
    </div>
  );
}