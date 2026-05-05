import { notFound } from "next/navigation";

import {
  adjustContactAttemptsAction,
  changeCaseStatusAction,
  createManualCaseMessageAction,
  createNoteAction,
  saveCaseNotificationAction,
  sendMockNotificationAction,
} from "@/lib/actions/cases";
import { CASE_STATUS_OPTIONS } from "@/lib/domain";
import { formatDateTime, formatFileSize } from "@/lib/format";
import { getCaseDetail } from "@/lib/queries";
import { ContactAttemptsControl } from "@/components/contact-attempts-control";
import { MessagesPanel } from "@/components/messages-panel";
import { NotesPanel } from "@/components/notes-panel";
import { StatusBadge } from "@/components/status-badge";
import { StatusNotice } from "@/components/status-notice";

interface AdminCaseDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCaseDetailPage({
  params,
  searchParams,
}: AdminCaseDetailPageProps) {
  const { id } = await params;
  const [detail, query] = await Promise.all([getCaseDetail(id), searchParams]);

  if (!detail) {
    notFound();
  }

  const returnTo = `/admin/cases/${detail.caseItem.id}`;

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">{detail.caseItem.case_reference}</p>
          <h1>{detail.caseItem.customer_name}</h1>
          <p>
            Verwalten Sie Status, Dateien, Notizen, Kontaktversuche,
            Nachrichten und vorbereitete Benachrichtigungen für diesen Fall.
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
              <p className="portal-kicker">Kundendaten</p>
              <h2>Stammdaten</h2>
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
          </dl>

          {detail.caseItem.initial_note ? (
            <div className="detail-note">
              <strong>Initiale Kundennotiz</strong>
              <p>{detail.caseItem.initial_note}</p>
            </div>
          ) : null}
        </article>

        <article className="portal-card detail-card">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Status</p>
              <h2>Fallstatus ändern</h2>
            </div>
          </div>

          <form action={changeCaseStatusAction} className="portal-form compact-form">
            <input name="case_id" type="hidden" value={detail.caseItem.id} />
            <input name="return_to" type="hidden" value={returnTo} />
            <label>
              Status
              <select defaultValue={detail.caseItem.status} name="status">
                {CASE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="portal-button portal-button-primary" type="submit">
              Status speichern
            </button>
          </form>
        </article>
      </section>

      <section className="portal-detail-grid">
        <article className="portal-card detail-card">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Uploads</p>
              <h2>Fall-Dateien</h2>
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

        <ContactAttemptsControl
          action={adjustContactAttemptsAction}
          caseId={detail.caseItem.id}
          emailAttempts={detail.caseItem.email_contact_attempts}
          phoneAttempts={detail.caseItem.phone_contact_attempts}
          returnTo={returnTo}
        />
      </section>

      <section className="portal-content-grid">
        <NotesPanel
          action={createNoteAction}
          canCreate
          caseId={detail.caseItem.id}
          notes={detail.notes}
          returnTo={returnTo}
        />
        <MessagesPanel
          action={createManualCaseMessageAction}
          canCompose
          caseId={detail.caseItem.id}
          messages={detail.messages}
          returnTo={returnTo}
        />
      </section>

      <section className="portal-content-grid">
        <article className="portal-card panel-stack">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Benachrichtigungen</p>
              <h2>Vorbereitete E-Mail-Automationen</h2>
            </div>
          </div>

          {detail.notifications.length > 0 ? (
            detail.notifications.map((notification) => (
              <div className="notification-card" key={notification.id}>
                <form action={saveCaseNotificationAction} className="portal-form compact-form">
                  <input name="notification_id" type="hidden" value={notification.id} />
                  <input name="case_id" type="hidden" value={detail.caseItem.id} />
                  <input name="return_to" type="hidden" value={returnTo} />

                  <div className="notification-card-head">
                    <div>
                      <strong>
                        {notification.template?.name || "Benachrichtigung"}
                      </strong>
                      <p>{notification.template?.description || "Ohne Beschreibung"}</p>
                    </div>
                    <label className="checkbox-inline">
                      <input
                        defaultChecked={notification.is_enabled}
                        name="is_enabled"
                        type="checkbox"
                      />
                      Aktiv
                    </label>
                  </div>

                  <label>
                    Empfänger
                    <input
                      defaultValue={notification.recipient_email}
                      name="recipient_email"
                      required
                      type="email"
                    />
                  </label>
                  <label>
                    Betreff-Override
                    <input
                      defaultValue={notification.subject_override ?? ""}
                      name="subject_override"
                      placeholder={notification.template?.subject_template ?? ""}
                      type="text"
                    />
                  </label>
                  <label>
                    Body-Override
                    <textarea
                      defaultValue={notification.body_override ?? ""}
                      name="body_override"
                      placeholder={notification.template?.body_template ?? ""}
                      rows={5}
                    />
                  </label>

                  <div className="inline-actions">
                    <button className="portal-button portal-button-secondary" type="submit">
                      Vorlage speichern
                    </button>
                  </div>
                </form>

                <form action={sendMockNotificationAction}>
                  <input name="notification_id" type="hidden" value={notification.id} />
                  <input name="return_to" type="hidden" value={returnTo} />
                  <button className="portal-button portal-button-primary" type="submit">
                    Mock senden
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="empty-state-inline">
              Keine Benachrichtigungen vorbereitet.
            </div>
          )}
        </article>

        <article className="portal-card panel-stack">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Versand-Log</p>
              <h2>Notification Logs</h2>
            </div>
          </div>

          <div className="timeline-list">
            {detail.notificationLogs.length > 0 ? (
              detail.notificationLogs.map((log) => (
                <article className="timeline-item" key={log.id}>
                  <div className="timeline-meta">
                    <span className={`message-direction message-direction-${log.status === "sent" ? "outbound" : "inbound"}`}>
                      {log.status}
                    </span>
                    <span>{formatDateTime(log.created_at)}</span>
                  </div>
                  <strong>{log.subject}</strong>
                  <p>{log.body}</p>
                  <small>{log.recipient_email}</small>
                </article>
              ))
            ) : (
              <div className="empty-state-inline">
                Noch keine Versandereignisse protokolliert.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
