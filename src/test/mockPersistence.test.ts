import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('mock persistence', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('persists queue visibility updates to localStorage', async () => {
    const queueApi = await import('@mocks/api/queue');
    const publicApi = await import('@mocks/api/public');

    queueApi.updateQueueVisibility('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', {
      visibility_mode: 'hidden',
      visible_count: null,
    });

    expect(window.localStorage.getItem('song-request.db.queues')).toContain('"visibility_mode":"hidden"');

    const projectedQueue = publicApi.getPublicQueue('44444444-4444-4444-8444-444444444444');
    expect(projectedQueue.queue.visibility_mode).toBe('hidden');
  });

  it('ships expanded mock lists for meaningful scrolling', async () => {
    const songsApi = await import('@mocks/api/songs');
    const requestsApi = await import('@mocks/api/requests');
    const queueApi = await import('@mocks/api/queue');

    expect(songsApi.listSongs().data.length).toBeGreaterThan(10);
    expect(requestsApi.listRequests().data.length).toBeGreaterThan(10);
    expect(queueApi.listQueueItems('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').data.length).toBeGreaterThan(10);
  });

  it('persists created public request entries', async () => {
    const publicApi = await import('@mocks/api/public');
    const requestApi = await import('@mocks/api/requests');

    const beforeCount = requestApi.listRequests().data.length;
    publicApi.createPublicRequest('44444444-4444-4444-8444-444444444444', {
      song_id: '55555555-5555-4555-8555-555555555555',
      guest_name: 'Test Guest',
      guest_message: 'Persistence check',
    });

    const afterCount = requestApi.listRequests().data.length;
    expect(afterCount).toBe(beforeCount + 1);
    expect(window.localStorage.getItem('song-request.db.requests')).toContain('Persistence check');
  });

  it('moves played item to top when marked as now playing', async () => {
    const queueApi = await import('@mocks/api/queue');

    queueApi.setCurrentQueueItem(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    );

    const ordered = queueApi
      .listQueueItems('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
      .data.map((item) => ({ id: item.id, status: item.status, position: item.position }));

    expect(ordered[0]?.id).toBe('dddddddd-dddd-4ddd-8ddd-dddddddddddd');
    expect(ordered[0]?.status).toBe('now_playing');
  });

  it('persists playlist songs mapping for list-specific song management', async () => {
    const playlistsApi = await import('@mocks/api/playlists');
    const songsApi = await import('@mocks/api/songs');

    const playlist = playlistsApi.createPlaylist({
      name: 'Test List',
      description: 'Persistence test list',
    }).playlist;

    const song = songsApi.createSong({
      title: 'Mapped Song',
      artist: 'Mapper',
      cover_image_url: null,
    }).song;
    playlistsApi.attachSongToPlaylist(playlist.id, song.id);

    expect(window.localStorage.getItem('song-request.db.playlist-songs')).toContain(song.id);
    const listSongs = playlistsApi.listPlaylistSongs(playlist.id).data;
    expect(listSongs.some((item) => item.id === song.id)).toBe(true);
  });
});
