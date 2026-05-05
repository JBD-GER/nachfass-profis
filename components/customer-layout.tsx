import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/domain";
import type { Profile } from "@/lib/types";

interface CustomerLayoutProps {
  profile: Profile;
  children: ReactNode;
}

const customerLinks = [
  { href: "/dashboard", label: "Meine Fälle" },
  { href: "/dashboard/upload", label: "Angebot hochladen" },
];

export function CustomerLayout({ profile, children }: CustomerLayoutProps) {
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <p className="portal-kicker">Nachfass-Profis</p>
          <h1>Kundenportal</h1>
        </div>

        <nav className="portal-nav">
          {customerLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="portal-user-card">
          <strong>{profile.full_name || profile.email || "Kunde"}</strong>
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
