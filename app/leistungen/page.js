import Link from "next/link";

import { PackageGrid } from "../../components/package-grid";
import { features, packages } from "../../lib/content";
import { buildPageMetadata } from "../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Leistungen",
  description:
    "Leistungen der Nachfrass-Profis rund um persönliche Angebotsnachfassung, Einwände, Rückmeldungen und mehr Verbindlichkeit im Follow-up.",
  path: "/leistungen",
});

export default function LeistungenPage() {
  return (
    <main id="main-content" className="site-page">
      <section className="section subpage-hero">
        <div className="section-heading reveal">
          <p className="eyebrow">Leistungen</p>
          <h1>Persönliche Nachfassung mit klarem Fokus auf Conversion.</h1>
          <p>
            Wir übernehmen das konsequente Nachfassen, machen Einwände sichtbar
            und bringen mehr Verbindlichkeit in offene Angebote.
          </p>
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
          <h2>Die passende Stufe richtet sich nach Volumen und Taktung.</h2>
          <p>
            Als klare Orientierung gilt meist: Starter bis etwa 10 Angebote pro
            Monat, Standard bei ungefähr 10 bis 20 und Wachstum ab mehr als 20
            Angeboten pro Monat.
          </p>
        </div>

        <PackageGrid packages={packages} />

        <div className="pricing-note reveal">
          <p>
            Im Erstgespräch prüfen wir, welche Paketstufe operativ zu eurem
            Betrieb passt und welche Nachfassintensität sinnvoll ist.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="contact-panel reveal contact-cta-panel">
          <div className="contact-copy">
            <p className="eyebrow">Weiter</p>
            <h2>Mehr Kontext zu Branchen und Ablauf.</h2>
            <p>
              Wenn ihr wissen wollt, wo der Hebel besonders groß ist und wie die
              Zusammenarbeit praktisch läuft, findet ihr das auf den nächsten
              Seiten.
            </p>
          </div>

          <div className="contact-cta-actions">
            <Link className="button button-primary" href="/branchen">
              Branchen ansehen
            </Link>
            <Link className="button button-secondary" href="/ablauf">
              Ablauf ansehen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
