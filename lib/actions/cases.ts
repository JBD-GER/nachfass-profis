"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthContext, requireRole } from "@/lib/auth";
import { buildNotificationContent } from "@/lib/notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/files";
import type {
  CaseNotificationRecord,
  CaseRecord,
  CaseStatus,
  NoteVisibility,
  NotificationTemplateRecord,
} from "@/lib/types";

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CASE_REFERENCE_PATTERN = /(NP-[A-Z0-9]{8})/i;

function buildRedirect(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://localhost");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return `${url.pathname}${url.search}`;
}

function normalizePath(pathname: string | null | undefined, fallback: string) {
  if (!pathname) {
    return fallback;
  }

  return pathname.split("?")[0] || fallback;
}

function isCaseStatus(value: string): value is CaseStatus {
  return ["eingegangen", "rueckfrage", "abgeschlossen", "abgelehnt"].includes(value);
}

function isNoteVisibility(value: string): value is NoteVisibility {
  return ["internal", "customer_visible"].includes(value);
}

async function resolveCaseId(
  suppliedCaseId: string,
  subject: string,
): Promise<string | null> {
  if (suppliedCaseId) {
    return suppliedCaseId;
  }

  const match = subject.match(CASE_REFERENCE_PATTERN);

  if (!match) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cases")
    .select("id")
    .eq("case_reference", match[1].toUpperCase())
    .single();

  return (data as Pick<CaseRecord, "id"> | null)?.id ?? null;
}

function revalidateCasePages(caseId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/customers");
  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath(`/admin/cases/${caseId}`);
}

