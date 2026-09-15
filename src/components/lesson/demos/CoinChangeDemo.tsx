"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const SETS = [
  { label: "1, 5, 10, 50", coins: [50, 10, 5, 1] },
  { label: "1, 3, 4", coins: [4, 3, 1] },
];
const AMOUNTS = [6, 10, 27, 63];

interface Step { desc: string; ci: number; remain: number; picked: number[]; done: boolean }

/** DP 算最佳解，順便回傳用了哪些硬幣 */
function optimal(coins: number[], amount: number): number[] {
  const INF = 1e9;
  const dp: number[] = new Array(amount + 1).fill(INF);
  const from: number[] = new Array(amount + 1).fill(-1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) { dp[a] = dp[a - c] + 1; from[a] = c; }
    }
  }
  const out: number[] = [];
  let a: number = amount;
  while (a > 0) { out.push(from[a]); a -= from[a]; }
  return out;
}

function buildSteps(coins: number[], amount: number): Step[] {
  const steps: Step[] = [];
  const picked: number[] = [];
  let remain: number = amount;
  steps.push({ desc: `要找 ${amount} 元。貪婪：面額由大到小，每一種都盡量多拿，拿到剩餘金額不夠為止。`, ci: -1, remain, picked: [], done: false });
  coins.forEach((c, ci) => {
    const cnt = Math.floor(remain / c);
    if (cnt === 0) {
      steps.push({ desc: `面額 ${c} 比剩下的 ${remain} 元大，一枚都拿不了，看下一種。`, ci, remain, picked: [...picked], done: false });
    } else {
      for (let i = 0; i < cnt; i++) picked.push(c);
      remain -= cnt * c;
      steps.push({ desc: `剩 ${remain + cnt * c} 元，面額 ${c} 最多拿 ${cnt} 枚（${remain + cnt * c} ÷ ${c} 取整數），剩 ${remain} 元。`, ci, remain, picked: [...picked], done: false });
    }
  });
  const best = optimal(coins, amount);
  const same = best.length === picked.length;
  steps.push({
    desc: same
      ? `找完。貪婪用了 ${picked.length} 枚，最佳解（DP 算出來的）也是 ${picked.length} 枚。在這組幣值下貪婪是對的。`
      : `找完。貪婪用了 ${picked.length} 枚，但最佳解只要 ${best.length} 枚（${[...best].sort((a, b) => b - a).join(" + ")}）。貪婪先拿最大面額，把剩下的金額拆得很碎，這組幣值沒有「大面額是小面額的倍數」這種結構，所以會錯。`,
    ci: coins.length, remain, picked: [...picked], done: true,
  });
  return steps;
}

export function CoinChangeDemo() {
  const [si, setSi] = useState(1);
  const [amount, setAmount] = useState(6);
  const [k, setK] = useState(0);
  const coins = SETS[si].coins;
  const steps = useMemo(() => buildSteps(coins, amount), [coins, amount]);
  const best = useMemo(() => optimal(coins, amount), [coins, amount]);
  const s = steps[k];
  const same = best.length === s.picked.length;

  const chip = (on: boolean) => `h-[28px] cursor-pointer rounded-md border px-2.5 font-mono text-[12.5px] ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>幣值</span>
        <div className="flex gap-1.5">
          {SETS.map((o, i) => (
            <button key={o.label} type="button" className={chip(si === i)} onClick={() => { setSi(i); setK(0); }}>{o.label}</button>
          ))}
        </div>
        <span className="ml-1">金額</span>
        <div className="flex gap-1.5">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" className={chip(amount === a)} onClick={() => { setAmount(a); setK(0); }}>{a}</button>
          ))}
        </div>
      </div>
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">greedy({amount})</span>} right="面額由大到小，能拿就拿" />

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">面額（由大到小）</div>
          <Cells items={coins} tone={(i) => (i === s.ci ? CELL.accent : i < s.ci ? CELL.dim : "")} w="w-10" />
        </div>
        <div>
          <div className="eyebrow mb-2">剩餘金額</div>
          <div className="font-mono text-[22px] font-semibold tabular-nums">{s.remain}<span className="ml-1 text-[13px] font-normal text-ink-3">/ {amount}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-2">
        <div>
          <div className="eyebrow mb-2">貪婪拿的硬幣（{s.picked.length} 枚）</div>
          <Cells items={s.picked} tone={() => (s.done ? (same ? CELL.green : CELL.amber) : CELL.accent)} empty="還沒拿" w="w-10" />
        </div>
        <div>
          <div className="eyebrow mb-2">最佳解，DP 算的（{best.length} 枚）</div>
          <Cells items={[...best].sort((a, b) => b - a)} tone={() => (s.done ? CELL.green : CELL.dim)} w="w-10" />
          {s.done && (
            <div className={`mt-2 text-[12.5px] font-semibold ${same ? "text-green" : "text-amber"}`}>
              {same ? "貪婪 = 最佳" : `貪婪多用了 ${s.picked.length - best.length} 枚`}
            </div>
          )}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
