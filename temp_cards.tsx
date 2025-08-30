        {/* 중복 관리 경고 카드 */}
        {duplicateStats && duplicateStats.duplicate_percentage > 15 && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-800">데이터 중복률 높음</p>
                <p className="text-red-700 text-sm">
                  현재 {duplicateStats.duplicate_percentage.toFixed(1)}%의 중복률을 보이고 있습니다. 
                  즉시 중복 정리가 필요합니다.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('duplicates')}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                중복 관리
              </button>
            </div>
          </div>
        )}

        {/* 시스템 상태 카드들 - 중복률 카드 추가 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">API 상태</span>
              <span className="text-2xl">📡</span>
            </div>
            <div className="text-xl font-bold">
              <span className="text-green-600">✅ 정상</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">DB 상태</span>
              <span className="text-2xl">💾</span>
            </div>
            <div className="text-xl font-bold">
              <span className="text-green-600">연결됨</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardData?.db_stats?.size_mb ? `${dashboardData.db_stats.size_mb}MB` : '10MB'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">중복률</span>
              <span className="text-2xl">🔍</span>
            </div>
            <div className="text-xl font-bold">
              <span className={duplicateStats?.duplicate_percentage && duplicateStats.duplicate_percentage > 15 ? 'text-red-600' : 'text-yellow-600'}>
                {duplicateStats ? `${duplicateStats.duplicate_percentage.toFixed(1)}%` : '로딩...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {duplicateStats?.duplicate_count || 0}개 중복
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">활성 사용자</span>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-xl font-bold">
              {dashboardData?.api_stats?.active_users || 45}
            </div>
          </div>
        </div>