export async function createCaseUploadAction(formData: FormData) {
  const auth = await requireRole("customer");
  const supabase = await createSupabaseServerClient();

  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim().toLowerCase();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const initialNote = String(formData.get("initial_note") ?? "").trim();
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!customerName || !customerEmail || !customerPhone || files.length === 0) {
    redirect(
      buildRedirect("/dashboard/upload", {
        error: "Bitte Kontaktdaten ausfüllen und mindestens eine Datei hochladen.",
      }),
    );
  }

  if (!EMAIL_PATTERN.test(customerEmail)) {
    redirect(
      buildRedirect("/dashboard/upload", {
        error: "Bitte eine gültige E-Mail-Adresse angeben.",
      }),
    );
  }

  for (const file of files) {
    if (file.size > MAX_UPLOAD_SIZE) {
      redirect(
        buildRedirect("/dashboard/upload", {
          error: `Die Datei ${file.name} überschreitet das Upload-Limit von 50 MB.`,
        }),
      );
    }
  }

  const caseId = crypto.randomUUID();
  const uploadedPaths: string[] = [];

  const { error: caseInsertError } = await supabase.from("cases").insert({
    id: caseId,
    customer_id: auth.userId,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    initial_note: initialNote || null,
  });

  if (caseInsertError) {
    redirect(
      buildRedirect("/dashboard/upload", {
        error: caseInsertError.message,
      }),
    );
  }

  try {
    for (const file of files) {
      const safeName = sanitizeFileName(file.name) || "angebot";
      const storagePath = `${auth.userId}/${caseId}/${crypto.randomUUID()}-${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage.from("offers").upload(storagePath, buffer, {
        contentType: file.type || undefined,
        upsert: false,
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      uploadedPaths.push(storagePath);

      const { error: fileInsertError } = await supabase.from("case_files").insert({
        case_id: caseId,
        uploaded_by: auth.userId,
        file_name: file.name,
        file_path: storagePath,
        file_type: file.type || null,
        file_size: file.size,
      });

      if (fileInsertError) {
        throw new Error(fileInsertError.message);
      }
    }
  } catch (error) {
    const adminClient = createSupabaseAdminClient();

    if (uploadedPaths.length > 0) {
      await adminClient.storage.from("offers").remove(uploadedPaths);
    }

    await adminClient.from("case_files").delete().eq("case_id", caseId);
    await adminClient.from("cases").delete().eq("id", caseId);

    redirect(
      buildRedirect("/dashboard/upload", {
        error:
          error instanceof Error
            ? error.message
            : "Der Upload konnte nicht abgeschlossen werden.",
      }),
    );
  }

  revalidateCasePages(caseId);
  redirect(
    buildRedirect(`/dashboard/cases/${caseId}`, {
      success: "Angebot erfolgreich hochgeladen.",
    }),
  );
}

export async function changeCaseStatusAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const caseId = String(formData.get("case_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin");

  if (!caseId || !isCaseStatus(status)) {
    redirect(buildRedirect(returnTo, { error: "Ungültiger Statuswechsel." }));
  }

  const { error } = await supabase.from("cases").update({ status }).eq("id", caseId);

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  revalidateCasePages(caseId);
  redirect(buildRedirect(returnTo, { success: "Status aktualisiert." }));
}

export async function adjustContactAttemptsAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const caseId = String(formData.get("case_id") ?? "").trim();
  const field = String(formData.get("field") ?? "").trim();
  const delta = Number(formData.get("delta") ?? 0);
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin");

  if (!caseId || !["email", "phone"].includes(field) || Number.isNaN(delta)) {
    redirect(buildRedirect(returnTo, { error: "Ungültige Kontaktanpassung." }));
  }

  const { error } = await supabase.rpc("adjust_case_contact_attempts", {
    p_case_id: caseId,
    p_email_delta: field === "email" ? delta : 0,
    p_phone_delta: field === "phone" ? delta : 0,
  });

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  revalidateCasePages(caseId);
  redirect(buildRedirect(returnTo, { success: "Kontaktversuche aktualisiert." }));
}

export async function createNoteAction(formData: FormData) {
  const auth = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const caseId = String(formData.get("case_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "").trim();
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin");

  if (!caseId || !body || !isNoteVisibility(visibility)) {
    redirect(buildRedirect(returnTo, { error: "Bitte eine gültige Notiz anlegen." }));
  }

  const { error } = await supabase.from("case_notes").insert({
    case_id: caseId,
    author_id: auth.userId,
    body,
    visibility,
  });

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  revalidateCasePages(caseId);
  redirect(buildRedirect(returnTo, { success: "Notiz gespeichert." }));
}

export async function createManualCaseMessageAction(formData: FormData) {
  const auth = await requireAuthContext();

  if (auth.profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const caseId = String(formData.get("case_id") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin/inbox");

  if (!caseId || !subject || !body) {
    redirect(buildRedirect(returnTo, { error: "Bitte Betreff und Nachricht ausfüllen." }));
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, customer_id, customer_email")
    .eq("id", caseId)
    .single();

  if (!caseData) {
    redirect(buildRedirect(returnTo, { error: "Fall wurde nicht gefunden." }));
  }

  const { data: customerProfile } = await supabase
    .from("profiles")
    .select("id, company_name, full_name, mailbox_email, mailbox_display_name, mailbox_signature, mailbox_is_active")
    .eq("id", caseData.customer_id)
    .single();

  if (!customerProfile?.mailbox_is_active || !customerProfile?.mailbox_email) {
    redirect(
      buildRedirect(returnTo, {
        error: "Für diesen Kunden ist keine aktive Mailbox hinterlegt.",
      }),
    );
  }

  const finalBody = customerProfile.mailbox_signature
    ? `${body}\n\n${customerProfile.mailbox_signature}`
    : body;

  const { error } = await supabase.rpc("process_customer_mailbox_message", {
    p_customer_profile_id: caseData.customer_id,
    p_sender_email: customerProfile.mailbox_email,
    p_recipient_email: caseData.customer_email,
    p_subject: subject,
    p_body: finalBody,
    p_case_id: caseId,
    p_sender_name:
      customerProfile.mailbox_display_name ||
      customerProfile.company_name ||
      customerProfile.full_name ||
      "Nachfass-Profis",
    p_direction: "outbound",
    p_sender_user_id: auth.userId,
    p_mailbox_email: customerProfile.mailbox_email,
  });

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  revalidateCasePages(caseId);
  redirect(buildRedirect(returnTo, { success: "Nachricht im Fallverlauf gespeichert." }));
}

export async function saveCaseNotificationAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const notificationId = String(formData.get("notification_id") ?? "").trim();
  const caseId = String(formData.get("case_id") ?? "").trim();
  const recipientEmail = String(formData.get("recipient_email") ?? "").trim().toLowerCase();
  const subjectOverride = String(formData.get("subject_override") ?? "").trim();
  const bodyOverride = String(formData.get("body_override") ?? "").trim();
  const isEnabled = String(formData.get("is_enabled") ?? "") === "on";
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin");

  if (!notificationId || !caseId || !recipientEmail || !EMAIL_PATTERN.test(recipientEmail)) {
    redirect(
      buildRedirect(returnTo, {
        error: "Bitte eine gültige Empfänger-E-Mail für die Benachrichtigung angeben.",
      }),
    );
  }

  const { error } = await supabase
    .from("case_notifications")
    .update({
      recipient_email: recipientEmail,
      subject_override: subjectOverride || null,
      body_override: bodyOverride || null,
      is_enabled: isEnabled,
    })
    .eq("id", notificationId);

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  revalidateCasePages(caseId);
  redirect(buildRedirect(returnTo, { success: "Benachrichtigung aktualisiert." }));
}

export async function sendMockNotificationAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const notificationId = String(formData.get("notification_id") ?? "").trim();
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin");

  if (!notificationId) {
    redirect(buildRedirect(returnTo, { error: "Benachrichtigung konnte nicht zugeordnet werden." }));
  }

  const { data: notification, error: notificationError } = await supabase
    .from("case_notifications")
    .select("*")
    .eq("id", notificationId)
    .single();

  if (notificationError || !notification) {
    redirect(buildRedirect(returnTo, { error: "Benachrichtigung nicht gefunden." }));
  }

  const caseNotification = notification as CaseNotificationRecord;

  if (!caseNotification.is_enabled) {
    redirect(buildRedirect(returnTo, { error: "Diese Benachrichtigung ist deaktiviert." }));
  }

  const [{ data: caseData }, { data: templateData }] = await Promise.all([
    supabase.from("cases").select("*").eq("id", caseNotification.case_id).single(),
    supabase
      .from("notification_templates")
      .select("*")
      .eq("id", caseNotification.template_id)
      .single(),
  ]);

  if (!caseData) {
    redirect(buildRedirect(returnTo, { error: "Fall für Benachrichtigung nicht gefunden." }));
  }

  const content = buildNotificationContent(
    caseNotification,
    (templateData as NotificationTemplateRecord | null) ?? null,
    caseData as CaseRecord,
  );

  const { error } = await supabase.rpc("record_notification_dispatch", {
    p_case_notification_id: notificationId,
    p_subject: content.subject,
    p_body: content.body,
    p_provider: "mock",
    p_status: "sent",
  });

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  revalidateCasePages(caseNotification.case_id);
  redirect(buildRedirect(returnTo, { success: "Mock-Benachrichtigung versendet." }));
}

export async function processMockInboundMessageAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const senderEmail = String(formData.get("sender_email") ?? "").trim().toLowerCase();
  const senderName = String(formData.get("sender_name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const suppliedCaseId = String(formData.get("case_id") ?? "").trim();
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin/inbox");

  if (!senderEmail || !subject || !body || !EMAIL_PATTERN.test(senderEmail)) {
    redirect(
      buildRedirect(returnTo, {
        error: "Bitte Absender, Betreff und Nachricht korrekt eingeben.",
      }),
    );
  }

  const resolvedCaseId = await resolveCaseId(suppliedCaseId, subject);

  const { error } = await supabase.rpc("process_case_message", {
    p_case_id: resolvedCaseId,
    p_sender_email: senderEmail,
    p_sender_name: senderName || null,
    p_subject: subject,
    p_body: body,
    p_direction: "inbound",
  });

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  if (resolvedCaseId) {
    revalidateCasePages(resolvedCaseId);
  } else {
    revalidatePath("/admin/inbox");
  }

  redirect(
    buildRedirect(returnTo, {
      success: resolvedCaseId
        ? "Eingehende Nachricht gespeichert und dem Fall zugeordnet."
        : "Eingehende Nachricht im allgemeinen Postfach gespeichert.",
    }),
  );
}
