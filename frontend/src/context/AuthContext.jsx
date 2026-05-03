import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  fetchCurrentUser,
  login as loginService,
  signup as signupService,
  startGoogleOAuth,
  updateProfile as updateProfileService,
} from '../services/authService.js';
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [authReady, setAuthReady] = useState(() => !getStoredToken());
  const verifyingRef = useRef(false);

  // On mount, if a token exists try to restore the session by fetching the current user.
  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setAuthReady(true);
      return;
    }
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    fetchCurrentUser()
      .then((freshUser) => {
        setUser(freshUser);
        setStoredUser(freshUser);
      })
      .catch(() => {
        clearStoredToken();
        clearStoredUser();
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        setAuthReady(true);
        verifyingRef.current = false;
      });
  }, []);

  useEffect(() => {
    if (user) setStoredUser(user);
  }, [user]);

  const applyAuth = useCallback((result) => {
    if (result?.token) {
      setStoredToken(result.token);
      setToken(result.token);
    }
    if (result?.user) {
      setStoredUser(result.user);
      setUser(result.user);
    }
    return result?.user;
  }, []);

  const value = useMemo(() => {
    return {
      user,
      token,
      authReady,
      isAuthenticated: Boolean(user && token),
      async login(credentials) {
        const result = await loginService(credentials);
        return applyAuth(result);
      },
      async signup(payload) {
        const result = await signupService(payload);
        return applyAuth(result);
      },
      async oauthLogin() {
        startGoogleOAuth();
        // No user returned synchronously — full-page redirect handles the rest.
        return null;
      },
      async loginWithToken(nextToken) {
        if (!nextToken) throw new Error('Missing token');
        setStoredToken(nextToken);
        setToken(nextToken);
        const freshUser = await fetchCurrentUser();
        setUser(freshUser);
        setStoredUser(freshUser);
        return freshUser;
      },
      logout() {
        clearStoredToken();
        clearStoredUser();
        setUser(null);
        setToken(null);
      },
      async updateProfile(patch) {
        const updated = await updateProfileService(patch);
        setUser(updated);
        setStoredUser(updated);
        return updated;
      },
    };
  }, [user, token, authReady, applyAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
