import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('request status transitions (mock)', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('allows pending -> approved transition', async () => {
    const requestsApi = await import('@mocks/api/requests');
    const pendingRequest = requestsApi.listRequests().data.find((item) => item.status === 'pending');
    expect(pendingRequest).toBeDefined();

    const updated = requestsApi.updateRequestStatus(pendingRequest!.id, 'approved');
    expect(updated.status).toBe('approved');
  });

  it('rejects rejected -> approved transition', async () => {
    const requestsApi = await import('@mocks/api/requests');
    const pendingRequest = requestsApi.listRequests().data.find((item) => item.status === 'pending');
    expect(pendingRequest).toBeDefined();

    requestsApi.updateRequestStatus(pendingRequest!.id, 'rejected');
    expect(() => requestsApi.updateRequestStatus(pendingRequest!.id, 'approved')).toThrow(
      'Invalid request status transition',
    );
  });
});
