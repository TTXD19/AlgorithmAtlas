"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 八天的股價漲跌（每天的變化量），最大子陣列就是最賺的持有區間 */
const A = [-2, 1, -3, 4, -1, 2, 1, -5];

type Range = [number, number];
interface Step {
  desc: string;
  op: string;
  phase: "dc" | "kadane" | "done";
  cur?: Range;            // 目前處理的區間（其餘變暗）
  scan?: Range;           // 黃色：正在掃的區間
  best?: Range;           // 綠色：目前這層／目前的最佳區間
  solved: Record<string, { ans: number; range: Range }>;
  table?: { left?: string; right?: string; cross?: string; ans?: string };
  kadane?: { i: number; cur: number; best: number; curRange: Range; bestRange: Range };
}

const key = (lo: number, hi: number) => `${lo}-${hi}`;
/** a + b 的顯示，負數加括號：1 + (−5) */
const plus = (a: number, b: number) => `${a} + ${b < 0 ? `(${b})` : b}`;

const TEXT = demoText(
  {
    intro: "每格是當天的漲跌。要找連續一段加總最大的區間。分治：切半、各自解、再算跨中線的那一種。",
    baseCase: (label: string, l: number, r: number, c: number, best: number) =>
      `${label} 切到剩單一元素：左 ${l}、右 ${r} 各自就是自己的答案，跨中線是 ${plus(l, r)} = ${c}。三者取最大 ${best}。`,
    split: (label: string, lo: number, mid: number, hi: number) =>
      `${label} 切半：mid = ${mid}。先遞迴解左半 [${lo}, ${mid}]，再解右半 [${mid + 1}, ${hi}]。`,
    suffix: (label: string, left: number, right: number, mid: number, li: number, bestL: number) =>
      `回到 ${label}。左半最佳 ${left}，右半最佳 ${right}。接著算跨中線：從 mid = ${mid} 往左累加，最大後綴是 [${li}, ${mid}] = ${bestL}。`,
    prefix: (mid: number, ri: number, bestR: number, bestL: number, cross: number) =>
      `從 mid+1 = ${mid + 1} 往右累加，最大前綴是 [${mid + 1}, ${ri}] = ${bestR}。跨中線 = ${bestL} + ${bestR} = ${cross}。這一段掃描是 O(n)。`,
    combine: (label: string, left: number, right: number, cross: number, win: number, from: string, lo: number, hi: number) =>
      `${label} 的答案 = max(左 ${left}, 右 ${right}, 跨 ${cross}) = ${win}，來自${from} [${lo}, ${hi}]。`,
    fromLeft: "左半",
    fromRight: "右半",
    fromCross: "跨中線",
    dcDone: (ans: number, lo: number, hi: number) =>
      `分治完成：答案 ${ans}，區間 [${lo}, ${hi}]。每層跨中線掃描 O(n)，共 log n 層，T(n) = 2T(n/2) + n = O(n log n)。接下來看 Kadane。`,
    kadaneIntro: "Kadane：從左到右掃一遍。cur 是「以目前這格結尾」的最大和：若前面累積的 cur 是負的，帶著只會拖累，不如從這格重新開始。",
    kadaneFirst: (x: number) => `從第 0 格開始：cur = best = ${x}。`,
    kadaneRestart: (i: number, x: number) => `前面的 cur 是負的，丟掉，從第 ${i} 格重新開始：cur = ${x}。`,
    kadaneExtend: (prev: number, x: number, cur: number) => `cur ≥ 0，接上去：cur = ${plus(prev, x)} = ${cur}。`,
    kadaneNewBest: (best: number, lo: number, hi: number) => `超過目前最佳，best = ${best}，區間 [${lo}, ${hi}]。`,
    kadaneSameBest: (best: number) => `best 仍是 ${best}。`,
    finish: (best: number, lo: number, hi: number) =>
      `兩種做法答案相同：${best}，區間 [${lo}, ${hi}]。分治 O(n log n)，Kadane O(n) 且只用兩個變數。分治的價值在於它的形狀能推廣到線段樹等需要「合併兩段資訊」的結構。`,
    opStart: "開始",
    opDcDone: "分治結束",
    opKadane: "Kadane",
    opKadaneAt: (i: number) => `Kadane i=${i}`,
    opEnd: "結束",
    header: "8 天的漲跌 · 分治 → Kadane",
    arrayTitle: "陣列",
    hintDc: "黃色：正在掃的跨中線區段 · 綠色：這層的答案區間",
    hintKadane: "黃色：cur（以目前格結尾的區間） · 綠色：best",
    treeTitle: "遞迴樹（節點下方是解出的答案）",
    currentRange: "目前區間",
    rowLeft: "左半最佳",
    rowRight: "右半最佳",
    rowCross: "跨中線",
    rowAns: "這層答案",
    cardIndex: "目前位置 i",
    cardDone: "完成",
    cardCur: "cur（以 i 結尾）",
    summaryA: "分治 ",
    summaryB: "、空間 ",
    summaryC: " 遞迴深度；Kadane ",
    summaryD: "、空間 ",
    summaryE: "。答案都是 ",
    summaryF: "。",
  },
  {
    en: {
      intro: "Each cell is one day's price change. We want the contiguous stretch with the largest total. Divide and conquer: cut the array in half, solve each half, then handle the case that straddles the middle.",
      baseCase: (label: string, l: number, r: number, c: number, best: number) =>
        `${label} has been cut down to single elements: the left one, ${l}, and the right one, ${r}, are each their own answer, and crossing the middle gives ${plus(l, r)} = ${c}. The largest of the three is ${best}.`,
      split: (label: string, lo: number, mid: number, hi: number) =>
        `${label} splits in half at mid = ${mid}. Solve the left half [${lo}, ${mid}] recursively first, then the right half [${mid + 1}, ${hi}].`,
      suffix: (label: string, left: number, right: number, mid: number, li: number, bestL: number) =>
        `Back at ${label}. The left half's best is ${left} and the right half's is ${right}. Now for the crossing case: adding up leftwards from mid = ${mid}, the largest suffix is [${li}, ${mid}] = ${bestL}.`,
      prefix: (mid: number, ri: number, bestR: number, bestL: number, cross: number) =>
        `Adding up rightwards from mid+1 = ${mid + 1}, the largest prefix is [${mid + 1}, ${ri}] = ${bestR}. So crossing the middle gives ${bestL} + ${bestR} = ${cross}. That scan is O(n).`,
      combine: (label: string, left: number, right: number, cross: number, win: number, from: string, lo: number, hi: number) =>
        `The answer for ${label} is max(left ${left}, right ${right}, crossing ${cross}) = ${win}, which comes from the ${from} at [${lo}, ${hi}].`,
      fromLeft: "left half",
      fromRight: "right half",
      fromCross: "crossing segment",
      dcDone: (ans: number, lo: number, hi: number) =>
        `Divide and conquer is finished: the answer is ${ans} over [${lo}, ${hi}]. Each level spends O(n) on the crossing scan and there are log n levels, so T(n) = 2T(n/2) + n = O(n log n). Now for Kadane.`,
      kadaneIntro: "Kadane makes a single left-to-right pass. cur is the largest sum of a range ending at the current cell: if the running cur has gone negative, carrying it forward only drags the total down, so start again from this cell instead.",
      kadaneFirst: (x: number) => `Starting at cell 0: cur = best = ${x}.`,
      kadaneRestart: (i: number, x: number) => `The running cur is negative, so drop it and start again at cell ${i}: cur = ${x}.`,
      kadaneExtend: (prev: number, x: number, cur: number) => `cur ≥ 0, so extend it: cur = ${plus(prev, x)} = ${cur}.`,
      kadaneNewBest: (best: number, lo: number, hi: number) => ` That beats the best so far, so best = ${best} over [${lo}, ${hi}].`,
      kadaneSameBest: (best: number) => ` best is still ${best}.`,
      finish: (best: number, lo: number, hi: number) =>
        `Both approaches give the same answer: ${best} over [${lo}, ${hi}]. Divide and conquer runs in O(n log n); Kadane runs in O(n) and uses just two variables. The value of the divide-and-conquer version is that its shape generalises to structures like segment trees, which also merge information from two halves.`,
      opStart: "Start",
      opDcDone: "Divide and conquer done",
      opKadane: "Kadane",
      opKadaneAt: (i: number) => `Kadane i=${i}`,
      opEnd: "Done",
      header: "8 days of price changes · divide and conquer → Kadane",
      arrayTitle: "Array",
      hintDc: "Yellow: the crossing segment being scanned · Green: the answer range at this level",
      hintKadane: "Yellow: cur, the range ending at the current cell · Green: best",
      treeTitle: "Recursion tree (the number under each node is its answer)",
      currentRange: "Current range",
      rowLeft: "Best in left half",
      rowRight: "Best in right half",
      rowCross: "Crossing the middle",
      rowAns: "Answer at this level",
      cardIndex: "Current index i",
      cardDone: "done",
      cardCur: "cur (ending at i)",
      summaryA: "Divide and conquer: ",
      summaryB: " time, ",
      summaryC: " recursion depth. Kadane: ",
      summaryD: " time, ",
      summaryE: " space. Both give ",
      summaryF: ".",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const solved: Record<string, { ans: number; range: Range }> = {};
  const push = (s: Omit<Step, "solved">) => steps.push({ ...s, solved: { ...solved } });

  push({ desc: t.intro, op: t.opStart, phase: "dc" });

  const solve = (lo: number, hi: number): { ans: number; range: Range } => {
    const label = `[${lo}, ${hi}]`;
    if (hi - lo === 1) {
      const l = A[lo], r = A[hi], c = l + r;
      const cands: { ans: number; range: Range }[] = [{ ans: l, range: [lo, lo] }, { ans: r, range: [hi, hi] }, { ans: c, range: [lo, hi] }];
      const bestC = cands.reduce((b, x) => (x.ans > b.ans ? x : b));
      solved[key(lo, lo)] = { ans: l, range: [lo, lo] };
      solved[key(hi, hi)] = { ans: r, range: [hi, hi] };
      solved[key(lo, hi)] = bestC;
      push({
        desc: t.baseCase(label, l, r, c, bestC.ans),
        op: label, phase: "dc", cur: [lo, hi], best: bestC.range,
        table: { left: String(l), right: String(r), cross: String(c), ans: String(bestC.ans) },
      });
      return bestC;
    }
    const mid = (lo + hi) >> 1;
    push({ desc: t.split(label, lo, mid, hi), op: label, phase: "dc", cur: [lo, hi] });
    const L = solve(lo, mid);
    const R = solve(mid + 1, hi);

    // 跨中線：從 mid 往左的最大後綴 + 從 mid+1 往右的最大前綴
    let s = 0, bestL = -Infinity, li = mid;
    for (let i = mid; i >= lo; i--) { s += A[i]; if (s > bestL) { bestL = s; li = i; } }
    push({
      desc: t.suffix(label, L.ans, R.ans, mid, li, bestL),
      op: label, phase: "dc", cur: [lo, hi], scan: [li, mid],
      table: { left: String(L.ans), right: String(R.ans), cross: `${bestL} + ?` },
    });
    s = 0;
    let bestR = -Infinity, ri = mid + 1;
    for (let i = mid + 1; i <= hi; i++) { s += A[i]; if (s > bestR) { bestR = s; ri = i; } }
    const cross = bestL + bestR;
    push({
      desc: t.prefix(mid, ri, bestR, bestL, cross),
      op: label, phase: "dc", cur: [lo, hi], scan: [li, ri],
      table: { left: String(L.ans), right: String(R.ans), cross: String(cross) },
    });
    const cands: { ans: number; range: Range; name: string }[] = [
      { ...L, name: t.fromLeft }, { ...R, name: t.fromRight }, { ans: cross, range: [li, ri], name: t.fromCross },
    ];
    const win = cands.reduce((b, x) => (x.ans > b.ans ? x : b));
    solved[key(lo, hi)] = { ans: win.ans, range: win.range };
    push({
      desc: t.combine(label, L.ans, R.ans, cross, win.ans, win.name, win.range[0], win.range[1]),
      op: label, phase: "dc", cur: [lo, hi], best: win.range,
      table: { left: String(L.ans), right: String(R.ans), cross: String(cross), ans: String(win.ans) },
    });
    return { ans: win.ans, range: win.range };
  };
  const dc = solve(0, A.length - 1);
  push({ desc: t.dcDone(dc.ans, dc.range[0], dc.range[1]), op: t.opDcDone, phase: "dc", best: dc.range });

  // Kadane：cur 是「以 i 結尾的最大和」
  let cur = 0, best = -Infinity, cs = 0;
  let curRange: Range = [0, 0], bestRange: Range = [0, 0];
  push({ desc: t.kadaneIntro, op: t.opKadane, phase: "kadane", kadane: { i: -1, cur: 0, best: -Infinity, curRange: [0, -1], bestRange: [0, -1] } });
  for (let i = 0; i < A.length; i++) {
    const x = A[i];
    let d: string;
    if (i === 0) { cur = x; cs = 0; d = t.kadaneFirst(x); }
    else if (cur < 0) { cur = x; cs = i; d = t.kadaneRestart(i, x); }
    else { cur += x; d = t.kadaneExtend(cur - x, x, cur); }
    curRange = [cs, i];
    if (i === 0) { best = cur; bestRange = [0, 0]; }
    else if (cur > best) { best = cur; bestRange = [cs, i]; d += t.kadaneNewBest(best, cs, i); }
    else d += t.kadaneSameBest(best);
    push({ desc: d, op: t.opKadaneAt(i), phase: "kadane", kadane: { i, cur, best, curRange, bestRange } });
  }
  push({
    desc: t.finish(best, bestRange[0], bestRange[1]),
    op: t.opEnd, phase: "done", kadane: { i: A.length, cur, best, curRange, bestRange },
  });
  return steps;
}

/** 分治的遞迴樹：節點標籤是區間 */
function buildTree(lo: number, hi: number): GNode {
  const id = key(lo, hi);
  const label = lo === hi ? String(lo) : `${lo}-${hi}`;
  if (hi - lo <= 0) return { id, label, children: [] };
  const mid = (lo + hi) >> 1;
  return { id, label, children: [buildTree(lo, mid), buildTree(mid + 1, hi)] };
}
const TREE = buildTree(0, A.length - 1);

const inR = (r: Range | undefined, i: number) => !!r && i >= r[0] && i <= r[1];

export function MaxSubarrayDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const curKey = s.cur ? key(s.cur[0], s.cur[1]) : "";

  const tone = (i: number) => {
    if (s.phase === "dc") {
      if (inR(s.best, i)) return CELL.green;
      if (inR(s.scan, i)) return CELL.amber;
      if (s.cur && !inR(s.cur, i)) return CELL.dim;
      return "";
    }
    const kd = s.kadane!;
    if (inR(kd.bestRange, i)) return CELL.green;
    if (inR(kd.curRange, i)) return CELL.amber;
    if (i > kd.i) return CELL.dim;
    return "";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.header} />
      <div className="px-3.5 pt-3">
        <div className="mb-1.5 flex items-baseline gap-3">
          <span className="eyebrow">{t.arrayTitle}</span>
          <span className="text-[12px] text-ink-3">{s.phase === "dc" ? t.hintDc : t.hintKadane}</span>
        </div>
        <div className="flex gap-1">
          {A.map((_, i) => <span key={i} className="grid w-9 place-items-center font-mono text-[10.5px] text-ink-3">{i}</span>)}
        </div>
        <Cells items={A} tone={tone} />
      </div>

      {s.phase === "dc" ? (
        <div className="grid grid-cols-1 gap-3 p-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <div className="eyebrow mb-1">{t.treeTitle}</div>
            <ForestSVG
              roots={[TREE]} width={640} levelH={50} r={15} height={24 + 4 * 50}
              tone={(n) => (n.id === curKey ? "accent" : s.solved[n.id] ? "green" : "none")}
              sub={(n) => (s.solved[n.id] ? String(s.solved[n.id].ans) : "")}
            />
          </div>
          <div>
            <div className="eyebrow mb-1">{t.currentRange} {s.cur ? `[${s.cur[0]}, ${s.cur[1]}]` : ""}</div>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
              {[
                { id: "left", name: t.rowLeft, v: s.table?.left },
                { id: "right", name: t.rowRight, v: s.table?.right },
                { id: "cross", name: t.rowCross, v: s.table?.cross },
                { id: "ans", name: t.rowAns, v: s.table?.ans },
              ].map(({ id, name, v }) => (
                <span key={id} className="contents">
                  <span className="text-ink-3">{name}</span>
                  <span className={`font-mono tabular-nums ${id === "ans" && v ? "font-semibold text-green" : ""}`}>{v ?? "…"}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-3.5 md:grid-cols-3">
          {[
            { id: "i", name: t.cardIndex, v: s.kadane!.i < 0 ? "…" : s.kadane!.i >= A.length ? t.cardDone : String(s.kadane!.i) },
            { id: "cur", name: t.cardCur, v: s.kadane!.i < 0 ? "…" : `${s.kadane!.cur}  [${s.kadane!.curRange[0]}, ${s.kadane!.curRange[1]}]` },
            { id: "best", name: "best", v: s.kadane!.best === -Infinity ? "…" : `${s.kadane!.best}  [${s.kadane!.bestRange[0]}, ${s.kadane!.bestRange[1]}]` },
          ].map(({ id, name, v }) => (
            <div key={id} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
              <div className="eyebrow mb-0.5">{name}</div>
              <div className={`font-mono text-[15px] tabular-nums ${id === "best" ? "text-green" : ""}`}>{v}</div>
            </div>
          ))}
          {s.phase === "done" && (
            <div className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-[13px] text-ink md:col-span-3">
              {t.summaryA}<span className="font-mono">O(n log n)</span>{t.summaryB}<span className="font-mono">O(log n)</span>{t.summaryC}<span className="font-mono">O(n)</span>{t.summaryD}<span className="font-mono">O(1)</span>{t.summaryE}<span className="font-mono font-semibold">{s.kadane!.best}</span>{t.summaryF}
            </div>
          )}
        </div>
      )}
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
