import { requests } from '../db/requests';
import { savePersistedDb } from '../db/persist';
import type { SongRequest } from '@/types/domain';

export function listRequests() {
  return {
    data: requests,
    meta: { current_page: 1, per_page: 20, total: requests.length, last_page: 1 },
  };
}

export function updateRequestStatus(requestId: string, status: SongRequest['status']): SongRequest {
  const request = requests.find((item) => item.id === requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  const allowedTransitions: Record<string, string[]> = {
    pending: ['approved', 'rejected', 'pending'],
    approved: ['approved'],
    rejected: ['rejected'],
  };

  const allowed = allowedTransitions[request.status] ?? [request.status];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid request status transition: ${request.status} -> ${status}`);
  }

  request.status = status;
  savePersistedDb('song-request.db.requests', requests);
  return request;
}
