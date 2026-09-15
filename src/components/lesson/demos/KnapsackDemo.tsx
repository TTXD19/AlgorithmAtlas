"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter } from "./StepBar";

/** 四個物品：重量 w、價值 v。背包容量 7。 */
const ITEMS = [
  { name: "A", w: 1, v: 1 },
  { name: "B", w: 3, v: 4 },
  { name: "C", w: 4, v: 5 },
  { name: "D", w: 5, v: 7 },
];
const CAP = 7;

type Pos = [number, number];
interface Step {
  desc: string; label: string; formula: string;
  table: (number | null)[][];
  cur: Pos | null; skip: Pos | null; take: Pos | null;
  path: Pos[]; chosen: number[]; rejected: number[];
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const n = ITEMS.length;
  const table: (number | null)[][] = Array.from({ length: n + 1 }, () => Array.from({ length: CAP + 1 }, () => null));
  const snap = (desc: string, label: string, formula: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, label, formula, table: table.map((r) => [...r]), cur: null, skip: null, take: null, path: [], chosen: [], rejected: [], ...extra });

  snap("定義狀態：dp[i][w] = 只考慮前 i 個物品、容量為 w 時的最大價值。答案是右下角 dp[4][7]。", "定義狀態", "dp[i][w] = max(dp[i−1][w], dp[i−1][w−wᵢ] + vᵢ)");
  for (let w = 0; w <= CAP; w++) table[0][w] = 0;
  snap("base case：一個物品都沒有，不管容量多少價值都是 0。第 0 列全填 0。", "base case", "dp[0][w] = 0");

  for (let i = 1; i <= n; i++) {
    const it = ITEMS[i - 1];
    table[i][0] = 0;
    snap(`第 ${i} 列：考慮物品 ${it.name}（重 ${it.w}、值 ${it.v}）。容量 0 什麼都放不下，dp[${i}][0] = 0。接著 w 從 1 到 ${CAP} 逐格填。`, `物品 ${it.name}`, `dp[${i}][0] = 0`, { cur: [i, 0] });
    for (let w = 1; w <= CAP; w++) {
      const skip = table[i - 1][w] as number;
      if (w < it.w) {
        table[i][w] = skip;
        snap(`容量 ${w} 放不下 ${it.name}（重 ${it.w}），只有「不選」一條路：抄上一列同一欄，dp[${i}][${w}] = dp[${i - 1}][${w}] = ${skip}。`, `物品 ${it.name} · w = ${w}`, `dp[${i}][${w}] = dp[${i - 1}][${w}] = ${skip}`, { cur: [i, w], skip: [i - 1, w] });
      } else {
        const takeBase = table[i - 1][w - it.w] as number;
        const take = takeBase + it.v;
        table[i][w] = Math.max(skip, take);
        snap(
          `不選 ${it.name}（黃）：dp[${i - 1}][${w}] = ${skip}。選 ${it.name}（綠）：先留 ${it.w} 的空間給它，剩下容量 ${w - it.w} 給前 ${i - 1} 個物品，dp[${i - 1}][${w - it.w}] + ${it.v} = ${take}。取大的 ${table[i][w]}${take > skip ? "，選比較好" : take < skip ? "，不選比較好" : "，兩邊一樣"}。`,
          `物品 ${it.name} · w = ${w}`,
          `dp[${i}][${w}] = max(${skip}, ${takeBase} + ${it.v}) = ${table[i][w]}`,
          { cur: [i, w], skip: [i - 1, w], take: [i - 1, w - it.w] },
        );
      }
    }
  }

  // 回溯：從 dp[n][CAP] 往上走，值有變就是選了這個物品
  const path: Pos[] = [[n, CAP]];
  const chosen: number[] = [];
  const rejected: number[] = [];
  let w: number = CAP;
  snap(`填完了，答案 dp[${n}][${CAP}] = ${table[n][CAP]}。但表只告訴我們最大價值，要知道選了誰，得從右下角往上回溯。`, "回溯", `答案 = ${table[n][CAP]}`, { cur: [n, CAP], path: [...path] });
  for (let i = n; i >= 1; i--) {
    const it = ITEMS[i - 1];
    const here = table[i][w] as number;
    const above = table[i - 1][w] as number;
    if (here !== above) {
      chosen.push(i - 1);
      path.push([i - 1, w - it.w]);
      snap(`dp[${i}][${w}] = ${here} ≠ dp[${i - 1}][${w}] = ${above}，這一格是靠「選 ${it.name}」得到的。記下 ${it.name}，容量扣掉 ${it.w}，跳到 dp[${i - 1}][${w - it.w}]。`, "回溯", `選 ${it.name}：w ${w} → ${w - it.w}`, { cur: [i - 1, w - it.w], path: [...path], chosen: [...chosen], rejected: [...rejected] });
      w -= it.w;
    } else {
      rejected.push(i - 1);
      path.push([i - 1, w]);
      snap(`dp[${i}][${w}] = ${here} = dp[${i - 1}][${w}]，這一格是抄上面來的，${it.name} 沒有選。往上一格。`, "回溯", `不選 ${it.name}：w 維持 ${w}`, { cur: [i - 1, w], path: [...path], chosen: [...chosen], rejected: [...rejected] });
    }
  }
  const names = chosen.slice().reverse().map((c) => ITEMS[c].name);
  snap(`回到第 0 列，結束。選了 ${names.join("、")}，總重 ${chosen.reduce((a, c) => a + ITEMS[c].w, 0)} ≤ ${CAP}，總價值 ${table[n][CAP]}。表格大小 (n+1)×(W+1)，每格 O(1)，整體 O(nW)。`, "結束", `答案 = ${table[n][CAP]}`, { path: [...path], chosen: [...chosen], rejected: [...rejected] });
  return steps;
}

