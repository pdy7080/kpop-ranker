import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();
  
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '40px',
        color: '#333'
      }}>
        🎵 KPOP Ranker Admin
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* 중복 관리 시스템 (새로운 통합 버전) */}
        <div style={{
          padding: '30px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #28a745'
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
              fontWeight: 'bold'
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
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
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
            onClick={() => window.open('http://localhost:5000/api/chart/update-status', '_blank')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            API 상태 확인 →
          </button>
        </div>

        {/* 데이터베이스 통계 */}
        <div style={{
          padding: '30px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
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
            • AI 제안: 19개 대기
          </div>
        </div>
      </div>

      {/* 이전 기능 목록 (참고용) */}
      <div style={{
        marginTop: '60px',
        padding: '20px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '1px solid #b0d4f1'
      }}>
        <h3 style={{ color: '#004085', marginBottom: '10px' }}>
          📁 이전 기능 페이지 (Legacy)
        </h3>
        <p style={{ color: '#004085', fontSize: '14px' }}>
          새로운 통합 시스템이 모든 기능을 포함합니다. 이전 페이지들은 참고용으로만 유지됩니다.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '15px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => router.push('/admin/similarity')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e7f3ff',
              color: '#004085',
              border: '1px solid #b0d4f1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            유사도 분석
          </button>
          <button 
            onClick={() => router.push('/admin/correct-duplicates')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e7f3ff',
              color: '#004085',
              border: '1px solid #b0d4f1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            중복 수정
          </button>
          <button 
            onClick={() => router.push('/admin/real-duplicates')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e7f3ff',
              color: '#004085',
              border: '1px solid #b0d4f1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            실제 중복
          </button>
        </div>
      </div>
    </div>
  );
}