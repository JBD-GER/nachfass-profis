import Image from "next/image";

import { ContactForm } from "../../components/contact-form";
import { teamDetails } from "../../lib/content";
import { buildPageMetadata } from "../../lib/seo";
import { getPhoneHref, siteConfig } from "../../lib/site";

export const metadata = buildPageMetadata({
  title: "Kontakt",
  description:
    "Erstgespräch zur persönlichen Angebotsnachfassung anfragen. Direktkontakt, Kontaktformular und schnelle Einordnung nach Angebotsvolumen.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <main id="main-content" className="site-page">
      <section className="section subpage-hero">
        <div className="section-heading reveal">
          <p className="eyebrow">Kontakt</p>
          <h1>Erstgespräch zur persönlichen Angebotsnachfassung anfragen.</h1>
          <p>
            Wenn ihr offenes Angebotsvolumen habt und im Follow-up mehr
            Verbindlichkeit wollt, könnt ihr hier direkt den Einstieg machen.
          </p>
        </div>

        <div className="contact-panel reveal">
          <div className="contact-copy">
            <p className="eyebrow">Direktkontakt</p>
            <h2>Sauber starten und schnell einordnen.</h2>
            <p>
              Wir schauen uns an, wie viel Volumen offen ist, wie heute
              nachgefasst wird und welche Form der Zusammenarbeit fachlich Sinn
              macht.
            </p>

            <div className="legal-contact contact-details">
              <p>{siteConfig.legalName}</p>
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
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="section team-section">
        <div className="team-copy reveal">
          <p className="eyebrow">Auftreten & Vertrauen</p>
          <h2>Wir sollen wirken wie ein guter Teil eures Teams.</h2>
          <p>
            Genau deshalb ist der persönliche Eindruck so wichtig. Die
            Nachfassung soll professionell, freundlich und so sauber geführt
            wirken, als wäre sie ein natürlicher Teil eures Vertriebs.
          </p>
          <ul className="detail-list">
            {teamDetails.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="team-visual reveal">
          <div className="team-frame">
            <Image
              src="/teamfoto.png"
              alt="Team von Nachfrass-Profis"
              width={1448}
              height={1086}
              priority
            />
            <div className="team-note">
              <span>Nachfrass-Profis</span>
              <strong>
                Persönliche Angebotsnachfassung mit echtem Team im Hintergrund.
              </strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
