import { ImageResponse } from "next/og";
import { TOPICS } from "@/lib/topics";
import { getSubtopicBy } from "@/lib/topics-text";
import { getMessages } from "@/lib/messages";
import { LOCALES, type Locale } from "@/lib/i18n";
import { OgCard, ogOptions, ogText, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

/** 每篇課程一張 OG 圖：主題當眉標、課名當標題、中文名當副標。 */

export const alt = "Begin Algo";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// 跟 page.tsx 不同，route handler 的 generateStaticParams 不會自動接上父層的 lang，
// 三個參數都要自己給，否則 186 張圖一張都不會在建置時產生。
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => TOPICS.flatMap((t) => t.subs.map((s) => ({ lang, topic: t.id, sub: s.id }))));
}

export default async function Image({ params }: { params: Promise<{ lang: string; topic: string; sub: string }> }) {
  const { lang, topic, sub } = await params;
  const locale = lang as Locale;
  const t18n = getMessages(locale);
  const hit = getSubtopicBy(locale, topic, sub);
  const props = hit
    ? { locale, eyebrow: hit.topic.en, title: hit.sub.name, subtitle: hit.sub.zh, siteName: t18n.site.name, tagline: t18n.site.tagline }
    : { locale, title: t18n.site.name, siteName: t18n.site.name, tagline: t18n.site.tagline };
  return new ImageResponse(<OgCard {...props} />, await ogOptions(ogText(props)));
}
