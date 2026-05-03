import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

import { NAV_LINKS } from '../utils/constants.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}
      aria-label="Site header"
    >
      <div className="container navbar__inner">
        <a className="navbar__brand" href="#top" aria-label="WebSentinal">
          <img
            className="navbar__logo"
            src="/websentinal-logo.png"
            alt="WebSentinal Logo"
          />
          <span className="navbar__name">WebSentinal</span>
        </a>

        <nav className="navbar__nav" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.label} className="navbar__link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__themeToggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
          <a className="btn btn--primary" href="#auth">
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
