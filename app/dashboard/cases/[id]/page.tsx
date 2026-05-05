import { notFound } from "next/navigation";

import { MessagesPanel } from "@/components/messages-panel";
import { NotesPanel } from "@/components/notes-panel";
import { StatusBadge } from "@/components/status-badge";
import { StatusNotice } from "@/components/status-notice";
import { formatDateTime, formatFileSize } from "@/lib/format";
import { getCaseDetail } from "@/lib/queries";

interface CustomerCaseDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CustomerCaseDetailPage({
  params,
  searchParams,
}: CustomerCaseDetailPageProps) {
  const { id } = await params;
  const [detail, query] = await Promise.all([getCaseDetail(id), searchParams]);

  if (!detail) {
    notFound();
  }

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">{detail.caseItem.case_reference}</p>
          <h1>Falldetails</h1>
          <p>
            Verfolgen Sie Status, hochgeladene Dateien, Admin-Notizen und den
            Kommunikationsverlauf zu Ihrem Angebot.
          </p>
        </div>
        <StatusBadge status={detail.caseItem.status} />
      </header>

      <StatusNotice message={readParam(query.success)} tone="success" />
      <StatusNotice message={readParam(query.error)} tone="error" />

      <section className="portal-detail-grid">
        <article className="portal-card detail-card">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Fallübersicht</p>
              <h2>Kundendaten</h2>
            </div>
          </div>

          <dl className="detail-list-grid">
            <div>
              <dt>Name</dt>
              <dd>{detail.caseItem.customer_name}</dd>
            </div>
            <div>
              <dt>E-Mail</dt>
              <dd>{detail.caseItem.customer_email}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{detail.caseItem.customer_phone}</dd>
            </div>
            <div>
              <dt>Erstellt</dt>
              <dd>{formatDateTime(detail.caseItem.created_at)}</dd>
            </div>
            <div>
              <dt>E-Mail-Kontaktversuche</dt>
              <dd>{detail.caseItem.email_contact_attempts}</dd>
            </div>
            <div>
              <dt>Telefon-Kontaktversuche</dt>
              <dd>{detail.caseItem.phone_contact_attempts}</dd>
            </div>
          </dl>

          {detail.caseItem.initial_note ? (
            <div className="detail-note">
              <strong>Ihre Notiz beim Upload</strong>
              <p>{detail.caseItem.initial_note}</p>
            </div>
          ) : null}
        </article>

        <article className="portal-card detail-card">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Dateien</p>
              <h2>Hochgeladene Angebote</h2>
            </div>
          </div>

          <div className="file-list">
            {detail.files.length > 0 ? (
              detail.files.map((file) => (
                <a
                  className="file-item"
                  href={file.signed_url ?? "#"}
                  key={file.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <strong>{file.file_name}</strong>
                  <span>
                    {formatFileSize(file.file_size)}
                    {file.file_type ? ` · ${file.file_type}` : ""}
                  </span>
                </a>
              ))
            ) : (
              <div className="empty-state-inline">Keine Dateien vorhanden.</div>
            )}
          </div>
        </article>
      </section>

      <section className="portal-content-grid">
        <NotesPanel
          action={undefined}
          canCreate={false}
          caseId={detail.caseItem.id}
          notes={detail.notes}
          returnTo={`/dashboard/cases/${detail.caseItem.id}`}
        />
        <MessagesPanel
          action={undefined}
          canCompose={false}
          caseId={detail.caseItem.id}
          messages={detail.messages}
          returnTo={`/dashboard/cases/${detail.caseItem.id}`}
        />
      </section>
    </div>
  );
}
