import type { PublicPlaylistResponse } from '@/types/api';
import { loadPersistedDb } from './persist';

const defaultSettings: PublicPlaylistResponse['settings'] = {
  show_now_playing: true,
  show_queue_to_guests: true,
  queue_visibility_mode: 'current_and_next',
  queue_visible_count: 2,
  show_only_locked_items: false,
};

export const publicSettings: PublicPlaylistResponse['settings'] = loadPersistedDb<PublicPlaylistResponse['settings']>(
  'song-request.db.public-settings',
  defaultSettings,
);
