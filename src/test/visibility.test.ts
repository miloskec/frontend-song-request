import { describe, expect, it } from 'vitest';
import { projectVisibleQueueItems } from '@/utils/visibility';
import type { Queue, QueueItem } from '@/types/domain';

const baseQueue: Queue = {
  id: 'queue-1',
  playlist_id: 'playlist-1',
  user_id: 'user-1',
  name: 'Active Queue',
  is_active: true,
  visibility_mode: 'full',
  visible_count: 2,
  current_queue_item_id: 'item-1',
};

const items: QueueItem[] = [
  { id: 'item-1', queue_id: 'queue-1', song_id: 'song-1', position: 1, status: 'now_playing', is_locked: true },
  { id: 'item-2', queue_id: 'queue-1', song_id: 'song-2', position: 2, status: 'queued', is_locked: true },
  { id: 'item-3', queue_id: 'queue-1', song_id: 'song-3', position: 3, status: 'queued', is_locked: false },
];

describe('projectVisibleQueueItems', () => {
  it('returns no items when queue is hidden', () => {
    expect(projectVisibleQueueItems({ ...baseQueue, visibility_mode: 'hidden' }, items)).toHaveLength(0);
  });

  it('returns one current item for current_only', () => {
    const result = projectVisibleQueueItems({ ...baseQueue, visibility_mode: 'current_only' }, items);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('now_playing');
  });

  it('returns current plus next for current_and_next', () => {
    const result = projectVisibleQueueItems({ ...baseQueue, visibility_mode: 'current_and_next' }, items);
    expect(result.map((item) => item.id)).toEqual(['item-1', 'item-2']);
  });

  it('returns top n items for top_n', () => {
    const result = projectVisibleQueueItems({ ...baseQueue, visibility_mode: 'top_n', visible_count: 2 }, items);
    expect(result.map((item) => item.id)).toEqual(['item-1', 'item-2', 'item-3']);
  });

  it('returns all active items for full', () => {
    const result = projectVisibleQueueItems({ ...baseQueue, visibility_mode: 'full' }, items);
    expect(result).toHaveLength(3);
  });
});
