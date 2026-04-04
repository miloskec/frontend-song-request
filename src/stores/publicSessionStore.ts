import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { PublicPlaylistResponse, PublicQueueResponse } from '@/types/api';

interface PublicSessionState {
  qrUuid: string | null;
  publicPlaylist: PublicPlaylistResponse | null;
  publicQueue: PublicQueueResponse | null;
  setQrUuid: (qrUuid: string | null) => void;
  setPublicPlaylist: (payload: PublicPlaylistResponse | null) => void;
  setPublicQueue: (payload: PublicQueueResponse | null) => void;
  reset: () => void;
}

const initialState = {
  qrUuid: null,
  publicPlaylist: null,
  publicQueue: null,
};

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Prevent app crashes when storage quota is reached.
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(name);
  },
};

export const usePublicSessionStore = create<PublicSessionState>()(
  persist(
    (set) => ({
      ...initialState,
      setQrUuid: (qrUuid) => set({ qrUuid }),
      setPublicPlaylist: (publicPlaylist) => set({ publicPlaylist }),
      setPublicQueue: (publicQueue) => set({ publicQueue }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'song-request.public-session',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ qrUuid: state.qrUuid }),
    },
  ),
);
