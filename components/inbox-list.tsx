import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import type { CaseRecord, CustomerSummary, InboxMessageRecord } from "@/lib/types";

interface InboxListProps {
  messages: InboxMessageRecord[];
  customers: CustomerSummary[];
  cases: CaseRecord[];
  selectedCustomerId: string | null;
  inboundAction: (formData: FormData) => void | Promise<void>;
  composeAction: (formData: FormData) => void | Promise<void>;
}

function getCustomerLabel(customer: CustomerSummary) {
  return (
    customer.profile.company_name ||
    customer.profile.full_name ||
    customer.profile.email ||
    "Kunde"
  );
}

export function InboxList({
  messages,
  customers,
  cases,
  selectedCustomerId,
  inboundAction,
  composeAction,
}: InboxListProps) {
  const customerMap = new Map(
    customers.map((customer) => [customer.profile.id, customer]),
  );

  return (
    <div className="panel-stack">
      <section className="portal-card panel-stack">
        <div className="portal-card-header">
          <div>
            <p className="portal-kicker">Filter</p>
            <h2>Postfachansicht</h2>
          </div>
        </div>

        <div className="filter-links">
          <Link className={!selectedCustomerId ? "is-active" : ""} href="/admin/inbox">
            Alle Kunden
          </Link>
          {customers.map((customer) => (
            <Link
              className={selectedCustomerId === customer.profile.id ? "is-active" : ""}
              href={`/admin/inbox?customer=${customer.profile.id}`}
              key={customer.profile.id}
            >
              {getCustomerLabel(customer)}
            </Link>
          ))}
        </div>
      </section>

      <div className="portal-content-grid">
        <form action={composeAction} className="portal-card portal-form">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Ausgang</p>
              <h2>E-Mail schreiben</h2>
            </div>
            <p className="portal-muted">
              Wählen Sie den Kundenkontext. Optional kann die Nachricht direkt
              einem Fall zugeordnet werden.
            </p>
          </div>

          <input
            name="return_to"
            type="hidden"
            value={selectedCustomerId ? `/admin/inbox?customer=${selectedCustomerId}` : "/admin/inbox"}
          />

          <div className="portal-form-grid">
            <label>
              Kunde
              <select defaultValue={selectedCustomerId ?? ""} name="customer_profile_id" required>
                <option value="" disabled>
                  Kunde wählen
                </option>
                {customers.map((customer) => (
                  <option key={customer.profile.id} value={customer.profile.id}>
                    {getCustomerLabel(customer)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fall optional
              <select defaultValue="" name="case_id">
                <option value="">Kein Fallbezug</option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.case_reference} · {caseItem.customer_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="portal-form-span">
              Empfänger-E-Mail
              <input
                name="recipient_email"
                placeholder="kontakt@kunde.de"
                required
                type="email"
              />
            </label>
            <label className="portal-form-span">
              Betreff
              <input name="subject" required type="text" />
            </label>
            <label className="portal-form-span">
              Nachricht
              <textarea name="body" required rows={6} />
            </label>
          </div>

          <button className="portal-button portal-button-primary" type="submit">
            Nachricht ins Postfach schreiben
          </button>
        </form>

        <form action={inboundAction} className="portal-card portal-form">
          <div className="portal-card-header">
            <div>
              <p className="portal-kicker">Eingang</p>
              <h2>Eingehende Nachricht simulieren</h2>
            </div>
            <p className="portal-muted">
              Ohne Fall-ID kann eine Fallreferenz wie `NP-AB12CD34` im Betreff
              erkannt werden.
            </p>
          </div>

          <input
            name="return_to"
            type="hidden"
            value={selectedCustomerId ? `/admin/inbox?customer=${selectedCustomerId}` : "/admin/inbox"}
          />

          <div className="portal-form-grid">
            <label>
              Kunde optional
              <select defaultValue={selectedCustomerId ?? ""} name="customer_profile_id">
                <option value="">Allgemeines Postfach</option>
                {customers.map((customer) => (
                  <option key={customer.profile.id} value={customer.profile.id}>
                    {getCustomerLabel(customer)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fall-ID optional
              <input name="case_id" placeholder="UUID des Falls" type="text" />
            </label>
            <label>
              Absendername
              <input name="sender_name" placeholder="Maria Beispiel" type="text" />
            </label>
            <label>
              Absender-E-Mail
              <input
                name="sender_email"
                placeholder="kontakt@kunde.de"
                required
                type="email"
              />
            </label>
            <label className="portal-form-span">
              Betreff
              <input
                name="subject"
                placeholder="[NP-AB12CD34] Rückfrage zum Angebot"
                required
                type="text"
              />
            </label>
            <label className="portal-form-span">
              Nachricht
              <textarea name="body" required rows={6} />
            </label>
          </div>

          <button className="portal-button portal-button-secondary" type="submit">
            Eingehende Mail speichern
          </button>
        </form>
      </div>

      <section className="portal-card panel-stack">
        <div className="portal-card-header">
          <div>
            <p className="portal-kicker">Nachrichtenfeed</p>
            <h2>Neueste Nachrichten zuerst</h2>
          </div>
        </div>

        <div className="timeline-list">
          {messages.length > 0 ? (
            messages.map((message) => {
              const customer =
                message.customer_profile_id
                  ? customerMap.get(message.customer_profile_id)
                  : undefined;

              return (
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

                  <div className="message-footer">
                    <small>
                      Von: {message.sender_name || message.sender_email}
                      {message.recipient_email ? ` · An: ${message.recipient_email}` : ""}
                    </small>
                    <small>
                      {customer ? (
                        <>
                          Kunde:{" "}
                          <Link href={`/admin/customers/${customer.profile.id}`}>
                            {getCustomerLabel(customer)}
                          </Link>
                        </>
                      ) : (
                        "Allgemeines Postfach"
                      )}
                      {message.case_id ? (
                        <>
                          {" · "}
                          <Link href={`/admin/cases/${message.case_id}`}>Zum Fall</Link>
                        </>
                      ) : null}
                    </small>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state-inline">
              Für diese Ansicht sind noch keine Nachrichten vorhanden.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
