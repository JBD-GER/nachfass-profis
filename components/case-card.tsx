import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import type { CaseRecord } from "@/lib/types";

import { StatusBadge } from "@/components/status-badge";

interface CaseCardProps {
  caseItem: CaseRecord;
  href: string;
}

export function CaseCard({ caseItem, href }: CaseCardProps) {
  return (
    <Link className="portal-card case-card" href={href}>
      <div className="case-card-head">
        <div>
          <p className="portal-kicker">{caseItem.case_reference}</p>
          <h3>{caseItem.customer_name}</h3>
        </div>
        <StatusBadge status={caseItem.status} />
      </div>

      <dl className="case-card-grid">
        <div>
          <dt>E-Mail</dt>
          <dd>{caseItem.customer_email}</dd>
        </div>
        <div>
          <dt>Telefon</dt>
          <dd>{caseItem.customer_phone}</dd>
        </div>
        <div>
          <dt>E-Mail-Versuche</dt>
          <dd>{caseItem.email_contact_attempts}</dd>
        </div>
        <div>
          <dt>Telefon-Versuche</dt>
          <dd>{caseItem.phone_contact_attempts}</dd>
        </div>
      </dl>

      <p className="case-card-meta">
        Erstellt am {formatDateTime(caseItem.created_at)}
      </p>
    </Link>
  );
}
