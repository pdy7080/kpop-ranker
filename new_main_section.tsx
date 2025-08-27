        {/* Top Champions Section - 새로운 TOP 3 섹션 */}
        {!isLoading && trendingTracks.length > 0 && (
          <TopChampionsSection 
            trendingTracks={trendingTracks}
            stats={stats}
          />
        )}

        {/* Trending Gallery - 새로운 4x4 갤러리 */}
        {!isLoading && trendingTracks.length > 3 && (
          <TrendingGallery trendingTracks={trendingTracks} />
        )}

        {/* Features Section - 기존 유지 */}