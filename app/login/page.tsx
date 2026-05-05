import { redirectIfAuthenticated } from "@/lib/auth";
import { signInAction } from "@/lib/actions/auth";

import { StatusNotice } from "@/components/status-notice";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticated();
  const params = await searchParams;
  const error = readParam(params.error);
  const success = readParam(params.success);

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-copy">
          <p className="portal-kicker">Nachfass-Profis</p>
          <h1>Portalzugang für Kunden und Admin-Team</h1>
          <p>
            Verwalten Sie Angebote, Fälle, Notizen, Nachrichten und automatische
            Benachrichtigungen in einer gemeinsamen Arbeitsoberfläche.
          </p>
        </div>

        <div className="auth-panel-stack">
          <StatusNotice message={error} tone="error" />
          <StatusNotice message={success} tone="success" />

          <div className="auth-grid auth-grid-single">
            <form action={signInAction} className="portal-card portal-form">
              <div className="portal-card-header">
                <div>
                  <p className="portal-kicker">Login</p>
                  <h2>Anmelden</h2>
                </div>
                <p className="portal-muted">
                  Konten werden zentral in Supabase verwaltet. Eine
                  Selbstregistrierung gibt es nicht.
                </p>
              </div>

              <label>
                E-Mail
                <input name="email" required type="email" />
              </label>
              <label>
                Passwort
                <input name="password" required type="password" />
              </label>
              <button className="portal-button portal-button-primary" type="submit">
                Einloggen
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
