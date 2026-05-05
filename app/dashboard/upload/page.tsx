import { FileUpload } from "@/components/file-upload";
import { StatusNotice } from "@/components/status-notice";
import { createCaseUploadAction } from "@/lib/actions/cases";
import { requireRole } from "@/lib/auth";

interface UploadPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const auth = await requireRole("customer");
  const params = await searchParams;

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">Upload</p>
          <h1>Angebot und Kontaktdaten einreichen</h1>
          <p>
            Jede Einreichung wird als neuer Fall angelegt und startet mit dem
            Status &quot;Eingegangen&quot;.
          </p>
        </div>
      </header>

      <StatusNotice message={readParam(params.error)} tone="error" />

      <FileUpload
        action={createCaseUploadAction}
        defaultEmail={auth.profile.email}
        defaultName={auth.profile.full_name}
        defaultPhone={auth.profile.phone}
      />
    </div>
  );
}
