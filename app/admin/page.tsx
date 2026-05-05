import Link from "next/link";

import { CaseTable } from "@/components/case-table";
import { StatusNotice } from "@/components/status-notice";
import { CASE_STATUS_OPTIONS } from "@/lib/domain";
import { getAdminCases } from "@/lib/queries";

interface AdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const status = readParam(params.status);
  const customerId = readParam(params.customer);
  const cases = await getAdminCases(status, customerId);

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">Admin</p>
          <h1>Alle Fälle</h1>
          <p>
            Filtern Sie Fälle nach Status, öffnen Sie Detailansichten und
            steuern Sie Kontaktversuche, Notizen und Nachrichten zentral.
          </p>
          {customerId ? (
            <p className="portal-muted">
              Aktiver Kundenfilter: {customerId}
            </p>
          ) : null}
        </div>
      </header>

      <StatusNotice message={readParam(params.success)} tone="success" />
      <StatusNotice message={readParam(params.error)} tone="error" />

      <section className="portal-card filter-card">
        <div className="filter-links">
          <Link className={!status ? "is-active" : ""} href="/admin">
            Alle
          </Link>
          {CASE_STATUS_OPTIONS.map((option) => (
            <Link
              className={status === option.value ? "is-active" : ""}
              href={`/admin?status=${option.value}`}
              key={option.value}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </section>

      <CaseTable basePath="/admin/cases" cases={cases} showCustomer />
    </div>
  );
}
