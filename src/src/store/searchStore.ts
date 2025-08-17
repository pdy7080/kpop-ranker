import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchHistory {
  id: string;
  artist: string;
  track: string;
  timestamp: number;
}

interface SearchStore {
  searchHistory: SearchHistory[];
  lastSearch: { artist: string; track: string } | null;
  addToHistory: (artist: string, track: string) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      searchHistory: [],
      lastSearch: null,
      
      addToHistory: (artist: string, track: string) => 
        set((state) => {
          const newItem: SearchHistory = {
            id: Date.now().toString(),
            artist,
            track,
            timestamp: Date.now(),
          };
          
          // 중복 제거 후 최신 10개만 유지
          const filtered = state.searchHistory.filter(
            item => !(item.artist === artist && item.track === track)
          );
          
          return {
            searchHistory: [newItem, ...filtered].slice(0, 10),
            lastSearch: { artist, track },
          };
        }),
      
      clearHistory: () => 
        set({ searchHistory: [], lastSearch: null }),
      
      removeFromHistory: (id: string) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter(item => item.id !== id),
        })),
    }),
    {
      name: 'search-storage',
    }
  )
);
