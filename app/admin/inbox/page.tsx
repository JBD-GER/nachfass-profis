import { InboxList } from "@/components/inbox-list";
import { StatusNotice } from "@/components/status-notice";
import {
  composeCustomerMailboxMessageAction,
  processCustomerInboundMessageAction,
} from "@/lib/actions/customers";
import { getAdminCases, getAdminInbox, getCustomerSummaries } from "@/lib/queries";

interface AdminInboxPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminInboxPage({
  searchParams,
}: AdminInboxPageProps) {
  const params = await searchParams;
  const selectedCustomerId = readParam(params.customer);
  const [messages, customers, cases] = await Promise.all([
    getAdminInbox(selectedCustomerId),
    getCustomerSummaries(),
    getAdminCases(undefined, selectedCustomerId),
  ]);

  const selectedCustomer = customers.find(
    (customer) => customer.profile.id === selectedCustomerId,
  );

  return (
    <div className="portal-page">
      <header className="portal-page-header">
        <div>
          <p className="portal-kicker">Inbox</p>
          <h1>
            {selectedCustomer
              ? `Postfach: ${selectedCustomer.profile.company_name || selectedCustomer.profile.full_name || "Kunde"}`
              : "Allgemeines Admin-Postfach"}
          </h1>
          <p>
            Alle eingehenden und ausgehenden Nachrichten laufen hier zusammen.
            Über den Kundenfilter wechseln Sie zwischen Gesamtansicht und
            kundenspezifischem Postfach.
          </p>
        </div>
      </header>

      <StatusNotice message={readParam(params.success)} tone="success" />
      <StatusNotice message={readParam(params.error)} tone="error" />

      <InboxList
        composeAction={composeCustomerMailboxMessageAction}
        customers={customers}
        inboundAction={processCustomerInboundMessageAction}
        messages={messages}
        selectedCustomerId={selectedCustomerId ?? null}
        cases={cases}
      />
    </div>
  );
}
