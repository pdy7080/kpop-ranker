        {/* 탭 섹션 - 중복 관리 탭 추가 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button 
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'stats' 
                    ? 'border-b-2 border-purple-600 text-purple-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                통계
              </button>
              <button 
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'duplicates' 
                    ? 'border-b-2 border-purple-600 text-purple-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => {
                  setActiveTab('duplicates');
                  loadSuspiciousDuplicates();
                }}
              >
                중복 관리
                {duplicateStats && duplicateStats.duplicate_count > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {duplicateStats.duplicate_count}
                  </span>
                )}
              </button>
              <button 
                className={`px-6 py-3 ${
                  activeTab === 'logs' 
                    ? 'font-semibold border-b-2 border-purple-600 text-purple-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('logs')}
              >
                로그
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'stats' && (
              <div>
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
                  
                  {duplicateStats && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-bold mb-2">데이터 품질</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">통합 트랙:</span>
                          <span className="font-bold ml-2">{duplicateStats.total_unified_tracks.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">원본 엔트리:</span>
                          <span className="font-bold ml-2">{duplicateStats.total_original_entries.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">중복 수:</span>
                          <span className="font-bold ml-2 text-red-600">{duplicateStats.duplicate_count.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">중복률:</span>
                          <span className={`font-bold ml-2 ${
                            duplicateStats.duplicate_percentage > 15 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {duplicateStats.duplicate_percentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
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
            )}

            {activeTab === 'duplicates' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">중복 데이터 관리</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={loadSuspiciousDuplicates}
                      disabled={duplicateLoading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      {duplicateLoading ? '🔄 로딩...' : '🔍 중복 검색'}
                    </button>
                    <button
                      onClick={loadDuplicateStats}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      📊 통계 새로고침
                    </button>
                  </div>
                </div>

                {duplicateLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin text-4xl mb-4">🔄</div>
                    <p className="text-gray-600">중복 항목을 분석하고 있습니다...</p>
                  </div>
                ) : duplicateGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-gray-600">의심스러운 중복 항목이 없습니다.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      '중복 검색' 버튼을 클릭하여 최신 상태를 확인하세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {duplicateGroups.map((group, index) => (
                      <DuplicateGroupCard 
                        key={group.id}
                        group={group}
                        index={index}
                        onMerge={handleMergeDuplicates}
                        onKeepSeparate={handleKeepSeparate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <h3 className="font-bold mb-4">시스템 로그</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">로그 기능은 개발 중입니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>

// 중복 그룹 카드 컴포넌트
const DuplicateGroupCard = ({ 
  group, 
  index, 
  onMerge, 
  onKeepSeparate 
}: {
  group: DuplicateGroup;
  index: number;
  onMerge: (group: DuplicateGroup, canonicalIndex: number) => void;
  onKeepSeparate: (group: DuplicateGroup) => void;
}) => {
  const [selectedCanonical, setSelectedCanonical] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-red-600 bg-red-100';
    if (confidence >= 0.8) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return '높음';
    if (confidence >= 0.8) return '중간';
    return '낮음';
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-lg">#{index + 1} {group.unified_artist} - {group.unified_track}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(group.confidence)}`}>
              신뢰도: {getConfidenceText(group.confidence)} ({(group.confidence * 100).toFixed(0)}%)
            </span>
            <span className="text-sm text-gray-600">
              {group.variations}개 변형
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          {showDetails ? '접기' : '상세보기'}
        </button>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div className="mb-4 p-3 bg-white rounded border">
          <h5 className="font-semibold mb-2">원본 항목들:</h5>
          <div className="space-y-2">
            {group.tracks.map((track, trackIndex) => (
              <div key={trackIndex} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{track.original_artist}</span>
                  <span className="mx-2">-</span>
                  <span>{track.original_track}</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {track.chart}
                  </span>
                </div>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`canonical-${group.id}`}
                    value={trackIndex}
                    checked={selectedCanonical === trackIndex}
                    onChange={(e) => setSelectedCanonical(parseInt(e.target.value))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">대표로 사용</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={() => onMerge(group, selectedCanonical)}
          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          ✅ 통합하기
          {showDetails && (
            <span className="block text-xs mt-1">
              "{group.tracks[selectedCanonical]?.original_artist}"을(를) 대표로 사용
            </span>
          )}
        </button>
        <button
          onClick={() => onKeepSeparate(group)}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
        >
          ➡️ 별개 유지
        </button>
      </div>
    </div>
  );
};