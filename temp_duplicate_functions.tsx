  // 새로운 중복 관리 함수들
  const loadDuplicateStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/duplicate-stats`);
      const data = await response.json();
      if (data.success) {
        setDuplicateStats(data.stats);
      }
    } catch (error) {
      console.error('Duplicate stats error:', error);
    }
  };

  const loadSuspiciousDuplicates = async () => {
    setDuplicateLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/suspicious-duplicates`);
      const data = await response.json();
      if (data.success) {
        setDuplicateGroups(data.groups);
      } else {
        toast.error('중복 목록 로드 실패');
      }
    } catch (error) {
      console.error('Suspicious duplicates error:', error);
      toast.error('중복 목록 로드 오류');
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleMergeDuplicates = async (group: DuplicateGroup, canonicalIndex: number) => {
    try {
      const canonical = group.tracks[canonicalIndex];
      const mergeList = group.tracks.filter((_, index) => index !== canonicalIndex);
      
      const response = await fetch(`${API_URL}/api/admin/merge-duplicates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminToken
        },
        body: JSON.stringify({
          canonical_artist: canonical.original_artist,
          canonical_track: canonical.original_track,
          merge_list: mergeList
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`${data.merged_count}개 항목이 통합되었습니다`);
        
        // 목록에서 제거
        setDuplicateGroups(prev => prev.filter(g => g.id !== group.id));
        
        // 통계 새로고침
        await loadDuplicateStats();
      } else {
        toast.error('통합 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Merge error:', error);
      toast.error('통합 중 오류 발생');
    }
  };

  const handleKeepSeparate = async (group: DuplicateGroup) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/keep-separate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Auth': adminToken
        },
        body: JSON.stringify({
          items: group.tracks
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('별개 항목으로 기록되었습니다');
        
        // 목록에서 제거
        setDuplicateGroups(prev => prev.filter(g => g.id !== group.id));
      } else {
        toast.error('처리 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Keep separate error:', error);
      toast.error('처리 중 오류 발생');
    }
  };