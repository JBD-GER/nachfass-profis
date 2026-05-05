"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { sanitizeFileName } from "@/lib/files";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LOGO_SIZE = 10 * 1024 * 1024;
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

function normalizeOptional(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeBoolean(value: FormDataEntryValue | null) {
  return String(value ?? "") === "on";
}

function revalidateCustomerPaths(customerId?: string | null) {
  revalidatePath("/admin/customers");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");

  if (customerId) {
    revalidatePath(`/admin/customers/${customerId}`);
    revalidatePath(`/admin?customer=${customerId}`);
    revalidatePath(`/admin/inbox?customer=${customerId}`);
  }
}

async function resolveCustomerFromCaseOrReference(caseId: string, subject: string) {
  const supabase = await createSupabaseServerClient();

  let resolvedCaseId = caseId;

  if (!resolvedCaseId) {
    const match = subject.match(CASE_REFERENCE_PATTERN);

    if (match) {
      const { data } = await supabase
        .from("cases")
        .select("id")
        .eq("case_reference", match[1].toUpperCase())
        .single();

      resolvedCaseId = data?.id ?? "";
    }
  }

  if (!resolvedCaseId) {
    return {
      caseId: null,
      customerId: null,
      customerProfile: null,
    };
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("id, customer_id")
    .eq("id", resolvedCaseId)
    .single();

  if (!caseData) {
    return {
      caseId: null,
      customerId: null,
      customerProfile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", caseData.customer_id)
    .single();

  return {
    caseId: caseData.id,
    customerId: caseData.customer_id,
    customerProfile: (profile as Profile | null) ?? null,
  };
}

export async function createCustomerAction(formData: FormData) {
  await requireRole("admin");

  const companyName = String(formData.get("company_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const phone = normalizeOptional(formData.get("phone"));
  const street = normalizeOptional(formData.get("street"));
  const postalCode = normalizeOptional(formData.get("postal_code"));
  const city = normalizeOptional(formData.get("city"));
  const country = String(formData.get("country") ?? "DE").trim() || "DE";
  const mailboxEmail = normalizeOptional(formData.get("mailbox_email"))?.toLowerCase() ?? null;
  const mailboxDisplayName =
    normalizeOptional(formData.get("mailbox_display_name")) ?? companyName;
  const mailboxSignature = normalizeOptional(formData.get("mailbox_signature"));
  const mailboxIsActive = normalizeBoolean(formData.get("mailbox_is_active"));
  const logo = formData.get("logo");

  if (!companyName || !fullName || !email || !password) {
    redirect(
      buildRedirect("/admin/customers", {
        error: "Bitte Firma, Ansprechpartner, Portal-E-Mail und Passwort ausfüllen.",
      }),
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    redirect(
      buildRedirect("/admin/customers", {
        error: "Bitte eine gültige Portal-E-Mail angeben.",
      }),
    );
  }

  if (password.length < 8) {
    redirect(
      buildRedirect("/admin/customers", {
        error: "Das Initialpasswort muss mindestens 8 Zeichen lang sein.",
      }),
    );
  }

  if (mailboxEmail && !EMAIL_PATTERN.test(mailboxEmail)) {
    redirect(
      buildRedirect("/admin/customers", {
        error: "Bitte eine gültige Mailbox-E-Mail-Adresse angeben.",
      }),
    );
  }

  if (mailboxIsActive && !mailboxEmail) {
    redirect(
      buildRedirect("/admin/customers", {
        error: "Eine aktive Mailbox benötigt eine E-Mail-Adresse.",
      }),
    );
  }

  const hasLogo = logo instanceof File && logo.size > 0;

  if (hasLogo && logo.size > MAX_LOGO_SIZE) {
    redirect(
      buildRedirect("/admin/customers", {
        error: "Das Logo überschreitet das Limit von 10 MB.",
      }),
    );
  }

  const adminClient = createSupabaseAdminClient();
  const { data: createdUser, error: createUserError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  if (createUserError || !createdUser.user) {
    redirect(
      buildRedirect("/admin/customers", {
        error: createUserError?.message || "Kunde konnte nicht angelegt werden.",
      }),
    );
  }

  let logoPath: string | null = null;

  try {
    if (hasLogo) {
      const safeName = sanitizeFileName(logo.name) || "logo";
      logoPath = `${createdUser.user.id}/logo-${crypto.randomUUID()}-${safeName}`;
      const buffer = Buffer.from(await logo.arrayBuffer());

      const { error: uploadError } = await adminClient.storage
        .from("customer-assets")
        .upload(logoPath, buffer, {
          contentType: logo.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }
    }

    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: createdUser.user.id,
        role: "customer",
        full_name: fullName,
        email,
        phone,
        company_name: companyName,
        street,
        postal_code: postalCode,
        city,
        country,
        logo_file_path: logoPath,
        mailbox_email: mailboxEmail,
        mailbox_display_name: mailboxDisplayName,
        mailbox_signature: mailboxSignature,
        mailbox_is_active: mailboxIsActive,
      },
      {
        onConflict: "id",
      },
    );

    if (profileError) {
      throw new Error(profileError.message);
    }
  } catch (error) {
    if (logoPath) {
      await adminClient.storage.from("customer-assets").remove([logoPath]);
    }

    await adminClient.auth.admin.deleteUser(createdUser.user.id);

    redirect(
      buildRedirect("/admin/customers", {
        error:
          error instanceof Error
            ? error.message
            : "Kunde konnte nicht vollständig angelegt werden.",
      }),
    );
  }

  revalidateCustomerPaths(createdUser.user.id);
  redirect(
    buildRedirect(`/admin/customers/${createdUser.user.id}`, {
      success: "Kunde angelegt und Portalzugang erstellt.",
    }),
  );
}

export async function updateCustomerAction(formData: FormData) {
  await requireRole("admin");
  const adminClient = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();

  const customerId = String(formData.get("customer_id") ?? "").trim();
  const companyName = String(formData.get("company_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = normalizeOptional(formData.get("phone"));
  const street = normalizeOptional(formData.get("street"));
  const postalCode = normalizeOptional(formData.get("postal_code"));
  const city = normalizeOptional(formData.get("city"));
  const country = String(formData.get("country") ?? "DE").trim() || "DE";
  const mailboxEmail = normalizeOptional(formData.get("mailbox_email"))?.toLowerCase() ?? null;
  const mailboxDisplayName =
    normalizeOptional(formData.get("mailbox_display_name")) ?? companyName;
  const mailboxSignature = normalizeOptional(formData.get("mailbox_signature"));
  const mailboxIsActive = normalizeBoolean(formData.get("mailbox_is_active"));
  const returnTo = normalizePath(
    String(formData.get("return_to") ?? ""),
    `/admin/customers/${customerId}`,
  );
  const logo = formData.get("logo");

  if (!customerId || !companyName || !fullName) {
    redirect(buildRedirect(returnTo, { error: "Bitte Firma und Ansprechpartner angeben." }));
  }

  if (mailboxEmail && !EMAIL_PATTERN.test(mailboxEmail)) {
    redirect(buildRedirect(returnTo, { error: "Mailbox-E-Mail ist ungültig." }));
  }

  if (mailboxIsActive && !mailboxEmail) {
    redirect(
      buildRedirect(returnTo, {
        error: "Eine aktive Mailbox benötigt eine E-Mail-Adresse.",
      }),
    );
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("logo_file_path")
    .eq("id", customerId)
    .single();

  let logoPath =
    (existingProfile as Pick<Profile, "logo_file_path"> | null)?.logo_file_path ?? null;
  const oldLogoPath = logoPath;
  const hasLogo = logo instanceof File && logo.size > 0;

  if (hasLogo) {
    if (logo.size > MAX_LOGO_SIZE) {
      redirect(buildRedirect(returnTo, { error: "Das Logo überschreitet 10 MB." }));
    }

    const safeName = sanitizeFileName(logo.name) || "logo";
    logoPath = `${customerId}/logo-${crypto.randomUUID()}-${safeName}`;
    const buffer = Buffer.from(await logo.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from("customer-assets")
      .upload(logoPath, buffer, {
        contentType: logo.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      redirect(buildRedirect(returnTo, { error: uploadError.message }));
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      company_name: companyName,
      street,
      postal_code: postalCode,
      city,
      country,
      logo_file_path: logoPath,
      mailbox_email: mailboxEmail,
      mailbox_display_name: mailboxDisplayName,
      mailbox_signature: mailboxSignature,
      mailbox_is_active: mailboxIsActive,
    })
    .eq("id", customerId);

  if (updateError) {
    if (hasLogo && logoPath && logoPath !== oldLogoPath) {
      await adminClient.storage.from("customer-assets").remove([logoPath]);
    }

    redirect(buildRedirect(returnTo, { error: updateError.message }));
  }

  if (hasLogo && oldLogoPath && oldLogoPath !== logoPath) {
    await adminClient.storage.from("customer-assets").remove([oldLogoPath]);
  }

  revalidateCustomerPaths(customerId);
  redirect(buildRedirect(returnTo, { success: "Kundendaten aktualisiert." }));
}

export async function composeCustomerMailboxMessageAction(formData: FormData) {
  const auth = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const customerId = String(formData.get("customer_profile_id") ?? "").trim();
  const caseId = String(formData.get("case_id") ?? "").trim();
  const recipientEmail = String(formData.get("recipient_email") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin/inbox");

  if (!customerId || !recipientEmail || !subject || !body || !EMAIL_PATTERN.test(recipientEmail)) {
    redirect(
      buildRedirect(returnTo, {
        error: "Bitte Kunde, Empfänger, Betreff und Nachricht korrekt angeben.",
      }),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", customerId)
    .eq("role", "customer")
    .single();

  const customerProfile = profile as Profile | null;

  if (!customerProfile) {
    redirect(buildRedirect(returnTo, { error: "Kunde nicht gefunden." }));
  }

  if (!customerProfile.mailbox_is_active || !customerProfile.mailbox_email) {
    redirect(
      buildRedirect(returnTo, {
        error: "Für diesen Kunden ist noch keine aktive Mailbox hinterlegt.",
      }),
    );
  }

  const finalBody = customerProfile.mailbox_signature
    ? `${body}\n\n${customerProfile.mailbox_signature}`
    : body;

  const { error } = await supabase.rpc("process_customer_mailbox_message", {
    p_customer_profile_id: customerId,
    p_sender_email: customerProfile.mailbox_email,
    p_recipient_email: recipientEmail,
    p_subject: subject,
    p_body: finalBody,
    p_case_id: caseId || null,
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

  revalidateCustomerPaths(customerId);

  if (caseId) {
    revalidatePath(`/admin/cases/${caseId}`);
  }

  redirect(buildRedirect(returnTo, { success: "Nachricht im Kundenpostfach gespeichert." }));
}

export async function processCustomerInboundMessageAction(formData: FormData) {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const senderEmail = String(formData.get("sender_email") ?? "").trim().toLowerCase();
  const senderName = normalizeOptional(formData.get("sender_name"));
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const suppliedCaseId = String(formData.get("case_id") ?? "").trim();
  const suppliedCustomerId = String(formData.get("customer_profile_id") ?? "").trim();
  const returnTo = normalizePath(String(formData.get("return_to") ?? ""), "/admin/inbox");

  if (!senderEmail || !subject || !body || !EMAIL_PATTERN.test(senderEmail)) {
    redirect(
      buildRedirect(returnTo, {
        error: "Bitte Absender, Betreff und Nachricht korrekt eingeben.",
      }),
    );
  }

  let caseId = suppliedCaseId || null;
  let customerId = suppliedCustomerId || null;
  let customerProfile: Profile | null = null;

  if (!caseId || !customerId) {
    const resolved = await resolveCustomerFromCaseOrReference(suppliedCaseId, subject);
    caseId = caseId || resolved.caseId;
    customerId = customerId || resolved.customerId;
    customerProfile = resolved.customerProfile;
  }

  if (customerId && !customerProfile) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", customerId)
      .eq("role", "customer")
      .single();

    customerProfile = (profile as Profile | null) ?? null;
  }

  if (customerId && customerProfile) {
    const { error } = await supabase.rpc("process_customer_mailbox_message", {
      p_customer_profile_id: customerId,
      p_sender_email: senderEmail,
      p_recipient_email: customerProfile.mailbox_email || null,
      p_subject: subject,
      p_body: body,
      p_case_id: caseId,
      p_sender_name: senderName,
      p_direction: "inbound",
      p_mailbox_email: customerProfile.mailbox_email || null,
    });

    if (error) {
      redirect(buildRedirect(returnTo, { error: error.message }));
    }

    revalidateCustomerPaths(customerId);

    if (caseId) {
      revalidatePath(`/admin/cases/${caseId}`);
    }

    redirect(
      buildRedirect(returnTo, {
        success: caseId
          ? "Eingehende Nachricht dem Kunden und Fall zugeordnet."
          : "Eingehende Nachricht dem Kundenpostfach zugeordnet.",
      }),
    );
  }

  const { error } = await supabase.from("inbox_messages").insert({
    sender_email: senderEmail,
    sender_name: senderName,
    subject,
    body,
    direction: "inbound",
  });

  if (error) {
    redirect(buildRedirect(returnTo, { error: error.message }));
  }

  revalidatePath("/admin/inbox");
  redirect(
    buildRedirect(returnTo, {
      success: "Eingehende Nachricht im allgemeinen Postfach gespeichert.",
    }),
  );
}
