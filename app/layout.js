import { Manrope, Space_Grotesk } from "next/font/google";

import { ClientEffects } from "../components/client-effects";
import { CookieBanner } from "../components/cookie-banner";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { createAbsoluteUrl, getSiteUrl, siteConfig } from "../lib/site";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Persönliche Angebotsnachfassung für mehr Conversion | Nachfrass-Profis",
    template: "%s | Nachfrass-Profis",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Angebote nachfassen",
    "Angebotsnachfassung",
    "persönliche Angebotsnachfassung",
    "Conversion steigern",
    "offene Angebote",
    "SHK Vertrieb",
    "Fensterbau Vertrieb",
    "Küchenstudio Vertrieb",
    "Photovoltaik Vertrieb",
    "Metallbau Vertrieb",
  ],
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  icons: {
    icon: "/Nachfass_favi.png",
    shortcut: "/Nachfass_favi.png",
    apple: "/Nachfass_favi.png",
  },
  openGraph: {
    title: "Persönliche Angebotsnachfassung für mehr Conversion | Nachfrass-Profis",
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: createAbsoluteUrl(siteConfig.socialImage),
        width: 1448,
        height: 1086,
        alt: "Team von Nachfrass-Profis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Persönliche Angebotsnachfassung für mehr Conversion | Nachfrass-Profis",
    description: siteConfig.description,
    images: [createAbsoluteUrl(siteConfig.socialImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="de"
      className={`${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body>
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
      </body>
    </html>
  );
}
