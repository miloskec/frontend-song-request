import { useEffect, useState } from 'react';
import { Card, Screen, StateBlock } from '@/components/ui';
import {
  fetchDjQueueScreenData,
  markQueueItemNowPlaying,
  moveQueueItemOrder,
  removeQueueItemFromQueue,
  updateQueueVisibilitySettings,
} from '@/services/djQueueService';
import { useDjDashboardStore } from '@/stores';
import type { QueueItem, VisibilityMode } from '@/types/domain';

type Status = 'loading' | 'success' | 'empty' | 'error';

export function QueuePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<QueueItem[]>([]);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [songsById, setSongsById] = useState<Record<string, { title: string; artist: string | null; cover_image_url?: string | null }>>({});
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('current_and_next');
  const [topNCount, setTopNCount] = useState<number>(2);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [itemActionState, setItemActionState] = useState<Record<string, 'idle' | 'working'>>({});
  const { selectedQueueId, setSelectedQueueId } = useDjDashboardStore();

  async function loadQueueData(queueId: string | null) {
    setStatus('loading');
    try {
      const payload = await fetchDjQueueScreenData(queueId);
      if (!payload.queue) {
        setStatus('empty');
        setItems([]);
        setSongsById({});
        setQueueId(null);
        return;
      }

      if (!selectedQueueId) {
        setSelectedQueueId(payload.queue.id);
      }

      setQueueId(payload.queue.id);
      setItems(payload.items);
      setSongsById(payload.songsById);
      setVisibilityMode(payload.queue.visibility_mode);
      setTopNCount(Math.max(1, payload.queue.visible_count ?? 1));
      setStatus(payload.items.length === 0 ? 'empty' : 'success');
    } catch (error) {
      setStatus('error');
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load queue.' });
    }
  }

  useEffect(() => {
    void loadQueueData(selectedQueueId);
  }, [selectedQueueId]);

  async function runItemAction(itemId: string, action: () => Promise<{ message: string }>) {
    setItemActionState((prev) => ({ ...prev, [itemId]: 'working' }));
    try {
      const result = await action();
      setFeedback({ type: 'success', message: result.message });
      await loadQueueData(selectedQueueId);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Queue action failed.' });
    } finally {
      setItemActionState((prev) => ({ ...prev, [itemId]: 'idle' }));
    }
  }

  async function saveVisibilitySettings() {
    if (!queueId) {
      setFeedback({ type: 'error', message: 'No active queue available for visibility settings.' });
      return;
    }

    try {
      const result = await updateQueueVisibilitySettings(queueId, {
        visibility_mode: visibilityMode,
        visible_count: visibilityMode === 'top_n' ? Math.max(1, topNCount) : null,
      });
      setFeedback({ type: 'success', message: result.message });
      await loadQueueData(queueId);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to update visibility settings.' });
    }
  }

  return (
    <Screen className="dj-modern" title="DJ Queue" subtitle="Manage active play order and playback status.">
      {status === 'loading' ? <StateBlock kind="loading" title="Loading active queue..." /> : null}
      {status === 'empty' ? <StateBlock kind="empty" title="Queue is empty." description="Accepted requests and manual additions will appear here." /> : null}
      {status === 'error' ? <StateBlock kind="error" title="Unable to load queue." description={feedback?.message} /> : null}
      {feedback?.type === 'success' ? <StateBlock kind="success" title="Queue updated" description={feedback.message} /> : null}
      {feedback?.type === 'error' && status !== 'error' ? <StateBlock kind="error" title="Queue action failed" description={feedback.message} /> : null}

      {status === 'success' ? (
        <Card heading="Active queue" elevated>
          <div className="dj-scroll">
            <ul className="dj-list">
              {items.map((item, index) => {
                const song = songsById[item.song_id];
                const isBusy = itemActionState[item.id] === 'working';
                const isFirst = index === 0;
                const isLast = index === items.length - 1;
                return (
                  <li key={item.id} className="dj-list-item">
                    <div className="dj-row">
                      <p className="ui-meta" style={{ margin: 0 }}>
                        Queue item
                      </p>
                      <div className="dj-queue-tools dj-row__right">
                        <button
                          type="button"
                          className="dj-icon-btn"
                          aria-label="Move Up"
                          disabled={isBusy || isFirst}
                          onClick={() => runItemAction(item.id, () => moveQueueItemOrder(item.queue_id, item.id, 'up'))}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="dj-icon-btn"
                          aria-label="Move Down"
                          disabled={isBusy || isLast}
                          onClick={() => runItemAction(item.id, () => moveQueueItemOrder(item.queue_id, item.id, 'down'))}
                        >
                          ↓
                        </button>
                        <span className="dj-queue-tools__gap" aria-hidden="true" />
                        <button
                          type="button"
                          className="dj-icon-btn dj-icon-btn--remove"
                          aria-label="Remove from Queue"
                          disabled={isBusy}
                          onClick={() => runItemAction(item.id, () => removeQueueItemFromQueue(item.queue_id, item.id))}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="dj-row dj-row--queue">
                      <button
                        type="button"
                        className={`dj-icon-btn ${
                          item.status === 'played' ? 'dj-icon-btn--played' : 'dj-icon-btn--play'
                        }`}
                        aria-label={item.status === 'played' ? 'Checked' : 'Mark Now Playing'}
                        disabled={isBusy || item.status === 'now_playing' || item.status === 'played'}
                        onClick={() =>
                          runItemAction(item.id, () => markQueueItemNowPlaying(item.queue_id, item.id))
                        }
                      >
                        {item.status === 'played' ? '✓' : '▶'}
                      </button>
                      <img className="media-thumb" src={song?.cover_image_url ?? `https://picsum.photos/seed/${item.song_id}/96/96`} alt="Song cover" />
                      <div className="dj-song-meta">
                        <p className="dj-song-meta__title">{song?.title ?? `Song ${item.song_id}`}</p>
                        <p className="dj-song-meta__sub">{song?.artist ?? 'Unknown artist'}</p>
                        <p className="dj-song-meta__sub">Position: {item.position}</p>
                      </div>
                      <span
                        className={`ui-chip dj-row__right ${
                          item.status === 'now_playing' ? 'ui-chip--success' : item.status === 'played' ? 'ui-chip--warning' : ''
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      ) : null}

      {status !== 'error' ? (
        <Card heading="Visibility settings" elevated>
          <label htmlFor="visibility-mode" style={{ display: 'block', fontWeight: 600, marginBottom: '0.45rem' }}>
            Visibility mode
          </label>
          <select
            id="visibility-mode"
            value={visibilityMode}
            onChange={(event) => setVisibilityMode(event.target.value as VisibilityMode)}
            className="ui-field"
          >
            <option value="hidden">hidden</option>
            <option value="current_only">current_only</option>
            <option value="current_and_next">current_and_next</option>
            <option value="top_n">top_n</option>
            <option value="full">full</option>
          </select>

          {visibilityMode === 'top_n' ? (
            <div style={{ marginTop: '0.65rem' }}>
              <label htmlFor="visible-count" style={{ display: 'block', fontWeight: 600, marginBottom: '0.45rem' }}>
                Visible upcoming count
              </label>
              <input
                id="visible-count"
                type="number"
                min={1}
                value={topNCount}
                onChange={(event) => setTopNCount(Math.max(1, Number(event.target.value) || 1))}
                className="ui-field"
              />
            </div>
          ) : null}

          <button type="button" onClick={saveVisibilitySettings} className="ui-btn ui-btn--primary ui-btn--full" style={{ marginTop: '0.75rem' }}>
            Save visibility settings
          </button>
        </Card>
      ) : null}
    </Screen>
  );
}
