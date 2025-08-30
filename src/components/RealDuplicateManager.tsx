import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DuplicateItem {
  track1: { artist: string; track: string; charts: { [key: string]: number } };
  track2: { artist: string; track: string; charts: { [key: string]: number } };
  similarity: { artist: number; track: number; total: number };
  reason: string;
  priority: string;
}

const RealDuplicateManager = () => {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => { fetchDuplicates(); }, []);

  const fetchDuplicates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/real-duplicates`);
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
      setProcessing(index);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/merge-tracks`, {
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
        alert('✅ 통합 완료!');
      }
    } catch (error) {
      alert('❌ 통합 실패');
    } finally {
      setProcessing(null);
    }
  };

  const handleIgnore = async (track1: any, track2: any, index: number) => {
    try {
      setProcessing(index);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/ignore-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist1: track1.artist, track1: track1.track,
          artist2: track2.artist, track2: track2.track
        })
      });
      setDuplicates(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Ignore error:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <div className="ml-4 text-lg">중복 분석 중...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🔍 실제 중복 관리</h1>
            <p className="text-gray-600 mt-2">시스템이 놓친 같은 곡들을 찾아서 통합합니다</p>
          </div>
          <Link href="/admin" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            ← 관리자 홈
          </Link>
        </div>
      </div>

      {duplicates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <div className="text-xl text-gray-600">실제 중복이 발견되지 않았습니다!</div>
        </div>
      ) : (
        <div className="space-y-6">
          {duplicates.map((dup, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      dup.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {dup.reason} - {(dup.similarity.total * 100).toFixed(1)}% 유사
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-red-50 rounded border border-red-200">
                      <div className="text-red-600 font-medium mb-2">🎵 옵션 1</div>
                      <div className="font-bold text-lg">{dup.track1.artist}</div>
                      <div className="text-gray-700 mb-2">{dup.track1.track}</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(dup.track1.charts).map(([chart, rank]) => (
                          <span key={chart} className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                            {chart}: #{rank}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      <div className="text-blue-600 font-medium mb-2">🎵 옵션 2</div>
                      <div className="font-bold text-lg">{dup.track2.artist}</div>
                      <div className="text-gray-700 mb-2">{dup.track2.track}</div>
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

                <div className="ml-6 flex flex-col space-y-2 min-w-[140px]">
                  <button
                    onClick={() => handleMerge(dup.track1, dup.track2, index)}
                    disabled={processing === index}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                  >
                    {processing === index ? '처리중...' : '🔴 1번 선택'}
                  </button>
                  
                  <button
                    onClick={() => handleMerge(dup.track2, dup.track1, index)}
                    disabled={processing === index}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                  >
                    {processing === index ? '처리중...' : '🔵 2번 선택'}
                  </button>
                  
                  <button
                    onClick={() => handleIgnore(dup.track1, dup.track2, index)}
                    disabled={processing === index}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                  >
                    {processing === index ? '처리중...' : '❌ 다른곡'}
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
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            🔄 새로고침
          </button>
          <div className="text-sm text-gray-600">
            발견된 의심 케이스: <span className="font-bold">{duplicates.length}</span>개
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealDuplicateManager;