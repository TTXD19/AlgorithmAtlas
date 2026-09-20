"use client";

import Link from "next/link";
import { useState } from "react";
import { LIST_META, PATTERNS, patternLabel, problemsOf, listProblemUrl, type ListId } from "@/lib/problem-lists";
import { useProblems } from "@/lib/problems";
import { getSubtopicBy } from "@/lib/topics-text";
import { useHref, useLocale, useT } from "./LocaleProvider";
import { BTN } from "./lesson/demos/StepBar";

const COLOR = { Easy: "text-green", Medium: "text-amber", Hard: "text-accent" };

/**
 * 題單：Blind 75 / NeetCode 150，依分類分組。
 *
 * 每題的勾跟課程頁的練習題共用同一個 store（key 是 "LeetCode N"），
 * 在課程頁勾過的題目這裡也是勾的。有收錄的題目連回課程；沒有的連到
 * 對應的學習路線節點，至少知道該去學哪一塊。
 */
export function ProblemLists({ lessonsByProblem }: { lessonsByProblem: Record<number, string[]> }) {
  const [list, setList] = useState<ListId>("blind75");
  const { isSolved, toggle } = useProblems();
  const t = useT();
  const locale = useLocale();
  const h = useHref();

  const problems = problemsOf(list);
  const done = problems.filter((p) => isSolved(`LeetCode ${p.id}`)).length;
  const groups: { pattern: string; items: typeof problems }[] = [];
  for (const p of problems) {
    const g = groups.find((x) => x.pattern === p.pattern);
    if (g) g.items.push(p);
    else groups.push({ pattern: p.pattern, items: [p] });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[10px] border border-line bg-surface px-4 py-3">
        <div className="flex gap-1.5">
          {(Object.keys(LIST_META) as ListId[]).map((id) => (
            <button key={id} type="button" onClick={() => setList(id)} className={`${BTN} ${list === id ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`}>
              {LIST_META[id].name}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-3 text-[13px] text-ink-2">
          <div className="h-1.5 min-w-[80px] flex-1 overflow-hidden rounded-sm bg-surface-2">
            <i className="block h-full rounded-sm bg-green" style={{ width: `${(done / problems.length) * 100}%` }} />
          </div>
          <span className="whitespace-nowrap font-mono text-[13px] tabular-nums">{done}/{problems.length} {t.problems.solved}</span>
        </div>
      </div>

      {groups.map((g) => {
        const gDone = g.items.filter((p) => isSolved(`LeetCode ${p.id}`)).length;
        const node = PATTERNS[g.pattern]?.node;
        return (
          <section key={g.pattern} className="mb-7">
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <h2 className="m-0 text-[18px] font-bold">
                {patternLabel(g.pattern, locale)}
                {locale !== "en" && <span className="ml-2 text-[13px] font-medium text-ink-3">{g.pattern}</span>}
              </h2>
              <span className="text-[12.5px] text-ink-3 tabular-nums">
                {gDone}/{g.items.length}
                {node && <> · <Link href={h(`/roadmap#node-${node}`)} className="text-accent hover:underline">{t.lists.roadmapNode}</Link></>}
              </span>
            </div>
            <ul className="m-0 list-none overflow-hidden rounded-[10px] border border-line bg-surface p-0">
              {g.items.map((p, i) => {
                const key = `LeetCode ${p.id}`;
                const solved = isSolved(key);
                const lessons = (lessonsByProblem[p.id] ?? [])
                  .map((k) => { const [tid, sid] = k.split("/"); const hit = getSubtopicBy(locale, tid, sid); return hit ? { k, tid, sid, name: hit.sub.name } : null; })
                  .filter((x): x is NonNullable<typeof x> => !!x);
                return (
                  <li key={p.id} className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-[14px] ${i > 0 ? "border-t border-line" : ""}`}>
                    <input type="checkbox" checked={solved} onChange={() => toggle(key)} className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--green)]" aria-label={`${t.problems.markSolved}: ${key}`} />
                    <span className="w-12 shrink-0 font-mono text-[12px] text-ink-3">{p.id}</span>
                    <a href={listProblemUrl(p)} target="_blank" rel="noopener noreferrer" className={`min-w-0 hover:text-accent hover:underline ${solved ? "text-ink-3 line-through" : ""}`}>
                      {p.title}<span className="ml-1 text-[11px] text-ink-3">↗</span>
                    </a>
                    {p.premium && <span className="rounded-full bg-surface-2 px-1.5 text-[10.5px] text-ink-3">{t.lists.premium}</span>}
                    <span className={`ml-auto shrink-0 text-[12px] font-semibold ${COLOR[p.diff]}`}>{p.diff}</span>
                    {lessons.length > 0 && (
                      <span className="flex w-full flex-wrap gap-1.5 pl-[76px] text-[12px]">
                        {lessons.map((l) => (
                          <Link key={l.k} href={h(`/${l.tid}/${l.sid}`)} className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-ink-2 hover:border-line-strong hover:text-accent">{l.name}</Link>
                        ))}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
