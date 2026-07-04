import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('queue invariant detection and repair (mock)', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('repairs stale current_queue_item_id when a single now_playing item exists', async () => {
    const queueApi = await import('@mocks/api/queue');
    const queueDb = await import('@mocks/db/queue');

    const queue = queueDb.queues[0];
    const nowPlayingItem = queueDb.queueItems.find((item) => item.queue_id === queue.id && item.status === 'now_playing');
    expect(nowPlayingItem).toBeDefined();

    queue.current_queue_item_id = 'missing-item-id';
    queueApi.listQueueItems(queue.id);

    expect(queue.current_queue_item_id).toBe(nowPlayingItem!.id);
  });

  it('detects invalid state with multiple now_playing items', async () => {
    const queueApi = await import('@mocks/api/queue');
    const queueDb = await import('@mocks/db/queue');

    const queue = queueDb.queues[0];
    const queueItems = queueDb.queueItems.filter((item) => item.queue_id === queue.id);
    expect(queueItems.length).toBeGreaterThan(1);

    queueItems[0].status = 'now_playing';
    queueItems[1].status = 'now_playing';

    expect(() => queueApi.listQueueItems(queue.id)).toThrow('Queue invariant violation');
  });
});
