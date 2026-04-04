import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestsPage } from '@/pages/dj/RequestsPage';
import { useDjDashboardStore } from '@/stores';

const mockFetchDjRequestsScreenData = vi.fn();
const mockAcceptDjRequestToQueue = vi.fn();
const mockRejectDjRequest = vi.fn();

vi.mock('@/services/djRequestsService', () => ({
  fetchDjRequestsScreenData: () => mockFetchDjRequestsScreenData(),
  acceptDjRequestToQueue: (...args: unknown[]) => mockAcceptDjRequestToQueue(...args),
  rejectDjRequest: (...args: unknown[]) => mockRejectDjRequest(...args),
}));

const requestsPayload = {
  requests: {
    data: [
      {
        id: '88888888-8888-4888-8888-888888888888',
        playlist_id: '33333333-3333-4333-8333-333333333333',
        song_id: '66666666-6666-4666-8666-666666666666',
        status: 'pending',
        guest_name: 'Ana',
        guest_message: 'For table 7!',
        request_type: 'bid',
        offered_amount: 7,
      },
    ],
    meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
  },
  queues: {
    data: [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        playlist_id: '33333333-3333-4333-8333-333333333333',
        user_id: '11111111-1111-4111-8111-111111111111',
        name: 'Active Queue',
        is_active: true,
        visibility_mode: 'current_and_next',
        visible_count: 2,
        current_queue_item_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      },
    ],
  },
};

describe('RequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDjDashboardStore.setState({ activePlaylistId: null, selectedQueueId: null });
  });

  it('renders requests list', async () => {
    mockFetchDjRequestsScreenData.mockResolvedValue(requestsPayload);

    render(<RequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('Request details')).toBeInTheDocument();
    });

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('For table 7!')).toBeInTheDocument();
  });

  it('renders empty state', async () => {
    mockFetchDjRequestsScreenData.mockResolvedValue({
      requests: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
      queues: { data: [] },
    });

    render(<RequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('No incoming requests right now.')).toBeInTheDocument();
    });
  });

  it('handles accept action and queue flow', async () => {
    const user = userEvent.setup();
    mockFetchDjRequestsScreenData.mockResolvedValue(requestsPayload);
    mockAcceptDjRequestToQueue.mockResolvedValue({
      request: { ...requestsPayload.requests.data[0], status: 'approved' },
      queueItem: {
        id: 'fffffff-ffff-4fff-8fff-ffffffffffff',
        queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        request_id: '88888888-8888-4888-8888-888888888888',
        song_id: '66666666-6666-4666-8666-666666666666',
        position: 4,
        status: 'queued',
        is_locked: true,
      },
      message: 'Request accepted and added to active queue.',
    });

    render(<RequestsPage />);
    await screen.findByText('Request details');

    await user.click(screen.getByRole('button', { name: 'Accept' }));

    await waitFor(() => {
      expect(mockAcceptDjRequestToQueue).toHaveBeenCalled();
    });

    expect(mockAcceptDjRequestToQueue.mock.calls[0][1]).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    expect(screen.getByText('Action completed')).toBeInTheDocument();
    expect(screen.getByText('Request accepted and added to active queue.')).toBeInTheDocument();
  });

  it('handles reject action', async () => {
    const user = userEvent.setup();
    mockFetchDjRequestsScreenData.mockResolvedValue(requestsPayload);
    mockRejectDjRequest.mockResolvedValue({
      request: { ...requestsPayload.requests.data[0], status: 'rejected' },
      message: 'Request rejected.',
    });

    render(<RequestsPage />);
    await screen.findByText('Request details');

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(mockRejectDjRequest).toHaveBeenCalledWith('88888888-8888-4888-8888-888888888888');
    });

    expect(screen.getByText('Request rejected.')).toBeInTheDocument();
  });

  it('shows action error feedback', async () => {
    const user = userEvent.setup();
    mockFetchDjRequestsScreenData.mockResolvedValue(requestsPayload);
    mockRejectDjRequest.mockRejectedValue(new Error('Failed to reject request.'));

    render(<RequestsPage />);
    await screen.findByText('Request details');

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(screen.getByText('Action failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to reject request.')).toBeInTheDocument();
  });
});
