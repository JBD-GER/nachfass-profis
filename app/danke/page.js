import Link from "next/link";

import { buildPageMetadata } from "../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Danke",
  description: "Danke für deine Anfrage bei Nachfrass-Profis.",
  path: "/danke",
  noIndex: true,
});

export default function DankePage() {
  return (
    <main id="main-content" className="site-page">
      <section className="section subpage-hero">
        <div className="section-heading reveal">
          <p className="eyebrow">Anfrage erhalten</p>
          <h1>Danke für deine Anfrage.</h1>
          <p>
            Deine Nachricht ist bei uns eingegangen. Wir haben dir eine
            Eingangsbestätigung per E-Mail geschickt und melden uns zeitnah bei
            dir zurück.
          </p>
        </div>

        <div className="contact-panel reveal contact-cta-panel">
          <div className="contact-copy">
            <p className="eyebrow">Wie es weitergeht</p>
            <h2>Wir ordnen Volumen, Paketstufe und nächsten Schritt ein.</h2>
            <p>
              Im nächsten Schritt schauen wir uns an, wie euer aktueller
              Nachfassprozess aussieht und wo die größten Conversion-Hebel
              liegen.
            </p>
          </div>

          <div className="contact-cta-actions">
            <Link className="button button-primary" href="/">
              Zur Startseite
            </Link>
            <Link className="button button-secondary" href="/leistungen">
              Leistungen ansehen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
