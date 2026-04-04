import type { PlaylistSong } from '@/types/domain';
import { songs } from './songs';
import { loadPersistedDb } from './persist';

const defaultPlaylistId = '33333333-3333-4333-8333-333333333333';

const defaultPlaylistSongs: PlaylistSong[] = songs.map((song, index) => ({
  id: `ps000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  playlist_id: defaultPlaylistId,
  song_id: song.id,
  position: index + 1,
  is_active: true,
}));

export const playlistSongs: PlaylistSong[] = loadPersistedDb<PlaylistSong[]>(
  'song-request.db.playlist-songs',
  defaultPlaylistSongs,
);
