import type { AuthLoginPayload, AuthLoginResponse } from '@/types/api';
import { env } from '@/utils/env';
import { getApiMode } from './apiMode';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function login(payload: AuthLoginPayload): Promise<AuthLoginResponse> {
  if (getApiMode() === 'mock') {
    const module = await import('@mocks/api/auth');
    return module.mockLogin(payload);
  }

  const response = await fetch(`${env.apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await parseJson<AuthLoginResponse>(response);
}
