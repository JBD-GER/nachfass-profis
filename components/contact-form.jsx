"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getVolumeOption, volumeOptions } from "../lib/contact-options";

export function ContactForm() {
  const router = useRouter();
  const [selectedVolume, setSelectedVolume] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const selectedOption = getVolumeOption(selectedVolume);

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const volumeValue = String(formData.get("volume") || "");
    const volumeOption = getVolumeOption(volumeValue);

    if (!volumeOption) {
      setStatus({
        type: "error",
        message: "Bitte wähle euer monatliches Angebotsvolumen aus.",
      });
      return;
    }

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      volume: volumeValue,
      message: String(formData.get("message") || "").trim(),
      privacyAccepted: formData.get("privacy") === "on",
    };

    try {
      setIsSubmitting(true);
      setStatus({
        type: "",
        message: "",
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Die Anfrage konnte gerade nicht übermittelt werden. Bitte versuche es erneut.",
        );
      }

      router.push(result?.redirectTo || "/danke");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Die Anfrage konnte gerade nicht übermittelt werden. Bitte versuche es erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="contact-form" id="kontaktformular" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          name="name"
          placeholder="Max Mustermann"
          autoComplete="name"
          required
        />
      </label>

      <label>
        E-Mail
        <input
          type="email"
          name="email"
          placeholder="max@betrieb.de"
          autoComplete="email"
          required
        />
      </label>

      <label>
        Firma
        <input
          type="text"
          name="company"
          placeholder="Musterbetrieb GmbH"
          autoComplete="organization"
          required
        />
      </label>

      <label>
        Telefon
        <input
          type="tel"
          name="phone"
          placeholder="+49 ..."
          autoComplete="tel"
        />
      </label>

      <label>
        Monatliches Angebotsvolumen
        <select
          name="volume"
          value={selectedVolume}
          onChange={(event) => setSelectedVolume(event.target.value)}
          required
        >
          <option value="" disabled>
            Bitte auswählen
          </option>
          {volumeOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} - {item.packageLabel}
            </option>
          ))}
        </select>
      </label>

      <div className="volume-recommendation" aria-live="polite">
        <span className="volume-recommendation-label">Empfehlung</span>
        <strong>
          {selectedOption
            ? `${selectedOption.packageLabel} passt am ehesten zu diesem Volumen.`
            : "Wählt euer monatliches Volumen aus, dann ordnen wir das passende Paket direkt mit ein."}
        </strong>
        {selectedOption ? <span>{selectedOption.summary}</span> : null}
      </div>

      <label className="contact-form-message">
        Nachricht
        <textarea
          name="message"
          rows="5"
          placeholder="Kurz beschreiben, wie ihr heute nachfasst und wo ihr mehr Verbindlichkeit im Follow-up wollt."
        />
      </label>

      <label className="checkbox-field">
        <input type="checkbox" name="privacy" required />
        <span>
          Ich habe die <Link href="/datenschutz">Datenschutzerklärung</Link>{" "}
          gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der
          Anfrage zu.
        </span>
      </label>

      <button
        className="button button-primary button-full"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Anfrage wird gesendet ..." : "Unverbindlich anfragen"}
      </button>

      <p className="form-hint">
        Nach dem Absenden leiten wir dich auf die Danke-Seite weiter und senden
        dir eine Eingangsbestätigung per E-Mail.
      </p>

      <p
        className={`form-status${status.type ? ` is-${status.type}` : ""}`}
        aria-live="polite"
      >
        {status.message}
      </p>
    </form>
  );
}
