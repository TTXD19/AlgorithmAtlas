"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

/** Coin Change：硬幣面額與目標金額，求最少硬幣數。 */
const COINS = [1, 2, 5];
const AMOUNT = 11;
const INF = Number.POSITIVE_INFINITY;

type Mode = "forward" | "reverse";
interface Step {
  desc: string; label: string;
  dp: number[]; coin: number;          // coin：目前這一輪的硬幣索引，-1 表示還沒開始
  cur: number | null; src: number | null;
  fresh: boolean;                       // 來源格在這一輪已經被更新過（正序才會發生）
}

function fmt(v: number) { return v === INF ? "∞" : String(v); }

function build(mode: Mode): Step[] {
  const steps: Step[] = [];
  const dp: number[] = Array.from({ length: AMOUNT + 1 }, (_, i) => (i === 0 ? 0 : INF));
  const snap = (desc: string, label: string, coin: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, label, dp: [...dp], coin, cur: null, src: null, fresh: false, ...extra });

  snap(
    mode === "forward"
      ? `完全背包：每種硬幣可以用無限次。dp[w] = 湊出金額 w 的最少硬幣數，base case dp[0] = 0，其餘先設 ∞（還湊不出來）。`
      : `對照組：假裝每種硬幣只能用一次（0/1 背包），同一條轉移式，但 w 改成倒序掃。dp[0] = 0，其餘 ∞。`,
    "定義狀態", -1,
  );

  for (let c = 0; c < COINS.length; c++) {
    const coin = COINS[c];
    const updated: number[] = [];
    snap(
      mode === "forward"
        ? `第 ${c + 1} 輪：硬幣 ${coin}。w 從 ${coin} 正序掃到 ${AMOUNT}，dp[w] = min(dp[w], dp[w−${coin}] + 1)。`
        : `第 ${c + 1} 輪：硬幣 ${coin}。w 從 ${AMOUNT} 倒序掃到 ${coin}，dp[w] = min(dp[w], dp[w−${coin}] + 1)。`,
      `硬幣 ${coin}`, c,
    );
    const order = mode === "forward"
      ? Array.from({ length: AMOUNT - coin + 1 }, (_, i) => coin + i)
      : Array.from({ length: AMOUNT - coin + 1 }, (_, i) => AMOUNT - i);
    for (const w of order) {
      const src = w - coin;
      const fresh = updated.includes(src);
      const cand = dp[src] === INF ? INF : dp[src] + 1;
      const before = dp[w];
      if (cand < before) { dp[w] = cand; updated.push(w); }
      let desc: string;
      if (dp[src] === INF) {
        desc = `dp[${w}]：來源 dp[${src}] 是 ∞，湊不出 ${src}，所以也沒辦法多放一枚 ${coin} 湊成 ${w}。dp[${w}] 維持 ${fmt(before)}。`;
      } else if (mode === "forward") {
        desc = `dp[${w}] = min(${fmt(before)}, dp[${src}] + 1 = ${cand}) = ${fmt(dp[w])}。${
          fresh
            ? `注意 dp[${src}]（黃）是這一輪剛更新過的值，它已經用了硬幣 ${coin}，現在再疊一枚，所以硬幣 ${coin} 被用了不只一次，這正是完全背包要的。`
            : `dp[${src}]（綠）這一輪還沒動過，是${c === 0 ? " base case " : "上一輪"}的值。`
        }`;
      } else {
        desc = `dp[${w}] = min(${fmt(before)}, dp[${src}] + 1 = ${cand}) = ${fmt(dp[w])}。倒序掃，dp[${src}]（綠）這一輪還沒被碰到，一定是${c === 0 ? " base case " : "上一輪"}的值，所以硬幣 ${coin} 在這一格最多只算進一次。`;
      }
      snap(desc, `硬幣 ${coin} · w = ${w}`, c, { cur: w, src, fresh });
    }
  }

  snap(
    mode === "forward"
      ? `三輪掃完，dp[${AMOUNT}] = ${fmt(dp[AMOUNT])}：5 + 5 + 1。每種硬幣一輪、每輪 O(amount)，整體 O(硬幣數 × amount)。`
      : `三輪掃完，dp[${AMOUNT}] = ${fmt(dp[AMOUNT])}：每種硬幣只用一次最多湊到 1 + 2 + 5 = 8，湊不出 ${AMOUNT}。同一條轉移式，只差掃描方向，答案完全不同。`,
    "結束", COINS.length - 1,
  );
  return steps;
}

export function UnboundedDemo() {
  const forward = useMemo(() => build("forward"), []);
  const reverse = useMemo(() => build("reverse"), []);
  const [mode, setMode] = useState<Mode>("forward");
  const [k, setK] = useState(0);
  const steps = mode === "forward" ? forward : reverse;
  const s = steps[k];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const tone = (w: number) => {
    if (w === s.cur) return CELL.accent;
    if (w === s.src) return s.fresh ? CELL.amber : CELL.green;
    if (s.dp[w] === INF) return CELL.dim;
    return "border-line-strong bg-surface";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex flex-wrap items-center gap-1.5">
            {(["forward", "reverse"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "forward" ? "完全背包（正序）" : "0/1 背包（倒序）"}
              </button>
            ))}
            <span className="ml-1 font-mono text-[12.5px] text-ink">{s.label}</span>
          </div>
        }
        right={`coins = [${COINS.join(", ")}] · amount = ${AMOUNT}`}
      />

      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="eyebrow mb-2">硬幣</div>
            <Cells items={COINS} tone={(i) => (i === s.coin ? CELL.accent : i < s.coin ? CELL.dim : "")} />
          </div>
          <div className="text-[12px] text-ink-3">
            外層迴圈是硬幣，一種硬幣一輪；內層是金額 w，{mode === "forward" ? "從小到大" : "從大到小"}。
          </div>
        </div>

        <div>
          <div className="eyebrow mb-2">dp[w]（湊出 w 的最少硬幣數）</div>
          <div className="overflow-x-auto pb-1">
            <div className="flex gap-1">
              {s.dp.map((v, w) => (
                <div key={w} className="flex w-9 shrink-0 flex-col items-center gap-1">
                  <span className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone(w)}`}>{fmt(v)}</span>
                  <span className="font-mono text-[10.5px] text-ink-3">{w}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-3 text-[12px] text-ink-3">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-accent bg-accent align-middle" />正在填的 dp[w]</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />來源 dp[w−coin]，還是上一輪的值</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />來源 dp[w−coin]，這一輪已更新（硬幣被重複使用）</span>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">
          {s.cur !== null && s.src !== null
            ? `dp[${s.cur}] = min(dp[${s.cur}], dp[${s.src}] + 1) = ${fmt(s.dp[s.cur])}`
            : `dp[w] = min(dp[w], dp[w − coin] + 1)`}
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
