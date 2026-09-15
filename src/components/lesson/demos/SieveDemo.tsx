"use client";

import { useMemo, useState } from "react";
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

const join = (xs: number[]) => (xs.length > 10 ? `${xs.slice(0, 3).join("、")}、…、${xs[xs.length - 1]}` : xs.join("、"));

function buildSteps(): Step[] {
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
    primes
      .map((q) => xs.filter((m) => by[m] === q))
      .filter((g) => g.length > 0)
      .map((g) => `${join(g)} 被 ${by[g[0]]} 劃掉`)
      .join("，");

  snap(`把 2 到 ${N} 全部先當成「可能是質數」。規則只有一條：由小到大找下一個還沒被劃掉的數，它就是質數，再把它的倍數全部劃掉。1 既不是質數也不是合數，不參與。`, "開始", null, [], []);

  let prev = 1;
  for (let p = 2; p <= N; p++) {
    if (crossed[p]) continue;
    const skipped = NUMS.filter((x) => x > prev && x < p);
    const skipText = skipped.length ? `${skipped.join("、")} 已被劃掉，是合數，跳過。` : "";
    const below: number[] = [];
    for (let m = 2 * p; m < p * p && m <= N; m += p) below.push(m);

    if (p * p > N) {
      rows.push({ p, start: p * p, visits: 0, fresh: 0, stop: true });
      snap(`${skipText}${p} 沒被劃掉，是質數，但 ${p}² = ${p * p} > ${N}，停。任何 ≤ ${N} 的合數都能寫成 a × b 且 a ≤ b，於是 a × a ≤ ${N}、a ≤ √${N} ≈ ${SQRT}，它一定有 ≤ ${prev} 的質因數，早就被 ${primes.join("、")} 劃掉了。例如 ${p} 的倍數 ${below.join("、")} 全都已經劃掉（虛線）。`, `p = ${p}：p² > ${N}，停`, p, [], below);
      break;
    }

    primes.push(p);
    const startText = below.length
      ? `倍數從 ${p}² = ${p * p}（黃色）開始劃就好：比它小的倍數 ${p} × k 都有 k < ${p}，k 的質因數比 ${p} 小，所以早就被劃掉了：${byText(below)}（虛線）。`
      : `倍數從 ${p}² = ${p * p}（黃色）開始劃，這時 p² 剛好等於 2p，${p} 本身不劃。`;
    snap(`${skipText}${p} 沒被劃掉，表示沒有比它小的質數整除它，所以 ${p} 是質數。${startText}`, `p = ${p}：確認質數`, p, [p * p], below);

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
    const againText = again.length
      ? `其中 ${again.length} 個早就劃掉了（虛線：${byText(again)}），新劃掉的是 ${join(fresh)}，共 ${fresh.length} 個。`
      : `全部都是第一次被劃掉，共 ${fresh.length} 個。`;
    const saveText = below.length ? `若從 2p = ${2 * p} 開始，還得多走 ${below.length} 個早就劃掉的數。` : "";
    snap(`從 ${p * p} 開始每次加 ${p}，一路到 ${last}：走訪 ${fresh.length + again.length} 個數。${againText}${saveText}`, `p = ${p}：劃掉倍數`, p, fresh, again);
    prev = p;
  }

  const result = NUMS.filter((x) => x >= 2 && !crossed[x]);
  const work = rows.filter((r) => !r.stop);
  const composites = N - 1 - result.length;
  snap(`剩下沒被劃掉的 ${result.length} 個數就是 ${N} 以內的全部質數：${result.join("、")}。總共劃了 ${visits} 次（${work.map((r) => r.visits).join(" + ")}），劃掉 ${composites} 個合數，其中 ${visits - composites} 次是重複劃到。次數約為 N/2 + N/3 + N/5 + N/7 + …，質數倒數和只以 log log N 成長，所以時間 O(N log log N)；只用一個長度 N + 1 的布林陣列，空間 O(N)。`, "結果", null, [], [], true);
  return steps;
}

const LEGEND = [
  { tone: CELL.accent, label: "目前的質數 p" },
  { tone: CELL.amber, label: "p 的倍數（起點或新劃掉）" },
  { tone: "border-dashed border-amber bg-surface-2 text-ink-3", label: "早就被更小的質數劃掉" },
  { tone: `${CELL.dim} line-through`, label: "合數" },
  { tone: CELL.green, label: "質數" },
];

export function SieveDemo() {
  const steps = useMemo(() => buildSteps(), []);
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
        <div className="eyebrow mb-2">1 到 {N}（每列 10 個）</div>
        <div className="grid max-w-[440px] grid-cols-10 gap-1">
          {NUMS.map((x) => (
            <span key={x} className={`grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12px] tabular-nums ${tone(x)}`}>{x}</span>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12px] text-ink-3">
          {LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span className={`inline-block h-3.5 w-3.5 rounded-[4px] border ${l.tone}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-1">每個質數的工作量</div>
          <table className="w-full border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr className="text-[11px] text-ink-3">
                <th className="px-2 py-1 text-left font-medium">p</th>
                <th className="px-2 py-1 text-right font-medium">起點 p²</th>
                <th className="px-2 py-1 text-right font-medium">走訪</th>
                <th className="px-2 py-1 text-right font-medium">新劃掉</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r.p} className={`border-t border-line ${r.p === s.p ? "bg-accent-soft" : ""} ${r.stop ? "text-ink-3" : ""}`}>
                  <td className="px-2 py-1">{r.p}</td>
                  <td className="px-2 py-1 text-right">{r.stop ? `${r.start} > ${N}` : r.start}</td>
                  <td className="px-2 py-1 text-right">{r.stop ? "停" : r.visits}</td>
                  <td className={`px-2 py-1 text-right ${r.stop ? "" : "text-amber"}`}>{r.stop ? "—" : r.fresh}</td>
                </tr>
              ))}
              {s.rows.length === 0 && (
                <tr className="border-t border-line"><td colSpan={4} className="px-2 py-2 text-ink-3">還沒開始劃</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          <div>
            <div className="eyebrow mb-0.5">未劃掉</div>
            <div className={`font-mono text-[18px] tabular-nums ${s.done ? "text-green" : "text-ink"}`}>{remaining}</div>
          </div>
          <div>
            <div className="eyebrow mb-0.5">已劃掉</div>
            <div className="font-mono text-[18px] tabular-nums text-ink">{N - 1 - remaining}</div>
          </div>
          <div>
            <div className="eyebrow mb-0.5">累計走訪</div>
            <div className="font-mono text-[18px] tabular-nums text-ink">{s.visits}</div>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
