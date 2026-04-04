import type { PaginatedResponse } from '@/types/api';
import type { Queue, QueueItem, SongRequest } from '@/types/domain';
import { env } from '@/utils/env';
import { getApiMode } from './apiMode';

export interface DjRequestsScreenData {
  requests: PaginatedResponse<SongRequest>;
  queues: { data: Queue[] };
}

export interface DjActionResult {
  request: SongRequest;
  queueItem?: QueueItem;
  message: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchDjRequestsScreenData(): Promise<DjRequestsScreenData> {
  if (getApiMode() === 'mock') {
    const [requestModule, queueModule] = await Promise.all([import('@mocks/api/requests'), import('@mocks/api/queue')]);
    return {
      requests: requestModule.listRequests(),
      queues: queueModule.listQueues(),
    };
  }

  const [requests, queues] = await Promise.all([
    fetch(`${env.apiBaseUrl}/requests`).then((response) => parseJson<PaginatedResponse<SongRequest>>(response)),
    fetch(`${env.apiBaseUrl}/queues`).then((response) => parseJson<{ data: Queue[] }>(response)),
  ]);

  return { requests, queues };
}

export async function rejectDjRequest(requestId: string): Promise<DjActionResult> {
  if (getApiMode() === 'mock') {
    const requestModule = await import('@mocks/api/requests');
    const request = requestModule.updateRequestStatus(requestId, 'rejected');
    return { request, message: 'Request rejected.' };
  }

  const response = await fetch(`${env.apiBaseUrl}/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'rejected' }),
  });

  const payload = await parseJson<{ request: SongRequest }>(response);
  return { request: payload.request, message: 'Request rejected.' };
}

export async function acceptDjRequestToQueue(request: SongRequest, queueId: string): Promise<DjActionResult> {
  if (getApiMode() === 'mock') {
    const [requestModule, queueModule] = await Promise.all([import('@mocks/api/requests'), import('@mocks/api/queue')]);
    const updatedRequest = requestModule.updateRequestStatus(request.id, 'approved');
    const queueItem = queueModule.addQueueItem(queueId, { request_id: request.id, song_id: request.song_id }).item;
    return { request: updatedRequest, queueItem, message: 'Request accepted and added to active queue.' };
  }

  const statusResponse = await fetch(`${env.apiBaseUrl}/requests/${request.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  });
  const statusPayload = await parseJson<{ request: SongRequest }>(statusResponse);

  const queueResponse = await fetch(`${env.apiBaseUrl}/queues/${queueId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: request.id, song_id: request.song_id }),
  });
  const queuePayload = await parseJson<{ item: QueueItem }>(queueResponse);

  return {
    request: statusPayload.request,
    queueItem: queuePayload.item,
    message: 'Request accepted and added to active queue.',
  };
}
