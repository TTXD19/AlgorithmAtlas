"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const SETS = [
  { label: "1, 5, 10, 50", coins: [50, 10, 5, 1] },
  { label: "1, 3, 4", coins: [4, 3, 1] },
];
const AMOUNTS = [6, 10, 27, 63];

const TEXT = demoText(
  {
    intro: (amount: number) => `要找 ${amount} 元。貪婪：面額由大到小，每一種都盡量多拿，拿到剩餘金額不夠為止。`,
    tooBig: (c: number, remain: number) => `面額 ${c} 比剩下的 ${remain} 元大，一枚都拿不了，看下一種。`,
    take: (before: number, c: number, cnt: number, remain: number) =>
      `剩 ${before} 元，面額 ${c} 最多拿 ${cnt} 枚（${before} ÷ ${c} 取整數），剩 ${remain} 元。`,
    same: (n: number) => `找完。貪婪用了 ${n} 枚，最佳解（DP 算出來的）也是 ${n} 枚。在這組幣值下貪婪是對的。`,
    worse: (greedy: number, best: number, coins: string) =>
      `找完。貪婪用了 ${greedy} 枚，但最佳解只要 ${best} 枚（${coins}）。貪婪先拿最大面額，把剩下的金額拆得很碎，這組幣值沒有「大面額是小面額的倍數」這種結構，所以會錯。`,
    coinSet: "幣值",
    amount: "金額",
    rule: "面額由大到小，能拿就拿",
    denoms: "面額（由大到小）",
    remaining: "剩餘金額",
    greedyPicks: (n: number) => `貪婪拿的硬幣（${n} 枚）`,
    nothingYet: "還沒拿",
    optimal: (n: number) => `最佳解，DP 算的（${n} 枚）`,
    tie: "貪婪 = 最佳",
    extra: (n: number) => `貪婪多用了 ${n} 枚`,
  },
  {
    en: {
      intro: (amount: number) => `We need to make ${amount}. Greedy: work from the largest coin down, taking as many of each as will fit, until nothing is left.`,
      tooBig: (c: number, remain: number) => `The ${c} coin is larger than the remaining ${remain}, so not even one fits. On to the next denomination.`,
      take: (before: number, c: number, cnt: number, remain: number) =>
        `${before} left. The ${c} coin fits ${cnt} time${cnt === 1 ? "" : "s"} (${before} ÷ ${c}, rounded down), leaving ${remain}.`,
      same: (n: number) => `Done. Greedy used ${n} coin${n === 1 ? "" : "s"}, and the optimum (computed by DP) is also ${n}. For this coin set, greedy happens to be correct.`,
      worse: (greedy: number, best: number, coins: string) =>
        `Done. Greedy used ${greedy} coins, but the optimum needs only ${best} (${coins}). Greedy grabs the largest coin first and leaves a remainder that only breaks into small change. This coin set lacks the structure where every coin is a multiple of the smaller ones, so greedy gets it wrong.`,
      coinSet: "Coins",
      amount: "Amount",
      rule: "Largest denomination first, take whatever fits",
      denoms: "Denominations (largest first)",
      remaining: "Remaining",
      greedyPicks: (n: number) => `Greedy's coins (${n})`,
      nothingYet: "none yet",
      optimal: (n: number) => `Optimum, from DP (${n})`,
      tie: "Greedy = optimum",
      extra: (n: number) => `Greedy used ${n} coin${n === 1 ? "" : "s"} too many`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: T, coins: number[], amount: number): Step[] {
  const steps: Step[] = [];
  const picked: number[] = [];
  let remain: number = amount;
  steps.push({ desc: t.intro(amount), ci: -1, remain, picked: [], done: false });
  coins.forEach((c, ci) => {
    const cnt = Math.floor(remain / c);
    if (cnt === 0) {
      steps.push({ desc: t.tooBig(c, remain), ci, remain, picked: [...picked], done: false });
    } else {
      for (let i = 0; i < cnt; i++) picked.push(c);
      remain -= cnt * c;
      steps.push({ desc: t.take(remain + cnt * c, c, cnt, remain), ci, remain, picked: [...picked], done: false });
    }
  });
  const best = optimal(coins, amount);
  const same = best.length === picked.length;
  steps.push({
    desc: same
      ? t.same(picked.length)
      : t.worse(picked.length, best.length, [...best].sort((a, b) => b - a).join(" + ")),
    ci: coins.length, remain, picked: [...picked], done: true,
  });
  return steps;
}

export function CoinChangeDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const [si, setSi] = useState(1);
  const [amount, setAmount] = useState(6);
  const [k, setK] = useState(0);
  const coins = SETS[si].coins;
  const steps = useMemo(() => buildSteps(TEXT[locale], coins, amount), [locale, coins, amount]);
  const best = useMemo(() => optimal(coins, amount), [coins, amount]);
  const s = steps[k];
  const same = best.length === s.picked.length;

  const chip = (on: boolean) => `h-[28px] cursor-pointer rounded-md border px-2.5 font-mono text-[12.5px] ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>{t.coinSet}</span>
        <div className="flex gap-1.5">
          {SETS.map((o, i) => (
            <button key={o.label} type="button" className={chip(si === i)} onClick={() => { setSi(i); setK(0); }}>{o.label}</button>
          ))}
        </div>
        <span className="ml-1">{t.amount}</span>
        <div className="flex gap-1.5">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" className={chip(amount === a)} onClick={() => { setAmount(a); setK(0); }}>{a}</button>
          ))}
        </div>
      </div>
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">greedy({amount})</span>} right={t.rule} />

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">{t.denoms}</div>
          <Cells items={coins} tone={(i) => (i === s.ci ? CELL.accent : i < s.ci ? CELL.dim : "")} w="w-10" />
        </div>
        <div>
          <div className="eyebrow mb-2">{t.remaining}</div>
          <div className="font-mono text-[22px] font-semibold tabular-nums">{s.remain}<span className="ml-1 text-[13px] font-normal text-ink-3">/ {amount}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-2">
        <div>
          <div className="eyebrow mb-2">{t.greedyPicks(s.picked.length)}</div>
          <Cells items={s.picked} tone={() => (s.done ? (same ? CELL.green : CELL.amber) : CELL.accent)} empty={t.nothingYet} w="w-10" />
        </div>
        <div>
          <div className="eyebrow mb-2">{t.optimal(best.length)}</div>
          <Cells items={[...best].sort((a, b) => b - a)} tone={() => (s.done ? CELL.green : CELL.dim)} w="w-10" />
          {s.done && (
            <div className={`mt-2 text-[12.5px] font-semibold ${same ? "text-green" : "text-amber"}`}>
              {same ? t.tie : t.extra(s.picked.length - best.length)}
            </div>
          )}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
