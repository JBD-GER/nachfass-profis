import { buildPageMetadata } from "../../lib/seo";

export const metadata = buildPageMetadata({
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen der Nachfrass-Profis.",
  path: "/agb",
});

export default function AgbPage() {
  return (
    <main id="main-content" className="site-page">
      <section className="legal-page section">
        <div className="section-heading reveal">
          <p className="eyebrow">Rechtliches</p>
          <h1>Allgemeine Geschäftsbedingungen</h1>
          <p>Grundlage für die Zusammenarbeit im B2B-Kontext.</p>
        </div>

        <article className="legal-card reveal">
          <section className="legal-section">
            <h2>1. Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für die
              Zusammenarbeit mit Unternehmern im Sinne von § 14 BGB, soweit
              nicht schriftlich etwas anderes vereinbart wurde.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Leistungsgegenstand</h2>
            <p>
              Gegenstand der Leistung ist die persönliche Angebotsnachfassung
              sowie die damit verbundene Kommunikation, Strukturierung offener
              Vorgänge und Rückmeldung an den Auftraggeber. Der konkrete
              Leistungsumfang ergibt sich aus Angebot, Abstimmung und
              Auftragsbestätigung.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Vertragsschluss</h2>
            <p>
              Ein Vertrag kommt durch schriftliche Annahme eines Angebots, durch
              Auftragsbestätigung oder durch den vereinbarten Projektstart
              zustande. Individuelle Vereinbarungen gehen diesen AGB vor.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Mitwirkungspflichten des Auftraggebers</h2>
            <p>
              Der Auftraggeber stellt alle Informationen, Ansprechpartner,
              Freigaben und Unterlagen zur Verfügung, die für eine saubere
              Angebotsnachfassung notwendig sind. Verzögerungen aufgrund
              fehlender Mitwirkung können sich auf Zeitplan und Leistung
              auswirken.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Vergütung</h2>
            <p>
              Vergütung, Abrechnungsmodell und sonstige wirtschaftliche
              Konditionen werden individuell vereinbart. Maßgeblich sind
              ausschließlich die konkret abgestimmten Angebots- und
              Vertragsunterlagen.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Laufzeit und Kündigung</h2>
            <p>
              Laufzeiten, Kündigungsfristen und gegebenenfalls Mindestlaufzeiten
              richten sich nach der jeweiligen individuellen Vereinbarung. Das
              Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt
              unberührt.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Vertraulichkeit</h2>
            <p>
              Beide Parteien verpflichten sich, vertrauliche Informationen der
              jeweils anderen Partei nur im Rahmen der Zusammenarbeit zu
              verwenden und nicht unbefugt an Dritte weiterzugeben.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Haftung</h2>
            <p>
              Es wird für Vorsatz und grobe Fahrlässigkeit nach den gesetzlichen
              Vorschriften gehaftet. Bei leichter Fahrlässigkeit ist die Haftung
              auf die Verletzung wesentlicher Vertragspflichten und auf den
              vertragstypisch vorhersehbaren Schaden begrenzt, soweit gesetzlich
              zulässig.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Schlussbestimmungen</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Sofern rechtlich
              zulässig, ist Gerichtsstand der Sitz des Anbieters. Sollten
              einzelne Bestimmungen unwirksam sein oder werden, bleibt die
              Wirksamkeit der übrigen Regelungen unberührt.
            </p>
          </section>
        </article>
      </section>
    </main>
  );
}
