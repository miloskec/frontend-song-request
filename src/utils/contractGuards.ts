import type { PublicPlaylistResponse, PublicQueueResponse } from '@/types/api';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function ensureArray(value: unknown, label: string): void {
  if (!Array.isArray(value)) {
    throw new Error(`Contract mismatch: expected "${label}" to be an array.`);
  }
}

function ensureRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Contract mismatch: expected "${label}" to be an object.`);
  }
  return value;
}

export function assertPublicPlaylistResponse(payload: unknown): asserts payload is PublicPlaylistResponse {
  const root = ensureRecord(payload, 'public playlist payload');
  ensureRecord(root.playlist, 'playlist');
  ensureArray(root.songs, 'songs');
  ensureRecord(root.settings, 'settings');

  if (!('queue_visibility_mode' in ensureRecord(root.settings, 'settings'))) {
    throw new Error('Contract mismatch: missing "settings.queue_visibility_mode".');
  }
}

export function assertPublicQueueResponse(payload: unknown): asserts payload is PublicQueueResponse {
  const root = ensureRecord(payload, 'public queue payload');
  const queue = ensureRecord(root.queue, 'queue');
  ensureArray(root.items, 'items');

  if (typeof queue.visibility_mode !== 'string') {
    throw new Error('Contract mismatch: missing "queue.visibility_mode".');
  }
}
