const defaultSiteUrl = "https://www.nachfass-profis.de";

export const siteConfig = {
  name: "Nachfrass-Profis",
  shortName: "Nachfrass-Profis",
  legalName: "Flaaq Holding GmbH",
  representative: "Christoph Pfad",
  description:
    "Persönliche Angebotsnachfassung für SHK, Fensterbau, Küchenstudios, Photovoltaik und Metallbau. Klare Rückmeldungen, heiße Leads und mehr Conversion aus offenen Angeboten.",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(/\/$/, ""),
  locale: "de_DE",
  email: "info@nachfass-profis.de",
  phone: "+49 5761 8429660",
  vatId: "DE352217621",
  registerCourt: "Amtsgericht Hannover",
  registerNumber: "HRB 223594",
  socialImage: "/teamfoto.png",
  address: {
    street: "Großer Kamp 5a",
    postalCode: "31633",
    city: "Leese",
    country: "Deutschland",
  },
};

export const primaryNav = [
  {
    label: "Leistungen",
    href: "/leistungen",
  },
  {
    label: "Branchen",
    href: "/branchen",
  },
  {
    label: "Ablauf",
    href: "/ablauf",
  },
  {
    label: "Kontakt",
    href: "/kontakt",
  },
];

export const legalNav = [
  {
    label: "Impressum",
    href: "/impressum",
  },
  {
    label: "Datenschutz",
    href: "/datenschutz",
  },
  {
    label: "AGB",
    href: "/agb",
  },
];

export function getSiteUrl() {
  return new URL(siteConfig.siteUrl);
}

export function createAbsoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.siteUrl).toString();
}

export function getPhoneHref() {
  return `tel:${siteConfig.phone.replace(/\s+/g, "")}`;
}
