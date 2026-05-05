import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/domain";
import type { Profile } from "@/lib/types";

interface AdminLayoutProps {
  profile: Profile;
  children: ReactNode;
}

const adminLinks = [
  { href: "/admin", label: "Fälle" },
  { href: "/admin/inbox", label: "Postfach" },
  { href: "/admin/customers", label: "Kunden" },
];

export function AdminLayout({ profile, children }: AdminLayoutProps) {
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <p className="portal-kicker">Nachfass-Profis</p>
          <h1>Admin Console</h1>
        </div>

        <nav className="portal-nav">
          {adminLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="portal-user-card">
          <strong>{profile.full_name || profile.email || "Admin"}</strong>
          <span>{ROLE_LABELS[profile.role]}</span>
        </div>

        <form action={signOutAction}>
          <button className="portal-button portal-button-ghost portal-button-full" type="submit">
            Abmelden
          </button>
        </form>
      </aside>

      <div className="portal-main">{children}</div>
    </div>
  );
}
