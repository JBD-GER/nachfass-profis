import { buildPageMetadata } from "../../lib/seo";
import { getPhoneHref, siteConfig } from "../../lib/site";

export const metadata = buildPageMetadata({
  title: "Datenschutz",
  description: "Datenschutzerklärung der Nachfrass-Profis.",
  path: "/datenschutz",
});

export default function DatenschutzPage() {
  return (
    <main id="main-content" className="site-page">
      <section className="legal-page section">
        <div className="section-heading reveal">
          <p className="eyebrow">Rechtliches</p>
          <h1>Datenschutzerklärung</h1>
          <p>
            Informationen zur Verarbeitung personenbezogener Daten auf
            www.nachfass-profis.de.
          </p>
        </div>

        <article className="legal-card reveal">
          <section className="legal-section">
            <h2>1. Verantwortlicher</h2>
            <div className="legal-contact">
              <p>{siteConfig.legalName}</p>
              <p>Vertretungsberechtigt: {siteConfig.representative}</p>
              <p>{siteConfig.address.street}</p>
              <p>
                {siteConfig.address.postalCode} {siteConfig.address.city}
              </p>
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
            <h2>2. Aufruf der Website</h2>
            <p>
              Beim Besuch dieser Website können technisch notwendige
              Verbindungsdaten verarbeitet werden, etwa IP-Adresse, Datum und
              Uhrzeit des Zugriffs, aufgerufene Seiten, Browser-Informationen,
              Betriebssystem und Referrer.
            </p>
            <p>
              Die Verarbeitung erfolgt, um die Website technisch bereitzustellen
              sowie Sicherheit und Stabilität des Betriebs zu gewährleisten.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Hosting über Vercel</h2>
            <p>
              Für das Hosting und die technische Auslieferung dieser Website
              nutzen wir Vercel. Dabei können insbesondere Server-Logdaten,
              Verbindungsdaten und technische Nutzungsdaten verarbeitet werden,
              soweit dies für den sicheren und performanten Betrieb der Website
              erforderlich ist.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
              Interesse liegt in der stabilen, sicheren und schnellen
              Bereitstellung unseres Onlineangebots.
            </p>
            <p>
              Weitere Informationen findest du unter{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer"
              >
                vercel.com/legal/privacy-policy
              </a>
              .
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Consent-Banner, Cookies und lokale Speicherung</h2>
            <p>
              Diese Website verwendet ein Consent-Banner mit den Kategorien
              „essenziell“, „Statistik“ und „Marketing“. Standardmäßig werden
              nur essenzielle Speicherungen genutzt. Statistik- oder
              Marketing-Technologien bleiben deaktiviert, bis du ihnen aktiv
              zustimmst.
            </p>
            <p>
              Essenzielle Speicherungen werden genutzt, um deine
              Einwilligungsentscheidung technisch zu speichern und den Betrieb
              der Website sicherzustellen. Rechtsgrundlage ist § 25 Abs. 2 Nr. 2
              TDDDG. Soweit im Anschluss personenbezogene Daten verarbeitet
              werden, erfolgt dies auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>
            <p>
              Statistik- oder Marketing-Speicherungen dürfen erst nach deiner
              ausdrücklichen Einwilligung eingesetzt werden. Rechtsgrundlage ist
              dann § 25 Abs. 1 TDDDG in Verbindung mit Art. 6 Abs. 1 lit. a
              DSGVO.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Änderung und Widerruf deiner Auswahl</h2>
            <p>
              Deine Einwilligung ist freiwillig und kann jederzeit mit Wirkung
              für die Zukunft geändert oder widerrufen werden. Dafür steht im
              Footer der Website der Link „Cookie-Einstellungen“ zur Verfügung.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Statistik und Marketing</h2>
            <p>
              Statistik- oder Marketing-Technologien werden erst nach deiner
              ausdrücklichen Auswahl im Consent-Banner geladen. Ohne
              Einwilligung bleiben diese Kategorien deaktiviert.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Kontakt per E-Mail oder Telefon</h2>
            <p>
              Wenn du Kontakt per E-Mail oder Telefon aufnimmst, werden die von
              dir übermittelten Daten verarbeitet, um deine Anfrage zu
              beantworten und die weitere Kommunikation zu ermöglichen.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern es um die
              Anbahnung eines Vertrags geht, andernfalls Art. 6 Abs. 1 lit. f
              DSGVO.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Kontaktformular</h2>
            <p>
              Wenn du das Kontaktformular nutzt, verarbeiten wir die von dir
              eingegebenen Daten, insbesondere Name, Firma, E-Mail-Adresse,
              Telefonnummer, Angebotsvolumen und Nachricht, um deine Anfrage zu
              bearbeiten und mit dir Kontakt aufzunehmen.
            </p>
            <p>
              Nach dem Absenden leiten wir dich auf eine Danke-Seite weiter und
              versenden eine Eingangsbestätigung an die von dir angegebene
              E-Mail-Adresse. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
              beziehungsweise Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Speicherung und Dateninfrastruktur über Supabase</h2>
            <p>
              Für Datenbank- und Backend-Infrastruktur kann Supabase genutzt
              werden. Soweit im Rahmen unserer Website oder Anfragebearbeitung
              personenbezogene Daten in einer Supabase-Umgebung gespeichert oder
              verarbeitet werden, erfolgt dies ausschließlich zum Betrieb der
              Website und zur Bearbeitung von Anfragen.
            </p>
            <p>
              Rechtsgrundlage ist je nach Verarbeitung Art. 6 Abs. 1 lit. b
              DSGVO bei vertragsbezogenen Anfragen beziehungsweise Art. 6 Abs. 1
              lit. f DSGVO für den sicheren und strukturierten Betrieb unserer
              Systeme.
            </p>
            <p>
              Weitere Informationen findest du unter{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                supabase.com/privacy
              </a>
              .
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Versanddienstleister für Formular-E-Mails</h2>
            <p>
              Für den Versand der Formularbenachrichtigungen nutzen wir den
              E-Mail-Dienst Resend, bereitgestellt von Plus Five Five, Inc.,
              2261 Market Street #5039, San Francisco, CA 94114, USA.
            </p>
            <p>
              Dabei werden die im Formular angegebenen Daten an Resend
              übermittelt, soweit dies für die Zustellung der Nachricht an uns
              und der Bestätigung an dich erforderlich ist. Es kann hierbei auch
              zu einer Verarbeitung in Drittländern, insbesondere in den USA,
              kommen.
            </p>
            <p>
              Weitere Informationen findest du unter{" "}
              <a
                href="https://resend.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer"
              >
                resend.com/legal/privacy-policy
              </a>
              .
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Empfänger</h2>
            <p>
              Empfänger deiner Daten können technische Dienstleister sein, die
              wir für Hosting, Dateninfrastruktur, Zustellung von E-Mails oder
              den sicheren Betrieb dieser Website einsetzen, soweit dies zur
              Erfüllung der genannten Zwecke erforderlich ist.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Speicherdauer</h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie dies
              für die Bearbeitung deiner Anfrage, für gesetzliche
              Aufbewahrungspflichten oder zur Wahrung berechtigter Interessen
              erforderlich ist.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Rechte betroffener Personen</h2>
            <ul className="legal-list">
              <li>Recht auf Auskunft nach Art. 15 DSGVO</li>
              <li>Recht auf Berichtigung nach Art. 16 DSGVO</li>
              <li>Recht auf Löschung nach Art. 17 DSGVO</li>
              <li>Recht auf Einschränkung der Verarbeitung nach Art. 18 DSGVO</li>
              <li>Recht auf Datenübertragbarkeit nach Art. 20 DSGVO</li>
              <li>Widerspruchsrecht nach Art. 21 DSGVO</li>
              <li>Recht auf Widerruf einer Einwilligung mit Wirkung für die Zukunft</li>
              <li>Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>14. Stand</h2>
            <p>Stand dieser Datenschutzerklärung: Mai 2026.</p>
          </section>
        </article>
      </section>
    </main>
  );
}
