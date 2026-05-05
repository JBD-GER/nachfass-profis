import type { ReactNode } from "react";

import { AdminLayout as AdminShell } from "@/components/admin-layout";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const auth = await requireRole("admin");

  return <AdminShell profile={auth.profile}>{children}</AdminShell>;
}
