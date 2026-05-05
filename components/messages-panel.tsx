import { formatDateTime } from "@/lib/format";
import type { CaseMessageRecord } from "@/lib/types";

interface MessagesPanelProps {
  messages: CaseMessageRecord[];
  caseId: string;
  returnTo: string;
  canCompose?: boolean;
  action?: (formData: FormData) => void | Promise<void>;
}

export function MessagesPanel({
  messages,
  caseId,
  returnTo,
  canCompose = false,
  action,
}: MessagesPanelProps) {
  return (
    <section className="portal-card panel-stack">
      <div className="portal-card-header">
        <div>
          <p className="portal-kicker">Nachrichten</p>
          <h2>Fallverlauf</h2>
        </div>
      </div>

      <div className="timeline-list">
        {messages.length > 0 ? (
          messages.map((message) => (
            <article className="timeline-item" key={message.id}>
              <div className="timeline-meta">
                <span
                  className={`message-direction message-direction-${message.direction}`}
                >
                  {message.direction === "inbound" ? "Eingehend" : "Ausgehend"}
                </span>
                <span>{formatDateTime(message.received_at)}</span>
              </div>
              <strong>{message.subject}</strong>
              <p>{message.body}</p>
              <small>
                {message.sender_name || message.sender_email || "Unbekannter Absender"}
                {message.recipient_email ? ` · An: ${message.recipient_email}` : ""}
              </small>
            </article>
          ))
        ) : (
          <div className="empty-state-inline">
            Noch keine Nachrichten zu diesem Fall.
          </div>
        )}
      </div>

      {canCompose && action ? (
        <form action={action} className="portal-form panel-form">
          <input name="case_id" type="hidden" value={caseId} />
          <input name="return_to" type="hidden" value={returnTo} />
          <label>
            Betreff
            <input name="subject" required type="text" />
          </label>
          <label>
            Nachricht
            <textarea name="body" required rows={5} />
          </label>
          <button className="portal-button portal-button-primary" type="submit">
            Nachricht speichern
          </button>
        </form>
      ) : null}
    </section>
  );
}
