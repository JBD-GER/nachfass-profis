interface FileUploadProps {
  action: (formData: FormData) => void | Promise<void>;
  defaultName?: string | null;
  defaultEmail?: string | null;
  defaultPhone?: string | null;
}

export function FileUpload({
  action,
  defaultName,
  defaultEmail,
  defaultPhone,
}: FileUploadProps) {
  return (
    <form className="portal-form portal-card" action={action}>
      <div className="portal-card-header">
        <div>
          <p className="portal-kicker">Neuer Upload</p>
          <h2>Angebot hochladen</h2>
        </div>
        <p className="portal-muted">
          Ihr Fall wird automatisch mit dem Status &quot;Eingegangen&quot;
          angelegt.
        </p>
      </div>

      <div className="portal-form-grid">
        <label>
          Name
          <input
            defaultValue={defaultName ?? ""}
            name="customer_name"
            placeholder="Max Mustermann"
            required
            type="text"
          />
        </label>
        <label>
          E-Mail
          <input
            defaultValue={defaultEmail ?? ""}
            name="customer_email"
            placeholder="kunde@beispiel.de"
            required
            type="email"
          />
        </label>
        <label>
          Telefonnummer
          <input
            defaultValue={defaultPhone ?? ""}
            name="customer_phone"
            placeholder="+49 123 456789"
            required
            type="tel"
          />
        </label>
        <label className="portal-form-span">
          Optionale Notiz
          <textarea
            name="initial_note"
            placeholder="Zusätzliche Hinweise zum Angebot"
            rows={4}
          />
        </label>
        <label className="portal-form-span">
          Dateien
          <input
            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
            multiple
            name="files"
            required
            type="file"
          />
        </label>
      </div>

      <button className="portal-button portal-button-primary" type="submit">
        Angebot und Fall anlegen
      </button>
    </form>
  );
}
