import type { Metadata } from "next";
import { Crumbs } from "@/components/Crumbs";
import { MyLearning } from "@/components/MyLearning";
import { getMessages } from "@/lib/messages";
import type { Locale } from "@/lib/i18n";

/**
 * 個人頁：收藏、筆記、最近學會、該複習。
 *
 * 內容全部來自瀏覽器端的 store，所以這頁的靜態外殼跟其他頁一樣可以預渲染；
 * 不進 sitemap、不給搜尋引擎索引——沒有兩個人會看到一樣的內容。
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/me">): Promise<Metadata> {
  const { lang } = await params;
  const t18n = getMessages(lang as Locale);
  return { title: t18n.me.title, description: t18n.me.description, robots: { index: false, follow: true } };
}

export default async function MePage({ params }: PageProps<"/[lang]/me">) {
  const { lang } = await params;
  const t18n = getMessages(lang as Locale);
  return (
    <>
      <Crumbs label={t18n.lesson.breadcrumb} items={[{ href: `/${lang}`, label: t18n.nav.topics }, { label: t18n.me.title }]} />
      <div className="mb-7">
        <h1 className="display mt-1.5 mb-2 text-[clamp(30px,4vw,42px)] leading-[1.08] font-extrabold">{t18n.me.title}</h1>
        <p className="m-0 max-w-[60ch] text-[15px] text-ink-2">{t18n.me.description}</p>
      </div>
      <MyLearning />
    </>
  );
}
