import { FiCheck } from 'react-icons/fi';
import { PRICING_PLANS } from '../utils/constants.js';
import useInView from '../hooks/useInView.js';

export default function Pricing() {
  const { ref, isVisible } = useInView();

  return (
    <section
      ref={ref}
      className={`pricing section-reveal ${isVisible ? 'is-visible' : ''}`}
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      <div className="container">
        <div className="section-head">
          <h2 className="section-head__title" id="pricing-heading">
            Simple, transparent pricing
          </h2>
          <p className="section-head__subtitle">
            Choose a plan that grows with you. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="pricing__grid">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`card pricing__card ${plan.highlight ? 'pricing__card--highlight' : ''}`}
            >
              {plan.highlight && (
                <span className="pricing__badge">Most Popular</span>
              )}

              <h3 className="pricing__name">{plan.name}</h3>
              <p className="pricing__tagline">{plan.tagline}</p>

              <div className="pricing__price">
                <span className="pricing__amount">{plan.price}</span>
                <span className="pricing__period">{plan.period}</span>
              </div>

              <ul className="pricing__features">
                {plan.features.map((feature) => (
                  <li key={feature} className="pricing__feature">
                    <FiCheck aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#auth"
                className={`btn ${plan.highlight ? 'btn--primary' : 'btn--secondary'} btn--full pricing__cta`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
