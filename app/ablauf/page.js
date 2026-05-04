import Link from "next/link";

import {
  approachDetails,
  approachTimeline,
  faqs,
  processSteps,
} from "../../lib/content";
import { buildPageMetadata } from "../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Ablauf",
  description:
    "So läuft die Zusammenarbeit mit den Nachfrass-Profis ab: vom Kickoff über persönliche Rückfragen bis zur Übergabe heißer Leads oder Auftragsbestätigungen.",
  path: "/ablauf",
});

export default function AblaufPage() {
  return (
    <main id="main-content" className="site-page">
      <section className="section subpage-hero">
        <div className="section-heading reveal">
          <p className="eyebrow">Ablauf</p>
          <h1>So läuft die Zusammenarbeit praktisch und sauber geführt ab.</h1>
          <p>
            Vom Kickoff über die Nachfassung bis zur Rückübergabe: Wir arbeiten
            so, dass am Ende entweder eine Auftragsbestätigung übergeben wird
            oder ein heißer Lead mit letzten finalen Rückfragen direkt bei euch
            landet.
          </p>
        </div>

        <div className="process-grid">
          {processSteps.map((step) => (
            <article className="step-card reveal" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="approach-layout">
          <article className="approach-panel reveal">
            <div className="panel-badge">Persönliche Kommunikation</div>
            <h2>So wirken wir im Gespräch</h2>
            <ul className="detail-list">
              {approachDetails.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="timeline-panel reveal">
            {approachTimeline.map((row) => (
              <div className="timeline-row" key={row.number}>
                <span>{row.number}</span>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.text}</p>
                </div>
              </div>
            ))}
          </article>
        </div>
      </section>

      <section className="section faq-section">
        <div className="section-heading reveal">
          <p className="eyebrow">FAQ</p>
          <h2>Häufige Fragen zur Zusammenarbeit.</h2>
        </div>

        <div className="faq-list reveal">
          {faqs.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="contact-panel reveal contact-cta-panel">
          <div className="contact-copy">
            <p className="eyebrow">Kontakt</p>
            <h2>Wenn der Ablauf passt, können wir direkt konkret werden.</h2>
            <p>
              Im Erstgespräch schauen wir, wie euer aktueller Nachfassprozess
              aussieht und wie wir heiße Leads, finale Rückfragen und
              Auftragsbestätigungen sauber an euch übergeben.
            </p>
          </div>

          <div className="contact-cta-actions">
            <Link className="button button-primary" href="/kontakt">
              Erstgespräch anfragen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
