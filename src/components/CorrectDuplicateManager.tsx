import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DuplicateItem {
  track1: { artist: string; track: string; charts: any; type: string };
  track2: { artist: string; track: string; charts: any; type: string };
  duplicate_type: string;
  confidence: number;
  auto_recommend: boolean;
}

const CorrectDuplicateManager = () => {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDuplicates(); }, []);

  const fetchDuplicates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/correct-duplicates`);
      const data = await response.json();
      if (data.success) setDuplicates(data.duplicates || []);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async (master: any, merge: any, index: number) => {
    if (!confirm(`"${merge.artist} - ${merge.track}"을 "${master.artist} - ${master.track}"으로 통합?`)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/quick-merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          master_artist: master.artist, master_track: master.track,
          merge_artist: merge.artist, merge_track: merge.track
        })
      });
      const result = await response.json();
      if (result.success) {
        setDuplicates(prev => prev.filter((_, i) => i !== index));
        alert(`✅ ${result.details.updated_count}개 항목 통합 완료!`);
      } else if (result.retry) {
        alert('⚠️ DB 사용 중 - 잠시 후 다시 시도하세요');
      }
    } catch (error) {
      alert('❌ 통합 실패');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      <div className="ml-4 text-lg">정확한 중복 분석 중...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">🎯 정확한 중복 관리</h1>
            <p className="text-gray-600 mt-2">서로 다른 이름으로 저장된 같은 곡을 찾아 통합합니다</p>
          </div>
          <Link href="/admin" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            ← 관리자 홈
          </Link>
        </div>
        
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-bold text-purple-700 mb-2">🔍 탐지 방식:</h3>
          <ul className="text-sm text-purple-600 space-y-1">
            <li>• 한글-영어 매핑: 데이식스 ↔ DAY6</li>
            <li>• 띄어쓰기/특수문자: New Jeans ↔ NewJeans</li>
            <li>• Feat/Remix: 곡명 (feat. XX) ↔ 원곡</li>
          </ul>
        </div>
      </div>

      {duplicates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">✨</div>
          <div className="text-xl text-gray-600 mb-2">
            올바른 중복이 발견되지 않았습니다!
          </div>
          <div className="text-sm text-gray-500">
            시스템이 모든 곡을 정확하게 구분하고 있습니다.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {duplicates.map((dup, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dup.confidence > 0.95 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {dup.duplicate_type}
                    </span>
                    <span className="text-sm text-gray-500">
                      확신도: {(dup.confidence * 100).toFixed(1)}%
                    </span>
                    {dup.auto_recommend && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        자동 추천
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-red-600 font-medium mb-2">🎵 {dup.track1.type}</div>
                      <div className="font-bold text-lg text-gray-800">
                        {dup.track1.artist}
                      </div>
                      <div className="text-gray-700 mb-3">
                        {dup.track1.track}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(dup.track1.charts).map(([chart, rank]) => (
                          <span key={chart} className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                            {chart}: #{rank}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-blue-600 font-medium mb-2">🎵 {dup.track2.type}</div>
                      <div className="font-bold text-lg text-gray-800">
                        {dup.track2.artist}
                      </div>
                      <div className="text-gray-700 mb-3">
                        {dup.track2.track}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(dup.track2.charts).map(([chart, rank]) => (
                          <span key={chart} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                            {chart}: #{rank}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-3 min-w-[160px]">
                  <button
                    onClick={() => handleMerge(dup.track1, dup.track2, index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    🔴 {dup.track1.type}으로 통합
                  </button>
                  
                  <button
                    onClick={() => handleMerge(dup.track2, dup.track1, index)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    🔵 {dup.track2.type}으로 통합
                  </button>
                  
                  <button
                    onClick={() => setDuplicates(prev => prev.filter((_, i) => i !== index))}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    ❌ 다른곡임
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={fetchDuplicates}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            🔄 새로고침
          </button>
          <div className="text-sm text-gray-600">
            발견된 정확한 중복: <span className="font-bold">{duplicates.length}</span>개
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectDuplicateManager;