import Link from "next/link";

import {
  graphHighlights,
  graphMetrics,
  industryReasons,
  industryTags,
  industryUseCases,
} from "../../lib/content";
import { buildPageMetadata } from "../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Branchen",
  description:
    "Branchenfokus der Nachfrass-Profis für SHK, Fensterbau, Küchenstudios, Photovoltaik, Metallbau und andere beratungsintensive Betriebe.",
  path: "/branchen",
});

export default function BranchenPage() {
  return (
    <main id="main-content" className="site-page">
      <section className="section subpage-hero">
        <div className="section-heading reveal">
          <p className="eyebrow">Branchen</p>
          <h1>Dort, wo viele Angebote geschrieben werden, wird Nachfassen zum Hebel.</h1>
          <p>
            Besonders in beratungsintensiven Gewerken entscheidet nicht nur das
            Angebot selbst, sondern auch die Qualität der Nachverfolgung.
          </p>
        </div>

        <div className="industry-layout">
          <article className="industry-card reveal">
            <h2>Typische Einsatzbereiche</h2>
            <div className="industry-tags">
              {industryTags.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>

          <article className="industry-card accent-card reveal">
            <h2>Besonders passend, wenn ihr ...</h2>
            <ul className="detail-list">
              {industryReasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading reveal">
          <p className="eyebrow">Use Cases</p>
          <h2>Typische Situationen mit hohem Conversion-Potenzial.</h2>
        </div>

        <div className="card-grid">
          {industryUseCases.map((item, index) => (
            <article className="feature-card reveal" key={item.title}>
              <span className="card-index">{`0${index + 1}`}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading reveal">
          <p className="eyebrow">Conversion-Bild</p>
          <h2>Worauf wir im Nachfassen fachlich schauen.</h2>
        </div>

        <div className="graph-metric-grid graph-metric-grid-page">
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

        <div className="activity-grid graph-highlight-grid">
          {graphHighlights.map((item) => (
            <article className="activity-card reveal" key={item.title}>
              <span className="activity-label">{item.title}</span>
              <strong>{item.text}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="contact-panel reveal contact-cta-panel">
          <div className="contact-copy">
            <p className="eyebrow">Nächster Schritt</p>
            <h2>Prüfen, ob euer Angebotsvolumen dazu passt.</h2>
            <p>
              Wenn ihr viele offene Angebote und zu wenig konsequentes Follow-up
              habt, schauen wir uns den Ablauf gern konkret an.
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
  );
}
