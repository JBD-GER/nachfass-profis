import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import type { CaseRecord } from "@/lib/types";

import { StatusBadge } from "@/components/status-badge";

interface CaseTableProps {
  cases: CaseRecord[];
  basePath: string;
  showCustomer?: boolean;
}

export function CaseTable({
  cases,
  basePath,
  showCustomer = false,
}: CaseTableProps) {
  if (cases.length === 0) {
    return (
      <div className="portal-card empty-state">
        <h3>Keine Fälle gefunden</h3>
        <p>Für die aktuelle Auswahl sind noch keine Fälle vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="portal-table-shell portal-card">
      <table className="portal-table">
        <thead>
          <tr>
            <th>Fall</th>
            {showCustomer ? <th>Kunde</th> : null}
            <th>Status</th>
            <th>Kontakt</th>
            <th>Aktualisiert</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem) => (
            <tr key={caseItem.id}>
              <td>
                <strong>{caseItem.case_reference}</strong>
                <span>{caseItem.customer_email}</span>
              </td>
              {showCustomer ? (
                <td>
                  <strong>{caseItem.customer_name}</strong>
                  <span>{caseItem.customer_phone}</span>
                </td>
              ) : null}
              <td>
                <StatusBadge status={caseItem.status} />
              </td>
              <td>
                <strong>E-Mail: {caseItem.email_contact_attempts}</strong>
                <span>Telefon: {caseItem.phone_contact_attempts}</span>
              </td>
              <td>{formatDateTime(caseItem.updated_at)}</td>
              <td className="portal-table-action">
                <Link className="table-link" href={`${basePath}/${caseItem.id}`}>
                  Öffnen
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
