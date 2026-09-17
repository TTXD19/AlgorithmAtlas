import { ImageResponse } from "next/og";
import { LOCALES, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { OgCard, ogOptions, ogText, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

/**
 * 站台級的 OG 圖，每個語言一張。首頁、路線圖、主題頁分享時都用它；
 * 課程頁有自己更具體的版本（[topic]/[sub]/opengraph-image.tsx）。
 */

export const alt = "Begin Algo";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t18n = getMessages(locale);
  const props = {
    locale,
    title: t18n.home.headline,
    subtitle: t18n.site.description,
    siteName: t18n.site.name,
    tagline: t18n.site.tagline,
  };
  return new ImageResponse(<OgCard {...props} />, await ogOptions(ogText(props)));
}
