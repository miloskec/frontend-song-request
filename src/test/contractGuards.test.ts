import { describe, expect, it } from 'vitest';
import { assertPublicPlaylistResponse, assertPublicQueueResponse } from '@/utils/contractGuards';

describe('contractGuards', () => {
  it('accepts valid public playlist payload shape', () => {
    const payload = {
      playlist: { id: 'p1' },
      songs: [],
      settings: {
        queue_visibility_mode: 'current_and_next',
      },
    };

    expect(() => assertPublicPlaylistResponse(payload)).not.toThrow();
  });

  it('rejects invalid public playlist payload shape', () => {
    const payload = {
      playlist: { id: 'p1' },
      songs: [],
      settings: {},
    };

    expect(() => assertPublicPlaylistResponse(payload)).toThrow('Contract mismatch');
  });

  it('accepts valid public queue payload shape', () => {
    const payload = {
      queue: { visibility_mode: 'full' },
      items: [],
    };

    expect(() => assertPublicQueueResponse(payload)).not.toThrow();
  });

  it('rejects invalid public queue payload shape', () => {
    const payload = {
      queue: {},
      items: [],
    };

    expect(() => assertPublicQueueResponse(payload)).toThrow('Contract mismatch');
  });
});
