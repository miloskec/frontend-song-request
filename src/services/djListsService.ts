import type { PaginatedResponse } from '@/types/api';
import type { Playlist, Song } from '@/types/domain';
import { env } from '@/utils/env';
import { getApiMode } from './apiMode';

export interface SongCreatePayload {
  title: string;
  artist?: string;
  cover_image_url?: string | null;
}

export interface SongUpdatePayload {
  title?: string;
  artist?: string;
  cover_image_url?: string | null;
}

export interface PlaylistCreatePayload {
  name: string;
  description?: string | null;
}

export interface PlaylistUpdatePayload {
  name?: string;
  description?: string | null;
}

export interface DjPlaylistSummary extends Playlist {
  song_count: number;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchDjPlaylists(): Promise<DjPlaylistSummary[]> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/playlists');
    return module.listPlaylists().data as DjPlaylistSummary[];
  }

  const payload = await fetch(`${env.apiBaseUrl}/playlists`).then(
    (response) => parseJson<PaginatedResponse<DjPlaylistSummary>>(response),
  );
  return payload.data;
}

export async function createDjPlaylist(payload: PlaylistCreatePayload): Promise<Playlist> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/playlists');
    return module.createPlaylist(payload).playlist;
  }

  const response = await fetch(`${env.apiBaseUrl}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await parseJson<{ playlist: Playlist }>(response)).playlist;
}

export async function updateDjPlaylist(playlistId: string, payload: PlaylistUpdatePayload): Promise<Playlist> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/playlists');
    return module.updatePlaylist(playlistId, payload).playlist;
  }

  const response = await fetch(`${env.apiBaseUrl}/playlists/${playlistId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await parseJson<{ playlist: Playlist }>(response)).playlist;
}

export async function deleteDjPlaylist(playlistId: string): Promise<void> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/playlists');
    module.deletePlaylist(playlistId);
    return;
  }

  await fetch(`${env.apiBaseUrl}/playlists/${playlistId}`, { method: 'DELETE' }).then((response) => parseJson(response));
}

export async function fetchDjPlaylistSongs(playlistId: string): Promise<Song[]> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/playlists');
    return module.listPlaylistSongs(playlistId).data;
  }

  const payload = await fetch(`${env.apiBaseUrl}/playlists/${playlistId}/songs`).then(
    (response) => parseJson<PaginatedResponse<Song>>(response),
  );
  return payload.data;
}

export async function createDjSong(playlistId: string, payload: SongCreatePayload): Promise<Song> {
  if (getApiMode() === 'mock') {
    const [songsModule, playlistsModule] = await Promise.all([import('@mocks/api/songs'), import('@mocks/api/playlists')]);
    const created = songsModule.createSong(payload).song;
    playlistsModule.attachSongToPlaylist(playlistId, created.id);
    return created;
  }

  const response = await fetch(`${env.apiBaseUrl}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const created = (await parseJson<{ song: Song }>(response)).song;
  await fetch(`${env.apiBaseUrl}/playlists/${playlistId}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ song_id: created.id }),
  }).then((res) => parseJson(res));
  return created;
}

export async function updateDjSong(songId: string, payload: SongUpdatePayload): Promise<Song> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/songs');
    return module.updateSong(songId, payload).song;
  }

  const response = await fetch(`${env.apiBaseUrl}/songs/${songId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await parseJson<{ song: Song }>(response)).song;
}

export async function removeDjPlaylistSong(playlistId: string, songId: string): Promise<void> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/playlists');
    module.removeSongFromPlaylist(playlistId, songId);
    return;
  }

  await fetch(`${env.apiBaseUrl}/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' }).then((response) => parseJson(response));
}

export async function importSongs(playlistId: string, fileName: string): Promise<{ imported: number; message: string }> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/songs');
    return module.importSongsToPlaylist(playlistId, fileName);
  }

  const response = await fetch(`${env.apiBaseUrl}/imports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: fileName, playlist_id: playlistId }),
  });
  return (await parseJson<{ imported: number; message: string }>(response));
}
