import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppShell } from '@/app/layouts/AppShell';
import { useAuthStore } from '@/stores';

describe('AppShell', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        role: 'user',
        name: 'Demo DJ',
        email: 'dj@example.com',
        status: 'active',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });
  });

  it('renders queue/requests as default dj nav and reveals dashboard menu on hamburger click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/dj/queue']}>
        <AppShell>
          <div>body</div>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByText('Queue Control')).toBeInTheDocument();
    expect(screen.getByLabelText('DJ navigation')).toBeInTheDocument();
    expect(screen.getByText('Queue')).toBeInTheDocument();
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.queryByLabelText('DJ menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByLabelText('DJ menu')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Lists')).toBeInTheDocument();
    expect(screen.getByLabelText('User menu placeholder')).toBeInTheDocument();
  });

  it('supports profile edit and logout from user menu', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/dj/queue']}>
        <AppShell>
          <div>body</div>
        </AppShell>
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText('User menu placeholder'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Updated DJ');
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'updated@example.com');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => {
      expect(useAuthStore.getState().user?.name).toBe('Updated DJ');
      expect(useAuthStore.getState().user?.email).toBe('updated@example.com');
    });
  });

  it('logs out from profile menu', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/dj/queue']}>
        <AppShell>
          <div>body</div>
        </AppShell>
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText('User menu placeholder'));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
