import Image from "next/image";
import Link from "next/link";

import { primaryNav } from "../lib/site";

export function SiteHeader() {
  return (
    <header className="site-header" data-site-header>
      <Link className="brand" href="/" aria-label="Nachfrass-Profis Startseite">
        <Image
          src="/Nachfasdsprofis.png"
          alt="Nachfrass-Profis"
          width={240}
          height={60}
          priority
          className="brand-logo-image"
        />
      </Link>

      <nav className="main-nav" aria-label="Hauptnavigation">
        {primaryNav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="button button-small button-header" href="/kontakt">
        Erstgespräch
      </Link>
    </header>
  );
}
