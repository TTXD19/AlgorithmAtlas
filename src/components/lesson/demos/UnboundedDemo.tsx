"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** Coin Change：硬幣面額與目標金額，求最少硬幣數。 */
const COINS = [1, 2, 5];
const AMOUNT = 11;
const INF = Number.POSITIVE_INFINITY;

const TEXT = demoText(
  {
    tabForward: "完全背包（正序）",
    tabReverse: "0/1 背包（倒序）",
    introForward: "完全背包：每種硬幣可以用無限次。dp[w] = 湊出金額 w 的最少硬幣數，base case dp[0] = 0，其餘先設 ∞（還湊不出來）。",
    introReverse: "對照組：假裝每種硬幣只能用一次（0/1 背包），同一條轉移式，但 w 改成倒序掃。dp[0] = 0，其餘 ∞。",
    labelDefine: "定義狀態",
    roundForward: (n: number, coin: number, amount: number) => `第 ${n} 輪：硬幣 ${coin}。w 從 ${coin} 正序掃到 ${amount}，dp[w] = min(dp[w], dp[w−${coin}] + 1)。`,
    roundReverse: (n: number, coin: number, amount: number) => `第 ${n} 輪：硬幣 ${coin}。w 從 ${amount} 倒序掃到 ${coin}，dp[w] = min(dp[w], dp[w−${coin}] + 1)。`,
    labelCoin: (coin: number) => `硬幣 ${coin}`,
    labelCoinW: (coin: number, w: number) => `硬幣 ${coin} · w = ${w}`,
    labelEnd: "結束",
    srcInf: (w: number, src: number, coin: number, before: string) => `dp[${w}]：來源 dp[${src}] 是 ∞，湊不出 ${src}，所以也沒辦法多放一枚 ${coin} 湊成 ${w}。dp[${w}] 維持 ${before}。`,
    transition: (w: number, before: string, src: number, cand: number, now: string) => `dp[${w}] = min(${before}, dp[${src}] + 1 = ${cand}) = ${now}。`,
    freshNote: (src: number, coin: number) => `注意 dp[${src}]（黃）是這一輪剛更新過的值，它已經用了硬幣 ${coin}，現在再疊一枚，所以硬幣 ${coin} 被用了不只一次，這正是完全背包要的。`,
    staleNote: (src: number, prev: string) => `dp[${src}]（綠）這一輪還沒動過，是${prev}的值。`,
    reverseNote: (src: number, coin: number, prev: string) => `倒序掃，dp[${src}]（綠）這一輪還沒被碰到，一定是${prev}的值，所以硬幣 ${coin} 在這一格最多只算進一次。`,
    baseCase: " base case ",
    prevRound: "上一輪",
    doneForward: (amount: number, v: string) => `三輪掃完，dp[${amount}] = ${v}：5 + 5 + 1。每種硬幣一輪、每輪 O(amount)，整體 O(硬幣數 × amount)。`,
    doneReverse: (amount: number, v: string) => `三輪掃完，dp[${amount}] = ${v}：每種硬幣只用一次最多湊到 1 + 2 + 5 = 8，湊不出 ${amount}。同一條轉移式，只差掃描方向，答案完全不同。`,
    coinsTitle: "硬幣",
    loopNote: (dir: string) => `外層迴圈是硬幣，一種硬幣一輪；內層是金額 w，${dir}。`,
    dirAsc: "從小到大",
    dirDesc: "從大到小",
    dpTitle: "dp[w]（湊出 w 的最少硬幣數）",
    legendCur: "正在填的 dp[w]",
    legendSrcOld: "來源 dp[w−coin]，還是上一輪的值",
    legendSrcFresh: "來源 dp[w−coin]，這一輪已更新（硬幣被重複使用）",
  },
  {
    en: {
      tabForward: "Unbounded (forward sweep)",
      tabReverse: "0/1 knapsack (reverse sweep)",
      introForward: "Unbounded knapsack: every coin may be used any number of times. dp[w] is the fewest coins that add up to w. The base case is dp[0] = 0, and every other entry starts at ∞, meaning not reachable yet.",
      introReverse: "A control run: pretend each coin may be used only once (a 0/1 knapsack). The transition is identical, but w is now swept in reverse. dp[0] = 0 and the rest start at ∞.",
      labelDefine: "Define the state",
      roundForward: (n: number, coin: number, amount: number) => `Round ${n}: coin ${coin}. w sweeps forward from ${coin} up to ${amount}, with dp[w] = min(dp[w], dp[w−${coin}] + 1).`,
      roundReverse: (n: number, coin: number, amount: number) => `Round ${n}: coin ${coin}. w sweeps backward from ${amount} down to ${coin}, with dp[w] = min(dp[w], dp[w−${coin}] + 1).`,
      labelCoin: (coin: number) => `coin ${coin}`,
      labelCoinW: (coin: number, w: number) => `coin ${coin} · w = ${w}`,
      labelEnd: "Done",
      srcInf: (w: number, src: number, coin: number, before: string) => `dp[${w}]: the source dp[${src}] is ∞, so ${src} cannot be made at all, and adding one more ${coin} cannot reach ${w} either. dp[${w}] stays at ${before}.`,
      transition: (w: number, before: string, src: number, cand: number, now: string) => `dp[${w}] = min(${before}, dp[${src}] + 1 = ${cand}) = ${now}. `,
      freshNote: (src: number, coin: number) => `Notice that dp[${src}] (amber) was updated earlier in this very round, so it already uses coin ${coin}. Stacking another one on top uses coin ${coin} more than once — exactly what the unbounded knapsack wants.`,
      staleNote: (src: number, prev: string) => `dp[${src}] (green) has not been touched this round, so it still holds ${prev}.`,
      reverseNote: (src: number, coin: number, prev: string) => `Because the sweep runs backwards, dp[${src}] (green) has not been touched this round, so it must still hold ${prev}, which means coin ${coin} is counted at most once in this cell.`,
      baseCase: "the base case value",
      prevRound: "last round's value",
      doneForward: (amount: number, v: string) => `Three rounds done: dp[${amount}] = ${v}, which is 5 + 5 + 1. One round per coin and O(amount) per round, so O(number of coins × amount) overall.`,
      doneReverse: (amount: number, v: string) => `Three rounds done: dp[${amount}] = ${v}. Using each coin at most once reaches only 1 + 2 + 5 = 8, so ${amount} cannot be made. Same transition, opposite sweep direction, completely different answer.`,
      coinsTitle: "Coins",
      loopNote: (dir: string) => `The outer loop runs over the coins, one round each; the inner loop runs over the amount w, ${dir}.`,
      dirAsc: "from small to large",
      dirDesc: "from large to small",
      dpTitle: "dp[w] (fewest coins that make w)",
      legendCur: "the dp[w] being filled in",
      legendSrcOld: "source dp[w−coin], still holding last round's value",
      legendSrcFresh: "source dp[w−coin], already updated this round (the coin is reused)",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

type Mode = "forward" | "reverse";
interface Step {
  desc: string; label: string;
  dp: number[]; coin: number;          // coin：目前這一輪的硬幣索引，-1 表示還沒開始
  cur: number | null; src: number | null;
  fresh: boolean;                       // 來源格在這一輪已經被更新過（正序才會發生）
}

function fmt(v: number) { return v === INF ? "∞" : String(v); }

function build(t: T, mode: Mode): Step[] {
  const steps: Step[] = [];
  const dp: number[] = Array.from({ length: AMOUNT + 1 }, (_, i) => (i === 0 ? 0 : INF));
  const snap = (desc: string, label: string, coin: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, label, dp: [...dp], coin, cur: null, src: null, fresh: false, ...extra });

  snap(mode === "forward" ? t.introForward : t.introReverse, t.labelDefine, -1);

  for (let c = 0; c < COINS.length; c++) {
    const coin = COINS[c];
    const updated: number[] = [];
    snap(
      mode === "forward"
        ? t.roundForward(c + 1, coin, AMOUNT)
        : t.roundReverse(c + 1, coin, AMOUNT),
      t.labelCoin(coin), c,
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
      const prev = c === 0 ? t.baseCase : t.prevRound;
      let desc: string;
      if (dp[src] === INF) {
        desc = t.srcInf(w, src, coin, fmt(before));
      } else if (mode === "forward") {
        desc = t.transition(w, fmt(before), src, cand, fmt(dp[w])) + (fresh ? t.freshNote(src, coin) : t.staleNote(src, prev));
      } else {
        desc = t.transition(w, fmt(before), src, cand, fmt(dp[w])) + t.reverseNote(src, coin, prev);
      }
      snap(desc, t.labelCoinW(coin, w), c, { cur: w, src, fresh });
    }
  }

  snap(
    mode === "forward"
      ? t.doneForward(AMOUNT, fmt(dp[AMOUNT]))
      : t.doneReverse(AMOUNT, fmt(dp[AMOUNT])),
    t.labelEnd, COINS.length - 1,
  );
  return steps;
}

export function UnboundedDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const forward = useMemo(() => build(TEXT[locale], "forward"), [locale]);
  const reverse = useMemo(() => build(TEXT[locale], "reverse"), [locale]);
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
                {m === "forward" ? t.tabForward : t.tabReverse}
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
            <div className="eyebrow mb-2">{t.coinsTitle}</div>
            <Cells items={COINS} tone={(i) => (i === s.coin ? CELL.accent : i < s.coin ? CELL.dim : "")} />
          </div>
          <div className="text-[12px] text-ink-3">
            {t.loopNote(mode === "forward" ? t.dirAsc : t.dirDesc)}
          </div>
        </div>

        <div>
          <div className="eyebrow mb-2">{t.dpTitle}</div>
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
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-accent bg-accent align-middle" />{t.legendCur}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />{t.legendSrcOld}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />{t.legendSrcFresh}</span>
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
