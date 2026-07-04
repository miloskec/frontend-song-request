import type { PaginatedResponse } from '@/types/api';
import type { Queue, QueueItem, Song, VisibilityMode } from '@/types/domain';
import { emitDiagnostic } from '@/utils/diagnostics';
import { env } from '@/utils/env';
import { getApiMode } from './apiMode';

export interface DjQueueScreenData {
  queue: Queue | null;
  items: QueueItem[];
  songsById: Record<string, Song>;
}

export interface DjQueueActionResult {
  message: string;
}

export interface QueueVisibilityUpdatePayload {
  visibility_mode: VisibilityMode;
  visible_count?: number | null;
}

type ReorderDirection = 'up' | 'down';

interface QueueSignal {
  code: string;
  expected: string;
  actual: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

function buildReorderMap(items: QueueItem[], itemId: string, direction: ReorderDirection): Record<string, number> | null {
  const ordered = [...items].sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((item) => item.id === itemId);
  if (index === -1) {
    throw new Error('Queue item not found');
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ordered.length) {
    return null;
  }

  const current = ordered[index];
  const swapWith = ordered[swapIndex];

  return {
    [current.id]: swapWith.position,
    [swapWith.id]: current.position,
  };
}

function detectQueueSignals(queue: Queue, items: QueueItem[]): QueueSignal[] {
  const signals: QueueSignal[] = [];
  const queueItems = items.filter((item) => item.queue_id === queue.id);
  const nowPlayingItems = queueItems.filter((item) => item.status === 'now_playing');

  if (nowPlayingItems.length > 1) {
    signals.push({
      code: 'queue.multiple_now_playing',
      expected: 'at most one now_playing item',
      actual: `${nowPlayingItems.length} now_playing items`,
    });
  }

  if (queue.current_queue_item_id && !queueItems.some((item) => item.id === queue.current_queue_item_id)) {
    signals.push({
      code: 'queue.current_pointer_missing',
      expected: 'current_queue_item_id points to an existing queue item',
      actual: `missing item id ${queue.current_queue_item_id}`,
    });
  }

  const uniquePositions = new Set(queueItems.map((item) => item.position));
  if (uniquePositions.size !== queueItems.length) {
    signals.push({
      code: 'queue.duplicate_positions',
      expected: 'queue positions are unique',
      actual: 'duplicate queue positions detected',
    });
  }

  return signals;
}

export async function fetchDjQueueScreenData(queueId?: string | null): Promise<DjQueueScreenData> {
  if (getApiMode() === 'mock') {
    const [queueModule, songsModule] = await Promise.all([import('@mocks/api/queue'), import('@mocks/api/songs')]);
    const queues = queueModule.listQueues().data;
    const activeQueue = queues.find((item) => item.id === queueId) ?? queues[0] ?? null;
    if (!activeQueue) {
      return { queue: null, items: [], songsById: {} };
    }

    const items = queueModule.listQueueItems(activeQueue.id).data;
    const songs = songsModule.listSongs().data;
    const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));

    const signals = detectQueueSignals(activeQueue, items);
    for (const signal of signals) {
      emitDiagnostic('warn', {
        event: signal.code,
        flow: 'dj-queue-load',
        entityId: activeQueue.id,
        expected: signal.expected,
        actual: signal.actual,
        status: 'signal',
      });
    }

    return { queue: activeQueue, items, songsById };
  }

  const queues = await fetch(`${env.apiBaseUrl}/queues`).then((response) => parseJson<{ data: Queue[] }>(response));
  const activeQueue = queues.data.find((item) => item.id === queueId) ?? queues.data[0] ?? null;
  if (!activeQueue) {
    return { queue: null, items: [], songsById: {} };
  }

  const [items, songs] = await Promise.all([
    fetch(`${env.apiBaseUrl}/queues/${activeQueue.id}/items`).then((response) => parseJson<{ data: QueueItem[] }>(response)),
    fetch(`${env.apiBaseUrl}/songs`).then((response) => parseJson<PaginatedResponse<Song>>(response)),
  ]);

  const songsById = Object.fromEntries(songs.data.map((song) => [song.id, song]));
  const signals = detectQueueSignals(activeQueue, items.data);
  for (const signal of signals) {
    emitDiagnostic('warn', {
      event: signal.code,
      flow: 'dj-queue-load',
      entityId: activeQueue.id,
      expected: signal.expected,
      actual: signal.actual,
      status: 'signal',
    });
  }

  return { queue: activeQueue, items: items.data, songsById };
}

export async function markQueueItemNowPlaying(queueId: string, itemId: string): Promise<DjQueueActionResult> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/queue');
    module.setCurrentQueueItem(queueId, itemId);
    return { message: 'Queue item marked as now playing.' };
  }

  await fetch(`${env.apiBaseUrl}/queues/${queueId}/current`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId }),
  }).then((response) => parseJson(response));
  return { message: 'Queue item marked as now playing.' };
}

export async function markQueueItemPlayed(queueId: string, itemId: string): Promise<DjQueueActionResult> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/queue');
    module.updateQueueItemStatus(queueId, itemId, 'played');
    return { message: 'Queue item marked as played.' };
  }

  await fetch(`${env.apiBaseUrl}/queues/${queueId}/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'played' }),
  }).then((response) => parseJson(response));
  return { message: 'Queue item marked as played.' };
}

export async function removeQueueItemFromQueue(queueId: string, itemId: string): Promise<DjQueueActionResult> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/queue');
    module.removeQueueItem(queueId, itemId);
    return { message: 'Queue item removed.' };
  }

  await fetch(`${env.apiBaseUrl}/queues/${queueId}/items/${itemId}`, {
    method: 'DELETE',
  }).then((response) => parseJson(response));
  return { message: 'Queue item removed.' };
}

export async function updateQueueVisibilitySettings(
  queueId: string,
  payload: QueueVisibilityUpdatePayload,
): Promise<DjQueueActionResult> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/queue');
    module.updateQueueVisibility(queueId, payload);
    return { message: 'Queue visibility settings updated.' };
  }

  await fetch(`${env.apiBaseUrl}/queues/${queueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => parseJson(response));
  return { message: 'Queue visibility settings updated.' };
}

export async function moveQueueItemOrder(queueId: string, itemId: string, direction: ReorderDirection): Promise<DjQueueActionResult> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/queue');
    const result = module.moveQueueItem(queueId, itemId, direction);
    return { message: result.moved ? 'Queue order updated.' : 'Queue item cannot move further.' };
  }

  const items = await fetch(`${env.apiBaseUrl}/queues/${queueId}/items`).then((response) => parseJson<{ data: QueueItem[] }>(response));
  const itemPositions = buildReorderMap(items.data, itemId, direction);
  if (!itemPositions) {
    return { message: 'Queue item cannot move further.' };
  }

  await fetch(`${env.apiBaseUrl}/queues/${queueId}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_positions: itemPositions }),
  }).then((response) => parseJson(response));

  return { message: 'Queue order updated.' };
}
