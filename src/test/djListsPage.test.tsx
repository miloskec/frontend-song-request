import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListsPage } from '@/pages/dj/ListsPage';

const mockFetchDjPlaylists = vi.fn();
const mockFetchDjPlaylistSongs = vi.fn();
const mockCreateDjPlaylist = vi.fn();
const mockUpdateDjPlaylist = vi.fn();
const mockDeleteDjPlaylist = vi.fn();
const mockCreateDjSong = vi.fn();
const mockUpdateDjSong = vi.fn();
const mockRemoveDjPlaylistSong = vi.fn();
const mockImportSongs = vi.fn();

vi.mock('@/services/djListsService', () => ({
  fetchDjPlaylists: () => mockFetchDjPlaylists(),
  fetchDjPlaylistSongs: (...args: unknown[]) => mockFetchDjPlaylistSongs(...args),
  createDjPlaylist: (...args: unknown[]) => mockCreateDjPlaylist(...args),
  updateDjPlaylist: (...args: unknown[]) => mockUpdateDjPlaylist(...args),
  deleteDjPlaylist: (...args: unknown[]) => mockDeleteDjPlaylist(...args),
  createDjSong: (...args: unknown[]) => mockCreateDjSong(...args),
  updateDjSong: (...args: unknown[]) => mockUpdateDjSong(...args),
  removeDjPlaylistSong: (...args: unknown[]) => mockRemoveDjPlaylistSong(...args),
  importSongs: (...args: unknown[]) => mockImportSongs(...args),
}));

describe('ListsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchDjPlaylists.mockResolvedValue([
      {
        id: '33333333-3333-4333-8333-333333333333',
        user_id: '11111111-1111-4111-8111-111111111111',
        name: 'Friday Club Set',
        description: 'Primary active playlist for demo venue.',
        is_active: true,
        is_public: true,
        qr_uuid: '44444444-4444-4444-8444-444444444444',
        queue_visibility_mode: 'current_and_next',
        queue_visible_count: 2,
        song_count: 1,
      },
    ]);
    mockFetchDjPlaylistSongs.mockResolvedValue([
      {
        id: '55555555-5555-4555-8555-555555555555',
        user_id: '11111111-1111-4111-8111-111111111111',
        title: 'Midnight City',
        artist: 'M83',
        bidding_enabled: false,
        is_active: true,
      },
    ]);
  });

  it('renders lists and handles create/edit/delete list plus song actions', async () => {
    const user = userEvent.setup();
    mockCreateDjPlaylist.mockResolvedValue({ id: 'new-playlist-id' });
    mockUpdateDjPlaylist.mockResolvedValue({});
    mockDeleteDjPlaylist.mockResolvedValue({});
    mockCreateDjSong.mockResolvedValue({});
    mockUpdateDjSong.mockResolvedValue({});
    mockRemoveDjPlaylistSong.mockResolvedValue({});
    mockImportSongs.mockResolvedValue({ imported: 3, message: 'Imported from songs.csv' });

    render(<ListsPage />);
    await screen.findByText('Friday Club Set');

    await user.type(screen.getByLabelText('List name'), 'Afterparty');
    await user.type(screen.getByLabelText('Details'), 'Late-night energy');
    await user.click(screen.getByRole('button', { name: 'Create List' }));
    await waitFor(() => {
      expect(mockCreateDjPlaylist).toHaveBeenCalledWith({
        name: 'Afterparty',
        description: 'Late-night energy',
      });
    });

    await user.click(screen.getByRole('button', { name: 'Lists' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await screen.findByText('List details');
    await user.clear(screen.getByLabelText('List name'));
    await user.type(screen.getByLabelText('List name'), 'Friday Club Set Updated');
    await user.click(screen.getByRole('button', { name: 'Save List Details' }));
    await waitFor(() => {
      expect(mockUpdateDjPlaylist).toHaveBeenCalled();
    });

    await user.type(screen.getByLabelText('Title'), 'New Song');
    await user.type(screen.getByLabelText('Artist'), 'New Artist');
    await user.type(screen.getByLabelText('Cover image URL (optional)'), 'https://example.com/cover.jpg');
    await user.click(screen.getByRole('button', { name: 'Add Song' }));
    await waitFor(() => {
      expect(mockCreateDjSong).toHaveBeenCalledWith('33333333-3333-4333-8333-333333333333', {
        title: 'New Song',
        artist: 'New Artist',
        cover_image_url: 'https://example.com/cover.jpg',
      });
    });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Edit title'));
    await user.type(screen.getByLabelText('Edit title'), 'Edited Song');
    await user.type(screen.getByLabelText('Edit cover URL'), 'https://example.com/edited.jpg');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(mockUpdateDjSong).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(mockRemoveDjPlaylistSong).toHaveBeenCalledWith(
        '33333333-3333-4333-8333-333333333333',
        '55555555-5555-4555-8555-555555555555',
      );
    });

    const fileInput = screen.getByLabelText('CSV / TXT / JSON file');
    const file = new File(['col1,col2'], 'songs.csv', { type: 'text/csv' });
    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: 'Import File' }));
    await waitFor(() => {
      expect(mockImportSongs).toHaveBeenCalledWith('33333333-3333-4333-8333-333333333333', 'songs.csv');
    });

    await user.click(screen.getByRole('button', { name: 'Lists' }));
    const deleteListButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteListButtons[0]);
    await waitFor(() => {
      expect(mockDeleteDjPlaylist).toHaveBeenCalledWith('33333333-3333-4333-8333-333333333333');
    });
  });
});
