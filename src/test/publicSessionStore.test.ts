import { describe, expect, it } from 'vitest';
import { usePublicSessionStore } from '@/stores/publicSessionStore';

describe('publicSessionStore', () => {
  it('stores qr uuid and resets state', () => {
    const store = usePublicSessionStore.getState();
    store.setQrUuid('44444444-4444-4444-8444-444444444444');

    expect(usePublicSessionStore.getState().qrUuid).toBe('44444444-4444-4444-8444-444444444444');

    usePublicSessionStore.getState().reset();
    expect(usePublicSessionStore.getState().qrUuid).toBeNull();
    expect(usePublicSessionStore.getState().publicPlaylist).toBeNull();
    expect(window.localStorage.getItem('song-request.public-session')).toContain('"qrUuid":null');
  });

  it('persists qr uuid in localStorage', () => {
    usePublicSessionStore.getState().setQrUuid('44444444-4444-4444-8444-444444444444');
    expect(window.localStorage.getItem('song-request.public-session')).toContain('44444444-4444-4444-8444-444444444444');
  });
});
