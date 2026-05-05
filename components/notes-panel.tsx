import { formatDateTime } from "@/lib/format";
import type { NoteVisibility } from "@/lib/types";

interface NoteItem {
  id: string;
  body: string;
  visibility: NoteVisibility;
  created_at: string;
  author_name: string | null;
  author_email: string | null;
}

interface NotesPanelProps {
  notes: NoteItem[];
  caseId: string;
  returnTo: string;
  canCreate?: boolean;
  action?: (formData: FormData) => void | Promise<void>;
}

export function NotesPanel({
  notes,
  caseId,
  returnTo,
  canCreate = false,
  action,
}: NotesPanelProps) {
  return (
    <section className="portal-card panel-stack">
      <div className="portal-card-header">
        <div>
          <p className="portal-kicker">Notizen</p>
          <h2>Fallnotizen</h2>
        </div>
      </div>

      <div className="timeline-list">
        {notes.length > 0 ? (
          notes.map((note) => (
            <article className="timeline-item" key={note.id}>
              <div className="timeline-meta">
                <span className={`note-visibility note-visibility-${note.visibility}`}>
                  {note.visibility === "internal"
                    ? "Intern"
                    : "Kundensichtbar"}
                </span>
                <span>{formatDateTime(note.created_at)}</span>
              </div>
              <p>{note.body}</p>
              <small>
                {note.author_name || note.author_email || "Unbekannter Autor"}
              </small>
            </article>
          ))
        ) : (
          <div className="empty-state-inline">Noch keine Notizen vorhanden.</div>
        )}
      </div>

      {canCreate && action ? (
        <form action={action} className="portal-form panel-form">
          <input name="case_id" type="hidden" value={caseId} />
          <input name="return_to" type="hidden" value={returnTo} />
          <label>
            Sichtbarkeit
            <select defaultValue="internal" name="visibility">
              <option value="internal">Interne Admin-Notiz</option>
              <option value="customer_visible">Für Kunden sichtbar</option>
            </select>
          </label>
          <label>
            Notiz
            <textarea name="body" required rows={4} />
          </label>
          <button className="portal-button portal-button-primary" type="submit">
            Notiz speichern
          </button>
        </form>
      ) : null}
    </section>
  );
}
