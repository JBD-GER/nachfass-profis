import { createAbsoluteUrl, siteConfig } from "./site";

const defaultKeywords = [
  "Angebote nachfassen",
  "Angebotsnachfassung",
  "persönliche Angebotsnachfassung",
  "Conversion steigern",
  "offene Angebote",
  "Angebotsverfolgung",
  "SHK Vertrieb",
  "Fensterbau Vertrieb",
  "Küchenstudio Vertrieb",
  "Photovoltaik Vertrieb",
];

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
}) {
  const canonical = createAbsoluteUrl(path);
  const fullTitle = `${title} | ${siteConfig.name}`;
  const mergedKeywords = Array.from(new Set([...defaultKeywords, ...keywords]));

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: createAbsoluteUrl(siteConfig.socialImage),
          width: 1448,
          height: 1086,
          alt: "Nachfrass-Profis",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [createAbsoluteUrl(siteConfig.socialImage)],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
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
}
