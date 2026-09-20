"use client";

import { useState } from "react";
import type { QuizItem } from "@/lib/lesson-model";
import { inline } from "@/lib/inline";
import { useT } from "../LocaleProvider";
import { MarkDone } from "../ProgressBits";
import { BTN_PLAIN, BTN_PRIMARY } from "./demos/StepBar";

/**
 * 課後小測驗。全部作答後一次對答案；全對才把「標記為已學會」放到眼前，
 * 讓「已學會」多一點依據，但不強制——側欄的按鈕隨時都在。
 */
export function Quiz({ items, lessonId }: { items: QuizItem[]; lessonId: string }) {
  const t = useT();
  const [picked, setPicked] = useState<(number | null)[]>(() => items.map(() => null));
  const [checked, setChecked] = useState(false);
  const answered = picked.every((p) => p !== null);
  const score = items.filter((it, i) => picked[i] === it.answer).length;
  const allRight = checked && score === items.length;

  return (
    <div className="max-w-[66ch]">
      <p>{t.quiz.intro}</p>
      <ol className="m-0 list-none p-0">
        {items.map((it, qi) => {
          const mine = picked[qi];
          const right = mine === it.answer;
          return (
            <li key={qi} className="mb-4 rounded-[10px] border border-line bg-surface p-4">
              <div className="mb-2.5 flex gap-2.5 text-[14.5px] font-semibold">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-[12px] font-medium text-ink">{qi + 1}</span>
                <span>{inline(it.q)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {it.choices.map((c, ci) => {
                  const on = mine === ci;
                  let cls = "border-line bg-surface hover:bg-surface-2";
                  if (checked && ci === it.answer) cls = "border-green bg-green-soft text-green";
                  else if (checked && on) cls = "border-accent bg-accent-soft text-accent";
                  else if (on) cls = "border-accent bg-accent-soft";
                  return (
                    <label key={ci} className={`flex cursor-pointer items-start gap-2.5 rounded-[7px] border px-3 py-2 text-[14px] ${cls} ${checked ? "cursor-default" : ""}`}>
                      <input
                        type="radio"
                        name={`${lessonId}-q${qi}`}
                        checked={on}
                        disabled={checked}
                        onChange={() => setPicked((p) => p.map((v, i) => (i === qi ? ci : v)))}
                        className="mt-1 accent-[var(--accent)]"
                      />
                      <span>{inline(c)}</span>
                    </label>
                  );
                })}
              </div>
              {checked && (
                <div className={`mt-2.5 text-[13.5px] ${right ? "text-green" : "text-accent"}`}>
                  <b>{right ? t.quiz.correct : t.quiz.wrong}</b>
                  <span className="text-ink-2"> · {inline(it.why)}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-2.5">
        {!checked ? (
          <button type="button" className={BTN_PRIMARY} disabled={!answered} onClick={() => setChecked(true)}>{t.quiz.check}</button>
        ) : (
          <>
            <span className="text-[14px] font-semibold tabular-nums">{score}/{items.length} {t.quiz.score}</span>
            <button type="button" className={BTN_PLAIN} onClick={() => { setChecked(false); setPicked(items.map(() => null)); }}>{t.quiz.retry}</button>
          </>
        )}
      </div>
      {checked && (
        <div className={`mt-3 flex flex-wrap items-center gap-3 rounded-[10px] border px-4 py-3 text-[14px] ${allRight ? "border-green bg-green-soft/50" : "border-line bg-surface-2"}`}>
          <span className="flex-1">{allRight ? t.quiz.allCorrect : t.quiz.someWrong}</span>
          {allRight && <MarkDone lessonId={lessonId} />}
        </div>
      )}
    </div>
  );
}
