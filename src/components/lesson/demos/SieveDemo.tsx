"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, CELL } from "./StepBar";

/** 1 到 60 排成每列 10 個。√60 ≈ 7.75，所以只有 2、3、5、7 需要劃倍數，11² = 121 已經超過 60。 */
const N = 60;
const NUMS = Array.from({ length: N }, (_, i) => i + 1);
const SQRT = Math.sqrt(N).toFixed(2);

interface Row { p: number; start: number; visits: number; fresh: number; stop?: boolean }
interface Step {
  desc: string;
  op: string;
  /** 目前的質數 */
  p: number | null;
  /** 黃色：這一步處理的 p 的倍數（起點 p²，或這一步新劃掉的數） */
  hot: number[];
  /** 虛線：p 的倍數，但早就被更小的質數劃掉 */
  again: number[];
  /** 這一步做完後的劃掉狀態，索引就是數字本身 */
  crossed: boolean[];
  /** 已經用來篩過的質數 */
  primes: number[];
  rows: Row[];
  visits: number;
  done: boolean;
}

/** 太長就縮成「前三個、…、最後一個」，分隔符由語言決定 */
const join = (xs: number[], sep: string) =>
  xs.length > 10 ? `${xs.slice(0, 3).join(sep)}${sep}…${sep}${xs[xs.length - 1]}` : xs.join(sep);

/** 依「被哪個質數劃掉」分組，每組是 [質數, 被它劃掉的數] */
type Group = [number, number[]];

