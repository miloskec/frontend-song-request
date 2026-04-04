import { env } from '@/utils/env';

export function getApiMode(): 'mock' | 'real' {
  return env.useMockApi ? 'mock' : 'real';
}
