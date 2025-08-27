// Chart logos component
export const ChartLogos: Record<string, { icon: string; color: string; bgColor: string }> = {
  melon: { icon: '🍉', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  genie: { icon: '🧞', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  bugs: { icon: '🐛', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  vibe: { icon: '💜', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  flo: { icon: '🌸', color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  spotify: { icon: '🎵', color: 'text-green-400', bgColor: 'bg-green-400/10' },
  youtube: { icon: '📺', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  billboard: { icon: '📊', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' }
};

export const getChartLogo = (chartName: string) => {
  const chart = ChartLogos[chartName.toLowerCase()];
  return chart || { icon: '🎵', color: 'text-gray-500', bgColor: 'bg-gray-500/10' };
};