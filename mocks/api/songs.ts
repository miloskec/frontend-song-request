import { songs } from '../db/songs';
import { savePersistedDb } from '../db/persist';
import { attachSongToPlaylist } from './playlists';
import type { Song } from '@/types/domain';

interface SongMutationPayload {
  title?: string;
  artist?: string;
  cover_image_url?: string | null;
}

function persistSongs() {
  savePersistedDb('song-request.db.songs', songs);
}

export function listSongs() {
  return {
    data: songs,
    meta: { current_page: 1, per_page: 20, total: songs.length, last_page: 1 },
  };
}

export function createSong(payload: { title: string; artist?: string | null; cover_image_url?: string | null }): { song: Song } {
  const song: Song = {
    id: globalThis.crypto?.randomUUID?.() ?? `70000000-0000-4000-8000-${String(songs.length + 1).padStart(12, '0')}`,
    user_id: '11111111-1111-4111-8111-111111111111',
    title: payload.title,
    artist: payload.artist ?? null,
    cover_image_url: payload.cover_image_url ?? `https://picsum.photos/seed/new-song-${songs.length + 1}/160/160`,
    bidding_enabled: false,
    is_active: true,
  };

  songs.unshift(song);
  persistSongs();
  return { song };
}

export function updateSong(songId: string, payload: SongMutationPayload): { song: Song } {
  const song = songs.find((item) => item.id === songId);
  if (!song) {
    throw new Error('Song not found');
  }

  if (payload.title !== undefined) {
    song.title = payload.title;
  }
  if (payload.artist !== undefined) {
    song.artist = payload.artist || null;
  }
  if (payload.cover_image_url !== undefined) {
    song.cover_image_url = payload.cover_image_url || null;
  }

  persistSongs();
  return { song };
}

export function deleteSong(songId: string): { deleted: boolean } {
  const index = songs.findIndex((item) => item.id === songId);
  if (index === -1) {
    throw new Error('Song not found');
  }
  songs.splice(index, 1);
  persistSongs();
  return { deleted: true };
}

export function importSongs(fileName: string): { imported: number; message: string } {
  if (!fileName) {
    throw new Error('File name is required');
  }

  const importedSongs: Song[] = Array.from({ length: 3 }).map((_, index) => ({
    id: globalThis.crypto?.randomUUID?.() ?? `70000000-0000-4000-8000-${String(songs.length + index + 1).padStart(12, '0')}`,
    user_id: '11111111-1111-4111-8111-111111111111',
    title: `Imported Song ${index + 1}`,
    artist: 'Imported Artist',
    cover_image_url: `https://picsum.photos/seed/imported-${songs.length + index + 1}/160/160`,
    bidding_enabled: false,
    is_active: true,
  }));

  songs.unshift(...importedSongs);
  persistSongs();
  return { imported: importedSongs.length, message: `Imported from ${fileName}` };
}

export function importSongsToPlaylist(
  playlistId: string,
  fileName: string,
): { imported: number; message: string } {
  const result = importSongs(fileName);
  const recentlyImported = songs.slice(0, result.imported);
  recentlyImported.forEach((song) => {
    attachSongToPlaylist(playlistId, song.id);
  });
  return result;
}
