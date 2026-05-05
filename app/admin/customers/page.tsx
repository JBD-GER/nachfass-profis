import Link from "next/link";

import { StatusNotice } from "@/components/status-notice";
import { createCustomerAction } from "@/lib/actions/customers";
import { formatDateTime } from "@/lib/format";
import { getCustomerSummaries } from "@/lib/queries";

interface AdminCustomersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getCustomerLabel(companyName: string | null, fullName: string | null) {
  return companyName || fullName || "Unbenannter Kunde";
}

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const [customers, params] = await Promise.all([
    getCustomerSummaries(),
    searchParams,
  ]);

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">Kunden</p>
          <h1>Kundenverwaltung</h1>
          <p>
            Kundenstammdaten, Anschrift, Logo, Portalzugang und die
            systemseitige Mailbox werden hier zentral gepflegt.
          </p>
        </div>
      </header>

      <StatusNotice message={readParam(params.success)} tone="success" />
      <StatusNotice message={readParam(params.error)} tone="error" />

      <section className="portal-card portal-form">
        <div className="portal-card-header">
          <div>
            <p className="portal-kicker">Neuer Kunde</p>
            <h2>Kundenkonto anlegen</h2>
          </div>
          <p className="portal-muted">
            Erstellt direkt einen Portalzugang in Supabase Auth. Die
            Selbstregistrierung bleibt deaktiviert.
          </p>
        </div>

        <form action={createCustomerAction} className="portal-form">
          <div className="portal-form-grid">
            <label>
              Firmenname
              <input name="company_name" required type="text" />
            </label>
            <label>
              Ansprechpartner
              <input name="full_name" required type="text" />
            </label>
            <label>
              Portal-E-Mail
              <input name="email" required type="email" />
            </label>
            <label>
              Initialpasswort
              <input minLength={8} name="password" required type="password" />
            </label>
            <label>
              Telefon
              <input name="phone" type="tel" />
            </label>
            <label>
              Land
              <input defaultValue="DE" name="country" type="text" />
            </label>
            <label className="portal-form-span">
              Straße und Hausnummer
              <input name="street" type="text" />
            </label>
            <label>
              PLZ
              <input name="postal_code" type="text" />
            </label>
            <label>
              Ort
              <input name="city" type="text" />
            </label>
            <label>
              System-Mailbox
              <input
                name="mailbox_email"
                placeholder="kundenteam@beispiel.de"
                type="email"
              />
            </label>
            <label>
              Anzeigename Absender
              <input name="mailbox_display_name" type="text" />
            </label>
            <label className="portal-form-span">
              Signatur
              <textarea name="mailbox_signature" rows={4} />
            </label>
            <label className="portal-form-span">
              Kundenlogo
              <input accept=".png,.jpg,.jpeg,.webp,.svg" name="logo" type="file" />
            </label>
          </div>

          <label className="checkbox-inline">
            <input name="mailbox_is_active" type="checkbox" />
            Mailbox direkt aktivieren
          </label>

          <button className="portal-button portal-button-primary" type="submit">
            Kundenkonto erstellen
          </button>
        </form>
      </section>

      <div className="portal-table-shell portal-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Kunde</th>
              <th>Portalzugang</th>
              <th>System-Mailbox</th>
              <th>Fälle</th>
              <th>Letzte Aktivität</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.profile.id}>
                  <td>
                    <div className="customer-cell">
                      {customer.profile.logo_signed_url ? (
                        <img
                          alt={getCustomerLabel(
                            customer.profile.company_name,
                            customer.profile.full_name,
                          )}
                          className="customer-logo"
                          src={customer.profile.logo_signed_url}
                        />
                      ) : (
                        <div className="customer-logo customer-logo-fallback">
                          {getCustomerLabel(
                            customer.profile.company_name,
                            customer.profile.full_name,
                          )
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong>
                          {getCustomerLabel(
                            customer.profile.company_name,
                            customer.profile.full_name,
                          )}
                        </strong>
                        <span>{customer.profile.full_name || "Kein Ansprechpartner"}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{customer.profile.email || "Keine E-Mail"}</strong>
                    <span>{customer.profile.phone || "Kein Telefon"}</span>
                  </td>
                  <td>
                    <strong>{customer.profile.mailbox_email || "Nicht hinterlegt"}</strong>
                    <span>
                      {customer.profile.mailbox_is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td>{customer.case_count}</td>
                  <td>{formatDateTime(customer.latest_case_at)}</td>
                  <td className="portal-table-action">
                    <div className="table-link-stack">
                      <Link
                        className="table-link"
                        href={`/admin/customers/${customer.profile.id}`}
                      >
                        Bearbeiten
                      </Link>
                      <Link
                        className="table-link"
                        href={`/admin/inbox?customer=${customer.profile.id}`}
                      >
                        Postfach
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Noch keine Kunden vorhanden.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
