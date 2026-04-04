import { playlists } from '../db/playlists';
import { playlistSongs } from '../db/playlistSongs';
import { songs } from '../db/songs';
import { savePersistedDb } from '../db/persist';
import type { Playlist, Song } from '@/types/domain';

interface PlaylistMutationPayload {
  name?: string;
  description?: string | null;
}

function persistPlaylistState() {
  savePersistedDb('song-request.db.playlists', playlists);
  savePersistedDb('song-request.db.playlist-songs', playlistSongs);
}

function nextPlaylistSongPosition(playlistId: string): number {
  return (
    Math.max(
      0,
      ...playlistSongs.filter((item) => item.playlist_id === playlistId).map((item) => item.position),
    ) + 1
  );
}

export function listPlaylists() {
  return {
    data: playlists.map((playlist) => ({
      ...playlist,
      song_count: playlistSongs.filter((item) => item.playlist_id === playlist.id).length,
    })),
    meta: { current_page: 1, per_page: 20, total: playlists.length, last_page: 1 },
  };
}

export function createPlaylist(payload: { name: string; description?: string | null }): { playlist: Playlist } {
  const nextIndex = playlists.length + 1;
  const playlist: Playlist = {
    id: globalThis.crypto?.randomUUID?.() ?? `30000000-0000-4000-8000-${String(nextIndex).padStart(12, '0')}`,
    user_id: '11111111-1111-4111-8111-111111111111',
    name: payload.name,
    description: payload.description ?? null,
    is_active: false,
    is_public: false,
    cover_image_url: null,
    qr_uuid: globalThis.crypto?.randomUUID?.() ?? `40000000-0000-4000-8000-${String(nextIndex).padStart(12, '0')}`,
    queue_visibility_mode: 'current_and_next',
    queue_visible_count: 2,
  };

  playlists.unshift(playlist);
  persistPlaylistState();
  return { playlist };
}

export function updatePlaylist(playlistId: string, payload: PlaylistMutationPayload): { playlist: Playlist } {
  const playlist = playlists.find((item) => item.id === playlistId);
  if (!playlist) {
    throw new Error('Playlist not found');
  }

  if (payload.name !== undefined) {
    playlist.name = payload.name;
  }
  if (payload.description !== undefined) {
    playlist.description = payload.description || null;
  }

  persistPlaylistState();
  return { playlist };
}

export function deletePlaylist(playlistId: string): { deleted: boolean } {
  const playlistIndex = playlists.findIndex((item) => item.id === playlistId);
  if (playlistIndex === -1) {
    throw new Error('Playlist not found');
  }

  playlists.splice(playlistIndex, 1);
  for (let index = playlistSongs.length - 1; index >= 0; index -= 1) {
    if (playlistSongs[index].playlist_id === playlistId) {
      playlistSongs.splice(index, 1);
    }
  }

  persistPlaylistState();
  return { deleted: true };
}

export function listPlaylistSongs(playlistId: string): { data: Song[] } {
  const orderedSongIds = playlistSongs
    .filter((item) => item.playlist_id === playlistId)
    .sort((a, b) => a.position - b.position)
    .map((item) => item.song_id);

  const songsById = new Map(songs.map((song) => [song.id, song]));
  const data = orderedSongIds.map((songId) => songsById.get(songId)).filter((song): song is Song => Boolean(song));

  return { data };
}

export function attachSongToPlaylist(playlistId: string, songId: string): { attached: boolean } {
  const playlist = playlists.find((item) => item.id === playlistId);
  if (!playlist) {
    throw new Error('Playlist not found');
  }

  const song = songs.find((item) => item.id === songId);
  if (!song) {
    throw new Error('Song not found');
  }

  const existing = playlistSongs.find((item) => item.playlist_id === playlistId && item.song_id === songId);
  if (existing) {
    return { attached: false };
  }

  playlistSongs.push({
    id: globalThis.crypto?.randomUUID?.() ?? `ps000000-0000-4000-8000-${String(playlistSongs.length + 1).padStart(12, '0')}`,
    playlist_id: playlistId,
    song_id: songId,
    position: nextPlaylistSongPosition(playlistId),
    is_active: true,
  });

  persistPlaylistState();
  return { attached: true };
}

export function removeSongFromPlaylist(playlistId: string, songId: string): { removed: boolean } {
  const targetIndex = playlistSongs.findIndex((item) => item.playlist_id === playlistId && item.song_id === songId);
  if (targetIndex === -1) {
    throw new Error('Playlist song not found');
  }

  playlistSongs.splice(targetIndex, 1);
  const ordered = playlistSongs
    .filter((item) => item.playlist_id === playlistId)
    .sort((a, b) => a.position - b.position);
  ordered.forEach((item, index) => {
    item.position = index + 1;
  });

  persistPlaylistState();
  return { removed: true };
}
