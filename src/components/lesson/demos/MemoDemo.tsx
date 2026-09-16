"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, BTN } from "./StepBar";

const N = 6;
const W = 640;
const LEVEL_H = 46;
const TOP = 24;
const R = 15;

const TEXT = demoText(
  {
    base: (n: number) => `fib(${n}) 是 base case，直接回傳 ${n}。`,
    repeat: (n: number) => `再次呼叫 fib(${n})。這個子問題之前已經算過，但沒有人記得答案，只好${n > 1 ? "整棵子樹重算" : "再回傳一次"}。`,
    hit: (n: number) => `呼叫 fib(${n})：快取裡已經有答案，直接回傳。${n > 1 ? "底下整棵子樹都不用展開。" : ""}`,
    compute: (n: number) => `呼叫 fib(${n})，拆成 fib(${n - 1}) + fib(${n - 2})，先算左邊。`,
    introMemo: (n: number) => `同樣算 fib(${n})，但每個算完的 fib(n) 都存進快取。再被問到同一個 n 時直接回傳，不再展開。`,
    introNaive: (n: number) => `純遞迴算 fib(${n})：fib(n) = fib(n−1) + fib(n−2)。每次呼叫都重新展開，沒有人記得算過什麼。`,
    endMemo: (calls: number, real: number, hits: number) =>
      `結束。只有 ${calls} 次呼叫：每個 n 只真正算一次（${real} 個），其餘 ${hits} 次是快取命中。呼叫次數從指數變成 O(n)。`,
    endNaive: (calls: number, wasted: number) =>
      `結束。總共 ${calls} 次呼叫，其中 ${wasted} 次（黃色）是在重算已經算過的子問題。n 每加 1，呼叫次數大約乘以 1.6，這就是指數時間。`,
    labelStart: "開始",
    labelEnd: "結束",
    naive: "純遞迴",
    memo: "記憶化",
    treeTitle: (n: number) => `fib(${n}) 的遞迴樹`,
    treeAlt: "fib 遞迴樹",
    legendCurrent: "目前這次呼叫",
    legendBase: "第一次碰到的 base case",
    legendRepeat: "重算已經算過的子問題",
    legendHit: "快取命中",
    legendFaded: "淡色是還沒呼叫到的",
    outOf: (total: number) => `/ ${total} 次呼叫`,
    wastedPre: "其中 ",
    wastedCount: (n: number) => `${n} 次`,
    wastedPost: "是重算已經算過的子問題",
    realPre: (n: number) => `${n} 次真正計算 + `,
    hitCount: (n: number) => `${n} 次`,
    hitPost: "快取命中",
  },
  {
    en: {
      base: (n: number) => `fib(${n}) is a base case, so it returns ${n} immediately.`,
      repeat: (n: number) => `fib(${n}) is called again. This subproblem was solved earlier, but nothing remembers the answer, so ${n > 1 ? "the whole subtree has to be recomputed" : "it is simply computed once more"}.`,
      hit: (n: number) => `fib(${n}) is called, and the answer is already in the cache, so it comes back at once.${n > 1 ? " The entire subtree below never has to be expanded." : ""}`,
      compute: (n: number) => `fib(${n}) is called and splits into fib(${n - 1}) + fib(${n - 2}); the left branch goes first.`,
      introMemo: (n: number) => `The same fib(${n}), except every fib(n) goes into a cache once it is computed. Asked for the same n again, the function returns the stored answer instead of expanding.`,
      introNaive: (n: number) => `Plain recursion for fib(${n}): fib(n) = fib(n−1) + fib(n−2). Every call expands from scratch, because nothing remembers what has already been worked out.`,
      endMemo: (calls: number, real: number, hits: number) =>
        `Done, in only ${calls} calls: each n is genuinely computed once (${real} of them) and the other ${hits} are cache hits. The number of calls drops from exponential to O(n).`,
      endNaive: (calls: number, wasted: number) =>
        `Done, after ${calls} calls, of which ${wasted} (in amber) recompute a subproblem that had already been solved. Each time n grows by 1 the call count is multiplied by roughly 1.6, which is exactly what exponential time looks like.`,
      labelStart: "start",
      labelEnd: "end",
      naive: "Plain recursion",
      memo: "Memoisation",
      treeTitle: (n: number) => `Recursion tree for fib(${n})`,
      treeAlt: "fib recursion tree",
      legendCurrent: "the current call",
      legendBase: "a base case reached for the first time",
      legendRepeat: "recomputing a solved subproblem",
      legendHit: "cache hit",
      legendFaded: "faded nodes have not been called yet",
      outOf: (total: number) => `/ ${total} calls`,
      wastedPre: "of which ",
      wastedCount: (n: number) => `${n}`,
      wastedPost: " recompute a subproblem that was already solved",
      realPre: (n: number) => `${n} real computations + `,
      hitCount: (n: number) => `${n}`,
      hitPost: " cache hits",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

type Kind = "compute" | "base" | "repeat" | "hit";
type Mode = "naive" | "memo";
interface TNode { id: number; n: number; kind: Kind; children: TNode[] }
interface Step { desc: string; cur: number; visited: number[]; calls: number; label: string }
interface Run { root: TNode; steps: Step[]; total: number; wasted: number }

/** 模擬 fib(N) 的呼叫過程。memo=false 是純遞迴，memo=true 是加了快取的版本。 */
function build(t: T, memo: boolean): Run {
  const steps: Step[] = [];
  const seen = new Set<number>(); // 純遞迴：已經算過的 n；記憶化：快取裡的 n
  const visited: number[] = [];
  let nextId = 0;
  let calls = 0;
  let wasted = 0;
  const call = (n: number): TNode => {
    const kind: Kind = seen.has(n) ? (memo ? "hit" : "repeat") : n <= 1 ? "base" : "compute";
    const me: TNode = { id: nextId++, n, kind, children: [] };
    calls++;
    if (kind === "repeat") wasted++;
    visited.push(me.id);
    let desc: string;
    if (kind === "base") desc = t.base(n);
    else if (kind === "repeat") desc = t.repeat(n);
    else if (kind === "hit") desc = t.hit(n);
    else desc = t.compute(n);
    steps.push({ desc, cur: me.id, visited: [...visited], calls, label: `fib(${n})` });
    if (n > 1 && kind !== "hit") {
      me.children.push(call(n - 1));
      me.children.push(call(n - 2));
    }
    seen.add(n);
    return me;
  };
  steps.push({
    desc: memo ? t.introMemo(N) : t.introNaive(N),
    cur: -1, visited: [], calls: 0, label: t.labelStart,
  });
  const root = call(N);
  steps.push({
    desc: memo ? t.endMemo(calls, N + 1, calls - N - 1) : t.endNaive(calls, wasted),
    cur: -1, visited: [...visited], calls, label: t.labelEnd,
  });
  return { root, steps, total: calls, wasted };
}

interface Placed { node: TNode; x: number; y: number; parent?: Placed }

/** 葉節點平均分配寬度，父節點放在子樹正中間。 */
function layout(root: TNode): Placed[] {
  const leaves = (n: TNode): number => (n.children.length ? n.children.reduce((a, c) => a + leaves(c), 0) : 1);
  const total = leaves(root);
  const out: Placed[] = [];
  let cursor = 0;
  const walk = (n: TNode, depth: number, parent?: Placed) => {
    const l = leaves(n);
    const me: Placed = { node: n, x: 24 + ((cursor + l / 2) / total) * (W - 48), y: TOP + depth * LEVEL_H, parent };
    out.push(me);
    if (!n.children.length) cursor += 1;
    n.children.forEach((c) => walk(c, depth + 1, me));
  };
  walk(root, 0);
  return out;
}

/** 純遞迴的呼叫次數 c(n) = 1 + c(n−1) + c(n−2)，用迭代算免得自己也爆炸。 */
function naiveCalls(n: number): number {
  const c: number[] = [1, 1];
  for (let i = 2; i <= n; i++) c[i] = 1 + c[i - 1] + c[i - 2];
  return c[n];
}

const FILL: Record<Kind, string> = { compute: "var(--surface)", base: "var(--surface-2)", repeat: "var(--amber-soft)", hit: "var(--green-soft)" };
const STROKE: Record<Kind, string> = { compute: "var(--line-strong)", base: "var(--line-strong)", repeat: "var(--amber)", hit: "var(--green)" };
const INK: Record<Kind, string> = { compute: "var(--ink)", base: "var(--ink-2)", repeat: "var(--amber)", hit: "var(--green)" };

export function MemoDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const naive = useMemo(() => build(TEXT[locale], false), [locale]);
  const memo = useMemo(() => build(TEXT[locale], true), [locale]);
  const [mode, setMode] = useState<Mode>("naive");
  const [k, setK] = useState(0);
  const run = mode === "naive" ? naive : memo;
  const steps = run.steps;
  const s = steps[k];
  const placed = useMemo(() => layout(run.root), [run]);
  const height = TOP * 2 + (N - 1) * LEVEL_H;
  const visited = new Set(s.visited);
  const switchMode = (m: Mode) => { setMode(m); setK(0); };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex items-center gap-1.5">
            {(["naive", "memo"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "naive" ? t.naive : t.memo}
              </button>
            ))}
            <span className="ml-1 font-mono text-[12.5px] text-ink">{s.label}</span>
          </div>
        }
        right={t.treeTitle(N)}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-accent bg-accent">{t.legendCurrent}</Legend>
        <Legend cls="border-line-strong bg-surface-2">{t.legendBase}</Legend>
        {mode === "naive"
          ? <Legend cls="border-amber bg-amber-soft">{t.legendRepeat}</Legend>
          : <Legend cls="border-green bg-green-soft">{t.legendHit}</Legend>}
        <span className="whitespace-nowrap text-ink-3">{t.legendFaded}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${height}`} className="block h-auto w-full" role="img" aria-label={t.treeAlt}>
        {placed.map((p, i) => p.parent && (
          <line key={`e${i}`} x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} stroke="var(--line-strong)" strokeWidth="1.5" opacity={visited.has(p.node.id) ? 1 : 0.2} />
        ))}
        {placed.map((p, i) => {
          const on = visited.has(p.node.id);
          const cur = s.cur === p.node.id;
          const kind = p.node.kind;
          return (
            <g key={`n${i}`} opacity={on ? 1 : 0.22}>
              <circle cx={p.x} cy={p.y} r={R} fill={cur ? "var(--accent)" : FILL[kind]} stroke={cur ? "var(--accent)" : STROKE[kind]} strokeWidth={cur || kind === "repeat" || kind === "hit" ? 2.2 : 1.5} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fontFamily="var(--font-mono)" fill={cur ? "var(--accent-ink)" : INK[kind]}>
                f({p.node.n})
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-1 gap-3 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className={`rounded-lg border px-3 py-2 ${mode === "naive" ? "border-accent bg-accent-soft" : "border-line bg-surface-2"}`}>
          <div className="eyebrow mb-1">{t.naive}</div>
          <div className="font-mono text-[15px] tabular-nums">
            {mode === "naive" ? s.calls : naive.total} <span className="text-[12px] text-ink-3">{t.outOf(naive.total)}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">
            {t.wastedPre}<span className="text-amber">{t.wastedCount(naive.wasted)}</span>{t.wastedPost}
          </div>
        </div>
        <div className={`rounded-lg border px-3 py-2 ${mode === "memo" ? "border-accent bg-accent-soft" : "border-line bg-surface-2"}`}>
          <div className="eyebrow mb-1">{t.memo}</div>
          <div className="font-mono text-[15px] tabular-nums">
            {mode === "memo" ? s.calls : memo.total} <span className="text-[12px] text-ink-3">{t.outOf(memo.total)}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">
            {t.realPre(N + 1)}<span className="text-green">{t.hitCount(memo.total - N - 1)}</span>{t.hitPost}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="border-collapse font-mono text-[12px] tabular-nums">
            <thead>
              <tr className="text-ink-3"><th className="pr-3 text-left font-normal">n</th><th className="pr-3 text-right font-normal">{t.naive}</th><th className="text-right font-normal">{t.memo}</th></tr>
            </thead>
            <tbody>
              {[6, 10, 20, 30].map((n) => (
                <tr key={n}><td className="pr-3">{n}</td><td className="pr-3 text-right">{naiveCalls(n).toLocaleString("en-US")}</td><td className="text-right">{2 * n - 1}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function Legend({ cls, children }: { cls: string; children: ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${cls}`} />
      {children}
    </span>
  );
}
