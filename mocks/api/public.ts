import { playlists } from '../db/playlists';
import { publicSettings } from '../db/settings';
import { queueItems, queues } from '../db/queue';
import { requests } from '../db/requests';
import { songs } from '../db/songs';
import { playlistSongs } from '../db/playlistSongs';
import { savePersistedDb } from '../db/persist';
import type { RequestCreatePayload } from '@/types/api';
import type { SongRequest } from '@/types/domain';
import { projectVisibleQueueItems } from '@/utils/visibility';

function requirePlaylistByQr(qrUuid: string) {
  const playlist = playlists.find((item) => item.qr_uuid === qrUuid);
  if (!playlist) {
    throw new Error('Playlist not found for QR UUID');
  }
  return playlist;
}

export function getPublicPlaylist(qrUuid: string) {
  const playlist = requirePlaylistByQr(qrUuid);
  const queue = queues.find((item) => item.playlist_id === playlist.id)!;
  const queueForPlaylist = queueItems.filter((item) => item.queue_id === queue.id);
  const nowPlayingItem = queueForPlaylist.find((item) => item.status === 'now_playing') ?? null;
  const nowPlaying = nowPlayingItem ? songs.find((song) => song.id === nowPlayingItem.song_id) ?? null : null;
  const playlistSongIds = playlistSongs
    .filter((item) => item.playlist_id === playlist.id)
    .sort((a, b) => a.position - b.position)
    .map((item) => item.song_id);
  const songsById = new Map(songs.map((song) => [song.id, song]));
  const visibleSongs = playlistSongIds
    .map((songId) => songsById.get(songId))
    .filter((song): song is (typeof songs)[number] => {
      if (!song) {
        return false;
      }
      return song.is_active;
    });

  return {
    playlist,
    songs: visibleSongs,
    now_playing: nowPlaying,
    queue_preview: projectVisibleQueueItems(queue, queueForPlaylist),
    settings: publicSettings,
  };
}

export function getPublicQueue(qrUuid: string) {
  const playlist = requirePlaylistByQr(qrUuid);
  const queue = queues.find((item) => item.playlist_id === playlist.id)!;
  const items = queueItems.filter((item) => item.queue_id === queue.id);

  return {
    queue,
    items: projectVisibleQueueItems(queue, items),
  };
}

export function createPublicRequest(qrUuid: string, payload: RequestCreatePayload) {
  const playlist = requirePlaylistByQr(qrUuid);

  if (!payload.song_id) {
    throw new Error('song_id is required');
  }

  const request: SongRequest = {
    id: globalThis.crypto?.randomUUID?.() ?? `eeeeeeee-eeee-4eee-8eee-${String(requests.length + 1).padStart(12, '0')}`,
    playlist_id: playlist.id,
    song_id: payload.song_id,
    status: 'pending',
    guest_name: payload.guest_name ?? null,
    guest_message: payload.guest_message ?? null,
    request_type: payload.offered_amount ? 'bid' : 'free',
    offered_amount: payload.offered_amount ?? null,
  };

  requests.push(request);
  savePersistedDb('song-request.db.requests', requests);

  return {
    request,
    message: 'Request submitted successfully.',
  };
}
