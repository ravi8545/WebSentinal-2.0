import { FiCheck } from 'react-icons/fi';

import { HERO_BULLETS } from '../utils/constants.js';
import AuthCard from './AuthCard.jsx';
import useInView from '../hooks/useInView.js';

export default function Hero({ onAuthSuccess }) {
  const { ref, isVisible } = useInView();

  return (
    <section
      ref={ref}
      className={`hero section-reveal ${isVisible ? 'is-visible' : ''}`}
      aria-labelledby="hero-heading"
    >
      <div className="container hero__inner">
        <div className="hero__left">
          <p className="hero__eyebrow">Smart Website Monitoring Platform</p>
          <h1 className="hero__title" id="hero-heading">
            Monitor. Alert. Stay Secure.
          </h1>
          <p className="hero__subtitle">
            WebSentinal keeps your websites online, fast, and reliable.
          </p>

          <ul className="hero__bullets">
            {HERO_BULLETS.map((text) => (
              <li key={text} className="hero__bullet">
                <FiCheck aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="hero__slogans" aria-label="Slogans">
            <p>“Your website&apos;s guardian, 24/7.”</p>
            <p>“Downtime stops here.”</p>
          </div>
        </div>

        <div className="hero__right">
          <AuthCard onAuthSuccess={onAuthSuccess} />
        </div>
      </div>
    </section>
  );
}
