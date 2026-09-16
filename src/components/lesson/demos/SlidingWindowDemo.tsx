"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 最長不重複子字串（LeetCode 3） */
const S = "abcadbcxab";

const TEXT = demoText(
  {
    intro: "視窗一開始是空的。r 每次往右一格把 s[r] 加進來；若 s[r] 已在視窗裡，先不加，l 往右縮到它離開為止。",
    shrink: (r: number, c: string, outIdx: number, out: string, l: number, still: boolean) =>
      `s[${r}] = '${c}' 已在視窗裡，還不能加入。把左端的 s[${outIdx}] = '${out}' 移出集合，l 往右到 ${l}。${still ? `'${c}' 還在，繼續縮。` : `'${c}' 離開了，可以停。`}`,
    expandBest: (r: number, c: string, l: number, win: string, len: number) =>
      `加入 s[${r}] = '${c}'，視窗 [${l}, ${r}] = "${win}"，長度 ${len}，刷新最佳。`,
    expand: (r: number, c: string, l: number, win: string, len: number, best: number) =>
      `加入 s[${r}] = '${c}'，視窗 [${l}, ${r}] = "${win}"，長度 ${len}，沒超過最佳 ${best}。`,
    done: (sub: string, best: number) =>
      `r 走到底。最長不重複子字串是 "${sub}"，長度 ${best}。l 和 r 各只往右走了最多 n 步，總共 O(n)。`,
    phaseShrink: "縮視窗（l 往右）",
    phaseExpand: "擴視窗（r 往右）",
    phaseDone: "結束",
    stringTitle: "字串與視窗",
    setTitle: "視窗裡的字元集合",
    setLegend: "亮的在視窗裡。黃色是「想加進來但已經存在」的字元。",
    stateTitle: "目前狀態",
    sep: "，",
    lengthLabel: "長度 ",
    windowLabel: "視窗 = ",
    notAddedYet: (r: number) => `（s[${r}] 還沒加入）`,
    bestLabel: "最佳 = ",
    bestNote: (sub: string) => `（"${sub}"，綠線）`,
  },
  {
    en: {
      intro: "The window starts empty. Each step r moves one cell right and adds s[r]; if s[r] is already inside the window, hold off and move l right until that character leaves.",
      shrink: (r: number, c: string, outIdx: number, out: string, l: number, still: boolean) =>
        `s[${r}] = '${c}' is already in the window, so it cannot be added yet. Drop the left end, s[${outIdx}] = '${out}', from the set and move l right to ${l}. ${still ? `'${c}' is still there, so keep shrinking.` : `'${c}' has left, so the shrinking can stop.`}`,
      expandBest: (r: number, c: string, l: number, win: string, len: number) =>
        `Add s[${r}] = '${c}'. The window [${l}, ${r}] = "${win}" has length ${len}, which is a new best.`,
      expand: (r: number, c: string, l: number, win: string, len: number, best: number) =>
        `Add s[${r}] = '${c}'. The window [${l}, ${r}] = "${win}" has length ${len}, which does not beat the best of ${best}.`,
      done: (sub: string, best: number) =>
        `r has reached the end. The longest substring without repeats is "${sub}", of length ${best}. l and r each move right at most n steps, so the whole scan is O(n).`,
      phaseShrink: "Shrink (l moves right)",
      phaseExpand: "Expand (r moves right)",
      phaseDone: "Done",
      stringTitle: "String and window",
      setTitle: "Characters in the window",
      setLegend: "The bright cells are inside the window. Amber marks the character we want to add but which is already in there.",
      stateTitle: "Current state",
      sep: ", ",
      lengthLabel: "length ",
      windowLabel: "window = ",
      notAddedYet: (r: number) => ` (s[${r}] is not in it yet)`,
      bestLabel: "best = ",
      bestNote: (sub: string) => ` ("${sub}", the green underline)`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

/** r 是程式碼裡的 r。縮視窗時 s[r] 還沒加入，視窗是 [l, r − 1]；其餘時候視窗是 [l, r]。 */
interface Step { desc: string; l: number; r: number; set: string[]; best: number; bestRange: [number, number] | null; phase: "expand" | "shrink" | "done"; dup?: string }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [{ desc: t.intro, l: 0, r: -1, set: [], best: 0, bestRange: null, phase: "expand" }];
  const set = new Set<string>();
  let l = 0, best = 0;
  let bestRange: [number, number] | null = null;
  for (let r = 0; r < S.length; r++) {
    const c = S[r];
    while (set.has(c)) {
      const out = S[l];
      set.delete(out);
      l++;
      steps.push({ desc: t.shrink(r, c, l - 1, out, l, set.has(c)), l, r, set: [...set], best, bestRange, phase: "shrink", dup: c });
    }
    set.add(c);
    const len = r - l + 1;
    if (len > best) {
      best = len;
      bestRange = [l, r];
      steps.push({ desc: t.expandBest(r, c, l, S.slice(l, r + 1), len), l, r, set: [...set], best, bestRange, phase: "expand" });
    } else {
      steps.push({ desc: t.expand(r, c, l, S.slice(l, r + 1), len, best), l, r, set: [...set], best, bestRange, phase: "expand" });
    }
  }
  steps.push({ desc: t.done(bestRange ? S.slice(bestRange[0], bestRange[1] + 1) : "", best), l, r: S.length - 1, set: [...set], best, bestRange, phase: "done" });
  return steps;
}

const CHARS = Array.from(new Set(S.split(""))).sort();

export function SlidingWindowDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const end = s.phase === "shrink" ? s.r - 1 : s.r; // 視窗右端（縮的時候 s[r] 還沒加入）
  const [b0, b1] = s.bestRange ?? [-1, -1];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.phase === "shrink" ? t.phaseShrink : s.phase === "expand" ? t.phaseExpand : t.phaseDone}</span>} right={`s = "${S}" · n = ${S.length}`} />

      <div className="overflow-x-auto p-3.5">
        <div className="eyebrow mb-2">{t.stringTitle}</div>
        <div className="flex gap-1">
          {S.split("").map((c, i) => {
            const inWin = i >= s.l && i <= end;
            const isDup = s.phase === "shrink" && i === s.r;
            const tone = isDup
              ? "border-amber bg-amber-soft text-amber"
              : inWin
                ? "border-accent bg-accent text-accent-ink"
                : i < s.l ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface";
            return (
              <div key={i} className="flex w-9 flex-col items-center gap-1">
                <span className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] ${tone}`}>{c}</span>
                <span className="font-mono text-[10.5px] text-ink-3">{i}</span>
                <div className="flex h-4 gap-0.5">
                  {s.l === i && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] leading-4 text-ink">l</span>}
                  {s.r === i && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] leading-4 text-ink">r</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-1">
          {S.split("").map((_, i) => (
            <span key={i} className={`h-1 w-9 shrink-0 rounded-full ${i >= b0 && i <= b1 ? "bg-green" : "bg-transparent"}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">{t.setTitle}</div>
          <div className="flex flex-wrap gap-1">
            {CHARS.map((c) => {
              const inSet = s.set.includes(c);
              const isDup = s.phase === "shrink" && s.dup === c && inSet;
              return (
                <span key={c} className={`grid h-8 w-8 place-items-center rounded-md border font-mono text-[13px] ${isDup ? "border-amber bg-amber-soft text-amber" : inSet ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface-2 text-ink-3"}`}>{c}</span>
              );
            })}
          </div>
          <div className="mt-1.5 text-[12px] text-ink-3">{t.setLegend}</div>
        </div>
        <div>
          <div className="eyebrow mb-2">{t.stateTitle}</div>
          <div className="flex flex-col gap-1 font-mono text-[13px] tabular-nums">
            <span>l = <span className="text-ink">{s.l}</span>{t.sep}r = <span className="text-ink">{s.r < 0 ? "−1" : s.r}</span>{t.sep}{t.lengthLabel}<span className="text-ink">{Math.max(0, end - s.l + 1)}</span></span>
            <span>{t.windowLabel}<span className="text-ink">{end >= s.l ? `"${S.slice(s.l, end + 1)}"` : '""'}</span>{s.phase === "shrink" && <span className="text-ink-3">{t.notAddedYet(s.r)}</span>}</span>
            <span>{t.bestLabel}<span className="text-green">{s.best}</span>{s.bestRange && <span className="text-ink-3">{t.bestNote(S.slice(s.bestRange[0], s.bestRange[1] + 1))}</span>}</span>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
