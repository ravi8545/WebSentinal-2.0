import {
  FEATURE_CARDS,
  WHY_CHOOSE_US_CARDS,
} from '../utils/constants.js';
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiLock,
  FiShield,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';
import useInView from '../hooks/useInView.js';

const featureIcons = {
  monitoring: FiActivity,
  alerts: FiBell,
  'ai-insights': FiCpu,
  'status-page': FiBarChart2,
  logs: FiDatabase,
  'multi-site': FiGlobe,
};

const whyIcons = {
  easy: FiZap,
  reliable: FiShield,
  secure: FiLock,
  scalable: FiTrendingUp,
};

export default function Features() {
  const { ref, isVisible } = useInView();

  return (
    <section
      ref={ref}
      className={`features section-reveal ${isVisible ? 'is-visible' : ''}`}
      id="features"
      aria-labelledby="features-heading"
    >
      <div className="container">
        <div className="section-head">
          <h2 className="section-head__title" id="features-heading">
            Everything you need to stay online
          </h2>
          <p className="section-head__subtitle">
            Monitor uptime and latency, ship faster with alerts, and keep users in
            the loop.
          </p>
        </div>

        <div className="features__grid">
          {FEATURE_CARDS.map((feature) => {
            const Icon = featureIcons[feature.id] ?? FiActivity;

            return (
              <article
                key={feature.id}
                className="card features__card"
              >
                <div className="features__icon" aria-hidden="true">
                  <Icon />
                </div>
                <h3 className="features__title">{feature.title}</h3>
                <p className="features__desc">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const { ref, isVisible } = useInView();

  return (
    <section
      ref={ref}
      className={`why section-reveal ${isVisible ? 'is-visible' : ''}`}
      aria-labelledby="why-heading"
    >
      <div className="container">
        <div className="section-head">
          <h2 className="section-head__title" id="why-heading">
            Why choose WebSentinal
          </h2>
          <p className="section-head__subtitle">
            Designed for developers, trusted by teams, and built to scale.
          </p>
        </div>

        <div className="why__grid">
          {WHY_CHOOSE_US_CARDS.map((item) => {
            const Icon = whyIcons[item.id] ?? FiZap;

            return (
              <article key={item.id} className="card why__card">
                <div className="why__icon" aria-hidden="true">
                  <Icon />
                </div>
                <h3 className="why__title">{item.title}</h3>
                <p className="why__desc">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
