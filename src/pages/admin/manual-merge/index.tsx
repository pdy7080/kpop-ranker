import React, { useState, useEffect } from 'react';

interface DuplicateCandidate {
  id: number;
  unified_artist: string;
  unified_track: string;
  original_artist: string;
  original_track: string;
  chart_name: string;
  rank_position: number;
  created_at: string;
  similarity_score?: number;
}

interface DuplicateGroup {
  group_id: string;
  unified_artist: string;
  unified_track: string;
  candidates: DuplicateCandidate[];
  duplicate_type: 'clear' | 'review' | 'legitimate';
  auto_recommended?: boolean;
}

const ManualMergePage = () => {
  const [candidates, setCandidates] = useState<DuplicateGroup[]>([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: {[key: number]: boolean}}>({});
  const [masterIds, setMasterIds] = useState<{[key: string]: number}>({});
  const [activeTab, setActiveTab] = useState<'candidates' | 'exceptions'>('candidates');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [candidatesRes, exceptionsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/manual-merge-candidates`, {
          headers: { 'X-Admin-Auth': localStorage.getItem('adminToken') || 'dragon*7080' }
        }),
        fetch(`${API_URL}/api/admin/merge-exceptions`, {
          headers: { 'X-Admin-Auth': localStorage.getItem('adminToken') || 'dragon*7080' }
        })
      ]);
      
      const candidatesData = await candidatesRes.json();
      const exceptionsData = await exceptionsRes.json();
      
      if (candidatesData.success) {
        const processedCandidates = processCandidates(candidatesData.candidates);
        setCandidates(processedCandidates);
        
        // 명확한 중복에 대해 자동 추천 적용
        applyAutoRecommendations(processedCandidates);
      }
      if (exceptionsData.success) setExceptions(exceptionsData.exceptions);
    } catch (error) {
      console.error('Data loading error:', error);
    }
    setLoading(false);
  };

  // 중복 유형 분류 로직
  const processCandidates = (rawCandidates: any[]): DuplicateGroup[] => {
    if (!Array.isArray(rawCandidates)) return [];
    
    return rawCandidates.map(group => {
      const candidates = Array.isArray(group.candidates) ? group.candidates : [];
      
      // G-DRAGON 같은 명확한 중복 판정 로직
      const isDuplicateType = analyzeDuplicateType(candidates);
      
      return {
        ...group,
        candidates,
        duplicate_type: isDuplicateType,
        auto_recommended: isDuplicateType === 'clear'
      };
    });
  };

  // 중복 유형 분석
  const analyzeDuplicateType = (candidates: DuplicateCandidate[]): 'clear' | 'review' | 'legitimate' => {
    if (!Array.isArray(candidates) || candidates.length < 2) return 'legitimate';
    
    // 모든 항목이 같은 차트인지 확인
    const sameChart = candidates.every(c => c?.chart_name === candidates[0]?.chart_name);
    
    if (sameChart) {
      // 같은 차트에서 완전히 동일한 제목과 아티스트를 가진 경우
      const allSame = candidates.every(c => 
        c?.unified_artist === candidates[0]?.unified_artist &&
        c?.unified_track === candidates[0]?.unified_track &&
        c?.original_artist === candidates[0]?.original_artist &&
        c?.original_track === candidates[0]?.original_track
      );
      
      if (allSame) {
        // G-DRAGON 케이스: 완전히 동일한 데이터
        return 'clear';
      } else {
        // 같은 차트, 다른 세부사항
        return 'review';
      }
    } else {
      // 다른 차트 - NCT Dream 같은 정당한 케이스일 가능성
      return 'legitimate';
    }
  };

  // 자동 추천 적용
  const applyAutoRecommendations = (groups: DuplicateGroup[]) => {
    const newSelectedItems: {[key: string]: {[key: number]: boolean}} = {};
    const newMasterIds: {[key: string]: number} = {};
    
    groups.forEach(group => {
      const candidates = Array.isArray(group.candidates) ? group.candidates : [];
      if (group.duplicate_type === 'clear' && candidates.length > 1) {
        // 명확한 중복의 경우 모든 항목 선택
        newSelectedItems[group.group_id] = {};
        candidates.forEach(candidate => {
          newSelectedItems[group.group_id][candidate.id] = true;
        });
        
        // 첫 번째 항목을 대표로 선택
        newMasterIds[group.group_id] = candidates[0].id;
      }
    });
    
    setSelectedItems(newSelectedItems);
    setMasterIds(newMasterIds);
  };

  const handleItemSelect = (groupId: string, itemId: number, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [itemId]: checked
      }
    }));
  };

  const handleMasterSelect = (groupId: string, itemId: number) => {
    setMasterIds(prev => ({
      ...prev,
      [groupId]: itemId
    }));
  };

  const getSelectedIds = (groupId: string): number[] => {
    return Object.keys(selectedItems[groupId] || {})
      .filter(id => selectedItems[groupId][parseInt(id)])
      .map(id => parseInt(id));
  };

  const executeMerge = async (groupId: string, action: 'merge' | 'exception' | 'legitimate' = 'merge') => {
    const selectedIds = getSelectedIds(groupId);
    const masterId = masterIds[groupId];
    
    if (action === 'merge' && selectedIds.length < 2) {
      alert('병합하려면 최소 2개 항목을 선택해야 합니다.');
      return;
    }
    
    if (action === 'merge' && !masterId) {
      alert('대표로 남길 항목을 선택해주세요.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/manual-merge-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': localStorage.getItem('adminToken') || 'dragon*7080'
        },
        body: JSON.stringify({
          group_id: groupId,
          selected_ids: selectedIds,
          master_id: masterId,
          action: action
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        loadData(); // 데이터 새로고침
        setSelectedItems(prev => ({ ...prev, [groupId]: {} }));
        setMasterIds(prev => ({ ...prev, [groupId]: 0 }));
      } else {
        alert('오류: ' + result.error);
      }
    } catch (error) {
      alert('실행 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  };

  // 중복 유형별 배지 컴포넌트
  const DuplicateTypeBadge = ({ type }: { type: 'clear' | 'review' | 'legitimate' }) => {
    const configs = {
      clear: { color: 'bg-red-100 text-red-800', icon: '🔴', label: '명확한 중복' },
      review: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡', label: '검토 필요' },
      legitimate: { color: 'bg-green-100 text-green-800', icon: '🟢', label: '정당한 데이터' }
    };
    
    const config = configs[type];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // 그룹 카드 컴포넌트
  const GroupCard = ({ group }: { group: DuplicateGroup }) => {
    const selectedIds = getSelectedIds(group.group_id);
    const masterId = masterIds[group.group_id];
    const candidates = Array.isArray(group.candidates) ? group.candidates : [];
    
    if (candidates.length === 0) {
      return (
        <div className="border rounded-lg p-4 mb-4 border-gray-200 bg-gray-50">
          <p className="text-gray-500">데이터가 없습니다.</p>
        </div>
      );
    }
    
    return (
      <div className={`border rounded-lg p-4 mb-4 ${
        group.duplicate_type === 'clear' ? 'border-red-200 bg-red-50' :
        group.duplicate_type === 'review' ? 'border-yellow-200 bg-yellow-50' :
        'border-green-200 bg-green-50'
      }`}>
        {/* 그룹 헤더 */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {group.unified_artist} - {group.unified_track}
            </h3>
            <p className="text-sm text-gray-600">
              {candidates.length}개 항목
              {group.auto_recommended && (
                <span className="ml-2 text-blue-600 font-medium">✨ 자동 추천됨</span>
              )}
            </p>
          </div>
          <DuplicateTypeBadge type={group.duplicate_type} />
        </div>
        
        {/* 안내 메시지 */}
        {group.duplicate_type === 'clear' && (
          <div className="bg-red-100 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">
              <strong>🔴 명확한 중복:</strong> 모든 항목이 동일합니다. 자동으로 통합을 추천합니다.
            </p>
          </div>
        )}
        
        {group.duplicate_type === 'review' && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>🟡 검토 필요:</strong> 유사하지만 차이가 있습니다. 신중히 선택하세요.
            </p>
          </div>
        )}
        
        {group.duplicate_type === 'legitimate' && (
          <div className="bg-green-100 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-sm text-green-800">
              <strong>🟢 정당한 데이터:</strong> 다른 차트의 정상 데이터일 수 있습니다. 신중히 검토하세요.
            </p>
          </div>
        )}

        {/* 후보 항목 목록 */}
        <div className="space-y-4 mb-6">
          {candidates.map((candidate, idx) => {
            const isSelected = selectedItems[group.group_id]?.[candidate.id] || false;
            const isMaster = masterIds[group.group_id] === candidate.id;
            
            return (
              <div key={candidate.id} className={`border rounded-md p-3 ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleItemSelect(group.group_id, candidate.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium bg-gray-200 px-2 py-1 rounded mr-2">
                          {candidate.chart_name.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">#{candidate.rank_position}</span>
                      </div>
                      <div className="text-sm">
                        <div><strong>통합명:</strong> {candidate.unified_artist} - {candidate.unified_track}</div>
                        <div><strong>원본명:</strong> {candidate.original_artist} - {candidate.original_track}</div>
                        <div className="text-gray-500">{new Date(candidate.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="ml-4">
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name={`master-${group.group_id}`}
                          checked={isMaster}
                          onChange={() => handleMasterSelect(group.group_id, candidate.id)}
                          className="h-4 w-4 text-green-600 mr-2"
                        />
                        <span className="text-green-700 font-medium">대표로 남기기</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => executeMerge(group.group_id, 'merge')}
            disabled={selectedIds.length < 2}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedIds.length >= 2
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            선택 항목 통합 ({selectedIds.length}개)
          </button>
          
          <button
            onClick={() => executeMerge(group.group_id, 'exception')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600"
          >
            예외 처리
          </button>
          
          {group.duplicate_type === 'legitimate' && (
            <button
              onClick={() => executeMerge(group.group_id, 'legitimate')}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              정당한 데이터 승인
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">중복 데이터를 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔧 수동 중복 관리 시스템</h1>
          <p className="text-lg text-gray-600 mb-6">
            트렌딩 데이터의 중복을 수동으로 정리하고 관리하는 시스템입니다
          </p>
          
          {/* 범례 */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 inline-block">
            <h3 className="font-semibold mb-2">중복 유형 안내</h3>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <span className="mr-2">🔴</span>
                <span>명확한 중복 - 자동 추천</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🟡</span>
                <span>검토 필요 - 수동 선택</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🟢</span>
                <span>정당한 데이터 - 신중 검토</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 탭 메뉴 */}
        <div className="flex bg-white rounded-lg shadow-md mb-6">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex-1 px-6 py-3 text-center font-medium rounded-l-lg ${
              activeTab === 'candidates' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔍 의심 목록 ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`flex-1 px-6 py-3 text-center font-medium rounded-r-lg ${
              activeTab === 'exceptions' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⏸️ 예외 목록 ({exceptions.length})
          </button>
        </div>
        
        {/* 의심 목록 탭 */}
        {activeTab === 'candidates' && (
          <div>
            {candidates.length > 0 ? (
              <div>
                {/* 통계 */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-red-50 p-3 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {candidates.filter(g => g.duplicate_type === 'clear').length}
                      </div>
                      <div className="text-sm text-red-800">명확한 중복</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {candidates.filter(g => g.duplicate_type === 'review').length}
                      </div>
                      <div className="text-sm text-yellow-800">검토 필요</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {candidates.filter(g => g.duplicate_type === 'legitimate').length}
                      </div>
                      <div className="text-sm text-green-800">정당한 데이터</div>
                    </div>
                  </div>
                </div>
                
                {/* 그룹 목록 */}
                <div>
                  {candidates.map(group => (
                    <GroupCard key={group.group_id} group={group} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">중복 의심 항목이 없습니다</h3>
                <p className="text-gray-600">모든 데이터가 정리되었습니다!</p>
              </div>
            )}
          </div>
        )}
        
        {/* 예외 목록 탭 */}
        {activeTab === 'exceptions' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">⏸️ 예외 처리 대기 목록</h3>
            {exceptions.length > 0 ? (
              <p className="text-gray-600">예외 처리 목록 기능을 개발 중입니다.</p>
            ) : (
              <p className="text-gray-600">예외 처리 대기 중인 항목이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualMergePage;
