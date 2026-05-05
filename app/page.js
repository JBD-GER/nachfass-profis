import Link from "next/link";

import { PackageGrid } from "../components/package-grid";
import { buildPageMetadata } from "../lib/seo";
import {
  features,
  graphHighlights,
  graphMetrics,
  heroProof,
  packages,
  trustChips,
} from "../lib/content";
import { createAbsoluteUrl, siteConfig } from "../lib/site";

export const metadata = {
  ...buildPageMetadata({
    title: "Mehr Conversion aus offenen Angeboten",
    description:
      "Persönliche Angebotsnachfassung für SHK, Fensterbau, Küchenstudios, Photovoltaik und Metallbau. Klare Rückmeldungen, heiße Leads und mehr Abschlüsse aus offenem Angebotsvolumen.",
    path: "/",
    keywords: [
      "mehr Conversion aus Angeboten",
      "offene Angebote nachfassen",
      "Angebotsvolumen besser nutzen",
    ],
  }),
  title: "Mehr Conversion aus offenen Angeboten | Nachfrass-Profis",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: siteConfig.name,
      legalName: siteConfig.legalName,
      url: siteConfig.siteUrl,
      logo: createAbsoluteUrl("/Nachfasdsprofis.png"),
      email: siteConfig.email,
      telephone: siteConfig.phone,
      vatID: siteConfig.vatId,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address.street,
        postalCode: siteConfig.address.postalCode,
        addressLocality: siteConfig.address.city,
        addressCountry: "DE",
      },
    },
    {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      inLanguage: "de-DE",
    },
    {
      "@type": "Service",
      serviceType: "Persönliche Angebotsnachfassung",
      provider: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      areaServed: "DE",
      description:
        "Persönliches Nachfassen von Angeboten mit Fokus auf Rückmeldungen, Einwände, Entscheidungswege und mehr Abschlüsse aus offenem Angebotsvolumen.",
    },
  ],
};

const overviewCards = [
  {
    index: "01",
    title: "Leistungen",
    text: "Welche Aufgaben wir im Nachfassen übernehmen und wie daraus klare Rückmeldungen und heiße Fälle entstehen.",
    href: "/leistungen",
    linkLabel: "Leistungen ansehen",
  },
  {
    index: "02",
    title: "Branchen",
    text: "Wo persönliche Angebotsnachfassung besonders viel Hebel bringt und warum genau dort Conversion verloren geht.",
    href: "/branchen",
    linkLabel: "Branchen ansehen",
  },
  {
    index: "03",
    title: "Ablauf",
    text: "Wie offene Fälle priorisiert werden und wann Auftragsbestätigungen oder finale Rückfragen an euch zurückgehen.",
    href: "/ablauf",
    linkLabel: "Ablauf ansehen",
  },
  {
    index: "04",
    title: "Kontakt",
    text: "Wie der Einstieg konkret startet und welches Paket zu eurem monatlichen Angebotsvolumen passt.",
    href: "/kontakt",
    linkLabel: "Erstgespräch anfragen",
  },
];

