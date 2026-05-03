import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext.jsx';

export default function OAuthSuccessPage({ onSuccess, onFailure }) {
  const { loginWithToken } = useAuth();
  const [message, setMessage] = useState('Completing sign-in...');
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      setMessage('Sign-in failed. Returning to home...');
      const t = setTimeout(() => onFailure?.(), 1200);
      return () => clearTimeout(t);
    }

    loginWithToken(token)
      .then(() => {
        setMessage('Signed in. Redirecting...');
        onSuccess?.();
      })
      .catch(() => {
        setMessage('Could not verify session. Returning to home...');
        setTimeout(() => onFailure?.(), 1200);
      });
    return undefined;
  }, [loginWithToken, onSuccess, onFailure]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #0b0f17)',
        color: 'var(--text, #e5e7eb)',
        fontFamily: 'inherit',
      }}
    >
      <p style={{ fontSize: '1rem', opacity: 0.85 }}>{message}</p>
    </div>
  );
}
