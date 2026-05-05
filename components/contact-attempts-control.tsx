interface ContactAttemptsControlProps {
  caseId: string;
  emailAttempts: number;
  phoneAttempts: number;
  returnTo: string;
  action: (formData: FormData) => void | Promise<void>;
}

function CounterRow({
  label,
  field,
  value,
  caseId,
  returnTo,
  action,
}: {
  label: string;
  field: "email" | "phone";
  value: number;
  caseId: string;
  returnTo: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="attempt-row">
      <div>
        <strong>{label}</strong>
        <p>{value} Kontaktversuche</p>
      </div>

      <div className="attempt-actions">
        <form action={action}>
          <input name="case_id" type="hidden" value={caseId} />
          <input name="field" type="hidden" value={field} />
          <input name="delta" type="hidden" value="-1" />
          <input name="return_to" type="hidden" value={returnTo} />
          <button className="portal-button portal-button-ghost" type="submit">
            -1
          </button>
        </form>
        <form action={action}>
          <input name="case_id" type="hidden" value={caseId} />
          <input name="field" type="hidden" value={field} />
          <input name="delta" type="hidden" value="1" />
          <input name="return_to" type="hidden" value={returnTo} />
          <button className="portal-button portal-button-primary" type="submit">
            +1
          </button>
        </form>
      </div>
    </div>
  );
}

export function ContactAttemptsControl({
  caseId,
  emailAttempts,
  phoneAttempts,
  returnTo,
  action,
}: ContactAttemptsControlProps) {
  return (
    <section className="portal-card">
      <div className="portal-card-header">
        <div>
          <p className="portal-kicker">Kontaktversuche</p>
          <h2>Zähler verwalten</h2>
        </div>
      </div>

      <div className="attempt-grid">
        <CounterRow
          action={action}
          caseId={caseId}
          field="email"
          label="E-Mail"
          returnTo={returnTo}
          value={emailAttempts}
        />
        <CounterRow
          action={action}
          caseId={caseId}
          field="phone"
          label="Telefon"
          returnTo={returnTo}
          value={phoneAttempts}
        />
      </div>
    </section>
  );
}
