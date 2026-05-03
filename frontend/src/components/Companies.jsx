import { COMPANIES } from '../utils/constants.js';
import useInView from '../hooks/useInView.js';

export default function Companies() {
  const { ref, isVisible } = useInView();
  const tickerItems = [...COMPANIES, ...COMPANIES, ...COMPANIES];

  return (
    <section
      ref={ref}
      className={`companies section-reveal ${isVisible ? 'is-visible' : ''}`}
      aria-labelledby="companies-heading"
    >
      <div className="container">
        <p className="companies__label" id="companies-heading">
          Trusted by teams at
        </p>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {tickerItems.map((company, index) => (
              <span key={`${company.id}-${index}`} className="ticker-item">
                {company.name}
              </span>
            ))}
          </div>
        </div>

        <ul className="sr-only">
          {COMPANIES.map((company) => (
            <li key={company.id}>{company.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
