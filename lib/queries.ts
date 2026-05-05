import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CaseDetailData,
  CaseFileRecord,
  CaseMessageRecord,
  CaseNotificationRecord,
  CaseNoteRecord,
  CaseRecord,
  CustomerDetailData,
  CustomerSummary,
  InboxMessageRecord,
  NotificationLogRecord,
  NotificationTemplateRecord,
  Profile,
} from "@/lib/types";

async function attachSignedUrls(files: CaseFileRecord[]) {
  if (files.length === 0) {
    return files;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage
    .from("offers")
    .createSignedUrls(files.map((file) => file.file_path), 60 * 60);

  if (!data) {
    return files.map((file) => ({ ...file, signed_url: null }));
  }

  return files.map((file, index) => ({
    ...file,
    signed_url: data[index]?.signedUrl ?? null,
  }));
}

async function attachProfileLogoUrls(profiles: Profile[]) {
  const files = profiles.filter((profile) => profile.logo_file_path);

  if (files.length === 0) {
    return profiles.map((profile) => ({
      ...profile,
      logo_signed_url: null,
    }));
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage
    .from("customer-assets")
    .createSignedUrls(
      files.map((profile) => profile.logo_file_path as string),
      60 * 60,
    );

  const urlMap = new Map<string, string | null>();
  files.forEach((profile, index) => {
    urlMap.set(profile.id, data?.[index]?.signedUrl ?? null);
  });

  return profiles.map((profile) => ({
    ...profile,
    logo_signed_url: urlMap.get(profile.id) ?? null,
  }));
}

export async function getDashboardCases() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as CaseRecord[];
}

export async function getAdminCases(status?: string, customerId?: string) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  const { data } = await query;
  return (data ?? []) as CaseRecord[];
}

export async function getCaseDetail(caseId: string): Promise<CaseDetailData | null> {
  const supabase = await createSupabaseServerClient();

  const { data: caseItem, error: caseError } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (caseError || !caseItem) {
    return null;
  }

  const [filesResult, notesResult, messagesResult, notificationsResult, logsResult] =
    await Promise.all([
      supabase
        .from("case_files")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("case_notes")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("case_messages")
        .select("*")
        .eq("case_id", caseId)
        .order("received_at", { ascending: false }),
      supabase
        .from("case_notifications")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true }),
      supabase
        .from("notification_logs")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
    ]);

  const files = await attachSignedUrls((filesResult.data ?? []) as CaseFileRecord[]);
  const notes = (notesResult.data ?? []) as CaseNoteRecord[];
  const messages = (messagesResult.data ?? []) as CaseMessageRecord[];
  const notifications = (notificationsResult.data ?? []) as CaseNotificationRecord[];
  const notificationLogs = (logsResult.data ?? []) as NotificationLogRecord[];

  const authorIds = Array.from(new Set(notes.map((note) => note.author_id)));
  const templateIds = Array.from(new Set(notifications.map((item) => item.template_id)));

  const [authorsResult, templatesResult] = await Promise.all([
    authorIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", authorIds)
      : Promise.resolve({ data: [], error: null }),
    templateIds.length
      ? supabase.from("notification_templates").select("*").in("id", templateIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const authorMap = new Map(
    ((authorsResult.data ?? []) as Array<Pick<Profile, "id" | "full_name" | "email">>).map(
      (author) => [author.id, author],
    ),
  );

  const templateMap = new Map(
    ((templatesResult.data ?? []) as NotificationTemplateRecord[]).map((template) => [
      template.id,
      template,
    ]),
  );

  return {
    caseItem: caseItem as CaseRecord,
    files,
    notes: notes.map((note) => ({
      ...note,
      author_name: authorMap.get(note.author_id)?.full_name ?? null,
      author_email: authorMap.get(note.author_id)?.email ?? null,
    })),
    messages,
    notifications: notifications.map((notification) => ({
      ...notification,
      template: templateMap.get(notification.template_id) ?? null,
    })),
    notificationLogs,
  };
}

export async function getAdminInbox(customerId?: string) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("inbox_messages")
    .select("*")
    .order("received_at", { ascending: false });

  if (customerId) {
    query = query.eq("customer_profile_id", customerId);
  }

  const { data } = await query;

  return (data ?? []) as InboxMessageRecord[];
}

export async function getCustomerSummaries() {
  const supabase = await createSupabaseServerClient();
  const [profilesResult, casesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false }),
    supabase.from("cases").select("customer_id, created_at"),
  ]);

  const profiles = await attachProfileLogoUrls((profilesResult.data ?? []) as Profile[]);
  const cases = (casesResult.data ?? []) as Array<
    Pick<CaseRecord, "customer_id" | "created_at">
  >;

  const grouped = new Map<string, { count: number; latest: string | null }>();

  for (const item of cases) {
    const current = grouped.get(item.customer_id) ?? { count: 0, latest: null };
    grouped.set(item.customer_id, {
      count: current.count + 1,
      latest:
        !current.latest || new Date(item.created_at) > new Date(current.latest)
          ? item.created_at
          : current.latest,
    });
  }

  return profiles.map(
    (profile): CustomerSummary => ({
      profile,
      case_count: grouped.get(profile.id)?.count ?? 0,
      latest_case_at: grouped.get(profile.id)?.latest ?? null,
    }),
  );
}

export async function getCustomerDetail(customerId: string): Promise<CustomerDetailData | null> {
  const supabase = await createSupabaseServerClient();

  const [{ data: profileData, error: profileError }, { data: casesData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .eq("role", "customer")
        .single(),
      supabase
        .from("cases")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false }),
    ]);

  if (profileError || !profileData) {
    return null;
  }

  const [profile] = await attachProfileLogoUrls([profileData as Profile]);

  return {
    profile,
    cases: (casesData ?? []) as CaseRecord[],
  };
}
