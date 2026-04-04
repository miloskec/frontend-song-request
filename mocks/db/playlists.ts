import type { Playlist } from '@/types/domain';
import { loadPersistedDb } from './persist';

const defaultPlaylists: Playlist[] = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    user_id: '11111111-1111-4111-8111-111111111111',
    name: 'Friday Club Set',
    description: 'Primary active playlist for demo venue.',
    is_active: true,
    is_public: true,
    cover_image_url: 'https://images.example.com/playlist-friday.jpg',
    qr_uuid: '44444444-4444-4444-8444-444444444444',
    queue_visibility_mode: 'current_and_next',
    queue_visible_count: 2,
  },
];

export const playlists: Playlist[] = loadPersistedDb<Playlist[]>('song-request.db.playlists', defaultPlaylists);
