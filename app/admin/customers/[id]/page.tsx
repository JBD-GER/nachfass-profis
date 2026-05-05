import Link from "next/link";
import { notFound } from "next/navigation";

import { CaseTable } from "@/components/case-table";
import { StatusNotice } from "@/components/status-notice";
import { updateCustomerAction } from "@/lib/actions/customers";
import { formatDate, formatDateTime } from "@/lib/format";
import { getCustomerDetail } from "@/lib/queries";

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getCustomerLabel(companyName: string | null, fullName: string | null) {
  return companyName || fullName || "Unbenannter Kunde";
}

function renderAddress(profile: NonNullable<Awaited<ReturnType<typeof getCustomerDetail>>>["profile"]) {
  const parts = [profile.street, `${profile.postal_code ?? ""} ${profile.city ?? ""}`.trim(), profile.country]
    .map((part) => part?.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Keine Anschrift hinterlegt";
}

export default async function AdminCustomerDetailPage({
  params,
  searchParams,
}: AdminCustomerDetailPageProps) {
  const { id } = await params;
  const [detail, query] = await Promise.all([getCustomerDetail(id), searchParams]);

  if (!detail) {
    notFound();
  }

  const customerLabel = getCustomerLabel(
    detail.profile.company_name,
    detail.profile.full_name,
  );

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">Kundendetail</p>
          <h1>{customerLabel}</h1>
          <p>
            Verwalten Sie Anschrift, Logo, Mailbox-Konfiguration und springen
            Sie direkt in das kundenspezifische Postfach oder in die Fälle.
          </p>
        </div>
        <div className="inline-actions">
          <Link
            className="portal-button portal-button-secondary"
            href={`/admin/inbox?customer=${detail.profile.id}`}
          >
            Postfach öffnen
          </Link>
          <Link
            className="portal-button portal-button-ghost"
            href={`/admin?customer=${detail.profile.id}`}
          >
            Fälle filtern
          </Link>
        </div>
      </header>

      <StatusNotice message={readParam(query.success)} tone="success" />
      <StatusNotice message={readParam(query.error)} tone="error" />

      <section className="portal-detail-grid">
        <article className="portal-card detail-card">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Übersicht</p>
              <h2>Stammdaten</h2>
            </div>
          </div>

          <div className="customer-profile-summary">
            {detail.profile.logo_signed_url ? (
              <img
                alt={customerLabel}
                className="customer-logo customer-logo-large"
                src={detail.profile.logo_signed_url}
              />
            ) : (
              <div className="customer-logo customer-logo-large customer-logo-fallback">
                {customerLabel.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="customer-summary-copy">
              <strong>{customerLabel}</strong>
              <span>{detail.profile.full_name || "Kein Ansprechpartner"}</span>
              <span>{detail.profile.email || "Keine Portal-E-Mail"}</span>
            </div>
          </div>

          <dl className="detail-list-grid">
            <div>
              <dt>Portal-E-Mail</dt>
              <dd>{detail.profile.email || "Nicht hinterlegt"}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{detail.profile.phone || "Nicht hinterlegt"}</dd>
            </div>
            <div>
              <dt>Anschrift</dt>
              <dd>{renderAddress(detail.profile)}</dd>
            </div>
            <div>
              <dt>Angelegt</dt>
              <dd>{formatDate(detail.profile.created_at)}</dd>
            </div>
            <div>
              <dt>Mailbox</dt>
              <dd>{detail.profile.mailbox_email || "Nicht hinterlegt"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{detail.profile.mailbox_is_active ? "Aktiv" : "Inaktiv"}</dd>
            </div>
          </dl>
        </article>

        <article className="portal-card detail-card">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Pflege</p>
              <h2>Kundendaten bearbeiten</h2>
            </div>
          </div>

          <form action={updateCustomerAction} className="portal-form">
            <input name="customer_id" type="hidden" value={detail.profile.id} />
            <input
              name="return_to"
              type="hidden"
              value={`/admin/customers/${detail.profile.id}`}
            />

            <div className="portal-form-grid">
              <label>
                Firmenname
                <input
                  defaultValue={detail.profile.company_name ?? ""}
                  name="company_name"
                  required
                  type="text"
                />
              </label>
              <label>
                Ansprechpartner
                <input
                  defaultValue={detail.profile.full_name ?? ""}
                  name="full_name"
                  required
                  type="text"
                />
              </label>
              <label>
                Portal-E-Mail
                <input
                  defaultValue={detail.profile.email ?? ""}
                  disabled
                  type="email"
                />
              </label>
              <label>
                Telefon
                <input defaultValue={detail.profile.phone ?? ""} name="phone" type="tel" />
              </label>
              <label className="portal-form-span">
                Straße und Hausnummer
                <input defaultValue={detail.profile.street ?? ""} name="street" type="text" />
              </label>
              <label>
                PLZ
                <input
                  defaultValue={detail.profile.postal_code ?? ""}
                  name="postal_code"
                  type="text"
                />
              </label>
              <label>
                Ort
                <input defaultValue={detail.profile.city ?? ""} name="city" type="text" />
              </label>
              <label>
                Land
                <input
                  defaultValue={detail.profile.country ?? "DE"}
                  name="country"
                  type="text"
                />
              </label>
              <label>
                System-Mailbox
                <input
                  defaultValue={detail.profile.mailbox_email ?? ""}
                  name="mailbox_email"
                  type="email"
                />
              </label>
              <label>
                Anzeigename Absender
                <input
                  defaultValue={detail.profile.mailbox_display_name ?? ""}
                  name="mailbox_display_name"
                  type="text"
                />
              </label>
              <label className="portal-form-span">
                Signatur
                <textarea
                  defaultValue={detail.profile.mailbox_signature ?? ""}
                  name="mailbox_signature"
                  rows={5}
                />
              </label>
              <label className="portal-form-span">
                Logo ersetzen
                <input accept=".png,.jpg,.jpeg,.webp,.svg" name="logo" type="file" />
              </label>
            </div>

            <label className="checkbox-inline">
              <input
                defaultChecked={detail.profile.mailbox_is_active}
                name="mailbox_is_active"
                type="checkbox"
              />
              Mailbox aktiv
            </label>

            <button className="portal-button portal-button-primary" type="submit">
              Änderungen speichern
            </button>
          </form>
        </article>
      </section>

      <section className="portal-stats-grid">
        <article className="portal-card stat-card">
          <p className="portal-kicker">Fälle</p>
          <strong>{detail.cases.length}</strong>
          <span>Alle diesem Kunden zugeordneten Fälle im System.</span>
        </article>
        <article className="portal-card stat-card stat-card-muted">
          <p className="portal-kicker">Letzte Aktivität</p>
          <strong>
            {detail.cases[0] ? formatDateTime(detail.cases[0].created_at) : "Noch kein Fall"}
          </strong>
          <span>Neuestes eingegangenes Angebot dieses Kunden.</span>
        </article>
      </section>

      <CaseTable basePath="/admin/cases" cases={detail.cases} showCustomer={false} />
    </div>
  );
}
