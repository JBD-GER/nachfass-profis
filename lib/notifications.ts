import { CASE_STATUS_LABELS } from "@/lib/domain";
import type { CaseNotificationRecord, CaseRecord, NotificationTemplateRecord } from "@/lib/types";

interface RenderContext {
  caseItem: CaseRecord;
}

function fillTemplate(template: string, context: RenderContext) {
  return template
    .replaceAll("{{customer_name}}", context.caseItem.customer_name)
    .replaceAll("{{customer_email}}", context.caseItem.customer_email)
    .replaceAll("{{customer_phone}}", context.caseItem.customer_phone)
    .replaceAll("{{case_reference}}", context.caseItem.case_reference)
    .replaceAll("{{status}}", context.caseItem.status)
    .replaceAll(
      "{{status_label}}",
      CASE_STATUS_LABELS[context.caseItem.status] ?? context.caseItem.status,
    )
    .replaceAll("{{initial_note}}", context.caseItem.initial_note ?? "");
}

export function buildNotificationContent(
  notification: CaseNotificationRecord,
  template: NotificationTemplateRecord | null | undefined,
  caseItem: CaseRecord,
) {
  const subjectSource =
    notification.subject_override?.trim() || template?.subject_template || "Update zu Ihrem Fall";
  const bodySource =
    notification.body_override?.trim() ||
    template?.body_template ||
    "Es gibt ein Update zu Ihrem Fall.";

  return {
    subject: fillTemplate(subjectSource, { caseItem }),
    body: fillTemplate(bodySource, { caseItem }),
  };
}
