import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { createAbsoluteUrl, getSiteUrl, siteConfig } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Persönliche Angebotsnachfassung für mehr Conversion | Nachfass-Profis",
    template: "%s | Nachfass-Profis",
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
    title: "Persönliche Angebotsnachfassung für mehr Conversion | Nachfass-Profis",
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
        alt: "Team von Nachfass-Profis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Persönliche Angebotsnachfassung für mehr Conversion | Nachfass-Profis",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
