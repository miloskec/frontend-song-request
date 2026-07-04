import { queueItems, queues } from '../db/queue';
import { playlists } from '../db/playlists';
import { publicSettings } from '../db/settings';
import { savePersistedDb } from '../db/persist';
import type { VisibilityMode } from '@/types/domain';
import type { QueueItem, QueueItemStatus } from '@/types/domain';

interface AddQueueItemPayload {
  request_id?: string | null;
  song_id: string;
  status?: QueueItemStatus;
}

interface QueueVisibilityPayload {
  visibility_mode: VisibilityMode;
  visible_count?: number | null;
}

type ReorderDirection = 'up' | 'down';

function applyQueueInvariantRepairs(queueId: string): { repaired: boolean } {
  const queue = queues.find((item) => item.id === queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const items = queueItems.filter((item) => item.queue_id === queueId);
  const nowPlayingItems = items.filter((item) => item.status === 'now_playing');

  if (nowPlayingItems.length > 1) {
    throw new Error('Queue invariant violation: multiple now_playing items.');
  }

  const uniquePositions = new Set(items.map((item) => item.position));
  if (uniquePositions.size !== items.length) {
    throw new Error('Queue invariant violation: duplicate queue positions.');
  }

  let repaired = false;
  const nowPlayingItem = nowPlayingItems[0] ?? null;

  if (nowPlayingItem && queue.current_queue_item_id !== nowPlayingItem.id) {
    queue.current_queue_item_id = nowPlayingItem.id;
    repaired = true;
  }

  if (!nowPlayingItem && queue.current_queue_item_id !== null) {
    queue.current_queue_item_id = null;
    repaired = true;
  }

  if (
    queue.current_queue_item_id &&
    !items.some((item) => item.id === queue.current_queue_item_id)
  ) {
    queue.current_queue_item_id = nowPlayingItem?.id ?? null;
    repaired = true;
  }

  return { repaired };
}

function persistQueueState() {
  savePersistedDb('song-request.db.queues', queues);
  savePersistedDb('song-request.db.queue-items', queueItems);
  savePersistedDb('song-request.db.playlists', playlists);
  savePersistedDb('song-request.db.public-settings', publicSettings);
}

export function listQueues() {
  let hasRepair = false;
  for (const queue of queues) {
    const result = applyQueueInvariantRepairs(queue.id);
    if (result.repaired) {
      hasRepair = true;
    }
  }
  if (hasRepair) {
    persistQueueState();
  }
  return { data: queues };
}

export function listQueueItems(queueId: string) {
  const result = applyQueueInvariantRepairs(queueId);
  if (result.repaired) {
    persistQueueState();
  }
  return {
    data: queueItems.filter((item) => item.queue_id === queueId).sort((a, b) => a.position - b.position),
  };
}

export function addQueueItem(queueId: string, payload: AddQueueItemPayload): { item: QueueItem } {
  const queue = queues.find((item) => item.id === queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const nextPosition = Math.max(
    0,
    ...queueItems.filter((item) => item.queue_id === queueId).map((item) => item.position),
  ) + 1;

  const id = globalThis.crypto?.randomUUID?.() ?? `00000000-0000-4000-8000-${String(nextPosition).padStart(12, '0')}`;

  const item: QueueItem = {
    id,
    queue_id: queueId,
    request_id: payload.request_id ?? null,
    song_id: payload.song_id,
    position: nextPosition,
    status: payload.status ?? 'queued',
    is_locked: true,
  };

  queueItems.push(item);
  applyQueueInvariantRepairs(queueId);
  persistQueueState();
  return { item };
}

export function setCurrentQueueItem(queueId: string, itemId: string): { item: QueueItem } {
  const queue = queues.find((item) => item.id === queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const targetItem = queueItems.find((item) => item.queue_id === queueId && item.id === itemId);
  if (!targetItem) {
    throw new Error('Queue item not found');
  }

  for (const item of queueItems) {
    if (item.queue_id !== queueId) {
      continue;
    }
    if (item.status === 'now_playing') {
      item.status = 'queued';
    }
  }

  const ordered = queueItems
    .filter((item) => item.queue_id === queueId)
    .sort((a, b) => a.position - b.position);
  const reordered = [targetItem, ...ordered.filter((item) => item.id !== targetItem.id)];

  reordered.forEach((item, index) => {
    item.position = index + 1;
  });

  targetItem.status = 'now_playing';
  queue.current_queue_item_id = itemId;
  applyQueueInvariantRepairs(queueId);
  persistQueueState();
  return { item: targetItem };
}

export function updateQueueItemStatus(queueId: string, itemId: string, status: QueueItemStatus): { item: QueueItem } {
  const queue = queues.find((item) => item.id === queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const targetItem = queueItems.find((item) => item.queue_id === queueId && item.id === itemId);
  if (!targetItem) {
    throw new Error('Queue item not found');
  }

  targetItem.status = status;
  if (status !== 'now_playing' && queue.current_queue_item_id === itemId) {
    queue.current_queue_item_id = null;
  }

  applyQueueInvariantRepairs(queueId);
  persistQueueState();
  return { item: targetItem };
}

export function removeQueueItem(queueId: string, itemId: string): { removed: boolean } {
  const queue = queues.find((item) => item.id === queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const itemIndex = queueItems.findIndex((item) => item.queue_id === queueId && item.id === itemId);
  if (itemIndex === -1) {
    throw new Error('Queue item not found');
  }

  const [removedItem] = queueItems.splice(itemIndex, 1);
  if (queue.current_queue_item_id === removedItem.id) {
    queue.current_queue_item_id = null;
  }

  applyQueueInvariantRepairs(queueId);
  persistQueueState();
  return { removed: true };
}

export function updateQueueVisibility(queueId: string, payload: QueueVisibilityPayload) {
  const queue = queues.find((item) => item.id === queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const nextVisibleCount =
    payload.visibility_mode === 'top_n'
      ? Math.max(1, payload.visible_count ?? queue.visible_count ?? 1)
      : null;

  queue.visibility_mode = payload.visibility_mode;
  queue.visible_count = nextVisibleCount;

  const playlist = playlists.find((item) => item.id === queue.playlist_id);
  if (playlist) {
    playlist.queue_visibility_mode = payload.visibility_mode;
    playlist.queue_visible_count = nextVisibleCount;
  }

  publicSettings.queue_visibility_mode = payload.visibility_mode;
  publicSettings.queue_visible_count = nextVisibleCount;

  persistQueueState();
  return { queue };
}

export function moveQueueItem(queueId: string, itemId: string, direction: ReorderDirection): { moved: boolean } {
  const queue = queues.find((item) => item.id === queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }

  const ordered = queueItems
    .filter((item) => item.queue_id === queueId)
    .sort((a, b) => a.position - b.position);

  const index = ordered.findIndex((item) => item.id === itemId);
  if (index === -1) {
    throw new Error('Queue item not found');
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ordered.length) {
    return { moved: false };
  }

  const current = ordered[index];
  const swapWith = ordered[swapIndex];
  const currentPosition = current.position;
  current.position = swapWith.position;
  swapWith.position = currentPosition;

  applyQueueInvariantRepairs(queueId);
  persistQueueState();
  return { moved: true };
}
