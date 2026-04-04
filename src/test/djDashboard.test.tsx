import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/pages/dj/DashboardPage';

const mockFetchDjDashboardSummary = vi.fn();

vi.mock('@/services/djService', () => ({
  fetchDjDashboardSummary: () => mockFetchDjDashboardSummary(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders success overview for non-empty payload', async () => {
    mockFetchDjDashboardSummary.mockResolvedValue({
      playlists: {
        data: [{ id: '33333333-3333-4333-8333-333333333333' }],
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      requests: {
        data: [{ id: '88888888-8888-4888-8888-888888888888' }],
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      queues: {
        data: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }],
      },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Playlists: 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Incoming requests: 1')).toBeInTheDocument();
    expect(screen.getByText('Queues: 1')).toBeInTheDocument();
  });

  it('renders empty state for no data', async () => {
    mockFetchDjDashboardSummary.mockResolvedValue({
      playlists: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
      requests: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
      queues: { data: [] },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('No DJ data yet.')).toBeInTheDocument();
    });
  });
});
