import {
  FaSlack,
  FaDiscord,
  FaGithub,
  FaTelegramPlane,
  FaEnvelope,
  FaLink,
} from 'react-icons/fa';
import { INTEGRATIONS } from '../utils/constants.js';
import useInView from '../hooks/useInView.js';

const integrationIcons = {
  slack: FaSlack,
  email: FaEnvelope,
  discord: FaDiscord,
  webhooks: FaLink,
  github: FaGithub,
  telegram: FaTelegramPlane,
};

export default function Integrations() {
  const { ref, isVisible } = useInView();

  return (
    <section
      ref={ref}
      className={`integrations section-reveal ${isVisible ? 'is-visible' : ''}`}
      id="integrations"
      aria-labelledby="integrations-heading"
    >
      <div className="container">
        <div className="section-head">
          <h2 className="section-head__title" id="integrations-heading">
            Integrations that fit your stack
          </h2>
          <p className="section-head__subtitle">
            Connect WebSentinal to the tools your team already uses every day.
          </p>
        </div>

        <div className="integrations__grid">
          {INTEGRATIONS.map((item) => {
            const Icon = integrationIcons[item.id] ?? FaLink;

            return (
              <article key={item.id} className="card integrations__card">
                <div className="integrations__icon" aria-hidden="true">
                  <Icon />
                </div>
                <h3 className="integrations__title">{item.name}</h3>
                <p className="integrations__desc">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
