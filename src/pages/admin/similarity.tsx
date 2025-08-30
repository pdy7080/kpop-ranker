import { useState, useEffect } from 'react';
import axios from 'axios';

interface SimilarTrack {
  similarity: number;
  track1: {
    artist: string;
    track: string;
    charts: string;
    count: number;
  };
  track2: {
    artist: string;
    track: string;
    charts: string;
    count: number;
  };
}

interface SelectedMerge {
  primary: { artist: string; track: string };
  secondary: { artist: string; track: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SimilarityAdmin() {
  const [similarTracks, setSimilarTracks] = useState<SimilarTrack[]>([]);
  const [selectedMerges, setSelectedMerges] = useState<SelectedMerge[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadSimilarTracks();
    loadStats();
  }, []);

  const loadSimilarTracks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/similar-tracks`);
      setSimilarTracks(response.data.similar_pairs || []);
    } catch (error) {
      console.error('유사 트랙 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/similarity-stats`);
      setStats(response.data);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const handleTrackSelect = (track: SimilarTrack, primaryIndex: 1 | 2) => {
    const primary = primaryIndex === 1 ? track.track1 : track.track2;
    const secondary = primaryIndex === 1 ? track.track2 : track.track1;
    
    const merge: SelectedMerge = {
      primary: { artist: primary.artist, track: primary.track },
      secondary: { artist: secondary.artist, track: secondary.track }
    };

    setSelectedMerges(prev => {
      const exists = prev.find(m => 
        (m.primary.artist === merge.primary.artist && m.primary.track === merge.primary.track) ||
        (m.secondary.artist === merge.secondary.artist && m.secondary.track === merge.secondary.track)
      );
      
      if (exists) {
        return prev.filter(m => m !== exists);
      } else {
        return [...prev, merge];
      }
    });
  };

  const executeMerges = async () => {
    if (selectedMerges.length === 0) return;
    
    setProcessing(true);
    try {
      await axios.post(`${API_BASE}/api/admin/merge-selected`, {
        merges: selectedMerges
      });
      
      alert(`${selectedMerges.length}개 트랙 통합 완료!`);
      setSelectedMerges([]);
      loadSimilarTracks();
      loadStats();
    } catch (error) {
      console.error('통합 실패:', error);
      alert('통합 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const isSelected = (track: SimilarTrack) => {
    return selectedMerges.some(merge =>
      (merge.primary.artist === track.track1.artist && merge.primary.track === track.track1.track) ||
      (merge.secondary.artist === track.track1.artist && merge.secondary.track === track.track1.track) ||
      (merge.primary.artist === track.track2.artist && merge.primary.track === track.track2.track) ||
      (merge.secondary.artist === track.track2.artist && merge.secondary.track === track.track2.track)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">유사 트랙 분석 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">🔍 유사 트랙 통합 관리</h1>
          
          {stats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{stats.unique_tracks}</div>
                <div className="text-sm text-gray-600">고유 트랙</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{stats.total_entries}</div>
                <div className="text-sm text-gray-600">전체 항목</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">{similarTracks.length}</div>
                <div className="text-sm text-gray-600">유사 케이스</div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              유사도 90% 이상 케이스 (상위 50개)
            </div>
            <button
              onClick={executeMerges}
              disabled={selectedMerges.length === 0 || processing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {processing ? '통합 중...' : `선택된 ${selectedMerges.length}개 통합`}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {similarTracks.map((track, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow p-6 ${isSelected(track) ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">
                  유사도: {track.similarity}%
                </div>
                <div className="text-sm text-gray-500">
                  케이스 #{index + 1}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Track 1 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">트랙 A</h3>
                    <button
                      onClick={() => handleTrackSelect(track, 1)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      메인으로 선택
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div><strong>아티스트:</strong> {track.track1.artist}</div>
                    <div><strong>트랙:</strong> {track.track1.track}</div>
                    <div className="text-sm text-gray-600">
                      <strong>차트:</strong> {track.track1.charts} ({track.track1.count}개)
                    </div>
                  </div>
                </div>

                {/* Track 2 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">트랙 B</h3>
                    <button
                      onClick={() => handleTrackSelect(track, 2)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      메인으로 선택
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div><strong>아티스트:</strong> {track.track2.artist}</div>
                    <div><strong>트랙:</strong> {track.track2.track}</div>
                    <div className="text-sm text-gray-600">
                      <strong>차트:</strong> {track.track2.charts} ({track.track2.count}개)
                    </div>
                  </div>
                </div>
              </div>

              {/* 선택 상태 표시 */}
              {isSelected(track) && (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500">
                  <div className="text-sm text-blue-800">
                    ✅ 통합 예약됨
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {similarTracks.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500">
              🎉 유사도 90% 이상의 중복 케이스가 없습니다!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
