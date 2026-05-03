import { useId, useMemo, useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { useAuth } from '../context/AuthContext.jsx';
import { requestPasswordReset } from '../services/authService.js';

const TABS = [
  { id: 'login', label: 'Login' },
  { id: 'signup', label: 'Sign Up' },
];

export default function AuthCard({ onAuthSuccess }) {
  const baseId = useId();
  const { login, signup, oauthLogin } = useAuth();

  const [tab, setTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const currentEmail = useMemo(() => {
    return tab === 'login' ? loginForm.email : signupForm.email;
  }, [tab, loginForm.email, signupForm.email]);

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice('');
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        const nextUser = await login(loginForm);
        onAuthSuccess?.(nextUser);
        setNotice('Redirecting to dashboard...');
      } else {
        const nextUser = await signup(signupForm);
        onAuthSuccess?.(nextUser);
        setNotice('Account created. Redirecting to dashboard...');
      }
    } catch (err) {
      setNotice(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOAuth(provider) {
    setNotice('');
    setIsSubmitting(true);
    try {
      // Triggers a full-page redirect to the backend OAuth endpoint.
      await oauthLogin(provider);
      setNotice(`Redirecting to ${provider}...`);
    } catch (err) {
      setNotice(err?.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setNotice('');
    setIsSubmitting(true);

    try {
      await requestPasswordReset(currentEmail);
      setNotice('If an account exists for that email, a reset link will be sent.');
    } catch (err) {
      setNotice(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const loginPanelId = `${baseId}-panel-login`;
  const signupPanelId = `${baseId}-panel-signup`;

  return (
    <section className="auth-card" id="auth" aria-label="Authentication">
      <div className="auth-card__tabs" role="tablist" aria-label="Auth tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`auth-card__tab ${tab === t.id ? 'is-active' : ''}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={t.id === 'login' ? loginPanelId : signupPanelId}
            onClick={() => {
              setTab(t.id);
              setNotice('');
            }}
            disabled={isSubmitting}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="auth-card__body">
        <div className="auth-card__oauth" aria-label="Social sign-in">
          <button
            type="button"
            className="btn btn--secondary btn--full"
            onClick={() => handleOAuth('Google')}
            disabled={isSubmitting}
          >
            <FaGoogle aria-hidden="true" />
            Continue with Google
          </button>
        </div>

        <div className="auth-card__divider" role="separator" aria-label="or" />

        <form className="auth-card__form" onSubmit={handleSubmit}>
          <div
            className={`auth-card__panel ${tab === 'login' ? 'is-active' : ''}`}
            role="tabpanel"
            id={loginPanelId}
            aria-hidden={tab !== 'login'}
          >
            <label className="auth-card__field">
              <span className="auth-card__label">Email</span>
              <input
                className="auth-card__input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </label>

            <label className="auth-card__field">
              <span className="auth-card__label">Password</span>
              <input
                className="auth-card__input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </label>

            <button
              className="btn btn--primary btn--full"
              type="submit"
              disabled={isSubmitting}
            >
              Continue
            </button>

            <div className="auth-card__meta">
              <a className="auth-card__link" href="#" onClick={handleForgotPassword}>
                Forgot password?
              </a>
            </div>
          </div>

          <div
            className={`auth-card__panel ${tab === 'signup' ? 'is-active' : ''}`}
            role="tabpanel"
            id={signupPanelId}
            aria-hidden={tab !== 'signup'}
          >
            <label className="auth-card__field">
              <span className="auth-card__label">Name</span>
              <input
                className="auth-card__input"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </label>

            <label className="auth-card__field">
              <span className="auth-card__label">Email</span>
              <input
                className="auth-card__input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </label>

            <label className="auth-card__field">
              <span className="auth-card__label">Password</span>
              <input
                className="auth-card__input"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </label>

            <button
              className="btn btn--primary btn--full"
              type="submit"
              disabled={isSubmitting}
            >
              Create account
            </button>

            <p className="auth-card__hint">
              By continuing, you agree to our Terms &amp; Privacy Policy.
            </p>
          </div>
        </form>

        {notice ? <p className="auth-card__notice">{notice}</p> : null}
      </div>
    </section>
  );
}
