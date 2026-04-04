import { describe, expect, it } from 'vitest';
import { getApiMode } from '@/services/apiMode';

describe('getApiMode', () => {
  it('returns a valid mode', () => {
    expect(['mock', 'real']).toContain(getApiMode());
  });
});
