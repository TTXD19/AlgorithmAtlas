"use client";

import { useProblems } from "@/lib/problems";
import { problemUrl } from "@/lib/problem-links";
import { useT } from "../LocaleProvider";

export type Problem = { src: string; name: string; diff: "Easy" | "Medium" | "Hard" };

const COLOR = { Easy: "text-green", Medium: "text-amber", Hard: "text-accent" };

/**
 * 練習題清單：每題連到題目頁（另開分頁），前面一個「做過了」的勾。
 * 勾的 key 是題目來源，所以同一題在別篇課程也會顯示已做過。
 */
export function Problems({ items }: { items: Problem[] }) {
  const { isSolved, toggle } = useProblems();
  const t = useT();
  const done = items.filter((p) => isSolved(p.src)).length;
  return (
    <div className="max-w-[66ch]">
      <ul className="m-0 list-none overflow-hidden rounded-[10px] border border-line bg-surface p-0">
        {items.map((p, i) => {
          const solved = isSolved(p.src);
          const url = problemUrl(p.src);
          const name = <span className={solved ? "text-ink-3 line-through decoration-line-strong" : ""}>{p.name}</span>;
          return (
            <li key={p.src} className={`flex items-center gap-3 px-3.5 py-2.5 text-[14px] ${i > 0 ? "border-t border-line" : ""}`}>
              <label className="flex shrink-0 cursor-pointer items-center" title={solved ? t.problems.undo : t.problems.markSolved}>
                <input type="checkbox" checked={solved} onChange={() => toggle(p.src)} className="h-4 w-4 cursor-pointer accent-[var(--green)]" aria-label={`${t.problems.markSolved}: ${p.src}`} />
              </label>
              <span className="w-24 shrink-0 font-mono text-[12px] text-ink-3">{p.src}</span>
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 hover:text-accent hover:underline">
                  {name}
                  <span className="ml-1 text-[11px] text-ink-3">↗</span>
                </a>
              ) : name}
              <span className={`ml-auto shrink-0 text-[12px] font-semibold ${COLOR[p.diff]}`}>{p.diff}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 text-[12.5px] text-ink-3 tabular-nums">{done}/{items.length} {t.problems.solved}</div>
    </div>
  );
}
