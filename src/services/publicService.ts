import type { PublicPlaylistResponse, PublicQueueResponse, RequestCreatePayload, RequestCreateResponse } from '@/types/api';
import { env } from '@/utils/env';
import { getApiMode } from './apiMode';

async function mockFetch<T>(resolver: () => Promise<T> | T): Promise<T> {
  return await Promise.resolve(resolver());
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchPublicPlaylist(qrUuid: string): Promise<PublicPlaylistResponse> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/public');
    return mockFetch(() => module.getPublicPlaylist(qrUuid));
  }

  const response = await fetch(`${env.apiBaseUrl}/public/playlists/${qrUuid}`);
  return await parseJson<PublicPlaylistResponse>(response);
}

export async function fetchPublicQueue(qrUuid: string): Promise<PublicQueueResponse> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/public');
    return mockFetch(() => module.getPublicQueue(qrUuid));
  }

  const response = await fetch(`${env.apiBaseUrl}/public/playlists/${qrUuid}/queue`);
  return await parseJson<PublicQueueResponse>(response);
}

export async function submitPublicRequest(qrUuid: string, payload: RequestCreatePayload): Promise<RequestCreateResponse> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/public');
    return mockFetch(() => module.createPublicRequest(qrUuid, payload));
  }

  const response = await fetch(`${env.apiBaseUrl}/public/playlists/${qrUuid}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return await parseJson<RequestCreateResponse>(response);
}
