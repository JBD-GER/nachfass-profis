"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  defaultConsent,
  persistConsent,
  readStoredConsent,
  sanitizeConsent,
} from "../lib/consent";

function ConsentToggle({ checked, disabled, label, description, onChange }) {
  return (
    <label className={`consent-option${disabled ? " is-locked" : ""}`}>
      <div className="consent-option-copy">
        <strong>{label}</strong>
        <p>{description}</p>
      </div>

      <span className="consent-switch-wrap">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          aria-label={label}
        />
        <span className="consent-switch" aria-hidden="true" />
      </span>
    </label>
  );
}

export function CookieBanner() {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [choices, setChoices] = useState(defaultConsent);

  useEffect(() => {
    const storedConsent = readStoredConsent();
    setChoices(storedConsent?.choices || defaultConsent);
    setIsVisible(!storedConsent);
    setIsReady(true);

    const openBanner = () => {
      const currentConsent = readStoredConsent();
      setChoices(currentConsent?.choices || defaultConsent);
      setIsSettingsOpen(true);
      setIsVisible(true);
    };

    window.addEventListener("nachfass:open-consent", openBanner);

    return () => {
      window.removeEventListener("nachfass:open-consent", openBanner);
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.NachfassConsent = {
      get: () => readStoredConsent(),
      canUse: (category) => {
        const storedConsent = readStoredConsent();
        return Boolean(storedConsent?.choices?.[category]);
      },
      openSettings: () => {
        window.dispatchEvent(new Event("nachfass:open-consent"));
      },
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (isVisible) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isReady, isVisible]);

  function updateChoice(key) {
    setChoices((currentState) => ({
      ...currentState,
      [key]: !currentState[key],
    }));
  }

  function saveConsent(nextChoices) {
    const payload = persistConsent(nextChoices);
    setChoices(payload.choices);
    setIsVisible(false);
    setIsSettingsOpen(false);
    window.dispatchEvent(
      new CustomEvent("nachfass:consent-updated", {
        detail: payload,
      }),
    );
  }

  function acceptAll() {
    saveConsent({
      essential: true,
      statistics: true,
      marketing: true,
    });
  }

  function acceptEssentialOnly() {
    saveConsent(defaultConsent);
  }

  function saveSelected() {
    saveConsent(sanitizeConsent(choices));
  }

  if (!isReady || !isVisible) {
    return null;
  }

  return (
    <div className="cookie-modal" aria-hidden="false">
      <div className="cookie-backdrop" />

      <aside
        className="cookie-banner"
        aria-label="Cookie- und Datenschutz-Einstellungen"
        aria-modal="true"
        role="dialog"
      >
        <div className="cookie-banner-copy">
          <p className="cookie-banner-title">Datenschutz und Einwilligung</p>
          <p>
            Wir nutzen essenzielle Speicherungen für den technischen Betrieb und
            die Verwaltung deiner Einwilligung. Statistik- und
            Marketing-Tracking bleiben standardmäßig deaktiviert und werden erst
            nach ausdrücklicher Auswahl aktiviert.
          </p>
        </div>

        <div className="cookie-banner-inline-actions">
          <button
            className="text-button"
            type="button"
            onClick={() => setIsSettingsOpen((currentState) => !currentState)}
          >
            {isSettingsOpen
              ? "Einstellungen schließen"
              : "Einstellungen anpassen"}
          </button>
          <Link className="text-button" href="/datenschutz">
            Datenschutzerklärung
          </Link>
        </div>

        {isSettingsOpen ? (
          <div className="consent-settings">
            <ConsentToggle
              checked
              disabled
              label="Essenziell"
              description="Erforderlich für die Seitendarstellung, die Sicherheit und das Merken deiner Einwilligungsentscheidung."
            />

            <ConsentToggle
              checked={choices.statistics}
              label="Statistik"
              description="Kann für Conversion-Messung, Reichweitenanalyse oder Funnel-Auswertung genutzt werden. Bleibt bis zur aktiven Zustimmung deaktiviert."
              onChange={() => updateChoice("statistics")}
            />

            <ConsentToggle
              checked={choices.marketing}
              label="Marketing"
              description="Kann für Retargeting, Werbeplattformen oder kampagnenbezogenes Conversion-Tracking freigegeben werden."
              onChange={() => updateChoice("marketing")}
            />

            <p className="consent-note">
              Deine Auswahl kann später jederzeit über den Link
              „Cookie-Einstellungen“ im Footer geändert oder widerrufen werden.
            </p>
          </div>
        ) : null}

        <div className="cookie-banner-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={acceptEssentialOnly}
          >
            Nur essenzielle
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={saveSelected}
          >
            Auswahl speichern
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={acceptAll}
          >
            Alle akzeptieren
          </button>
        </div>
      </aside>
    </div>
  );
}
