import { type FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Screen, StateBlock } from '@/components/ui';
import { env } from '@/utils/env';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const canSubmit = useMemo(
    () => name.trim().length > 0 && email.trim().length > 0 && password.trim().length >= 6 && confirmPassword.trim().length >= 6,
    [name, email, password, confirmPassword],
  );

  function validate(): string | null {
    if (!name.trim()) {
      return 'Name is required.';
    }
    if (!email.trim()) {
      return 'Email or username is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage(null);
      return;
    }

    if (env.useMockApi) {
      setErrorMessage(null);
      setSuccessMessage('Registration validated in mock mode. Redirecting to login...');
      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 400);
      return;
    }

    setErrorMessage('Real registration endpoint is not wired in this prototype.');
    setSuccessMessage(null);
  }

  return (
    <Screen title="Register" subtitle="Create your DJ/Admin account (mock mode validation flow).">
      <Card heading="Create account" elevated>
        <form className="dj-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">Name</label>
          <input id="register-name" className="ui-field" value={name} onChange={(event) => setName(event.target.value)} />
          <label htmlFor="register-email">Email or username</label>
          <input id="register-email" className="ui-field" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" type="password" className="ui-field" value={password} onChange={(event) => setPassword(event.target.value)} />
          <label htmlFor="register-password-confirm">Confirm password</label>
          <input
            id="register-password-confirm"
            type="password"
            className="ui-field"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {errorMessage ? <StateBlock kind="error" title="Registration failed" description={errorMessage} /> : null}
          {successMessage ? <StateBlock kind="success" title="Registration successful" description={successMessage} /> : null}
          <button type="submit" className="ui-btn ui-btn--primary ui-btn--full" disabled={!canSubmit}>
            Register
          </button>
          <p style={{ margin: 0 }}>
            <Link to="/login" className="dj-link">
              Back to login
            </Link>
          </p>
        </form>
      </Card>
    </Screen>
  );
}
