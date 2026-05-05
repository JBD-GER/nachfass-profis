import type { CaseStatus, UserRole } from "@/lib/types";

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  eingegangen: "Eingegangen",
  rueckfrage: "Rückfrage",
  abgeschlossen: "Abgeschlossen",
  abgelehnt: "Abgelehnt",
};

export const CASE_STATUS_TONES: Record<CaseStatus, string> = {
  eingegangen: "info",
  rueckfrage: "warning",
  abgeschlossen: "success",
  abgelehnt: "danger",
};

export const CASE_STATUS_OPTIONS = Object.entries(CASE_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as CaseStatus,
    label,
  }),
);

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  customer: "Kunde",
};

export const NOTIFICATION_SENDER_NAME = "Nachfass-Profis";
export const NOTIFICATION_FALLBACK_SENDER = "noreply@nachfass-profis.local";

export function getDefaultAppPath(role: UserRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}

export function isPortalRoute(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login")
  );
}
