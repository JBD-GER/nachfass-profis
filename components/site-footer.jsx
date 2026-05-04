import Link from "next/link";

import { ConsentSettingsButton } from "./consent-settings-button";
import { getPhoneHref, legalNav, primaryNav, siteConfig } from "../lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-column footer-column-brand">
          <p className="footer-kicker">Nachfrass-Profis</p>
          <p className="footer-subtitle">Die Auftragsagentur</p>
          <h2>Persönliche Angebotsnachfassung.</h2>
          <p>
            Für erklärungsbedürftige Leistungen mit Fokus auf sauberes
            Nachfassen, klare Rückmeldungen und mehr Abschlüsse aus bestehenden
            Angeboten.
          </p>
        </div>

        <div className="footer-column">
          <p className="footer-title">Navigation</p>
          <div className="footer-link-list">
            {primaryNav.map((item) => (
              <Link key={item.href} className="footer-link" href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-column">
          <p className="footer-title">Kontakt</p>
          <address className="footer-address">
            <span>{siteConfig.legalName}</span>
            <span>{siteConfig.address.street}</span>
            <span>
              {siteConfig.address.postalCode} {siteConfig.address.city}
            </span>
          </address>
          <div className="footer-link-list">
            <a className="footer-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            <a className="footer-link" href={getPhoneHref()}>
              {siteConfig.phone}
            </a>
          </div>
        </div>

        <div className="footer-column">
          <p className="footer-title">Rechtliches</p>
          <div className="footer-link-list">
            {legalNav.map((item) => (
              <Link key={item.href} className="footer-link" href={item.href}>
                {item.label}
              </Link>
            ))}
            <ConsentSettingsButton />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Nachfrass-Profis. Anbieter ist die{" "}
          {siteConfig.legalName}.
        </p>
      </div>
    </footer>
  );
}
