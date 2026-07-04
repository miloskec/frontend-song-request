import { type FormEvent, useEffect, useState } from 'react';
import { Card, Screen, StateBlock } from '@/components/ui';
import { fetchPublicPlaylist, fetchPublicQueue, submitPublicRequest } from '@/services/publicService';
import { usePublicSessionStore } from '@/stores';
import type { RequestCreatePayload, RequestCreateResponse } from '@/types/api';
import type { Song } from '@/types/domain';
import { emitDiagnostic } from '@/utils/diagnostics';
import { env } from '@/utils/env';
import '@/styles/guest-modern.css';

type Status = 'loading' | 'success' | 'empty' | 'error';

export function PublicPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [requestedSongIds, setRequestedSongIds] = useState<Record<string, true>>({});
  const [selectedListSongId, setSelectedListSongId] = useState<string | null>(null);
  const { qrUuid, publicPlaylist, publicQueue, setQrUuid, setPublicPlaylist, setPublicQueue, reset } = usePublicSessionStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qr = params.get(env.qrQueryParam);

    if (!qr) {
      reset();
      setStatus('empty');
      return;
    }

    let isMounted = true;
    setStatus('loading');
    setErrorMessage(null);
    setQrUuid(qr);

    void Promise.all([fetchPublicPlaylist(qr), fetchPublicQueue(qr)])
      .then(([playlistPayload, queuePayload]) => {
        if (!isMounted) {
          return;
        }

        if (playlistPayload.settings.queue_visibility_mode !== queuePayload.queue.visibility_mode) {
          emitDiagnostic('warn', {
            event: 'public.visibility_mode_mismatch',
            flow: 'guest-public-load',
            entityId: qr,
            expected: `settings queue_visibility_mode ${playlistPayload.settings.queue_visibility_mode}`,
            actual: `queue visibility_mode ${queuePayload.queue.visibility_mode}`,
            status: 'signal',
          });
        }

        const previewIds = playlistPayload.queue_preview.map((item) => item.id).join(',');
        const queueIds = queuePayload.items.map((item) => item.id).join(',');
        if (previewIds !== queueIds) {
          emitDiagnostic('warn', {
            event: 'public.queue_projection_mismatch',
            flow: 'guest-public-load',
            entityId: qr,
            expected: 'queue_preview and public queue items remain aligned',
            actual: `queue_preview=[${previewIds}] queue=[${queueIds}]`,
            status: 'signal',
          });
        }

        setPublicPlaylist(playlistPayload);
        setPublicQueue(queuePayload);
        setStatus('success');
      })
      .catch((error: Error) => {
        if (!isMounted) {
          return;
        }
        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [reset, setPublicPlaylist, setPublicQueue, setQrUuid]);

  useEffect(() => {
    if (!qrUuid) {
      return;
    }
    const raw = window.localStorage.getItem(`song-request.requested-songs.${qrUuid}`);
    if (!raw) {
      setRequestedSongIds({});
      return;
    }
    try {
      setRequestedSongIds(JSON.parse(raw) as Record<string, true>);
    } catch {
      setRequestedSongIds({});
    }
  }, [qrUuid]);

  const filteredSongs = publicPlaylist?.songs.filter((song) => {
    const source = `${song.title} ${song.artist ?? ''}`.toLowerCase();
    return source.includes(searchTerm.toLowerCase().trim());
  });
  const songsById = Object.fromEntries((publicPlaylist?.songs ?? []).map((song) => [song.id, song]));
  const visibilityMode = publicQueue?.queue.visibility_mode ?? publicPlaylist?.settings.queue_visibility_mode;
  const showNowPlaying = visibilityMode !== 'hidden';
  const showUpNext = visibilityMode !== 'hidden' && visibilityMode !== 'current_only';
  const upNextItems = (publicQueue?.items ?? []).filter((item) => item.status !== 'now_playing' && item.status !== 'played');

  function closeRequestModal() {
    setSelectedSong(null);
    setGuestName('');
    setGuestMessage('');
    setSubmitStatus('idle');
    setSubmitFeedback(null);
  }

  async function handleSubmitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSong || !qrUuid) {
      emitDiagnostic('warn', {
        event: 'public.request_precondition_failed',
        flow: 'guest-request-submit',
        entityId: qrUuid ?? 'missing',
        expected: 'selectedSong and qrUuid present before submit',
        actual: `selectedSong=${selectedSong ? 'present' : 'missing'} qrUuid=${qrUuid ? 'present' : 'missing'}`,
        status: 'blocked',
      });
      setSubmitStatus('error');
      setSubmitFeedback('Unable to submit right now. Reload the playlist and try again.');
      return;
    }

    const payload: RequestCreatePayload = {
      song_id: selectedSong.id,
      guest_name: guestName.trim() || undefined,
      guest_message: guestMessage.trim() || undefined,
    };

    setSubmitStatus('submitting');
    setSubmitFeedback(null);

    try {
      const response: RequestCreateResponse = await submitPublicRequest(qrUuid, payload);
      const nextRequested: Record<string, true> = { ...requestedSongIds, [selectedSong.id]: true };
      setRequestedSongIds(nextRequested);
      window.localStorage.setItem(`song-request.requested-songs.${qrUuid}`, JSON.stringify(nextRequested));
      closeRequestModal();
      setSubmitStatus('success');
      setSubmitFeedback(response.message);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitFeedback(error instanceof Error ? error.message : 'Failed to submit request.');
    }
  }

  return (
    <Screen title="Guest Song Request" subtitle="Scan the venue QR to browse songs and send your request.">
      <div className="guest-modern">
        {status === 'loading' ? <StateBlock kind="loading" title="Loading playlist..." /> : null}
        {status === 'empty' ? (
          <StateBlock
            kind="empty"
            title="No QR UUID found"
            description={`Use the "${env.qrQueryParam}" query param with a valid UUID to open this guest flow.`}
          />
        ) : null}
        {status === 'error' ? <StateBlock kind="error" title="Playlist unavailable" description={errorMessage ?? undefined} /> : null}
        {status === 'success' && publicPlaylist ? (
          <>
            {submitStatus === 'success' && submitFeedback ? <StateBlock kind="success" title="Request sent" description={submitFeedback} /> : null}
            {submitStatus === 'error' && submitFeedback ? <StateBlock kind="error" title="Request failed" description={submitFeedback} /> : null}

            <Card heading="Public Playlist" className="guest-playlist-card">
              <p style={{ margin: 0, fontWeight: 700 }}>{publicPlaylist.playlist.name}</p>
              <p style={{ margin: '0.35rem 0 0' }} className="guest-muted">
                {publicPlaylist.playlist.description ?? 'Browse and send requests.'}
              </p>
            </Card>
            {showNowPlaying ? (
              <section className="guest-live-strips" aria-label="Live playback projection">
                <div className="guest-live-strip guest-live-strip--now">
                  <h3>
                    Now Playing <span className="guest-live-pill">Live</span>
                  </h3>
                  {publicPlaylist.now_playing ? (
                    <div className="guest-now-playing">
                      <img
                        className="guest-thumb"
                        src={publicPlaylist.now_playing.cover_image_url ?? `https://picsum.photos/seed/${publicPlaylist.now_playing.id}/96/96`}
                        alt={`${publicPlaylist.now_playing.title} cover`}
                      />
                      <p style={{ margin: 0 }}>
                        {publicPlaylist.now_playing.title}
                        <span className="guest-muted"> • {publicPlaylist.now_playing.artist ?? 'Unknown artist'}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="guest-muted" style={{ margin: 0 }}>
                      No track marked as now playing.
                    </p>
                  )}
                </div>

                {showUpNext ? (
                  <div className="guest-live-strip guest-live-strip--next">
                    <h3>Up Next</h3>
                    {upNextItems.length > 0 ? (
                      <ol className="guest-up-next-list">
                        {upNextItems.map((item, index) => (
                          <li key={item.id} className="guest-up-next-item" style={{ animationDelay: `${index * 70}ms` }}>
                            <img
                              className="guest-thumb"
                              src={songsById[item.song_id]?.cover_image_url ?? `https://picsum.photos/seed/${item.song_id}/96/96`}
                              alt={`${songsById[item.song_id]?.title ?? `Queue item #${item.position}`} cover`}
                            />
                            <span>
                              {songsById[item.song_id]?.title ?? `Queue item #${item.position}`}
                              {songsById[item.song_id]?.artist ? ` • ${songsById[item.song_id].artist}` : ''}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="guest-muted" style={{ margin: 0 }}>
                        No upcoming songs visible.
                      </p>
                    )}
                  </div>
                ) : null}
              </section>
            ) : (
              <Card heading="Queue visibility">
                <StateBlock kind="empty" title="Queue is hidden by DJ settings." />
              </Card>
            )}

            <Card heading="Songs" className="guest-songs-card">
              <label htmlFor="song-search" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Search songs
              </label>
              <input
                id="song-search"
                className="guest-field"
                placeholder="Search by title or artist"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={{ marginBottom: '0.75rem' }}
              />

              {!filteredSongs || filteredSongs.length === 0 ? (
                <StateBlock
                  kind="empty"
                  title={publicPlaylist.songs.length === 0 ? 'No songs available yet.' : 'No songs match your search.'}
                  description={publicPlaylist.songs.length === 0 ? 'The DJ has not published songs in this playlist yet.' : 'Try a different title or artist keyword.'}
                />
              ) : (
                <ul className="guest-song-list guest-scroll">
                  {filteredSongs.map((song) => (
                    <li
                      key={song.id}
                      className={`guest-song-item ${selectedListSongId === song.id ? 'guest-song-item--selected' : ''}`}
                      onClick={(event) => {
                        if ((event.target as HTMLElement).closest('button')) {
                          return;
                        }
                        setSelectedListSongId(song.id);
                      }}
                    >
                      <img
                        className="guest-thumb"
                        src={song.cover_image_url ?? `https://picsum.photos/seed/${song.id}/96/96`}
                        alt={`${song.title} cover`}
                      />
                      <div className="guest-song-meta">
                        <p style={{ margin: 0, fontWeight: 700 }}>{song.title}</p>
                        <p style={{ margin: '0.25rem 0 0' }} className="guest-muted">
                          {song.artist ?? 'Unknown artist'}
                        </p>
                        {song.default_price ? <span className="ui-chip ui-chip--warning">${song.default_price}</span> : null}
                      </div>
                      <button
                        type="button"
                        className="guest-primary-btn guest-request-btn"
                        disabled={Boolean(requestedSongIds[song.id])}
                        onClick={() => {
                          setSelectedSong(song);
                          setSubmitStatus('idle');
                          setSubmitFeedback(null);
                        }}
                      >
                        {requestedSongIds[song.id] ? 'Requested' : 'Request Song'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        ) : null}

        {selectedSong ? (
          <div role="dialog" aria-modal="true" aria-label="Song request form" className="guest-overlay">
            <Card heading={`Request: ${selectedSong.title}`}>
              <form onSubmit={handleSubmitRequest} style={{ display: 'grid', gap: '0.65rem' }}>
                <label htmlFor="guest-name" style={{ fontWeight: 600 }}>
                  Guest name (optional)
                </label>
                <input id="guest-name" className="guest-field" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" />

                <label htmlFor="guest-message" style={{ fontWeight: 600 }}>
                  Message (optional)
                </label>
                <input id="guest-message" className="guest-field" value={guestMessage} onChange={(event) => setGuestMessage(event.target.value)} placeholder="Any note for the DJ?" />

                {submitStatus === 'error' && submitFeedback ? (
                  <StateBlock kind="error" title="Could not submit request." description={submitFeedback} />
                ) : null}

                <div className="guest-modal-actions">
                  <button type="button" onClick={closeRequestModal} className="guest-secondary-btn">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitStatus === 'submitting'} className="guest-primary-btn" style={{ opacity: submitStatus === 'submitting' ? 0.7 : 1 }}>
                    {submitStatus === 'submitting' ? 'Submitting...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}
