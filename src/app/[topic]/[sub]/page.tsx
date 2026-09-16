import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOPICS, getSubtopic, lessonKey, LEVEL_LABEL } from "@/lib/topics";
import { LESSONS } from "@/lib/lessons";
import { Level } from "@/components/Level";
import { Crumbs } from "@/components/Crumbs";
import { Rail } from "@/components/lesson/Rail";
import { MarkDone } from "@/components/ProgressBits";

export function generateStaticParams() {
  return TOPICS.flatMap((t) => t.subs.map((s) => ({ topic: t.id, sub: s.id })));
}

export async function generateMetadata({ params }: PageProps<"/[topic]/[sub]">): Promise<Metadata> {
  const { topic, sub } = await params;
  const hit = getSubtopic(topic, sub);
  return { title: hit ? `${hit.sub.name} ${hit.sub.zh}` : "課程" };
}

export default async function LessonPage({ params }: PageProps<"/[topic]/[sub]">) {
  const { topic, sub } = await params;
  const hit = getSubtopic(topic, sub);
  if (!hit) notFound();
  const { topic: t, sub: s } = hit;
  const idx = t.subs.indexOf(s);
  const prev = t.subs[idx - 1];
  const next = t.subs[idx + 1];
  const key = lessonKey(t.id, s.id);
  const lesson = LESSONS[key];

  return (
    <>
      <Crumbs items={[{ href: "/", label: "主題" }, { href: `/${t.id}`, label: t.en }, { label: s.name }]} />
      <div className="mb-7">
        <div className="eyebrow">
          {t.en} · {String(idx + 1).padStart(2, "0")} / {String(t.subs.length).padStart(2, "0")}
        </div>
        <h1 className="display mt-1.5 mb-3 text-[clamp(30px,4vw,42px)] leading-[1.08] font-extrabold">
          {s.name}
          <small className="mt-1.5 block font-sans text-[15px] font-medium tracking-normal text-ink-3">{s.zh}</small>
        </h1>
        {s.desc && <p className="m-0 max-w-[62ch] text-[16px] text-ink-2">{s.desc}。</p>}
        <p className="mt-2 max-w-[62ch] text-[14px] text-ink-3"><span className="font-semibold text-ink-2">用在：</span>{s.apply}</p>
      </div>

      <div className="mt-[22px] mb-9 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line md:grid-cols-4">
        <Fact label="時間複雜度" mono>{s.time}</Fact>
        <Fact label="空間複雜度" mono>{s.space}</Fact>
        <Fact label="難度">{LEVEL_LABEL[s.lvl]} <Level n={s.lvl} /></Fact>
        <Fact label="前置知識">{lesson?.prereq ?? "—"}</Fact>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_184px]">
        <div>
          {lesson ? (
            <lesson.Body />
          ) : (
            <div className="max-w-[66ch] rounded-xl border border-dashed border-line-strong p-7 text-center text-ink-3">
              <b className="mb-1 block text-ink">{s.name} 內容撰寫中</b>
              這頁會沿用 BFS 的版型：為什麼需要它、核心概念、步驟、互動示範、程式碼與練習題。
            </div>
          )}

          <div className="mt-3 border-t border-line pt-[22px]">
            <MarkDone lessonId={key} />
          </div>

          <div className="mt-5 flex justify-between gap-3">
            <PagerLink href={prev ? `/${t.id}/${prev.id}` : undefined} label="上一篇" name={prev?.name} />
            <PagerLink href={next ? `/${t.id}/${next.id}` : undefined} label="下一篇" name={next?.name} right />
          </div>
        </div>
        <Rail lessonId={key} />
      </div>
    </>
  );
}

function Fact({ label, mono, children }: { label: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <div className="bg-surface px-3.5 py-3">
      <span className="eyebrow mb-1 block tracking-[0.08em]">{label}</span>
      <b className={mono ? "font-mono text-[15px] font-medium" : "text-[15px] font-semibold"}>{children}</b>
    </div>
  );
}

function PagerLink({ href, label, name, right }: { href?: string; label: string; name?: string; right?: boolean }) {
  const cls = `flex-1 rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[14px] font-semibold ${right ? "text-right" : ""} ${
    href ? "hover:border-line-strong" : "pointer-events-none opacity-50"
  }`;
  const inner = (
    <>
      <span className="eyebrow mb-0.5 block tracking-[0.06em]">{label}</span>
      {name ?? "—"}
    </>
  );
  return href ? <Link href={href} className={cls}>{inner}</Link> : <span className={cls}>{inner}</span>;
}
