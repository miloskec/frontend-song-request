import { useEffect, useState } from 'react';
import { Card, Screen, StateBlock } from '@/components/ui';
import {
  createDjPlaylist,
  createDjSong,
  deleteDjPlaylist,
  fetchDjPlaylists,
  fetchDjPlaylistSongs,
  importSongs,
  removeDjPlaylistSong,
  updateDjPlaylist,
  updateDjSong,
} from '@/services/djListsService';
import type { Song } from '@/types/domain';

type Status = 'loading' | 'success' | 'empty' | 'error';
type ListsTab = 'overview' | 'manage';

interface PlaylistRow {
  id: string;
  name: string;
  description?: string | null;
  song_count: number;
}

export function ListsPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [songsStatus, setSongsStatus] = useState<Status>('loading');
  const [tab, setTab] = useState<ListsTab>('overview');
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [editingListName, setEditingListName] = useState('');
  const [editingListDescription, setEditingListDescription] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newCoverImageUrl, setNewCoverImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingArtist, setEditingArtist] = useState('');
  const [editingCoverImageUrl, setEditingCoverImageUrl] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read selected image file.'));
      reader.readAsDataURL(file);
    });
  }

  async function loadPlaylists(preferredPlaylistId?: string | null) {
    setStatus('loading');
    try {
      const data = await fetchDjPlaylists();
      setPlaylists(data);
      const nextSelectedId =
        (preferredPlaylistId && data.find((item) => item.id === preferredPlaylistId)?.id) ??
        (selectedPlaylistId && data.find((item) => item.id === selectedPlaylistId)?.id) ??
        data[0]?.id ??
        null;
      setSelectedPlaylistId(nextSelectedId);
      if (nextSelectedId) {
        const selected = data.find((item) => item.id === nextSelectedId);
        setEditingListName(selected?.name ?? '');
        setEditingListDescription(selected?.description ?? '');
      } else {
        setEditingListName('');
        setEditingListDescription('');
      }
      setStatus(data.length === 0 ? 'empty' : 'success');
    } catch (error) {
      setStatus('error');
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load lists.' });
    }
  }

  async function loadSongsForPlaylist(playlistId: string | null) {
    if (!playlistId) {
      setSongs([]);
      setSongsStatus('empty');
      return;
    }

    setSongsStatus('loading');
    try {
      const data = await fetchDjPlaylistSongs(playlistId);
      setSongs(data);
      setSongsStatus(data.length === 0 ? 'empty' : 'success');
    } catch (error) {
      setSongsStatus('error');
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load list songs.' });
    }
  }

  useEffect(() => {
    void loadPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadSongsForPlaylist(selectedPlaylistId);
  }, [selectedPlaylistId]);

  const selectedPlaylist = playlists.find((item) => item.id === selectedPlaylistId) ?? null;

  async function handleCreateList() {
    if (!newListName.trim()) {
      setFeedback({ type: 'error', message: 'List name is required.' });
      return;
    }

    setBusyId('create-list');
    try {
      const created = await createDjPlaylist({
        name: newListName.trim(),
        description: newListDescription.trim() || null,
      });
      setFeedback({ type: 'success', message: 'List created.' });
      setNewListName('');
      setNewListDescription('');
      await loadPlaylists(created.id);
      setTab('manage');
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to create list.' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveListDetails() {
    if (!selectedPlaylistId) {
      return;
    }
    if (!editingListName.trim()) {
      setFeedback({ type: 'error', message: 'List name is required.' });
      return;
    }

    setBusyId('save-list');
    try {
      await updateDjPlaylist(selectedPlaylistId, {
        name: editingListName.trim(),
        description: editingListDescription.trim() || null,
      });
      setFeedback({ type: 'success', message: 'List details saved.' });
      await loadPlaylists(selectedPlaylistId);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to save list details.' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteList(playlistId: string) {
    setBusyId(`delete-list-${playlistId}`);
    try {
      await deleteDjPlaylist(playlistId);
      setFeedback({ type: 'success', message: 'List removed.' });
      await loadPlaylists();
      setTab('overview');
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete list.' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreateSong() {
    if (!selectedPlaylistId) {
      setFeedback({ type: 'error', message: 'Select a list first.' });
      return;
    }
    if (!newTitle.trim()) {
      setFeedback({ type: 'error', message: 'Song title is required.' });
      return;
    }

    setBusyId('create');
    try {
      await createDjSong(selectedPlaylistId, {
        title: newTitle.trim(),
        artist: newArtist.trim() || undefined,
        cover_image_url: newCoverImageUrl.trim() || null,
      });
      setFeedback({ type: 'success', message: 'Song created.' });
      setNewTitle('');
      setNewArtist('');
      setNewCoverImageUrl('');
      await Promise.all([loadSongsForPlaylist(selectedPlaylistId), loadPlaylists(selectedPlaylistId)]);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to create song.' });
    } finally {
      setBusyId(null);
    }
  }

  function startEditing(song: Song) {
    setEditingId(song.id);
    setEditingTitle(song.title);
    setEditingArtist(song.artist ?? '');
    setEditingCoverImageUrl(song.cover_image_url ?? '');
  }

  async function handleSaveEdit(songId: string) {
    if (!editingTitle.trim()) {
      setFeedback({ type: 'error', message: 'Song title is required.' });
      return;
    }

    setBusyId(songId);
    try {
      await updateDjSong(songId, {
        title: editingTitle.trim(),
        artist: editingArtist.trim() || undefined,
        cover_image_url: editingCoverImageUrl.trim() || null,
      });
      setFeedback({ type: 'success', message: 'Song updated.' });
      setEditingId(null);
      await loadSongsForPlaylist(selectedPlaylistId);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to update song.' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteSong(songId: string) {
    if (!selectedPlaylistId) {
      return;
    }
    setBusyId(songId);
    try {
      await removeDjPlaylistSong(selectedPlaylistId, songId);
      setFeedback({ type: 'success', message: 'Song removed from list.' });
      await Promise.all([loadSongsForPlaylist(selectedPlaylistId), loadPlaylists(selectedPlaylistId)]);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to remove song.' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleImportSongs() {
    if (!selectedPlaylistId) {
      setFeedback({ type: 'error', message: 'Select a list first.' });
      return;
    }
    if (!importFileName) {
      setFeedback({ type: 'error', message: 'Select a file to import.' });
      return;
    }
    setBusyId('import');
    try {
      const result = await importSongs(selectedPlaylistId, importFileName);
      setFeedback({ type: 'success', message: `${result.message} (${result.imported})` });
      setImportFileName('');
      await Promise.all([loadSongsForPlaylist(selectedPlaylistId), loadPlaylists(selectedPlaylistId)]);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Import failed.' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen className="dj-modern" title="Lists" subtitle="Create lists, edit list details, and manage songs per selected list.">
      {status === 'loading' ? <StateBlock kind="loading" title="Loading lists..." /> : null}
      {status === 'empty' ? <StateBlock kind="empty" title="No lists yet." description="Create a list to start managing songs." /> : null}
      {status === 'error' ? <StateBlock kind="error" title="Unable to load lists." description={feedback?.message} /> : null}
      {feedback?.type === 'success' ? <StateBlock kind="success" title="Done" description={feedback.message} /> : null}
      {feedback?.type === 'error' && status !== 'error' ? <StateBlock kind="error" title="Action failed" description={feedback.message} /> : null}

      {status !== 'error' ? (
        <>
          <Card heading="Lists workspace" elevated>
            <div className="dj-tab-row">
              <button
                type="button"
                className={`ui-btn ${tab === 'overview' ? 'ui-btn--primary' : 'ui-btn--ghost'}`}
                onClick={() => setTab('overview')}
              >
                Lists
              </button>
              <button
                type="button"
                className={`ui-btn ${tab === 'manage' ? 'ui-btn--primary' : 'ui-btn--ghost'}`}
                onClick={() => setTab('manage')}
                disabled={!selectedPlaylistId}
              >
                Selected List
              </button>
            </div>

            {tab === 'overview' ? (
              <div className="dj-form">
                <div className="dj-lists-table-wrap">
                  <table className="dj-lists-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Details</th>
                        <th>Songs</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playlists.map((playlist) => (
                        <tr
                          key={playlist.id}
                          className={playlist.id === selectedPlaylistId ? 'is-active' : ''}
                        >
                          <td>{playlist.name}</td>
                          <td>{playlist.description || 'No details'}</td>
                          <td>{playlist.song_count}</td>
                          <td>
                            <div className="dj-inline">
                              <button
                                type="button"
                                className="ui-btn ui-btn--ghost"
                                onClick={() => {
                                  setSelectedPlaylistId(playlist.id);
                                  setEditingListName(playlist.name);
                                  setEditingListDescription(playlist.description ?? '');
                                  setTab('manage');
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="ui-btn ui-btn--danger"
                                onClick={() => handleDeleteList(playlist.id)}
                                disabled={busyId === `delete-list-${playlist.id}`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dj-form">
                  <h3 className="card__heading">Create list</h3>
                  <label htmlFor="new-list-name">List name</label>
                  <input id="new-list-name" className="ui-field" value={newListName} onChange={(event) => setNewListName(event.target.value)} />
                  <label htmlFor="new-list-description">Details</label>
                  <input
                    id="new-list-description"
                    className="ui-field"
                    value={newListDescription}
                    onChange={(event) => setNewListDescription(event.target.value)}
                  />
                  <button type="button" className="ui-btn ui-btn--primary" onClick={handleCreateList} disabled={busyId === 'create-list'}>
                    Create List
                  </button>
                </div>
              </div>
            ) : null}

            {tab === 'manage' && selectedPlaylist ? (
              <div className="dj-form">
                <h3 className="card__heading">List details</h3>
                <label htmlFor="edit-list-name">List name</label>
                <input id="edit-list-name" className="ui-field" value={editingListName} onChange={(event) => setEditingListName(event.target.value)} />
                <label htmlFor="edit-list-description">Details</label>
                <input
                  id="edit-list-description"
                  className="ui-field"
                  value={editingListDescription}
                  onChange={(event) => setEditingListDescription(event.target.value)}
                />
                <button type="button" className="ui-btn ui-btn--primary" onClick={handleSaveListDetails} disabled={busyId === 'save-list'}>
                  Save List Details
                </button>
              </div>
            ) : null}
          </Card>

          {tab === 'manage' && selectedPlaylist ? (
            <>
              <Card heading={`Add song to ${selectedPlaylist.name}`} elevated>
                <div className="dj-form">
                  <label htmlFor="new-song-title">Title</label>
                  <input id="new-song-title" className="ui-field" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
                  <label htmlFor="new-song-artist">Artist</label>
                  <input id="new-song-artist" className="ui-field" value={newArtist} onChange={(event) => setNewArtist(event.target.value)} />
                  <label htmlFor="new-song-cover-url">Cover image URL (optional)</label>
                  <input
                    id="new-song-cover-url"
                    className="ui-field"
                    value={newCoverImageUrl}
                    onChange={(event) => setNewCoverImageUrl(event.target.value)}
                    placeholder="https://..."
                  />
                  <label htmlFor="new-song-cover-upload">Or upload image (mock)</label>
                  <input
                    id="new-song-cover-upload"
                    className="ui-field ui-file-input"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.currentTarget.files?.[0];
                      if (!file) {
                        return;
                      }
                      try {
                        const dataUrl = await readFileAsDataUrl(file);
                        setNewCoverImageUrl(dataUrl);
                      } catch (error) {
                        setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load image file.' });
                      }
                    }}
                  />
                  {newCoverImageUrl ? <img src={newCoverImageUrl} alt="New song cover preview" className="media-thumb" /> : null}
                  <button type="button" className="ui-btn ui-btn--primary" onClick={handleCreateSong} disabled={busyId === 'create'}>
                    Add Song
                  </button>
                </div>
              </Card>

              <Card heading="Import songs" elevated>
                <div className="dj-form">
                  <label htmlFor="import-file">CSV / TXT / JSON file</label>
                  <input
                    id="import-file"
                    className="ui-field ui-file-input"
                    type="file"
                    accept=".csv,.txt,.json"
                    onChange={(event) => setImportFileName(event.currentTarget.files?.[0]?.name ?? '')}
                  />
                  <button type="button" className="ui-btn ui-btn--ghost" onClick={handleImportSongs} disabled={busyId === 'import'}>
                    Import File
                  </button>
                </div>
              </Card>

              <Card heading="Songs in list" elevated>
                {songsStatus === 'loading' ? <StateBlock kind="loading" title="Loading songs for selected list..." /> : null}
                {songsStatus === 'empty' ? <StateBlock kind="empty" title="No songs in this list yet." /> : null}
                {songsStatus === 'error' ? <StateBlock kind="error" title="Unable to load list songs." /> : null}

                {songsStatus === 'success' ? (
                  <div className="dj-scroll">
                    <ul className="dj-list">
                      {songs.map((song) => (
                        <li key={song.id} className="dj-list-item">
                          <div className="dj-row">
                            <img className="media-thumb" src={song.cover_image_url ?? `https://picsum.photos/seed/${song.id}/96/96`} alt="Song cover" />
                            <div className="dj-song-meta">
                              {editingId === song.id ? (
                                <>
                                  <input
                                    aria-label="Edit title"
                                    className="ui-field"
                                    value={editingTitle}
                                    onChange={(event) => setEditingTitle(event.target.value)}
                                  />
                                  <input
                                    aria-label="Edit artist"
                                    className="ui-field"
                                    value={editingArtist}
                                    onChange={(event) => setEditingArtist(event.target.value)}
                                  />
                                  <input
                                    aria-label="Edit cover URL"
                                    className="ui-field"
                                    value={editingCoverImageUrl}
                                    onChange={(event) => setEditingCoverImageUrl(event.target.value)}
                                    placeholder="https://..."
                                  />
                                </>
                              ) : (
                                <>
                                  <p className="dj-song-meta__title">{song.title}</p>
                                  <p className="dj-song-meta__sub">{song.artist ?? 'Unknown artist'}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="dj-actions">
                            {editingId === song.id ? (
                              <button type="button" className="ui-btn ui-btn--primary" onClick={() => handleSaveEdit(song.id)} disabled={busyId === song.id}>
                                Save
                              </button>
                            ) : (
                              <button type="button" className="ui-btn ui-btn--ghost" onClick={() => startEditing(song)}>
                                Edit
                              </button>
                            )}
                            <button type="button" className="ui-btn ui-btn--danger" onClick={() => handleDeleteSong(song.id)} disabled={busyId === song.id}>
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
