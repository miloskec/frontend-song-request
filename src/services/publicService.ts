import type { PublicPlaylistResponse, PublicQueueResponse, RequestCreatePayload, RequestCreateResponse } from '@/types/api';
import { env } from '@/utils/env';
import { assertPublicPlaylistResponse, assertPublicQueueResponse } from '@/utils/contractGuards';
import { emitDiagnostic } from '@/utils/diagnostics';
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
  try {
    let payload: PublicPlaylistResponse;
    if (getApiMode() === 'mock') {
      const module = await import('@mocks/api/public');
      payload = await mockFetch(() => module.getPublicPlaylist(qrUuid));
    } else {
      const response = await fetch(`${env.apiBaseUrl}/public/playlists/${qrUuid}`);
      payload = await parseJson<PublicPlaylistResponse>(response);
    }

    assertPublicPlaylistResponse(payload);
    emitDiagnostic('info', {
      event: 'public_playlist_loaded',
      flow: 'guest-public-load',
      entityId: qrUuid,
      status: 'success',
    });
    return payload;
  } catch (error) {
    emitDiagnostic('error', {
      event: 'public_playlist_load_failed',
      flow: 'guest-public-load',
      entityId: qrUuid,
      expected: 'valid PublicPlaylistResponse payload',
      actual: error instanceof Error ? error.message : 'unknown error',
      status: 'failure',
    });
    throw error;
  }
}

export async function fetchPublicQueue(qrUuid: string): Promise<PublicQueueResponse> {
  try {
    let payload: PublicQueueResponse;
    if (getApiMode() === 'mock') {
      const module = await import('@mocks/api/public');
      payload = await mockFetch(() => module.getPublicQueue(qrUuid));
    } else {
      const response = await fetch(`${env.apiBaseUrl}/public/playlists/${qrUuid}/queue`);
      payload = await parseJson<PublicQueueResponse>(response);
    }

    assertPublicQueueResponse(payload);
    emitDiagnostic('info', {
      event: 'public_queue_loaded',
      flow: 'guest-public-load',
      entityId: qrUuid,
      status: 'success',
    });
    return payload;
  } catch (error) {
    emitDiagnostic('error', {
      event: 'public_queue_load_failed',
      flow: 'guest-public-load',
      entityId: qrUuid,
      expected: 'valid PublicQueueResponse payload',
      actual: error instanceof Error ? error.message : 'unknown error',
      status: 'failure',
    });
    throw error;
  }
}

export async function submitPublicRequest(qrUuid: string, payload: RequestCreatePayload): Promise<RequestCreateResponse> {
  try {
    if (getApiMode() === 'mock') {
      const module = await import('@mocks/api/public');
      const result = await mockFetch(() => module.createPublicRequest(qrUuid, payload));
      emitDiagnostic('info', {
        event: 'public_request_submitted',
        flow: 'guest-request-submit',
        entityId: qrUuid,
        status: result.request.status,
        metadata: {
          song_id: payload.song_id,
          request_id: result.request.id,
        },
      });
      return result;
    }

    const response = await fetch(`${env.apiBaseUrl}/public/playlists/${qrUuid}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await parseJson<RequestCreateResponse>(response);
    emitDiagnostic('info', {
      event: 'public_request_submitted',
      flow: 'guest-request-submit',
      entityId: qrUuid,
      status: result.request.status,
      metadata: {
        song_id: payload.song_id,
        request_id: result.request.id,
      },
    });
    return result;
  } catch (error) {
    emitDiagnostic('error', {
      event: 'public_request_submit_failed',
      flow: 'guest-request-submit',
      entityId: qrUuid,
      expected: 'request persisted with pending/approved status',
      actual: error instanceof Error ? error.message : 'unknown error',
      status: 'failure',
      metadata: {
        song_id: payload.song_id,
      },
    });
    throw error;
  }
}
