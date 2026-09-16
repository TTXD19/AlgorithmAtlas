"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** Combination Sum：candidates 已排序，每個數可以重複使用 */
const CAND = [2, 3, 6, 7];
const TARGET = 7;

const TEXT = demoText(
  {
    sep: "、",
    opStart: "開始",
    opEnd: "結束",
    opFound: (label: string) => `找到 ${label}`,
    opPrune: (v: number, remain: number) => `剪枝 ${v} > ${remain}`,
    opPick: (v: number) => `選 ${v}`,
    opUndo: (v: number) => `撤銷 ${v}`,
    intro: (target: number) =>
      `目標湊出 ${target}。每層從 start 開始往右挑（不回頭挑左邊的，避免 [2,3] 和 [3,2] 算兩次），remain 記錄還差多少。`,
    found: (label: string, target: number) => `remain 歸零，路徑 ${label} 剛好湊到 ${target}。收進答案，回到上一層。`,
    prune: (i: number, v: number, remain: number) =>
      `剪枝：candidates[${i}] = ${v} 已經大於 remain = ${remain}。因為陣列已排序，右邊只會更大，整個 for 迴圈直接 break。`,
    pick: (v: number, remain: number, i: number) =>
      `選 ${v}，remain 變成 ${remain}。下一層的 start 仍是 ${i}，因為同一個數可以重複用。`,
    undo: (v: number, remain: number, next: string) =>
      `撤銷：把 ${v} 拿掉，remain 回到 ${remain}，換下一個候選 ${next}。`,
    nextCand: (i: number, v: number) => `candidates[${i}] = ${v}`,
    noneLeft: "（沒有了）",
    finished: (list: string) =>
      `搜尋結束，答案 ${list}。沒有排序與剪枝的話，每一層都會把 start 之後的候選全部試完，樹會大很多。`,
    caption: (cands: string, target: number) => `candidates = [${cands}] · target = ${target}`,
    candidates: (start: number) => `candidates（start = ${start}）`,
    startHint: "灰色是 start 左邊，這一層不再考慮",
    currentPath: (remain: number) => `目前路徑（remain = ${remain}）`,
    foundLabel: "已找到的組合",
    none: "還沒有",
    stackLabel: "遞迴堆疊（每一層的 start 與 remain，右邊是最深的一層）",
  },
  {
    en: {
      sep: ", ",
      opStart: "Start",
      opEnd: "Done",
      opFound: (label: string) => `Found ${label}`,
      opPrune: (v: number, remain: number) => `Prune ${v} > ${remain}`,
      opPick: (v: number) => `Take ${v}`,
      opUndo: (v: number) => `Undo ${v}`,
      intro: (target: number) =>
        `The goal is to make ${target}. Each level picks from start rightwards and never looks back to the left, which is what stops [2,3] and [3,2] from being counted twice. remain tracks how much is still missing.`,
      found: (label: string, target: number) => `remain has hit zero: the path ${label} makes exactly ${target}. Record it as an answer and return to the level above.`,
      prune: (i: number, v: number, remain: number) =>
        `Prune: candidates[${i}] = ${v} is already larger than remain = ${remain}. The array is sorted, so everything to the right is larger still, and the whole for loop can break immediately.`,
      pick: (v: number, remain: number, i: number) =>
        `Take ${v}, which leaves remain = ${remain}. The next level still starts at ${i}, because the same number may be reused.`,
      undo: (v: number, remain: number, next: string) =>
        `Undo: remove ${v}, which restores remain to ${remain}, and move on to the next candidate, ${next}.`,
      nextCand: (i: number, v: number) => `candidates[${i}] = ${v}`,
      noneLeft: "but there are none left",
      finished: (list: string) =>
        `The search is over and the answers are ${list}. Without the sort and the pruning, every level would try every candidate after start, and the tree would be far larger.`,
      caption: (cands: string, target: number) => `candidates = [${cands}] · target = ${target}`,
      candidates: (start: number) => `candidates (start = ${start})`,
      startHint: "Grey cells sit to the left of start and are out of consideration at this level.",
      currentPath: (remain: number) => `Current path (remain = ${remain})`,
      foundLabel: "Combinations found",
      none: "none yet",
      stackLabel: "The recursion stack (start and remain at each level; the deepest level is on the right)",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Frame { start: number; remain: number }
interface Step { desc: string; op: string; path: number[]; frames: Frame[]; found: string[]; i: number; kind: "pick" | "undo" | "prune" | "found" | "none" }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const path: number[] = [];
  const frames: Frame[] = [];
  const found: string[] = [];
  const snap = (desc: string, op: string, i: number, kind: Step["kind"]) =>
    steps.push({ desc, op, path: [...path], frames: frames.map((f) => ({ ...f })), found: [...found], i, kind });

  snap(t.intro(TARGET), t.opStart, -1, "none");
  const dfs = (start: number, remain: number) => {
    frames.push({ start, remain });
    if (remain === 0) {
      const label = `[${path.join(",")}]`;
      found.push(label);
      snap(t.found(label, TARGET), t.opFound(label), -1, "found");
      frames.pop();
      return;
    }
    for (let i = start; i < CAND.length; i++) {
      if (CAND[i] > remain) {
        snap(t.prune(i, CAND[i], remain), t.opPrune(CAND[i], remain), i, "prune");
        break;
      }
      path.push(CAND[i]);
      snap(t.pick(CAND[i], remain - CAND[i], i), t.opPick(CAND[i]), i, "pick");
      dfs(i, remain - CAND[i]);
      path.pop();
      snap(t.undo(CAND[i], remain, i + 1 < CAND.length ? t.nextCand(i + 1, CAND[i + 1]) : t.noneLeft), t.opUndo(CAND[i]), i, "undo");
    }
    frames.pop();
  };
  dfs(0, TARGET);
  snap(t.finished(found.join(t.sep)), t.opEnd, -1, "none");
  return steps;
}

export function CombinationsDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const top = s.frames[s.frames.length - 1];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.caption(CAND.join(", "), TARGET)} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-1.5">{t.candidates(top ? top.start : 0)}</div>
          <Cells items={CAND} tone={(i) => (i === s.i ? (s.kind === "prune" ? CELL.amber : CELL.accent) : top && i < top.start ? CELL.dim : "")} />
          <div className="mt-1.5 text-[12px] text-ink-3">{t.startHint}</div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.currentPath(top ? top.remain : TARGET)}</div>
          <Cells items={s.path} tone={() => (s.kind === "found" ? CELL.green : CELL.amber)} empty={ui.demo.empty} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.foundLabel}</div>
          <div className="flex flex-wrap gap-1 font-mono text-[12.5px]">
            {s.found.map((f, i) => (
              <span key={f} className={`rounded-md border px-1.5 leading-7 ${i === s.found.length - 1 && s.kind === "found" ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink-2"}`}>{f}</span>
            ))}
            {s.found.length === 0 && <span className="text-ink-3">{t.none}</span>}
          </div>
        </div>
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-1.5">{t.stackLabel}</div>
        <div className="flex flex-wrap gap-1 font-mono text-[12px]">
          {s.frames.map((f, i) => (
            <span key={i} className={`rounded-md border px-2 leading-7 ${i === s.frames.length - 1 ? (s.kind === "prune" ? "border-amber bg-amber-soft text-amber" : "border-accent bg-accent text-accent-ink") : "border-line bg-surface-2 text-ink-2"}`}>
              dfs(start={f.start}, remain={f.remain})
            </span>
          ))}
          {s.frames.length === 0 && <span className="text-ink-3">{ui.demo.empty}</span>}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
