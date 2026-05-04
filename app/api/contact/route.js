import { NextResponse } from "next/server";
import { Resend } from "resend";

import { getVolumeOption } from "../../../lib/contact-options";
import { createAbsoluteUrl, siteConfig } from "../../../lib/site";

export const runtime = "nodejs";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || siteConfig.email;
const fromEmail =
  process.env.RESEND_FROM_EMAIL || `Nachfrass-Profis <${siteConfig.email}>`;

function cleanValue(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return cleanValue(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeProviderError(error) {
  if (!error) {
    return {
      message: "Unbekannter Versandfehler.",
      name: "unknown_error",
      statusCode: null,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      name: "provider_error",
      statusCode: null,
    };
  }

  return {
    message: error.message || "Unbekannter Versandfehler.",
    name: error.name || "provider_error",
    statusCode: error.statusCode ?? null,
  };
}

function mapProviderErrorToUserMessage(error) {
  if (
    error.name === "validation_error" &&
    /domain is not verified/i.test(error.message)
  ) {
    return "Die Absenderdomain ist bei Resend noch nicht verifiziert.";
  }

  switch (error.name) {
    case "invalid_from_address":
      return "Die Absenderadresse ist bei Resend noch nicht freigeschaltet oder die Domain ist nicht korrekt verifiziert.";
    case "invalid_access":
    case "restricted_api_key":
    case "invalid_api_key":
    case "missing_api_key":
      return "Der E-Mail-Versand ist aktuell nicht korrekt mit Resend verbunden.";
    case "rate_limit_exceeded":
    case "daily_quota_exceeded":
    case "monthly_quota_exceeded":
      return "Das Versandlimit des E-Mail-Dienstes wurde erreicht.";
    default:
      return "Die Anfrage konnte gerade nicht per E-Mail versendet werden.";
  }
}

function renderEmailShell({
  preview,
  title,
  intro,
  contentHtml,
  ctaLabel,
  ctaUrl,
}) {
  return `
    <div style="margin:0;padding:32px 16px;background:#eef3f8;font-family:Arial,sans-serif;color:#0f1d2d;">
      <div style="max-width:680px;margin:0 auto;background:#07111b;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <div style="padding:32px;background:linear-gradient(135deg,#d8ff63 0%,#5fe6cf 100%);color:#08111a;">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(siteConfig.name)}</div>
          <h1 style="margin:14px 0 0;font-size:30px;line-height:1.1;">${escapeHtml(title)}</h1>
          <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#0f1d2d;">${escapeHtml(intro)}</p>
        </div>
        <div style="padding:28px 28px 12px;background:#07111b;color:#f5f7fb;">
          ${contentHtml}
          ${
            ctaLabel && ctaUrl
              ? `<p style="margin:28px 0 8px;">
                  <a href="${escapeHtml(
                    ctaUrl,
                  )}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#ffffff;color:#08111a;font-weight:700;text-decoration:none;">${escapeHtml(
                    ctaLabel,
                  )}</a>
                </p>`
              : ""
          }
        </div>
        <div style="padding:20px 28px 28px;background:#07111b;color:#9fb0c4;font-size:14px;line-height:1.7;border-top:1px solid rgba(255,255,255,0.08);">
          <div>${escapeHtml(siteConfig.legalName)}</div>
          <div>${escapeHtml(siteConfig.address.street)}, ${escapeHtml(siteConfig.address.postalCode)} ${escapeHtml(siteConfig.address.city)}</div>
          <div><a href="mailto:${escapeHtml(siteConfig.email)}" style="color:#d8edf8;text-decoration:underline;">${escapeHtml(siteConfig.email)}</a> · <a href="tel:${escapeHtml(
            siteConfig.phone.replace(/\s+/g, ""),
          )}" style="color:#d8edf8;text-decoration:underline;">${escapeHtml(siteConfig.phone)}</a></div>
          <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderFieldRow(label, value) {
  return `
    <tr>
      <td style="padding:12px 0 4px;color:#9fb0c4;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(
        label,
      )}</td>
    </tr>
    <tr>
      <td style="padding:0 0 12px;color:#f5f7fb;font-size:16px;line-height:1.6;">${escapeHtml(
        value || "—",
      )}</td>
    </tr>
  `;
}

function buildAdminEmail(data) {
  const contentHtml = `
    <p style="margin:0 0 20px;color:#d8e4f0;font-size:16px;line-height:1.7;">
      Über <a href="${createAbsoluteUrl(
        "/kontakt",
      )}" style="color:#d8edf8;text-decoration:underline;">nachfass-profis.de</a> ist eine neue Anfrage eingegangen.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      ${renderFieldRow("Name", data.name)}
      ${renderFieldRow("Firma", data.company)}
      ${renderFieldRow("E-Mail", data.email)}
      ${renderFieldRow("Telefon", data.phone)}
      ${renderFieldRow("Angebotsvolumen", `${data.volumeLabel} · ${data.packageLabel}`)}
      ${renderFieldRow("Nachricht", data.message)}
    </table>
  `;

  const text = [
    "Neue Anfrage über nachfass-profis.de",
    "",
    `Name: ${data.name}`,
    `Firma: ${data.company}`,
    `E-Mail: ${data.email}`,
    `Telefon: ${data.phone || "—"}`,
    `Angebotsvolumen: ${data.volumeLabel} · ${data.packageLabel}`,
    `Nachricht: ${data.message || "—"}`,
  ].join("\n");

  return {
    subject: `Neue Anfrage von ${data.company}`,
    html: renderEmailShell({
      preview: `Neue Anfrage von ${data.company}`,
      title: "Neue Anfrage eingegangen",
      intro: `${data.name} von ${data.company} hat ein Erstgespräch angefragt.`,
      contentHtml,
      ctaLabel: "Kontaktseite öffnen",
      ctaUrl: createAbsoluteUrl("/kontakt"),
    }),
    text,
  };
}

function buildCustomerEmail(data) {
  const contentHtml = `
    <p style="margin:0 0 20px;color:#d8e4f0;font-size:16px;line-height:1.7;">
      danke für deine Anfrage. Wir haben dein monatliches Angebotsvolumen mit
      <strong style="color:#ffffff;">${escapeHtml(
        data.volumeLabel,
      )}</strong> eingeordnet. Aktuell passt dazu am ehesten
      <strong style="color:#ffffff;"> ${escapeHtml(data.packageLabel)}</strong>.
    </p>
    <div style="padding:18px 20px;border-radius:22px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
      <div style="margin:0 0 8px;color:#9fb0c4;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Was wir erhalten haben</div>
      <div style="color:#f5f7fb;font-size:16px;line-height:1.7;">
        <div><strong>Name:</strong> ${escapeHtml(data.name)}</div>
        <div><strong>Firma:</strong> ${escapeHtml(data.company)}</div>
        <div><strong>Angebotsvolumen:</strong> ${escapeHtml(data.volumeLabel)}</div>
        <div><strong>Nachricht:</strong> ${escapeHtml(data.message || "Keine zusätzliche Nachricht")}</div>
      </div>
    </div>
    <p style="margin:20px 0 0;color:#d8e4f0;font-size:16px;line-height:1.7;">
      Wir melden uns so schnell wie möglich bei dir zurück und schauen uns an,
      wie wir aus euren offenen Angeboten mehr verbindliche Rückmeldungen und
      mehr Abschlüsse herausholen können.
    </p>
  `;

  const text = [
    "Danke für deine Anfrage bei Nachfrass-Profis",
    "",
    `Name: ${data.name}`,
    `Firma: ${data.company}`,
    `Angebotsvolumen: ${data.volumeLabel}`,
    `Passende Einordnung: ${data.packageLabel}`,
    "",
    "Wir melden uns so schnell wie möglich bei dir zurück.",
  ].join("\n");

  return {
    subject: "Danke für deine Anfrage bei Nachfrass-Profis",
    html: renderEmailShell({
      preview: "Wir haben deine Anfrage erhalten.",
      title: "Danke für deine Anfrage",
      intro: "Deine Anfrage ist bei uns eingegangen und wird jetzt geprüft.",
      contentHtml,
      ctaLabel: "Website öffnen",
      ctaUrl: createAbsoluteUrl("/"),
    }),
    text,
  };
}

async function sendResendEmail(payload) {
  const response = await resend.emails.send(payload);

  if (response.error) {
    throw normalizeProviderError(response.error);
  }

  return response.data;
}

export async function POST(request) {
  if (!resend) {
    return NextResponse.json(
      {
        message:
          "Der E-Mail-Versand ist aktuell nicht verfügbar. Bitte versuche es in Kürze erneut.",
      },
      { status: 500 },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "Die Anfrage konnte nicht verarbeitet werden.",
      },
      { status: 400 },
    );
  }

  const name = cleanValue(payload?.name);
  const email = cleanValue(payload?.email);
  const company = cleanValue(payload?.company);
  const phone = cleanValue(payload?.phone);
  const message = cleanValue(payload?.message);
  const privacyAccepted = Boolean(payload?.privacyAccepted);
  const volumeOption = getVolumeOption(cleanValue(payload?.volume));

  if (!name || !email || !company || !volumeOption || !privacyAccepted) {
    return NextResponse.json(
      {
        message:
          "Bitte fülle alle Pflichtfelder aus und bestätige die Datenschutzerklärung.",
      },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        message: "Bitte gib eine gültige E-Mail-Adresse an.",
      },
      { status: 400 },
    );
  }

  const data = {
    name,
    email,
    company,
    phone,
    message,
    volumeLabel: volumeOption.label,
    packageLabel: volumeOption.packageLabel,
  };

  const adminMail = buildAdminEmail(data);
  const customerMail = buildCustomerEmail(data);

  try {
    const [adminResult, customerResult] = await Promise.all([
      sendResendEmail({
        from: fromEmail,
        to: [adminEmail],
        replyTo: email,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
      }),
      sendResendEmail({
        from: fromEmail,
        to: [email],
        replyTo: siteConfig.email,
        subject: customerMail.subject,
        html: customerMail.html,
        text: customerMail.text,
      }),
    ]);

    console.info("Resend mail send accepted", {
      adminEmailId: adminResult?.id || null,
      customerEmailId: customerResult?.id || null,
      adminEmail,
      customerEmail: email,
    });

    return NextResponse.json({
      ok: true,
      redirectTo: "/danke",
    });
  } catch (error) {
    const providerError = normalizeProviderError(error);

    console.error("Resend mail send failed", {
      providerError,
      fromEmail,
      adminEmail,
      customerEmail: email,
    });

    return NextResponse.json(
      {
        message: `${mapProviderErrorToUserMessage(providerError)} Technischer Hinweis: ${providerError.message}`,
        error: providerError,
      },
      { status: providerError.statusCode || 500 },
    );
  }
}
