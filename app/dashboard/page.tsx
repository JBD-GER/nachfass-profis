import Link from "next/link";

import { CaseCard } from "@/components/case-card";
import { StatusNotice } from "@/components/status-notice";
import { getDashboardCases } from "@/lib/queries";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [cases, params] = await Promise.all([getDashboardCases(), searchParams]);

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">Dashboard</p>
          <h1>Meine Fälle</h1>
          <p>
            Hier sehen Sie alle hochgeladenen Angebote, Statusänderungen,
            kunden-sichtbaren Notizen und den Nachrichtenverlauf.
          </p>
        </div>
        <Link className="portal-button portal-button-primary" href="/dashboard/upload">
          Angebot hochladen
        </Link>
      </header>

      <StatusNotice message={readParam(params.success)} tone="success" />
      <StatusNotice message={readParam(params.error)} tone="error" />

      <section className="portal-stats-grid">
        <article className="portal-card stat-card">
          <p className="portal-kicker">Fälle gesamt</p>
          <strong>{cases.length}</strong>
          <span>Aktive und abgeschlossene Angebote im Überblick</span>
        </article>
        <article className="portal-card stat-card stat-card-muted">
          <p className="portal-kicker">API-Anbindung</p>
          <strong>Geplant</strong>
          <span>
            API-Anbindung ist geplant und wird bald verfügbar sein.
          </span>
        </article>
      </section>

      <section className="portal-card-list">
        {cases.length > 0 ? (
          cases.map((caseItem) => (
            <CaseCard
              caseItem={caseItem}
              href={`/dashboard/cases/${caseItem.id}`}
              key={caseItem.id}
            />
          ))
        ) : (
          <div className="portal-card empty-state">
            <h2>Noch keine Fälle vorhanden</h2>
            <p>
              Laden Sie Ihr erstes Angebot hoch, um einen neuen Fall im Portal
              anzulegen.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
