  // 🔥 실제 앨범 이미지인지 확인하는 함수 (개선됨)
  const getValidAlbumImage = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    
    // placeholder, placehold 이미지는 무효로 처리
    if (imageUrl.includes('placeholder') || 
        imageUrl.includes('placehold') || 
        imageUrl.includes('via.placeholder')) {
      return null;
    }
    
    // Spotify 이미지만 유효한 것으로 처리
    if (imageUrl.includes('scdn.co') || imageUrl.includes('spotify')) {
      return imageUrl;
    }
    
    // 기타 유효한 이미지 URL인지 확인
    if (imageUrl.startsWith('http') && 
        (imageUrl.includes('.jpg') || imageUrl.includes('.png') || imageUrl.includes('.webp'))) {
      return imageUrl;
    }
    
    return null;
  };

  // 🎨 아티스트 이니셜로 그래디언트 생성
  const getArtistInitial = (artistName: string) => {
    if (!artistName) return 'K';
    
    // 한글인 경우 첫 글자, 영어인 경우 첫 글자
    const firstChar = artistName.charAt(0).toUpperCase();
    return firstChar;
  };