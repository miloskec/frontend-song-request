import { type FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Card, Screen, StateBlock } from '@/components/ui';
import { login } from '@/services/authService';
import { useAuthStore } from '@/stores';

export function LoginPage() {
  const [email, setEmail] = useState('dj@example.com');
  const [password, setPassword] = useState('demo-password');
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setSession = useAuthStore((state) => state.setSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('next') || '/dj/queue';

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password]);

  if (isAuthenticated) {
    return <Navigate to="/dj" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setStatus('error');
      setErrorMessage('Enter email and password to continue.');
      return;
    }

    setStatus('working');
    setErrorMessage(null);
    try {
      const response = await login({ email: email.trim(), password: password.trim() });
      setSession({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
    }
  }

  return (
    <Screen title="DJ/Admin Login" subtitle="Mock login for the prototype environment.">
      <Card heading="Sign in" elevated>
        <form onSubmit={handleSubmit} className="dj-form">
          <label htmlFor="login-email">Username or email</label>
          <input
            id="login-email"
            className="ui-field"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="dj@example.com or your username"
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="ui-field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />
          {status === 'error' && errorMessage ? <StateBlock kind="error" title="Could not login" description={errorMessage} /> : null}
          <button type="submit" className="ui-btn ui-btn--primary ui-btn--full" disabled={status === 'working' || !canSubmit}>
            {status === 'working' ? 'Logging in...' : 'Login'}
          </button>
          <p style={{ margin: 0 }}>
            <Link to="/register" className="dj-link">
              Need an account? Register
            </Link>
          </p>
        </form>
      </Card>
    </Screen>
  );
}
