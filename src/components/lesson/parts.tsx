import type { ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

/** 課程六段固定結構的 id 與順序。標題在 messages 裡，隨語言變。 */
export const SECTIONS = ["why", "concept", "steps", "demo", "code", "problems"] as const;
export type SectionId = (typeof SECTIONS)[number];

/** locale 選填：尚未遷移的課程不會傳，那些一律是原始語言。 */
export function Section({ id, children, locale = DEFAULT_LOCALE }: { id: SectionId; children: ReactNode; locale?: Locale }) {
  const idx = SECTIONS.indexOf(id);
  const title = getMessages(locale).sections[id];
  return (
    <section id={`sec-${id}`} className="prose-lesson mb-10">
      <h2 className="mb-3 scroll-mt-[72px] text-[21px] font-bold">
        <span className="mr-2.5 font-mono text-[12px] font-medium text-ink-3">{String(idx + 1).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="m-0 max-w-[66ch] list-none p-0">
      {items.map((it, i) => (
        <li key={i} className={`relative py-2 pl-10 text-ink-2 ${i > 0 ? "border-t border-line" : ""}`}>
          <span className="absolute top-[9px] left-0 grid h-6 w-6 place-items-center rounded-full bg-surface-2 font-mono text-[12px] text-ink">{i + 1}</span>
          {it}
        </li>
      ))}
    </ol>
  );
}

export type Problem = { src: string; name: string; diff: "Easy" | "Medium" | "Hard" };

export function Problems({ items }: { items: Problem[] }) {
  const color = { Easy: "text-green", Medium: "text-amber", Hard: "text-accent" };
  return (
    <ul className="m-0 max-w-[66ch] list-none overflow-hidden rounded-[10px] border border-line bg-surface p-0">
      {items.map((p, i) => (
        <li key={p.src} className={`flex items-center gap-3 px-3.5 py-2.5 text-[14px] ${i > 0 ? "border-t border-line" : ""}`}>
          <span className="w-24 shrink-0 font-mono text-[12px] text-ink-3">{p.src}</span>
          {p.name}
          <span className={`ml-auto text-[12px] font-semibold ${color[p.diff]}`}>{p.diff}</span>
        </li>
      ))}
    </ul>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="inl">{children}</code>;
}

export type Scenario = { title: string; problem: string; why: string };

/** 課程開頭的「為什麼需要它」：先講現實情境，再講為什麼這個演算法能解。 */
/** locale 選填：尚未遷移到新模型的課程不會傳，那些一律是原始語言。 */
export function Applications({ items, cue, locale = DEFAULT_LOCALE }: { items: Scenario[]; cue: string; locale?: Locale }) {
  const t = getMessages(locale);
  return (
    <>
      <div className="grid max-w-[72ch] grid-cols-1 gap-2.5">
        {items.map((it) => (
          <div key={it.title} className="rounded-[10px] border border-line bg-surface px-4 py-3">
            <div className="mb-1 text-[15px] font-semibold text-ink">{it.title}</div>
            <p className="mb-1.5 text-[14px]">{it.problem}</p>
            <p className="m-0 text-[14px]"><span className="mr-1.5 font-semibold text-accent">{t.lesson.whyThis}</span>{it.why}</p>
          </div>
        ))}
      </div>
      <p className="mt-3.5 max-w-[72ch] rounded-lg bg-accent-soft px-4 py-2.5 text-[14px] text-ink">
        <span className="mr-1.5 font-semibold">{t.lesson.cue}</span>{cue}
      </p>
    </>
  );
}
