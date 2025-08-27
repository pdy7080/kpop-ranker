export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  target.onerror = null;
  target.style.display = 'none';
  
  // 부모 요소에 대체 이모지 표시
  const parent = target.parentElement;
  if (parent && !parent.querySelector('.fallback-emoji')) {
    const fallback = document.createElement('div');
    fallback.className = 'fallback-emoji w-full h-full flex items-center justify-center text-4xl';
    fallback.textContent = '🎵';
    parent.appendChild(fallback);
  }
};