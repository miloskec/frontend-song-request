import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicPage } from '@/pages/guest/PublicPage';
import { usePublicSessionStore } from '@/stores/publicSessionStore';
import type { PublicPlaylistResponse, PublicQueueResponse, RequestCreateResponse } from '@/types/api';

const mockFetchPublicPlaylist = vi.fn<() => Promise<PublicPlaylistResponse>>();
const mockFetchPublicQueue = vi.fn<() => Promise<PublicQueueResponse>>();
const mockSubmitPublicRequest = vi.fn<() => Promise<RequestCreateResponse>>();

vi.mock('@/services/publicService', () => ({
  fetchPublicPlaylist: () => mockFetchPublicPlaylist(),
  fetchPublicQueue: () => mockFetchPublicQueue(),
  submitPublicRequest: () => mockSubmitPublicRequest(),
}));

const playlistPayload: PublicPlaylistResponse = {
  playlist: {
    id: '33333333-3333-4333-8333-333333333333',
    user_id: '11111111-1111-4111-8111-111111111111',
    name: 'Friday Club Set',
    description: 'Primary active playlist for demo venue.',
    is_active: true,
    is_public: true,
    cover_image_url: null,
    qr_uuid: '44444444-4444-4444-8444-444444444444',
    queue_visibility_mode: 'current_and_next',
    queue_visible_count: 2,
  },
  songs: [
    {
      id: '55555555-5555-4555-8555-555555555555',
      user_id: '11111111-1111-4111-8111-111111111111',
      title: 'Midnight City',
      artist: 'M83',
      bidding_enabled: false,
      is_active: true,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      user_id: '11111111-1111-4111-8111-111111111111',
      title: 'Titanium',
      artist: 'David Guetta ft. Sia',
      bidding_enabled: true,
      is_active: true,
    },
  ],
  now_playing: null,
  queue_preview: [],
  settings: {
    show_now_playing: true,
    show_queue_to_guests: true,
    queue_visibility_mode: 'current_and_next',
    queue_visible_count: 2,
    show_only_locked_items: false,
  },
};

const queuePayload: PublicQueueResponse = {
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
  items: [],
};

const queueWithUpNextPayload: PublicQueueResponse = {
  queue: queuePayload.queue,
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
};

function buildQueueProjectionPayload(mode: PublicQueueResponse['queue']['visibility_mode'], visibleCount?: number): PublicQueueResponse {
  const items: PublicQueueResponse['items'] = [];

  if (mode === 'hidden') {
    return {
      queue: { ...queuePayload.queue, visibility_mode: mode, visible_count: visibleCount ?? 2 },
      items,
    };
  }

  if (mode === 'current_only') {
    items.push({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      request_id: '99999999-9999-4999-8999-999999999999',
      song_id: '55555555-5555-4555-8555-555555555555',
      position: 1,
      status: 'now_playing',
      is_locked: true,
    });
  }

  if (mode === 'current_and_next') {
    items.push(
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
    );
  }

  if (mode === 'top_n') {
    const count = visibleCount ?? 2;
    items.push({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      request_id: '99999999-9999-4999-8999-999999999999',
      song_id: '55555555-5555-4555-8555-555555555555',
      position: 1,
      status: 'now_playing',
      is_locked: true,
    });
    if (count >= 1) {
      items.push({
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        request_id: '88888888-8888-4888-8888-888888888888',
        song_id: '66666666-6666-4666-8666-666666666666',
        position: 2,
        status: 'queued',
        is_locked: true,
      });
    }
    if (count >= 2) {
      items.push({
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        request_id: null,
        song_id: '55555555-5555-4555-8555-555555555555',
        position: 3,
        status: 'queued',
        is_locked: false,
      });
    }
  }

  if (mode === 'full') {
    items.push(
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
      {
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        request_id: null,
        song_id: '55555555-5555-4555-8555-555555555555',
        position: 3,
        status: 'queued',
        is_locked: false,
      },
    );
  }

  return {
    queue: { ...queuePayload.queue, visibility_mode: mode, visible_count: visibleCount ?? 2 },
    items,
  };
}

