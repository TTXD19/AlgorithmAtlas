import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOPICS } from "@/lib/topics";
import { getTopicBy, getKindLabel } from "@/lib/topics-text";
import { Level } from "@/components/Level";
import { StatusBadge } from "@/components/ProgressBits";
import { Crumbs } from "@/components/Crumbs";
import { getMessages } from "@/lib/messages";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[topic]">): Promise<Metadata> {
  const { lang, topic } = await params;
  const locale = lang as Locale;
  const t = getTopicBy(locale, topic);
  if (!t) return {};
  // intro 是一段完整的話，長度剛好適合搜尋結果的摘要；desc 太短，只在沒 intro 時退用。
  return pageMeta(locale, `/${t.id}`, {
    title: `${t.en} ${t.zh}`,
    description: t.intro ?? t.desc,
    siteName: getMessages(locale).site.name,
  });
}

const GRID = "grid grid-cols-[24px_minmax(0,1fr)_92px] md:grid-cols-[30px_minmax(0,1fr)_150px_92px_96px] items-center gap-4";

export default async function TopicPage({ params }: PageProps<"/[lang]/[topic]">) {
  const { lang, topic } = await params;
  const h = (path: string) => `/${lang}${path}`;
  const t = getTopicBy(lang as Locale, topic);
  if (!t) notFound();
  const t18n = getMessages(lang as Locale);

  return (
    <>
      <Crumbs label={t18n.lesson.breadcrumb} items={[{ href: h(""), label: t18n.nav.topics }, { label: t.en }]} />
      <div className="mb-7">
        <div className="eyebrow">{getKindLabel(lang as Locale)[t.kind]} · {t.subs.length} {t18n.home.subsCount}</div>
        <h1 className="display mt-1.5 mb-3 text-[clamp(30px,4vw,42px)] leading-[1.08] font-extrabold">
          {t.en}
          <small className="mt-1.5 block font-sans text-[15px] font-medium tracking-normal text-ink-3">{t.zh}</small>
        </h1>
        <p className="mb-3.5 max-w-[62ch] text-[16px] text-ink-2">{t.intro ?? t.desc}</p>
        {t.prereq && (
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
            {t18n.lesson.prereq}
            {t.prereq.map((p) => (
              <span key={p} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[12px] text-ink-2">{p}</span>
            ))}
          </div>
        )}
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="m-0 text-[20px] font-bold">{t18n.topic.whyLearn} {t.en}</h2>
          <span className="text-[13px] text-ink-3">{t18n.topic.realWorld}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {t.applications.map((a) => {
            const sub = a.sub ? t.subs.find((x) => x.id === a.sub) : undefined;
            return (
              <div key={a.title} className="flex flex-col rounded-[10px] border border-line bg-surface px-4 py-3.5">
                <div className="mb-1 text-[15px] font-semibold">{a.title}</div>
                <p className="m-0 text-[13.5px] leading-[1.6] text-ink-2">{a.desc}</p>
                {sub && (
                  <Link href={h(`/${t.id}/${sub.id}`)} className="mt-2.5 self-start text-[12.5px] font-semibold text-accent hover:underline">
                    {t18n.topic.relatedLesson}{sub.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="m-0 text-[20px] font-bold">{t18n.topic.subsHeading}</h2>
        <span className="text-[13px] text-ink-3">{t.subs.length} {t18n.home.lessonsCount}</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className={`${GRID} eyebrow bg-surface-2 px-[18px] py-2 tracking-[0.08em]`}>
          <span>#</span><span>{t18n.topic.colAlgo}</span><span className="hidden md:block">{t18n.topic.colComplexity}</span><span>{t18n.lesson.level}</span><span className="hidden md:block">{t18n.topic.colStatus}</span>
        </div>
        {t.subs.map((s, i) => (
          <Link key={s.id} href={h(`/${t.id}/${s.id}`)} className={`${GRID} border-t border-line px-[18px] py-3.5 transition hover:bg-surface-2`}>
            <span className="font-mono text-[12px] text-ink-3 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <b className="block text-[15px] font-semibold">
                {s.name} <span className="font-medium text-ink-3">{s.zh}</span>
              </b>
              {s.desc && <span className="block text-[13px] text-ink-2">{s.desc}</span>}
              <span className="mt-0.5 block text-[12px] text-ink-3"><span className="font-semibold">{t18n.lesson.apply}</span>{s.apply}</span>
            </span>
            <span className="hidden font-mono text-[12.5px] text-ink-2 md:block">
              {s.time}
              <small className="block font-sans text-[11px] text-ink-3">{t18n.topic.space} {s.space}</small>
            </span>
            <Level n={s.lvl} label={t18n.lesson.level} />
            <span className="hidden md:block"><StatusBadge topic={t} sub={s} /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
