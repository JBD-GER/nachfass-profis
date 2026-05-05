"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ClientEffects } from "@/components/client-effects";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isPortalRoute } from "@/lib/domain";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPortal = isPortalRoute(pathname);

  if (isPortal) {
    return (
      <>
        <div className="portal-background">
          <div className="portal-background-glow portal-background-glow-a" />
          <div className="portal-background-glow portal-background-glow-b" />
          <div className="portal-background-grid" />
        </div>
        {children}
      </>
    );
  }

  return (
    <>
      <div className="background-orb orb-1" />
      <div className="background-orb orb-2" />
      <div className="background-grid" />

      <a className="skip-link" href="#main-content">
        Direkt zum Inhalt
      </a>

      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieBanner />
      <ClientEffects />
    </>
  );
}