export default function HomePage() {
  return (
    <>
      <main id="main-content">
        <section className="hero section" id="start">
          <div className="hero-copy reveal">
            <p className="eyebrow">Persönliche Angebotsnachfassung</p>
            <h1>
              <span>Mehr Conversion aus</span>
              <span>offenen Angeboten.</span>
            </h1>
            <p className="lead">
              Wir fassen eure Angebote persönlich nach, schaffen klare
              Rückmeldungen zu Preisbild, Timing und Entscheidung und bringen
              mehr Bewegung in Vorgänge, die sonst einfach auslaufen.
            </p>

            <div className="hero-actions">
              <Link className="button button-primary" href="/kontakt">
                Erstgespräch anfragen
              </Link>
              <Link className="button button-secondary" href="/leistungen">
                Leistungen ansehen
              </Link>
            </div>

            <ul className="hero-proof">
              {heroProof.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="hero-visual reveal">
            <div className="visual-card dashboard-card graph-card" data-dashboard-card>
              <div className="visual-header">
                <div>
                  <p className="visual-label">Conversion-Entwicklung</p>
                  <h2>Vorher und nachher im sauberen Nachfassprozess</h2>
                </div>
                <span className="status-pill">Beratung statt Leerlauf</span>
              </div>

              <div className="graph-metric-grid">
                {graphMetrics.map((item) => (
                  <article
                    className={`graph-metric graph-metric-${item.tone}`}
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>

              <div className="graph-chart-shell">
                <div className="graph-axis-labels">
                  <span>20 %</span>
                  <span>15 %</span>
                  <span>10 %</span>
                  <span>5 %</span>
                </div>

                <div className="graph-surface">
                  <div className="graph-grid-line graph-grid-top" />
                  <div className="graph-grid-line graph-grid-middle" />
                  <div className="graph-grid-line graph-grid-bottom" />

                  <svg
                    className="graph-svg"
                    viewBox="0 0 560 260"
                    role="img"
                    aria-label="Vergleich der Conversion vor und nach aktiver Angebotsnachfassung"
                  >
                    <defs>
                      <linearGradient id="afterFill" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(95, 230, 207, 0.35)" />
                        <stop offset="100%" stopColor="rgba(95, 230, 207, 0)" />
                      </linearGradient>
                    </defs>

                    <polyline
                      className="graph-line graph-line-before"
                      fill="none"
                      points="10,215 120,203 230,188 340,174 450,165 550,158"
                    />
                    <path
                      className="graph-area-after"
                      d="M10 220 L10 205 L120 182 L230 156 L340 125 L450 98 L550 76 L550 220 Z"
                    />
                    <polyline
                      className="graph-line graph-line-after"
                      fill="none"
                      points="10,205 120,182 230,156 340,125 450,98 550,76"
                    />
                  </svg>

                  <div className="graph-legend">
                    <span className="graph-legend-item">
                      <i className="graph-dot graph-dot-before" />
                      Vorher
                    </span>
                    <span className="graph-legend-item">
                      <i className="graph-dot graph-dot-after" />
                      Mit persönlicher Nachfassung
                    </span>
                  </div>
                </div>
              </div>

              <div className="graph-x-axis">
                <span>Angebot versendet</span>
                <span>Erste Rückmeldung</span>
                <span>Entscheider aktiv</span>
                <span>Abschlussphase</span>
              </div>

              <div className="activity-grid graph-highlight-grid">
                {graphHighlights.map((item) => (
                  <article className="activity-card" key={item.title}>
                    <span className="activity-label">{item.title}</span>
                    <strong>{item.text}</strong>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip reveal" aria-label="Branchenfokus">
          <p>
            Besonders stark für Betriebe, die viele Angebote schreiben und aus
            bestehenden Chancen mehr Abschlüsse holen wollen.
          </p>
          <div className="trust-chips">
            {trustChips.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading reveal">
            <p className="eyebrow">Überblick</p>
            <h2>Die wichtigsten Antworten direkt auf einen Blick.</h2>
            <p>
              Ihr seht sofort, welche Leistungen wir übernehmen, für welche
              Betriebe das Modell besonders sinnvoll ist und wie die
              Zusammenarbeit im Alltag funktioniert.
            </p>
          </div>

          <div className="card-grid page-teaser-grid">
            {overviewCards.map((item) => (
              <article className="feature-card reveal" key={item.title}>
                <span className="card-index">{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link className="inline-link" href={item.href}>
                  {item.linkLabel}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="leistungen-vorschau">
          <div className="section-heading reveal">
            <p className="eyebrow">Leistungen im Überblick</p>
            <h2>Persönliche Nachfassung mit klarer Wirkung auf Abschlusschancen.</h2>
          </div>

          <div className="card-grid">
            {features.map((feature) => (
              <article className="feature-card reveal" key={feature.title}>
                <span className="card-index">{feature.index}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section packages-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Pakete</p>
            <h2>Pakete im Überblick</h2>
            <p>
              Persönliche Angebotsnachfassung für mehr Rückmeldung, mehr
              Struktur und mehr Abschlüsse.
            </p>
          </div>

          <PackageGrid packages={packages} />
        </section>

        <section className="section contact-cta-section">
          <div className="contact-panel reveal contact-cta-panel">
            <div className="contact-copy">
              <p className="eyebrow">Nächster Schritt</p>
              <h2>Lasst gute Angebote nicht einfach kalt werden.</h2>
              <p>
                Wenn ihr regelmäßig offene Angebote habt, schauen wir im
                Erstgespräch gemeinsam auf Volumen, Taktung und die größten
                Conversion-Hebel in eurem Follow-up.
              </p>
            </div>

            <div className="contact-cta-actions">
              <Link className="button button-primary" href="/kontakt">
                Kontakt aufnehmen
              </Link>
              <Link className="button button-secondary" href="/ablauf">
                Zusammenarbeit ansehen
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Link className="mobile-cta" href="/kontakt">
        Erstgespräch anfragen
      </Link>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
