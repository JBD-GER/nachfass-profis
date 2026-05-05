export type UserRole = "admin" | "customer";

export type CaseStatus =
  | "eingegangen"
  | "rueckfrage"
  | "abgeschlossen"
  | "abgelehnt";

export type NoteVisibility = "internal" | "customer_visible";

export type MessageDirection = "inbound" | "outbound";

export type NotificationDeliveryStatus = "queued" | "sent" | "failed";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  logo_file_path: string | null;
  mailbox_email: string | null;
  mailbox_display_name: string | null;
  mailbox_signature: string | null;
  mailbox_provider: string;
  mailbox_is_active: boolean;
  created_at: string;
  updated_at: string;
  logo_signed_url?: string | null;
}

export interface CaseRecord {
  id: string;
  case_reference: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: CaseStatus;
  email_contact_attempts: number;
  phone_contact_attempts: number;
  initial_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseFileRecord {
  id: string;
  case_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number;
  created_at: string;
  signed_url?: string | null;
}

export interface CaseNoteRecord {
  id: string;
  case_id: string;
  author_id: string;
  body: string;
  visibility: NoteVisibility;
  created_at: string;
}

export interface InboxMessageRecord {
  id: string;
  case_id: string | null;
  customer_profile_id: string | null;
  sender_email: string;
  sender_name: string | null;
  recipient_email: string | null;
  mailbox_email: string | null;
  subject: string;
  body: string;
  received_at: string;
  direction: MessageDirection;
  read_at: string | null;
  created_at: string;
}

export interface CaseMessageRecord {
  id: string;
  case_id: string;
  customer_profile_id: string | null;
  inbox_message_id: string | null;
  sender_user_id: string | null;
  sender_email: string;
  sender_name: string | null;
  recipient_email: string | null;
  mailbox_email: string | null;
  subject: string;
  body: string;
  received_at: string;
  direction: MessageDirection;
  read_at: string | null;
  created_at: string;
}

export interface NotificationTemplateRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subject_template: string;
  body_template: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseNotificationRecord {
  id: string;
  case_id: string;
  template_id: string;
  recipient_email: string;
  subject_override: string | null;
  body_override: string | null;
  is_enabled: boolean;
  metadata: Record<string, unknown>;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
  template?: NotificationTemplateRecord | null;
}

export interface NotificationLogRecord {
  id: string;
  case_id: string;
  case_notification_id: string | null;
  template_id: string | null;
  created_by: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  provider: string;
  provider_message_id: string | null;
  status: NotificationDeliveryStatus;
  error_message: string | null;
  created_at: string;
}

export interface AuthContext {
  userId: string;
  email: string | null;
  profile: Profile;
}

export interface CustomerSummary {
  profile: Profile;
  case_count: number;
  latest_case_at: string | null;
}

export interface CustomerDetailData {
  profile: Profile;
  cases: CaseRecord[];
}

export interface CaseDetailData {
  caseItem: CaseRecord;
  files: CaseFileRecord[];
  notes: Array<
    CaseNoteRecord & {
      author_name: string | null;
      author_email: string | null;
    }
  >;
  messages: CaseMessageRecord[];
  notifications: CaseNotificationRecord[];
  notificationLogs: NotificationLogRecord[];
}
