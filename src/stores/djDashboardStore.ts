import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DjDashboardState {
  activePlaylistId: string | null;
  selectedQueueId: string | null;
  setActivePlaylistId: (value: string | null) => void;
  setSelectedQueueId: (value: string | null) => void;
}

export const useDjDashboardStore = create<DjDashboardState>()(
  persist(
    (set) => ({
      activePlaylistId: null,
      selectedQueueId: null,
      setActivePlaylistId: (activePlaylistId) => set({ activePlaylistId }),
      setSelectedQueueId: (selectedQueueId) => set({ selectedQueueId }),
    }),
    {
      name: 'song-request.dj-dashboard',
    },
  ),
);
