import { users } from '../db/users';
import type { AuthLoginPayload } from '@/types/api';
import type { AuthUser } from '@/types/domain';

export function mockLogin(payload: AuthLoginPayload) {
  if (!payload.email || !payload.password) {
    throw new Error('Email and password are required.');
  }

  const input = payload.email.trim();
  const derivedName = input.includes('@') ? input.split('@')[0] : input;
  const user: AuthUser = {
    id: users[0].id,
    role: 'user',
    name: derivedName || users[0].name,
    email: input.includes('@') ? input : `${input}@mock.local`,
    status: 'active',
  };

  return {
    user,
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  };
}
