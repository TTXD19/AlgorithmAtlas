"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 4 個城市的旅行推銷員問題：從 0 出發，每個城市恰好一次，最後回到 0。 */
const N = 4;
const FULL = (1 << N) - 1;
const D = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];
const POS: [number, number][] = [[60, 50], [200, 50], [200, 160], [60, 160]];
const MASKS = Array.from({ length: FULL + 1 }, (_, m) => m).filter((m) => m & 1);

/** 邊權重標籤的位置：水平邊放上方、垂直邊放外側、對角線放離 a 較近的 30% 處以免兩條對角線的字重疊。 */
function labelPos(a: number, b: number): [number, number] {
  const [x1, y1] = POS[a];
  const [x2, y2] = POS[b];
  if (y1 === y2) return [(x1 + x2) / 2, y1 - 6];
  if (x1 === x2) return [x1 + (x1 < 130 ? -16 : 16), (y1 + y2) / 2 + 4];
  return [x1 + (x2 - x1) * 0.3 + (x1 < x2 ? -10 : 10), y1 + (y2 - y1) * 0.3];
}

const bits = (m: number) => m.toString(2).padStart(N, "0");
const setOf = (m: number) => `{${Array.from({ length: N }, (_, i) => i).filter((i) => m & (1 << i)).join(",")}}`;
const popcount = (m: number) => bits(m).split("").filter((c) => c === "1").length;

