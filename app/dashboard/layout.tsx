import type { ReactNode } from "react";

import { CustomerLayout as CustomerShell } from "@/components/customer-layout";
import { requireRole } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const auth = await requireRole("customer");

  return <CustomerShell profile={auth.profile}>{children}</CustomerShell>;
}
