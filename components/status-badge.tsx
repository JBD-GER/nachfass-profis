import { CASE_STATUS_LABELS, CASE_STATUS_TONES } from "@/lib/domain";
import type { CaseStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: CaseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`status-badge status-badge-${CASE_STATUS_TONES[status]}`}
    >
      {CASE_STATUS_LABELS[status]}
    </span>
  );
}
