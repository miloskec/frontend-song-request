import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SettingsPage } from '@/pages/dj/SettingsPage';

describe('SettingsPage', () => {
  it('renders Generate QR Code and supports copy action', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: 'Generate QR Code' }));
    expect(screen.getByText('QR code generated (mock)')).toBeInTheDocument();
    expect(screen.getByText(/QR UUID:/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });
});