const TEXT = demoText(
  {
    opInit: "初始化",
    opClose: "收尾回到 0",
    opDone: "完成",

    intro: (n: number) =>
      `dp[mask][j] 是「已拜訪 mask 這個集合，目前站在 j」的最小成本。mask 是 ${n} 位元的整數，第 i 位是 1 代表城市 i 拜訪過。起點：dp[0001][0] = 0。`,
    head: (maskBits: string, set: string, j: number, p: number, subBits: string, from: number, d: number, cand: number) =>
      `mask = ${maskBits} = ${set}，最後停在 ${j}。上一站 ${p}：dp[${subBits}][${p}] + d(${p},${j}) = ${from} + ${d} = ${cand}。`,
    tailBest: (best: number, bp: number) => ` 候選看完，最小是 ${best}（從 ${bp} 來），填入。`,
    tailOnly: " 只有這一個來源，直接填入。",
    tailNewMin: " 目前最小。",
    tailWorse: (best: number) => ` 比目前最小 ${best} 大。`,
    close: (fullBits: string, j: number, from: number | null, d: number, cand: number) =>
      `所有城市都走過（mask = ${fullBits}），最後在 ${j} 要回到 0：dp[${fullBits}][${j}] + d(${j},0) = ${from} + ${d} = ${cand}。`,
    finished: (best: number | null, tour: string, n: number) =>
      `最短環路成本 ${best}，路線 ${tour}。狀態有 2ⁿ·n 個、每個狀態看 n 個上一站，共 O(2ⁿ·n²)。n = ${n} 時暴力只有 (${n}−1)! = 6 條路線，反而比較快；但 n = 20 時暴力要 19! ≈ 1.2×10¹⁷ 條，DP 只要 2²⁰·20² ≈ 4.2×10⁸ 次運算。`,

    right: "4 個城市 · 從 0 出發回到 0",
    graphTitle: "城市與距離",
    aria: "四個城市的距離圖",
    posLabel: "位置 j",
    prevLabel: "上一站",
    candLabel: "候選",
    legend: "綠色是 mask 裡已拜訪的城市，藍色是目前位置，黃色是正在考慮的上一站。",
    tableTitle: "dp[mask][j]（只列含起點 0 的 mask）",
    tableNote: "mask 由小到大填：任何子集合的整數值都比它小，所以用到的 dp[sub][prev] 一定已經算好。",
  },
  {
    en: {
      opInit: "Initialise",
      opClose: "Close the tour at 0",
      opDone: "Done",

      intro: (n: number) =>
        `dp[mask][j] is the cheapest way to have visited the set mask and be standing at j right now. mask is an integer of ${n} bits whose bit i is 1 when city i has been visited. The starting point is dp[0001][0] = 0.`,
      head: (maskBits: string, set: string, j: number, p: number, subBits: string, from: number, d: number, cand: number) =>
        `mask = ${maskBits} = ${set}, ending at ${j}. Coming from ${p}: dp[${subBits}][${p}] + d(${p},${j}) = ${from} + ${d} = ${cand}.`,
      tailBest: (best: number, bp: number) => ` That was the last candidate; the smallest is ${best}, arriving from ${bp}, so store it.`,
      tailOnly: " This is the only possible predecessor, so store it straight away.",
      tailNewMin: " That is the smallest so far.",
      tailWorse: (best: number) => ` That is worse than the current best of ${best}.`,
      close: (fullBits: string, j: number, from: number | null, d: number, cand: number) =>
        `Every city has been visited (mask = ${fullBits}), so from the final city ${j} we still have to return to 0: dp[${fullBits}][${j}] + d(${j},0) = ${from} + ${d} = ${cand}.`,
      finished: (best: number | null, tour: string, n: number) =>
        `The cheapest tour costs ${best} and runs ${tour}. There are 2ⁿ·n states and each one considers n predecessors, so the whole thing is O(2ⁿ·n²). At n = ${n} brute force only has (${n}−1)! = 6 tours and is the faster choice, but at n = 20 brute force faces 19! ≈ 1.2×10¹⁷ tours while the DP needs only 2²⁰·20² ≈ 4.2×10⁸ operations.`,

      right: "4 cities · leave 0 and return to 0",
      graphTitle: "Cities and distances",
      aria: "Distance graph of four cities",
      posLabel: "position j",
      prevLabel: "previous",
      candLabel: "candidate",
      legend: "Green cities are the ones already in mask, blue is the current position, and amber is the predecessor being considered.",
      tableTitle: "dp[mask][j] (only masks that contain the start city 0)",
      tableNote: "Masks are filled in increasing order: every subset of a mask is a smaller integer, so each dp[sub][prev] the formula needs is already known.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  dp: (number | null)[][];
  mask: number;
  j: number;
  prev: number | null;
  edge: [number, number] | null;
  cand: number | null;
  tour: number[] | null;
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const dp: (number | null)[][] = Array.from({ length: FULL + 1 }, () => Array<number | null>(N).fill(null));
  const parent: (number | null)[][] = Array.from({ length: FULL + 1 }, () => Array<number | null>(N).fill(null));
  const snap = (desc: string, op: string, mask: number, j: number, prev: number | null, edge: [number, number] | null, cand: number | null, tour: number[] | null = null) =>
    steps.push({ desc, op, dp: dp.map((r) => [...r]), mask, j, prev, edge, cand, tour });

  dp[1][0] = 0;
  snap(t.intro(N), t.opInit, 1, 0, null, null, null);

  for (const mask of MASKS) {
    if (popcount(mask) < 2) continue;
    for (let j = 1; j < N; j++) {
      if (!(mask & (1 << j))) continue;
      const sub = mask ^ (1 << j);
      let best: number | null = null;
      let bp = -1;
      const prevs = Array.from({ length: N }, (_, p) => p).filter((p) => sub & (1 << p) && dp[sub][p] !== null);
      prevs.forEach((p, idx) => {
        const cand = (dp[sub][p] ?? 0) + D[p][j];
        if (best === null || cand < best) { best = cand; bp = p; }
        const op = `dp[${bits(mask)}][${j}]`;
        const head = t.head(bits(mask), setOf(mask), j, p, bits(sub), dp[sub][p] ?? 0, D[p][j], cand);
        if (idx === prevs.length - 1) {
          dp[mask][j] = best;
          parent[mask][j] = bp;
          snap(`${head}${prevs.length > 1 ? t.tailBest(best, bp) : t.tailOnly}`, op, mask, j, p, [p, j], cand);
        } else {
          snap(`${head}${cand === best ? t.tailNewMin : t.tailWorse(best)}`, op, mask, j, p, [p, j], cand);
        }
      });
    }
  }

  let ansBest: number | null = null;
  let ansJ = -1;
  for (let j = 1; j < N; j++) {
    const cand = (dp[FULL][j] ?? 0) + D[j][0];
    if (ansBest === null || cand < ansBest) { ansBest = cand; ansJ = j; }
    snap(t.close(bits(FULL), j, dp[FULL][j], D[j][0], cand), t.opClose, FULL, j, null, [j, 0], cand);
  }
  const tour: number[] = [];
  let m = FULL;
  let j = ansJ;
  while (j !== 0 && j !== -1) {
    tour.unshift(j);
    const p = parent[m][j];
    m ^= 1 << j;
    j = p ?? 0;
  }
  tour.unshift(0);
  tour.push(0);
  snap(t.finished(ansBest, tour.join(" → "), N), t.opDone, FULL, ansJ, null, null, ansBest, tour);
  return steps;
}

export function BitmaskDpDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const visited = (i: number) => (s.mask & (1 << i)) !== 0;
  const tourEdges = new Set<string>();
  if (s.tour) for (let i = 0; i + 1 < s.tour.length; i++) tourEdges.add([s.tour[i], s.tour[i + 1]].sort().join("-"));
  const edgeKey = s.edge ? [...s.edge].sort().join("-") : "";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.right} />
      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div>
          <div className="eyebrow mb-1.5">{t.graphTitle}</div>
          <svg viewBox="0 0 260 210" className="block h-auto w-[260px] max-w-full" role="img" aria-label={t.aria}>
            {[[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].map(([a, b]) => {
              const key = `${a}-${b}`;
              const hot = key === edgeKey;
              const inTour = tourEdges.has(key);
              const [x1, y1] = POS[a];
              const [x2, y2] = POS[b];
              return (
                <g key={key}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? "var(--accent)" : inTour ? "var(--green)" : "var(--line-strong)"} strokeWidth={hot || inTour ? 3 : 1.5} />
                  <text x={labelPos(a, b)[0]} y={labelPos(a, b)[1]} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill={hot ? "var(--accent)" : "var(--ink-3)"}>{D[a][b]}</text>
                </g>
              );
            })}
            {POS.map(([x, y], i) => {
              const isJ = i === s.j;
              const isPrev = i === s.prev;
              const fill = isJ ? "var(--accent)" : isPrev ? "var(--amber-soft)" : visited(i) ? "var(--green-soft)" : "var(--surface)";
              const stroke = isJ ? "var(--accent)" : isPrev ? "var(--amber)" : visited(i) ? "var(--green)" : "var(--line-strong)";
              const ink = isJ ? "var(--accent-ink)" : isPrev ? "var(--amber)" : visited(i) ? "var(--green)" : "var(--ink)";
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={17} fill={fill} stroke={stroke} strokeWidth={2} />
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fontFamily="var(--font-mono)" fill={ink}>{i}</text>
                </g>
              );
            })}
          </svg>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px] text-ink-2">
            <span className="text-ink-3">mask</span><span>{bits(s.mask)} = {s.mask} = {setOf(s.mask)}</span>
            <span className="text-ink-3">{t.posLabel}</span><span>{s.j}</span>
            {s.prev !== null && <><span className="text-ink-3">{t.prevLabel}</span><span>{s.prev}</span></>}
            {s.cand !== null && <><span className="text-ink-3">{t.candLabel}</span><span>{s.cand}</span></>}
          </div>
          <p className="mt-2 mb-0 text-[12px] text-ink-3">{t.legend}</p>
        </div>
        <div className="overflow-x-auto">
          <div className="eyebrow mb-1.5">{t.tableTitle}</div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(${N}, 50px)` }}>
            <div className="grid h-7 place-items-center font-mono text-[11px] text-ink-3">mask \ j</div>
            {Array.from({ length: N }, (_, j) => <div key={`h${j}`} className="grid h-7 place-items-center font-mono text-[12px] font-semibold text-ink-2">{j}</div>)}
            {MASKS.map((m) => (
              <MaskRow key={m} m={m} s={s} />
            ))}
          </div>
          <p className="mt-2 mb-0 font-mono text-[11px] text-ink-3">{t.tableNote}</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function MaskRow({ m, s }: { m: number; s: Step }) {
  const sub = s.prev !== null ? s.mask ^ (1 << s.j) : -1;
  return (
    <>
      <div className={`grid h-9 grid-cols-[auto_1fr] items-center gap-2 rounded-md border px-2 font-mono text-[11.5px] ${m === s.mask ? "border-accent bg-accent-soft text-ink" : m === sub ? "border-amber bg-amber-soft text-amber" : "border-line bg-surface-2 text-ink-2"}`}>
        <span className="tabular-nums">{bits(m)}</span>
        <span className="text-[10.5px] opacity-80">{setOf(m)}</span>
      </div>
      {Array.from({ length: N }, (_, j) => {
        const v = s.dp[m][j];
        const legal = m & (1 << j);
        const isCur = m === s.mask && j === s.j;
        const isFrom = m === sub && j === s.prev;
        const tone = isCur
          ? "border-accent bg-accent text-accent-ink"
          : isFrom ? "border-amber bg-amber-soft text-amber"
          : v !== null ? "border-line-strong bg-surface text-ink"
          : legal ? "border-dashed border-line text-ink-3" : "border-transparent text-ink-3";
        return (
          <div key={j} className={`grid h-9 place-items-center rounded-md border font-mono text-[13px] font-medium tabular-nums ${tone}`}>
            {v !== null ? v : legal ? "" : "·"}
          </div>
        );
      })}
    </>
  );
}
