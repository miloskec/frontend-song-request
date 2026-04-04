import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueuePage } from '@/pages/dj/QueuePage';
import { useDjDashboardStore } from '@/stores';

const mockFetchDjQueueScreenData = vi.fn();
const mockMarkQueueItemNowPlaying = vi.fn();
const mockMoveQueueItemOrder = vi.fn();
const mockRemoveQueueItemFromQueue = vi.fn();
const mockUpdateQueueVisibilitySettings = vi.fn();

vi.mock('@/services/djQueueService', () => ({
  fetchDjQueueScreenData: (...args: unknown[]) => mockFetchDjQueueScreenData(...args),
  markQueueItemNowPlaying: (...args: unknown[]) => mockMarkQueueItemNowPlaying(...args),
  moveQueueItemOrder: (...args: unknown[]) => mockMoveQueueItemOrder(...args),
  removeQueueItemFromQueue: (...args: unknown[]) => mockRemoveQueueItemFromQueue(...args),
  updateQueueVisibilitySettings: (...args: unknown[]) => mockUpdateQueueVisibilitySettings(...args),
}));

const queuePayload = {
  queue: {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    playlist_id: '33333333-3333-4333-8333-333333333333',
    user_id: '11111111-1111-4111-8111-111111111111',
    name: 'Active Queue',
    is_active: true,
    visibility_mode: 'current_and_next',
    visible_count: 2,
    current_queue_item_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  },
  items: [
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      request_id: '99999999-9999-4999-8999-999999999999',
      song_id: '55555555-5555-4555-8555-555555555555',
      position: 1,
      status: 'now_playing',
      is_locked: true,
    },
    {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      request_id: '88888888-8888-4888-8888-888888888888',
      song_id: '66666666-6666-4666-8666-666666666666',
      position: 2,
      status: 'queued',
      is_locked: true,
    },
  ],
  songsById: {
    '55555555-5555-4555-8555-555555555555': { title: 'Midnight City', artist: 'M83' },
    '66666666-6666-4666-8666-666666666666': { title: 'Titanium', artist: 'David Guetta ft. Sia' },
  },
};

describe('QueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDjDashboardStore.setState({ activePlaylistId: null, selectedQueueId: null });
  });

  it('renders queue list', async () => {
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);

    render(<QueuePage />);

    await waitFor(() => {
      expect(screen.getAllByText('Queue item').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Midnight City')).toBeInTheDocument();
    expect(screen.getByText('Titanium')).toBeInTheDocument();
    expect(screen.getByText('Visibility settings')).toBeInTheDocument();
  });

  it('changes visibility mode', async () => {
    const user = userEvent.setup();
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);
    mockUpdateQueueVisibilitySettings.mockResolvedValue({ message: 'Queue visibility settings updated.' });

    render(<QueuePage />);
    await screen.findByText('Midnight City');

    await user.selectOptions(screen.getByLabelText('Visibility mode'), 'hidden');
    await user.click(screen.getByRole('button', { name: 'Save visibility settings' }));

    await waitFor(() => {
      expect(mockUpdateQueueVisibilitySettings).toHaveBeenCalledWith('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', {
        visibility_mode: 'hidden',
        visible_count: null,
      });
    });
  });

  it('sends top_n visible count when top_n is selected', async () => {
    const user = userEvent.setup();
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);
    mockUpdateQueueVisibilitySettings.mockResolvedValue({ message: 'Queue visibility settings updated.' });

    render(<QueuePage />);
    await screen.findByText('Midnight City');

    await user.selectOptions(screen.getByLabelText('Visibility mode'), 'top_n');
    fireEvent.change(screen.getByLabelText('Visible upcoming count'), { target: { value: '3' } });
    await user.click(screen.getByRole('button', { name: 'Save visibility settings' }));

    await waitFor(() => {
      expect(mockUpdateQueueVisibilitySettings).toHaveBeenCalledWith('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', {
        visibility_mode: 'top_n',
        visible_count: 3,
      });
    });
  });

  it('renders empty queue state', async () => {
    mockFetchDjQueueScreenData.mockResolvedValue({
      queue: {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      },
      items: [],
      songsById: {},
    });

    render(<QueuePage />);

    await waitFor(() => {
      expect(screen.getByText('Queue is empty.')).toBeInTheDocument();
    });
  });

  it('shows boundary disabled states for reorder controls', async () => {
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);

    render(<QueuePage />);
    await screen.findByText('Midnight City');

    expect(screen.getAllByRole('button', { name: 'Move Up' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Move Down' })[1]).toBeDisabled();
  });

  it('handles move up action', async () => {
    const user = userEvent.setup();
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);
    mockMoveQueueItemOrder.mockResolvedValue({ message: 'Queue order updated.' });

    render(<QueuePage />);
    await screen.findByText('Midnight City');

    await user.click(screen.getAllByRole('button', { name: 'Move Up' })[1]);

    await waitFor(() => {
      expect(mockMoveQueueItemOrder).toHaveBeenCalledWith('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'up');
    });
    expect(screen.getByText('Queue order updated.')).toBeInTheDocument();
  });

  it('handles move down action', async () => {
    const user = userEvent.setup();
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);
    mockMoveQueueItemOrder.mockResolvedValue({ message: 'Queue order updated.' });

    render(<QueuePage />);
    await screen.findByText('Midnight City');

    await user.click(screen.getAllByRole('button', { name: 'Move Down' })[0]);

    await waitFor(() => {
      expect(mockMoveQueueItemOrder).toHaveBeenCalledWith('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'down');
    });
    expect(screen.getByText('Queue order updated.')).toBeInTheDocument();
  });

  it('handles mark now playing action', async () => {
    const user = userEvent.setup();
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);
    mockMarkQueueItemNowPlaying.mockResolvedValue({ message: 'Queue item marked as now playing.' });

    render(<QueuePage />);
    await screen.findByText('Midnight City');

    await user.click(screen.getAllByRole('button', { name: 'Mark Now Playing' })[1]);

    await waitFor(() => {
      expect(mockMarkQueueItemNowPlaying).toHaveBeenCalledWith('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
    });
    expect(screen.getByText('Queue item marked as now playing.')).toBeInTheDocument();
  });

  it('handles remove action', async () => {
    const user = userEvent.setup();
    mockFetchDjQueueScreenData.mockResolvedValue(queuePayload);
    mockRemoveQueueItemFromQueue.mockResolvedValue({ message: 'Queue item removed.' });

    render(<QueuePage />);
    await screen.findByText('Midnight City');

    await user.click(screen.getAllByRole('button', { name: 'Remove from Queue' })[0]);

    await waitFor(() => {
      expect(mockRemoveQueueItemFromQueue).toHaveBeenCalledWith('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    });
    expect(screen.getByText('Queue item removed.')).toBeInTheDocument();
  });

});
