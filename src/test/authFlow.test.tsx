import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { useAuthStore } from '@/stores';

const navigateMock = vi.fn();
const loginMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/services/authService', () => ({
  login: (...args: unknown[]) => loginMock(...args),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('handles mock login flow and persists auth state', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        role: 'user',
        name: 'Demo DJ',
        email: 'dj@example.com',
        status: 'active',
      },
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.clear(screen.getByLabelText('Username or email'));
    await user.type(screen.getByLabelText('Username or email'), 'dj@example.com');
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'demo-password');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ email: 'dj@example.com', password: 'demo-password' });
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith('/dj/queue', { replace: true });
    expect(window.localStorage.getItem('song-request.auth')).toContain('"isAuthenticated":true');
  });
});