const TEXT = demoText(
  {
    intro: (n: number) =>
      `把 2 到 ${n} 全部先當成「可能是質數」。規則只有一條：由小到大找下一個還沒被劃掉的數，它就是質數，再把它的倍數全部劃掉。1 既不是質數也不是合數，不參與。`,
    skipped: (xs: number[]) => `${xs.join("、")} 已被劃掉，是合數，跳過。`,
    byText: (groups: Group[]) => groups.map(([q, xs]) => `${join(xs, "、")} 被 ${q} 劃掉`).join("，"),
    stopDesc: (skip: string, p: number, n: number, sqrt: string, prev: number, primes: number[], below: number[]) =>
      `${skip}${p} 沒被劃掉，是質數，但 ${p}² = ${p * p} > ${n}，停。任何 ≤ ${n} 的合數都能寫成 a × b 且 a ≤ b，於是 a × a ≤ ${n}、a ≤ √${n} ≈ ${sqrt}，它一定有 ≤ ${prev} 的質因數，早就被 ${primes.join("、")} 劃掉了。例如 ${p} 的倍數 ${below.join("、")} 全都已經劃掉（虛線）。`,
    startFrom: (p: number) => `倍數從 ${p}² = ${p * p}（黃色）開始劃，這時 p² 剛好等於 2p，${p} 本身不劃。`,
    startFromSkipping: (p: number, by: string) =>
      `倍數從 ${p}² = ${p * p}（黃色）開始劃就好：比它小的倍數 ${p} × k 都有 k < ${p}，k 的質因數比 ${p} 小，所以早就被劃掉了：${by}（虛線）。`,
    primeDesc: (skip: string, p: number, start: string) =>
      `${skip}${p} 沒被劃掉，表示沒有比它小的質數整除它，所以 ${p} 是質數。${start}`,
    crossDesc: (p: number, last: string, visited: number, again: string, save: string) =>
      `從 ${p * p} 開始每次加 ${p}，一路到 ${last}：走訪 ${visited} 個數。${again}${save}`,
    againSome: (count: number, by: string, fresh: number[]) =>
      `其中 ${count} 個早就劃掉了（虛線：${by}），新劃掉的是 ${join(fresh, "、")}，共 ${fresh.length} 個。`,
    againNone: (count: number) => `全部都是第一次被劃掉，共 ${count} 個。`,
    saveText: (twoP: number, count: number) => `若從 2p = ${twoP} 開始，還得多走 ${count} 個早就劃掉的數。`,
    resultDesc: (primes: number[], n: number, visits: number, terms: string, composites: number, repeats: number) =>
      `剩下沒被劃掉的 ${primes.length} 個數就是 ${n} 以內的全部質數：${primes.join("、")}。總共劃了 ${visits} 次（${terms}），劃掉 ${composites} 個合數，其中 ${repeats} 次是重複劃到。次數約為 N/2 + N/3 + N/5 + N/7 + …，質數倒數和只以 log log N 成長，所以時間 O(N log log N)；只用一個長度 N + 1 的布林陣列，空間 O(N)。`,
    opStart: "開始",
    opStop: (p: number, n: number) => `p = ${p}：p² > ${n}，停`,
    opPrime: (p: number) => `p = ${p}：確認質數`,
    opCross: (p: number) => `p = ${p}：劃掉倍數`,
    opResult: "結果",
    legendCurrent: "目前的質數 p",
    legendHot: "p 的倍數（起點或新劃掉）",
    legendAgain: "早就被更小的質數劃掉",
    legendComposite: "合數",
    legendPrime: "質數",
    gridTitle: (n: number) => `1 到 ${n}（每列 10 個）`,
    tableTitle: "每個質數的工作量",
    colStart: "起點 p²",
    colVisits: "走訪",
    colFresh: "新劃掉",
    stopped: "停",
    tableEmpty: "還沒開始劃",
    statRemaining: "未劃掉",
    statCrossed: "已劃掉",
    statVisits: "累計走訪",
  },
  {
    en: {
      intro: (n: number) =>
        `Start by treating every number from 2 to ${n} as possibly prime. There is only one rule: scan upwards for the next number that has not been crossed out — that number is prime — then cross out all of its multiples. 1 is neither prime nor composite, so it takes no part.`,
      skipped: (xs: number[]) => `${xs.join(", ")} ${xs.length === 1 ? "is" : "are"} already crossed out, so composite — skip. `,
      byText: (groups: Group[]) => groups.map(([q, xs]) => `${join(xs, ", ")} crossed out by ${q}`).join("; "),
      stopDesc: (skip: string, p: number, n: number, sqrt: string, prev: number, primes: number[], below: number[]) =>
        `${skip}${p} was never crossed out, so it is prime — but ${p}² = ${p * p} > ${n}, so we stop here. Every composite ≤ ${n} can be written as a × b with a ≤ b, so a × a ≤ ${n} and a ≤ √${n} ≈ ${sqrt}: it must have a prime factor ≤ ${prev}, which means ${primes.join(", ")} crossed it out long ago. The multiples of ${p} — ${below.join(", ")} — are all crossed out already (dashed).`,
      startFrom: (p: number) => `Crossing out starts at ${p}² = ${p * p} (yellow); here p² is exactly 2p, so ${p} itself is never crossed out.`,
      startFromSkipping: (p: number, by: string) =>
        `Crossing out only needs to start at ${p}² = ${p * p} (yellow): a smaller multiple ${p} × k has k < ${p}, and k's prime factors are smaller than ${p}, so it was crossed out long ago — ${by} (dashed).`,
      primeDesc: (skip: string, p: number, start: string) =>
        `${skip}${p} was never crossed out, so no smaller prime divides it: ${p} is prime. ${start}`,
      crossDesc: (p: number, last: string, visited: number, again: string, save: string) =>
        `Starting at ${p * p} and stepping by ${p} up to ${last}: ${visited} numbers visited. ${again}${save}`,
      againSome: (count: number, by: string, fresh: number[]) =>
        `${count} of them ${count === 1 ? "was" : "were"} already crossed out (dashed: ${by}), and ${fresh.length} ${fresh.length === 1 ? "number is" : "numbers are"} newly crossed out: ${join(fresh, ", ")}. `,
      againNone: (count: number) => `All ${count} of them are crossed out for the first time. `,
      saveText: (twoP: number, count: number) => `Starting from 2p = ${twoP} instead would have visited ${count} more number${count === 1 ? "" : "s"} that ${count === 1 ? "was" : "were"} already crossed out.`,
      resultDesc: (primes: number[], n: number, visits: number, terms: string, composites: number, repeats: number) =>
        `The ${primes.length} numbers left uncrossed are every prime up to ${n}: ${primes.join(", ")}. That took ${visits} crossings in total (${terms}) to remove ${composites} composites, and ${repeats} of those landed on a number that was already crossed out. The work is roughly N/2 + N/3 + N/5 + N/7 + …, and the sum of the reciprocals of the primes grows only like log log N, so the time is O(N log log N); a single boolean array of length N + 1 gives O(N) space.`,
      opStart: "Start",
      opStop: (p: number, n: number) => `p = ${p}: p² > ${n}, stop`,
      opPrime: (p: number) => `p = ${p}: prime confirmed`,
      opCross: (p: number) => `p = ${p}: cross out multiples`,
      opResult: "Result",
      legendCurrent: "Current prime p",
      legendHot: "Multiple of p (start, or newly crossed out)",
      legendAgain: "Already crossed out by a smaller prime",
      legendComposite: "Composite",
      legendPrime: "Prime",
      gridTitle: (n: number) => `1 to ${n} (10 per row)`,
      tableTitle: "Work done per prime",
      colStart: "Start p²",
      colVisits: "Visits",
      colFresh: "Newly crossed",
      stopped: "stop",
      tableEmpty: "Nothing crossed out yet",
      statRemaining: "Uncrossed",
      statCrossed: "Crossed out",
      statVisits: "Total visits",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const crossed = new Array<boolean>(N + 1).fill(false);
  const by = new Array<number>(N + 1).fill(0); // 第一個劃掉它的質數，也就是它的最小質因數
  const primes: number[] = [];
  const rows: Row[] = [];
  let visits = 0;
  const snap = (desc: string, op: string, p: number | null, hot: number[], again: number[], done = false) =>
    steps.push({ desc, op, p, hot, again, crossed: [...crossed], primes: [...primes], rows: rows.map((r) => ({ ...r })), visits, done });

  /** 依「被哪個質數劃掉」分組描述，例如「10、20 被 2 劃掉，15 被 3 劃掉」 */
  const byText = (xs: number[]) =>
    t.byText(
      primes
        .map((q): Group => [q, xs.filter((m) => by[m] === q)])
        .filter(([, g]) => g.length > 0),
    );

  snap(t.intro(N), t.opStart, null, [], []);

  let prev = 1;
  for (let p = 2; p <= N; p++) {
    if (crossed[p]) continue;
    const skipped = NUMS.filter((x) => x > prev && x < p);
    const skipText = skipped.length ? t.skipped(skipped) : "";
    const below: number[] = [];
    for (let m = 2 * p; m < p * p && m <= N; m += p) below.push(m);

    if (p * p > N) {
      rows.push({ p, start: p * p, visits: 0, fresh: 0, stop: true });
      snap(t.stopDesc(skipText, p, N, SQRT, prev, primes, below), t.opStop(p, N), p, [], below);
      break;
    }

    primes.push(p);
    const startText = below.length ? t.startFromSkipping(p, byText(below)) : t.startFrom(p);
    snap(t.primeDesc(skipText, p, startText), t.opPrime(p), p, [p * p], below);

    const fresh: number[] = [];
    const again: number[] = [];
    let last = p * p;
    for (let m = p * p; m <= N; m += p) {
      visits++;
      last = m;
      if (crossed[m]) again.push(m);
      else { crossed[m] = true; by[m] = p; fresh.push(m); }
    }
    rows.push({ p, start: p * p, visits: fresh.length + again.length, fresh: fresh.length });
    const againText = again.length ? t.againSome(again.length, byText(again), fresh) : t.againNone(fresh.length);
    const saveText = below.length ? t.saveText(2 * p, below.length) : "";
    snap(t.crossDesc(p, String(last), fresh.length + again.length, againText, saveText), t.opCross(p), p, fresh, again);
    prev = p;
  }

  const result = NUMS.filter((x) => x >= 2 && !crossed[x]);
  const work = rows.filter((r) => !r.stop);
  const composites = N - 1 - result.length;
  snap(t.resultDesc(result, N, visits, work.map((r) => r.visits).join(" + "), composites, visits - composites), t.opResult, null, [], [], true);
  return steps;
}

const legend = (t: T) => [
  { tone: CELL.accent, label: t.legendCurrent },
  { tone: CELL.amber, label: t.legendHot },
  { tone: "border-dashed border-amber bg-surface-2 text-ink-3", label: t.legendAgain },
  { tone: `${CELL.dim} line-through`, label: t.legendComposite },
  { tone: CELL.green, label: t.legendPrime },
];

export function SieveDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const remaining = NUMS.filter((x) => x >= 2 && !s.crossed[x]).length;

  const tone = (x: number) => {
    if (x === 1) return "border-dashed border-line bg-surface-2 text-ink-3";
    if (x === s.p) return CELL.accent;
    if (s.hot.includes(x)) return `${CELL.amber} ${s.crossed[x] ? "line-through" : ""}`;
    if (s.again.includes(x)) return "border-dashed border-amber bg-surface-2 text-ink-3 line-through";
    if (s.crossed[x]) return `${CELL.dim} line-through`;
    if (s.done || s.primes.includes(x)) return CELL.green;
    return "border-line-strong bg-surface text-ink";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`N = ${N} · √${N} ≈ ${SQRT}`} />

      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.gridTitle(N)}</div>
        <div className="grid max-w-[440px] grid-cols-10 gap-1">
          {NUMS.map((x) => (
            <span key={x} className={`grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12px] tabular-nums ${tone(x)}`}>{x}</span>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12px] text-ink-3">
          {legend(t).map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span className={`inline-block h-3.5 w-3.5 rounded-[4px] border ${l.tone}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-1">{t.tableTitle}</div>
          <table className="w-full border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr className="text-[11px] text-ink-3">
                <th className="px-2 py-1 text-left font-medium">p</th>
                <th className="px-2 py-1 text-right font-medium">{t.colStart}</th>
                <th className="px-2 py-1 text-right font-medium">{t.colVisits}</th>
                <th className="px-2 py-1 text-right font-medium">{t.colFresh}</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r.p} className={`border-t border-line ${r.p === s.p ? "bg-accent-soft" : ""} ${r.stop ? "text-ink-3" : ""}`}>
                  <td className="px-2 py-1">{r.p}</td>
                  <td className="px-2 py-1 text-right">{r.stop ? `${r.start} > ${N}` : r.start}</td>
                  <td className="px-2 py-1 text-right">{r.stop ? t.stopped : r.visits}</td>
                  <td className={`px-2 py-1 text-right ${r.stop ? "" : "text-amber"}`}>{r.stop ? "—" : r.fresh}</td>
                </tr>
              ))}
              {s.rows.length === 0 && (
                <tr className="border-t border-line"><td colSpan={4} className="px-2 py-2 text-ink-3">{t.tableEmpty}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          <div>
            <div className="eyebrow mb-0.5">{t.statRemaining}</div>
            <div className={`font-mono text-[18px] tabular-nums ${s.done ? "text-green" : "text-ink"}`}>{remaining}</div>
          </div>
          <div>
            <div className="eyebrow mb-0.5">{t.statCrossed}</div>
            <div className="font-mono text-[18px] tabular-nums text-ink">{N - 1 - remaining}</div>
          </div>
          <div>
            <div className="eyebrow mb-0.5">{t.statVisits}</div>
            <div className="font-mono text-[18px] tabular-nums text-ink">{s.visits}</div>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
