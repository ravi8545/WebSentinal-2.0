import { useEffect, useMemo, useState } from 'react';

import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import OAuthSuccessPage from './pages/OAuthSuccessPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

const DEFAULT_ROUTE = '/';

function getRouteFromLocation() {
  const path = window.location.pathname;
  if (path === '/dashboard') return '/dashboard';
  if (path === '/oauth-success') return '/oauth-success';
  return DEFAULT_ROUTE;
}

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [route, setRoute] = useState(getRouteFromLocation);

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromLocation());

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Don't auto-redirect while we're on the OAuth callback page; that page
    // performs its own navigation once the token has been exchanged.
    if (route === '/oauth-success') return;

    if (isAuthenticated && route !== '/dashboard') {
      window.history.replaceState({}, '', '/dashboard');
      setRoute('/dashboard');
    }
    if (!isAuthenticated && route === '/dashboard') {
      window.history.replaceState({}, '', '/');
      setRoute('/');
    }
  }, [route, isAuthenticated]);

  const navigation = useMemo(() => {
    return {
      goTo(pathname) {
        window.history.pushState({}, '', pathname);
        setRoute(pathname);
      },
      replace(pathname) {
        window.history.replaceState({}, '', pathname);
        setRoute(pathname);
      },
    };
  }, []);

  function handleAuthSuccess() {
    navigation.replace('/dashboard');
  }

  function handleLogout() {
    logout();
    navigation.replace('/');
  }

  if (route === '/oauth-success') {
    return (
      <OAuthSuccessPage
        onSuccess={() => navigation.replace('/dashboard')}
        onFailure={() => navigation.replace('/')}
      />
    );
  }

  if (route === '/dashboard' && isAuthenticated) {
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }

  return (
    <LandingPage
      onAuthSuccess={handleAuthSuccess}
      onDashboardRequest={() => navigation.goTo('/dashboard')}
    />
  );
}
