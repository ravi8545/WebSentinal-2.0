import { FaGithub, FaLinkedinIn, FaTwitter } from 'react-icons/fa';

import { FOOTER_LINKS } from '../utils/constants.js';
import useInView from '../hooks/useInView.js';

export default function Footer() {
  const year = new Date().getFullYear();
  const { ref, isVisible } = useInView();

  return (
    <footer
      ref={ref}
      className={`footer section-reveal ${isVisible ? 'is-visible' : ''}`}
      id="footer"
      aria-label="Footer"
    >
      <div className="container footer__inner">
        <div className="footer__brand">
          <a className="footer__logo" href="#top" aria-label="WebSentinal">
            <span className="footer__logoText">WebSentinal</span>
          </a>
          <p className="footer__tagline">
            Smart monitoring for websites &amp; APIs—uptime, latency, and incident
            insights.
          </p>
          <div className="footer__contact">
            <a className="footer__contactLink" href="mailto:support@websentinal.com">
              support@websentinal.com
            </a>
            <span className="footer__dot" aria-hidden="true">
              •
            </span>
            <span className="footer__contactText">Mon–Fri, 9am–6pm</span>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <p className="footer__title">Product</p>
            <ul className="footer__list">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <a className="footer__link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__title">Company</p>
            <ul className="footer__list">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <a className="footer__link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__title">Support</p>
            <ul className="footer__list">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <a className="footer__link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__title">Social</p>
            <div className="footer__social" aria-label="Social links">
              <a className="footer__socialLink" href="#" aria-label="LinkedIn">
                <FaLinkedinIn aria-hidden="true" />
              </a>
              <a className="footer__socialLink" href="#" aria-label="Twitter">
                <FaTwitter aria-hidden="true" />
              </a>
              <a className="footer__socialLink" href="#" aria-label="GitHub">
                <FaGithub aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="footer__copyright">© {year} WebSentinal</p>
        <p className="footer__note">Frontend UI only — no backend connected.</p>
      </div>
    </footer>
  );
}