describe('PublicPage', () => {
  beforeEach(() => {
    usePublicSessionStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/guest');
  });

  it('renders empty state when qr query param is missing', () => {
    window.history.replaceState({}, '', '/guest');
    render(<PublicPage />);
    expect(screen.getByText('No QR UUID found')).toBeInTheDocument();
  });

  it('renders success state for valid payload', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(queuePayload);

    render(<PublicPage />);

    await waitFor(() => {
      expect(screen.getByText('Public Playlist')).toBeInTheDocument();
    });

    expect(screen.getByText('Friday Club Set')).toBeInTheDocument();
    expect(screen.getByText('Midnight City')).toBeInTheDocument();
    expect(screen.getByText('Titanium')).toBeInTheDocument();
  });

  it('renders extended song list with more than ten items', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    const extendedSongs = Array.from({ length: 12 }).map((_, index) => ({
      id: `70000000-0000-4000-8000-0000000000${String(index).padStart(2, '0')}`,
      user_id: '11111111-1111-4111-8111-111111111111',
      title: `Song ${index + 1}`,
      artist: `Artist ${index + 1}`,
      bidding_enabled: false,
      is_active: true,
      cover_image_url: null,
    }));

    mockFetchPublicPlaylist.mockResolvedValue({
      ...playlistPayload,
      songs: extendedSongs,
    });
    mockFetchPublicQueue.mockResolvedValue(queuePayload);

    render(<PublicPage />);

    await screen.findByText('Songs');
    expect(screen.getAllByRole('button', { name: 'Request Song' }).length).toBeGreaterThan(10);
  });

  it('renders public now playing and up next sections', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue({
      ...playlistPayload,
      now_playing: {
        id: '55555555-5555-4555-8555-555555555555',
        user_id: '11111111-1111-4111-8111-111111111111',
        title: 'Midnight City',
        artist: 'M83',
        bidding_enabled: false,
        is_active: true,
      },
    });
    mockFetchPublicQueue.mockResolvedValue(queueWithUpNextPayload);

    render(<PublicPage />);

    await waitFor(() => {
      expect(screen.getByText('Now Playing')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Midnight City').length).toBeGreaterThan(0);
    expect(screen.getByText('Up Next')).toBeInTheDocument();
    expect(screen.getByText('Titanium • David Guetta ft. Sia')).toBeInTheDocument();
  });

  it('renders hidden public projection', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(buildQueueProjectionPayload('hidden'));

    render(<PublicPage />);
    await screen.findByText('Queue visibility');
    expect(screen.queryByText('Up Next')).not.toBeInTheDocument();
    expect(screen.queryByText('Now Playing')).not.toBeInTheDocument();
  });

  it('renders current_only public projection', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(buildQueueProjectionPayload('current_only'));

    render(<PublicPage />);
    await screen.findByText('Now Playing');
    expect(screen.queryByText('Up Next')).not.toBeInTheDocument();
  });

  it('renders current_and_next public projection', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(buildQueueProjectionPayload('current_and_next'));

    render(<PublicPage />);
    await screen.findByText('Up Next');
    expect(screen.getByText('Titanium • David Guetta ft. Sia')).toBeInTheDocument();
  });

  it('renders top_n public projection', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(buildQueueProjectionPayload('top_n', 1));

    render(<PublicPage />);
    await screen.findByText('Up Next');
    expect(screen.getByText('Titanium • David Guetta ft. Sia')).toBeInTheDocument();
  });

  it('renders full public projection', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(buildQueueProjectionPayload('full'));

    render(<PublicPage />);
    await screen.findByText('Up Next');
    expect(screen.getByText('Titanium • David Guetta ft. Sia')).toBeInTheDocument();
    expect(screen.getByText('Midnight City • M83')).toBeInTheDocument();
  });

  it('renders reordered queue projection for top_n mode', async () => {
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue({
      ...playlistPayload,
      now_playing: {
        id: '55555555-5555-4555-8555-555555555555',
        user_id: '11111111-1111-4111-8111-111111111111',
        title: 'Midnight City',
        artist: 'M83',
        bidding_enabled: false,
        is_active: true,
      },
    });
    mockFetchPublicQueue.mockResolvedValue({
      queue: { ...queuePayload.queue, visibility_mode: 'top_n', visible_count: 2 },
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
          id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          request_id: null,
          song_id: '55555555-5555-4555-8555-555555555555',
          position: 2,
          status: 'queued',
          is_locked: false,
        },
        {
          id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          queue_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          request_id: '88888888-8888-4888-8888-888888888888',
          song_id: '66666666-6666-4666-8666-666666666666',
          position: 3,
          status: 'queued',
          is_locked: true,
        },
      ],
    });

    render(<PublicPage />);
    await screen.findByText('Up Next');

    const upNextSection = screen.getByText('Up Next').parentElement;
    const upNextList = upNextSection?.querySelector('ol');
    expect(upNextList?.children[0]).toHaveTextContent('Midnight City');
    expect(upNextList?.children[1]).toHaveTextContent('Titanium');
  });

  it('filters songs by search input', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(queuePayload);

    render(<PublicPage />);
    await screen.findByText('Midnight City');

    await user.type(screen.getByLabelText('Search songs'), 'm83');

    expect(screen.getByText('Midnight City')).toBeInTheDocument();
    expect(screen.queryByText('Titanium')).not.toBeInTheDocument();
  });

  it('opens and closes request form modal', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(queuePayload);

    render(<PublicPage />);
    await screen.findByText('Midnight City');

    await user.click(screen.getAllByRole('button', { name: 'Request Song' })[0]);
    expect(screen.getByRole('dialog', { name: 'Song request form' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog', { name: 'Song request form' })).not.toBeInTheDocument();
  });

  it('submits request successfully and shows feedback', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(queuePayload);
    mockSubmitPublicRequest.mockResolvedValue({
      request: {
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        playlist_id: '33333333-3333-4333-8333-333333333333',
        song_id: '55555555-5555-4555-8555-555555555555',
        status: 'pending',
        request_type: 'free',
      },
      message: 'Request submitted successfully.',
    });

    render(<PublicPage />);
    await screen.findByText('Midnight City');

    await user.click(screen.getAllByRole('button', { name: 'Request Song' })[0]);
    await user.click(screen.getByRole('button', { name: 'Send Request' }));

    await waitFor(() => {
      expect(screen.getByText('Request sent')).toBeInTheDocument();
    });

    expect(screen.getByText('Request submitted successfully.')).toBeInTheDocument();
  });

  it('shows validation error when request cannot be submitted without qr in state', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/guest?qr=44444444-4444-4444-8444-444444444444');
    mockFetchPublicPlaylist.mockResolvedValue(playlistPayload);
    mockFetchPublicQueue.mockResolvedValue(queuePayload);

    render(<PublicPage />);
    await screen.findByText('Midnight City');
    await act(async () => {
      usePublicSessionStore.getState().setQrUuid(null);
    });

    await user.click(screen.getAllByRole('button', { name: 'Request Song' })[0]);
    await user.click(screen.getByRole('button', { name: 'Send Request' }));

    expect(screen.getByText('Could not submit request.')).toBeInTheDocument();
    expect(screen.getAllByText('Unable to submit right now. Reload the playlist and try again.').length).toBeGreaterThan(0);
  });
});
