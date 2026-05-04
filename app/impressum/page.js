import { buildPageMetadata } from "../../lib/seo";
import { getPhoneHref, siteConfig } from "../../lib/site";

export const metadata = buildPageMetadata({
  title: "Impressum",
  description: "Impressum der Nachfrass-Profis.",
  path: "/impressum",
});

export default function ImpressumPage() {
  return (
    <main id="main-content" className="site-page">
      <section className="legal-page section">
        <div className="section-heading reveal">
          <p className="eyebrow">Rechtliches</p>
          <h1>Impressum</h1>
          <p>Angaben gemäß § 5 DDG.</p>
        </div>

        <article className="legal-card reveal">
          <section className="legal-section">
            <h2>Anbieter</h2>
            <div className="legal-contact">
              <p>{siteConfig.legalName}</p>
              <p>{siteConfig.address.street}</p>
              <p>
                {siteConfig.address.postalCode} {siteConfig.address.city}
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>Kontakt</h2>
            <div className="legal-contact">
              <p>
                E-Mail:{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>
              <p>
                Telefon: <a href={getPhoneHref()}>{siteConfig.phone}</a>
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>Registereintrag</h2>
            <div className="legal-contact">
              <p>
                Handelsregister: {siteConfig.registerCourt},{" "}
                {siteConfig.registerNumber}
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>Umsatzsteuer</h2>
            <div className="legal-contact">
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{" "}
                {siteConfig.vatId}
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>Vertretungsberechtigte Person</h2>
            <div className="legal-contact">
              <p>{siteConfig.representative}</p>
            </div>
          </section>
        </article>
      </section>
    </main>
  );
}
