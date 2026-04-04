import type { PaginatedResponse } from '@/types/api';
import type { Playlist, Queue, SongRequest } from '@/types/domain';
import { env } from '@/utils/env';
import { getApiMode } from './apiMode';

interface DjDashboardSummary {
  playlists: PaginatedResponse<Playlist>;
  requests: PaginatedResponse<SongRequest>;
  queues: { data: Queue[] };
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchDjDashboardSummary(): Promise<DjDashboardSummary> {
  if (getApiMode() === 'mock') {
    const [playlistModule, requestModule, queueModule] = await Promise.all([
      import('@mocks/api/playlists'),
      import('@mocks/api/requests'),
      import('@mocks/api/queue'),
    ]);

    return {
      playlists: playlistModule.listPlaylists(),
      requests: requestModule.listRequests(),
      queues: queueModule.listQueues(),
    };
  }

  const [playlists, requests, queues] = await Promise.all([
    fetch(`${env.apiBaseUrl}/playlists`).then((response) => parseJson<PaginatedResponse<Playlist>>(response)),
    fetch(`${env.apiBaseUrl}/requests`).then((response) => parseJson<PaginatedResponse<SongRequest>>(response)),
    fetch(`${env.apiBaseUrl}/queues`).then((response) => parseJson<{ data: Queue[] }>(response)),
  ]);

  return { playlists, requests, queues };
}
