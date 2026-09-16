import Link from "next/link";
import { type TopicKind, type Topic } from "@/lib/topics";
import { getTopics, getKindLabel } from "@/lib/topics-text";
import { getMessages } from "@/lib/messages";
import type { Locale } from "@/lib/i18n";
import { LESSONS } from "@/lib/lessons";
import { TopicGlyph } from "@/components/TopicGlyph";
import { TopicProgress, DoneTotal } from "@/components/ProgressBits";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const h = (path: string) => `/${lang}${path}`;
  const locale = lang as Locale;
  const topics = getTopics(locale);
  const kindLabel = getKindLabel(locale);
  const t18n = getMessages(locale);
  const total = topics.reduce((a, t) => a + t.subs.length, 0);
  const written = Object.keys(LESSONS).length;

  return (
    <>
      <div className="mb-10 grid grid-cols-1 items-end gap-10 md:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="eyebrow">Topic-based curriculum</div>
          <h1 className="display mt-2 mb-3.5 text-[clamp(34px,4.6vw,52px)] leading-[1.05] font-extrabold">
            {t18n.home.headline}
          </h1>
          <p className="m-0 max-w-[58ch] text-[16px] text-ink-2">
            {t18n.home.lede}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href={h("/roadmap")} className="inline-flex h-9 items-center rounded-[7px] bg-accent px-4 text-[14px] font-semibold text-accent-ink hover:brightness-110">
              {t18n.home.startRoadmap}
            </Link>
            <Link href={h("/graph/bfs")} className="inline-flex h-9 items-center rounded-[7px] border border-line bg-surface px-4 text-[14px] font-medium hover:bg-surface-2">
              {t18n.home.sampleLesson}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line">
          <Stat n={topics.length} label={t18n.home.statTopics} />
          <Stat n={total} label={t18n.home.statLessons} />
          <Stat n={written} label={t18n.home.statWritten} />
          <Stat n={<DoneTotal />} label={t18n.home.statDone} />
        </div>
      </div>

      {(["ds", "algo"] as TopicKind[]).map((kind) => {
        const list = topics.filter((t) => t.kind === kind);
        return (
          <section key={kind} className="mb-10">
            <div className="mb-3.5 flex items-baseline justify-between">
              <h2 className="m-0 text-[20px] font-bold">{kindLabel[kind]}</h2>
              <span className="text-[13px] text-ink-3">
                {list.length} {t18n.home.topicsCount} · {list.reduce((a, t) => a + t.subs.length, 0)} {t18n.home.lessonsCount}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
              {list.map((t) => <TopicCard key={t.id} t={t} lang={lang} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

function TopicCard({ t, lang }: { t: Topic; lang: string }) {
  const t18n = getMessages(lang as Locale);
  return (
    <Link
      href={`/${lang}/${t.id}`}
      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-[18px] pb-4 transition hover:-translate-y-px hover:border-line-strong hover:shadow-card"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[9px] bg-surface-2 text-ink-2">
          <TopicGlyph id={t.glyph} className="h-[22px] w-[22px]" />
        </div>
        <div>
          <b className="block font-display text-[18px] leading-[1.15] font-bold tracking-[-0.01em]">{t.en}</b>
          <span className="text-[13px] text-ink-3">{t.zh} · {t.subs.length} {t18n.home.subsCount}</span>
        </div>
      </div>
      <p className="m-0 text-[13.5px] leading-[1.55] text-ink-2">{t.desc}</p>
      <p className="m-0 text-[12.5px] leading-[1.5] text-ink-3">
        <span className="font-semibold">{t18n.home.usedFor}</span>{t.applications.map((a) => a.title).join(t18n.home.listSeparator)}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {t.subs.slice(0, 4).map((s) => (
          <span key={s.id} className="rounded-full bg-surface-2 px-2 py-0.5 text-[12px] text-ink-2">{s.name}</span>
        ))}
        {t.subs.length > 4 && (
          <span className="rounded-full border border-line px-2 py-0.5 text-[12px] text-ink-3">+{t.subs.length - 4}</span>
        )}
      </div>
      <TopicProgress topic={t} />
    </Link>
  );
}

function Stat({ n, label }: { n: React.ReactNode; label: string }) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <b className="block font-display text-[26px] leading-[1.1] font-bold tabular-nums">{n}</b>
      <span className="text-[12.5px] text-ink-3">{label}</span>
    </div>
  );
}
