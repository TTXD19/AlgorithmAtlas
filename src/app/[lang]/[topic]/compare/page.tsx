import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COMPARISONS, validateComparisons } from "@/content/compare";
import { pickL } from "@/lib/compare";
import { getTopicBy, getLevelLabel } from "@/lib/topics-text";
import { getMessages } from "@/lib/messages";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { Crumbs } from "@/components/Crumbs";
import { Level } from "@/components/Level";
import { inline } from "@/lib/inline";

/** 只有登記在 COMPARISONS 的主題才有這一頁。 */
export function generateStaticParams() {
  return Object.keys(COMPARISONS).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[topic]/compare">): Promise<Metadata> {
  const { lang, topic } = await params;
  const locale = lang as Locale;
  const cmp = COMPARISONS[topic];
  if (!cmp) return {};
  return pageMeta(locale, `/${topic}/compare`, {
    title: cmp.title[locale],
    description: cmp.description[locale],
    siteName: getMessages(locale).site.name,
  });
}

export default async function ComparePage({ params }: PageProps<"/[lang]/[topic]/compare">) {
  const { lang, topic } = await params;
  const locale = lang as Locale;
  const cmp = COMPARISONS[topic];
  const t = getTopicBy(locale, topic);
  if (!cmp || !t) notFound();
  // 跟路線圖一樣：資料指到不存在的細項就讓 build 失敗
  const problems = validateComparisons();
  if (problems.length) throw new Error(`比較表資料有誤：\n${problems.join("\n")}`);

  const t18n = getMessages(locale);
  const h = (path: string) => `/${lang}${path}`;
  const level = getLevelLabel(locale);
  const rows = cmp.rows.map((r) => ({ ...r, s: t.subs.find((x) => x.id === r.sub)! }));

  return (
    <>
      <Crumbs label={t18n.lesson.breadcrumb} items={[{ href: h(""), label: t18n.nav.topics }, { href: h(`/${t.id}`), label: t.en }, { label: t18n.compare.crumb }]} />
      <div className="mb-8">
        <div className="eyebrow">{t.en} · {t18n.compare.crumb}</div>
        <h1 className="display mt-1.5 mb-3 text-[clamp(28px,4vw,40px)] leading-[1.08] font-extrabold">{cmp.title[locale]}</h1>
        <p className="m-0 max-w-[62ch] text-[16px] text-ink-2">{cmp.description[locale]}</p>
      </div>

      {/* 一覽表：只放短的、可掃視的欄位 */}
      <div className="mb-10 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-[13.5px]">
          <thead>
            <tr className="eyebrow bg-surface-2 text-left tracking-[0.08em]">
              <th className="px-4 py-2.5 font-medium">{t18n.topic.colAlgo}</th>
              <th className="px-3 py-2.5 font-medium">{t18n.compare.time}</th>
              <th className="px-3 py-2.5 font-medium">{t18n.compare.space}</th>
              {cmp.columns.map((c) => <th key={c.key} className="px-3 py-2.5 font-medium">{c.label[locale]}</th>)}
              <th className="px-3 py-2.5 font-medium">{t18n.lesson.level}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, cells }) => (
              <tr key={s.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <Link href={h(`/${t.id}/${s.id}`)} className="font-semibold hover:text-accent hover:underline">{s.name}</Link>
                  <span className="block text-[12px] text-ink-3">{s.zh}</span>
                </td>
                <td className="px-3 py-3 font-mono text-[12.5px] whitespace-nowrap">{s.time}</td>
                <td className="px-3 py-3 font-mono text-[12.5px] whitespace-nowrap">{s.space}</td>
                {cmp.columns.map((c) => (
                  <td key={c.key} className="px-3 py-3 text-[13px] text-ink-2">{pickL(cells[c.key] ?? "—", locale)}</td>
                ))}
                <td className="px-3 py-3 whitespace-nowrap"><span className="mr-1.5 text-[12.5px]">{level[s.lvl]}</span><Level n={s.lvl} label={t18n.lesson.level} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 什麼時候選它 */}
      <section className="mb-10">
        <h2 className="m-0 mb-3.5 text-[20px] font-bold">{t18n.compare.whenTitle}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map(({ s, pick }) => (
            <Link key={s.id} href={h(`/${t.id}/${s.id}`)} className="rounded-[10px] border border-line bg-surface px-4 py-3.5 transition hover:border-line-strong">
              <div className="mb-1 text-[15px] font-semibold">{s.name} <span className="font-medium text-ink-3">{s.zh}</span></div>
              <p className="m-0 text-[13.5px] leading-[1.6] text-ink-2">{pick[locale]}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 選擇指南 */}
      <section className="prose-lesson mb-6">
        <h2 className="m-0 mb-3.5 text-[20px] font-bold">{t18n.compare.guideTitle}</h2>
        <ul className="m-0 max-w-[70ch] list-none p-0">
          {cmp.guide.map((g, i) => (
            <li key={i} className={`py-2.5 text-[14.5px] leading-[1.65] text-ink-2 ${i > 0 ? "border-t border-line" : ""}`}>{inline(g[locale])}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
