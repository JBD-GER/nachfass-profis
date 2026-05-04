"use client";

export function ConsentSettingsButton() {
  return (
    <button
      className="footer-link footer-button"
      type="button"
      onClick={() => window.dispatchEvent(new Event("nachfass:open-consent"))}
    >
      Cookie-Einstellungen
    </button>
  );
}