const same = (a: Pos | null, i: number, w: number) => a !== null && a[0] === i && a[1] === w;

export function KnapsackDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const onPath = (i: number, w: number) => s.path.some((p) => p[0] === i && p[1] === w);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.label}</span>} right={`4 個物品 · 容量 ${CAP}`} />

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-2">dp[i][w]</div>
          <table className="border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr>
                <th className="pr-2 pb-1 text-left text-[10.5px] font-normal text-ink-3">i \ w</th>
                {Array.from({ length: CAP + 1 }, (_, w) => (
                  <th key={w} className="w-9 pb-1 text-center text-[10.5px] font-normal text-ink-3">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.map((row, i) => (
                <tr key={i}>
                  <td className="pr-2 text-[11px] whitespace-nowrap text-ink-3">
                    {i === 0 ? "無" : `${ITEMS[i - 1].name} (${ITEMS[i - 1].w},${ITEMS[i - 1].v})`}
                  </td>
                  {row.map((v, w) => {
                    let cls = "border-line-strong bg-surface";
                    if (same(s.cur, i, w)) cls = "border-accent bg-accent text-accent-ink";
                    else if (same(s.skip, i, w)) cls = "border-amber bg-amber-soft text-amber";
                    else if (same(s.take, i, w)) cls = "border-green bg-green-soft text-green";
                    else if (onPath(i, w)) cls = "border-green bg-green-soft text-green";
                    else if (v === null) cls = "border-line bg-surface-2 text-ink-3";
                    return (
                      <td key={w} className="p-0.5">
                        <span className={`grid h-8 w-8 place-items-center rounded-md border ${cls}`}>{v === null ? "·" : v}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <div className="eyebrow mb-2">物品</div>
            <div className="flex flex-wrap gap-1.5">
              {ITEMS.map((it, idx) => (
                <span
                  key={it.name}
                  className={`rounded-md border px-2 py-1 font-mono text-[12.5px] tabular-nums ${
                    s.chosen.includes(idx) ? "border-green bg-green-soft text-green" : s.rejected.includes(idx) ? "border-line bg-surface-2 text-ink-3 line-through" : s.cur && s.cur[0] === idx + 1 && s.path.length === 0 ? "border-accent bg-accent-soft" : "border-line-strong bg-surface"
                  }`}
                >
                  {it.name}：重 {it.w} 值 {it.v}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">{s.formula}</div>
          <div className="flex flex-wrap gap-3 text-[12px] text-ink-3">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />不選：dp[i−1][w]</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />選：dp[i−1][w−wᵢ] + vᵢ</span>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
