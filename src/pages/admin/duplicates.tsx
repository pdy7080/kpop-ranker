import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DuplicateManager() {
  const [activeTab, setActiveTab] = useState('potential'); // 'potential', 'ai', 'mappings'
  const [duplicates, setDuplicates] = useState([]);
  const [aiQueue, setAiQueue] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // 중복 의심 목록 로드 (확장)
  const loadDuplicates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admin/duplicates/potential`);
      setDuplicates(response.data.duplicates || []);
      setMessage(`중복 의심 항목 ${response.data.count}개 로드됨`);
    } catch (error) {
      console.error('Failed to load duplicates:', error);
      setMessage('중복 목록 로드 실패');
    }
    setLoading(false);
  };

  // AI 제안 로드
  const loadAIQueue = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/ai/review-queue`);
      setAiQueue(response.data.queue || []);
      setMessage(`AI 제안 ${response.data.queue?.length || 0}개 대기 중`);
    } catch (error) {
      console.error('Failed to load AI queue:', error);
    }
  };

  // 현재 매핑 로드
  const loadMappings = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/duplicates/mappings`);
      setMappings(response.data.mappings || []);
    } catch (error) {
      console.error('Failed to load mappings:', error);
    }
  };

  // AI 제안 승인
  const approveAISuggestion = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/admin/ai/approve`, { id });
      setMessage('✅ AI 제안이 승인되었습니다');
      loadAIQueue();
      loadMappings();
    } catch (error) {
      setMessage('❌ 승인 실패');
    }
  };

  // AI 제안 거부
  const rejectAISuggestion = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/admin/ai/reject`, { id });
      setMessage('✅ AI 제안이 거부되었습니다');
      loadAIQueue();
    } catch (error) {
      setMessage('❌ 거부 실패');
    }
  };

  // AI 분석 실행
  const runAIAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/admin/ai/run-analysis`);
      setMessage(response.data.message);
      loadAIQueue();
    } catch (error) {
      setMessage('❌ AI 분석 실패');
    }
    setLoading(false);
  };

  // 매핑 토글
  const toggleMapping = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/admin/duplicates/toggle`, { id });
      loadMappings();
      setMessage('✅ 매핑 상태가 변경되었습니다');
    } catch (error) {
      setMessage('❌ 상태 변경 실패');
    }
  };

  useEffect(() => {
    loadDuplicates();
    loadAIQueue();
    loadMappings();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        marginBottom: '20px', 
        color: '#1a1a1a' 
      }}>
        🎵 KPOP Ranker - 중복 관리 시스템
      </h1>
      
      {message && (
        <div style={{ 
          padding: '12px 20px', 
          marginBottom: '20px', 
          backgroundColor: message.includes('✅') ? '#d4edda' : message.includes('❌') ? '#f8d7da' : '#fff3cd',
          color: message.includes('✅') ? '#155724' : message.includes('❌') ? '#721c24' : '#856404',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setActiveTab('potential')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'potential' ? '#007bff' : 'transparent',
            color: activeTab === 'potential' ? 'white' : '#495057',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'potential' ? 'bold' : 'normal',
            fontSize: '15px'
          }}
        >
          📊 중복 의심 차트 데이터 ({duplicates.length})
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'ai' ? '#28a745' : 'transparent',
            color: activeTab === 'ai' ? 'white' : '#495057',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'ai' ? 'bold' : 'normal',
            fontSize: '15px',
            position: 'relative'
          }}
        >
          🤖 AI 중복 제안 ({aiQueue.length})
          {aiQueue.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              NEW
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mappings')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'mappings' ? '#6c757d' : 'transparent',
            color: activeTab === 'mappings' ? 'white' : '#495057',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'mappings' ? 'bold' : 'normal',
            fontSize: '15px'
          }}
        >
          ✅ 활성 매핑 ({mappings.filter(m => m.is_active).length})
        </button>
      </div>

      {/* 중복 의심 차트 데이터 탭 */}
      {activeTab === 'potential' && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)' 
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#1a1a1a' }}>
              📌 이것은 무엇인가요?
            </h2>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#e7f3ff', 
              borderRadius: '6px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#004085'
            }}>
              <strong>여러 차트에 동시에 진입한 곡들</strong>입니다. 같은 곡이 차트마다 다르게 표기될 수 있어요:<br/>
              예) Melon: "블랙핑크 - 뛰어" / Genie: "BLACKPINK - 뛰어(JUMP)" / Bugs: "BLACKPINK - JUMP"<br/>
              <strong>→ 이런 경우 하나로 통합해야 정확한 순위가 나옵니다!</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left', color: '#495057', fontSize: '14px' }}>아티스트</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left', color: '#495057', fontSize: '14px' }}>트랙</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left', color: '#495057', fontSize: '14px' }}>진입 차트</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center', color: '#495057', fontSize: '14px' }}>차트 수</th>
                  <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center', color: '#495057', fontSize: '14px' }}>최고 순위</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((item, idx) => (
                  <tr key={idx} style={{ 
                    backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#f8f9fa'}
                  >
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #dee2e6', 
                      fontWeight: '500',
                      color: '#1a1a1a',
                      fontSize: '14px'
                    }}>
                      {item.unified_artist}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #dee2e6',
                      color: '#333',
                      fontSize: '14px'
                    }}>
                      {item.unified_track}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {item.charts.split(',').map(chart => (
                          <span 
                            key={chart}
                            style={{
                              padding: '3px 8px',
                              backgroundColor: 
                                chart === 'melon' ? '#00cd3c' :
                                chart === 'genie' ? '#4285f4' :
                                chart === 'bugs' ? '#ff6b6b' :
                                chart === 'flo' ? '#9b59b6' :
                                '#6c757d',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}
                          >
                            {chart}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #dee2e6', 
                      textAlign: 'center',
                      fontSize: '14px'
                    }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        {item.chart_count}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #dee2e6', 
                      textAlign: 'center',
                      fontSize: '14px'
                    }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: item.best_rank <= 10 ? '#28a745' : '#ffc107',
                        color: item.best_rank <= 10 ? 'white' : '#333',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        #{item.best_rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI 제안 탭 */}
      {activeTab === 'ai' && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '20px', color: '#1a1a1a' }}>
              🤖 AI가 발견한 중복 후보
            </h2>
            <button
              onClick={runAIAnalysis}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {loading ? '분석 중...' : '🔄 AI 분석 실행'}
            </button>
          </div>

          {aiQueue.length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <p>AI 제안이 없습니다.</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                위의 "AI 분석 실행" 버튼을 클릭하세요!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiQueue.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ 
                        color: '#dc3545', 
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        {item.source_artist} - {item.source_track}
                      </span>
                      <span style={{ margin: '0 10px', color: '#6c757d' }}>→</span>
                      <span style={{ 
                        color: '#28a745', 
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        {item.target_artist} - {item.target_track}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      신뢰도: {(item.ai_confidence * 100).toFixed(0)}% | 
                      이유: {item.notes || 'Similar pattern detected'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => approveAISuggestion(item.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      ✓ 승인
                    </button>
                    <button
                      onClick={() => rejectAISuggestion(item.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      ✗ 거부
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 활성 매핑 탭 */}
      {activeTab === 'mappings' && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)' 
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#1a1a1a' }}>
            ✅ 현재 활성 매핑 ({mappings.filter(m => m.is_active).length}개)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mappings.map((mapping) => (
              <div 
                key={mapping.id}
                style={{
                  padding: '15px',
                  backgroundColor: mapping.is_active ? '#d4edda' : '#f8f9fa',
                  border: `1px solid ${mapping.is_active ? '#c3e6cb' : '#dee2e6'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: '500', color: '#495057', fontSize: '14px' }}>
                    {mapping.source_artist} - {mapping.source_track}
                  </span>
                  <span style={{ margin: '0 10px', color: '#6c757d' }}>→</span>
                  <span style={{ fontWeight: '500', color: '#007bff', fontSize: '14px' }}>
                    {mapping.target_artist} - {mapping.target_track}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: mapping.is_active ? '#28a745' : '#6c757d',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {mapping.is_active ? '활성' : '비활성'}
                  </span>
                  <button
                    onClick={() => toggleMapping(mapping.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {mapping.is_active ? '❌ 비활성화' : '✅ 활성화'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}