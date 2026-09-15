"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, BTN } from "./StepBar";

const N = 6;
const W = 640;
const LEVEL_H = 46;
const TOP = 24;
const R = 15;

type Kind = "compute" | "base" | "repeat" | "hit";
type Mode = "naive" | "memo";
interface TNode { id: number; n: number; kind: Kind; children: TNode[] }
interface Step { desc: string; cur: number; visited: number[]; calls: number; label: string }
interface Run { root: TNode; steps: Step[]; total: number; wasted: number }

/** 模擬 fib(N) 的呼叫過程。memo=false 是純遞迴，memo=true 是加了快取的版本。 */
function build(memo: boolean): Run {
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
    if (kind === "base") desc = `fib(${n}) 是 base case，直接回傳 ${n}。`;
    else if (kind === "repeat") desc = `再次呼叫 fib(${n})。這個子問題之前已經算過，但沒有人記得答案，只好${n > 1 ? "整棵子樹重算" : "再回傳一次"}。`;
    else if (kind === "hit") desc = `呼叫 fib(${n})：快取裡已經有答案，直接回傳。${n > 1 ? "底下整棵子樹都不用展開。" : ""}`;
    else desc = `呼叫 fib(${n})，拆成 fib(${n - 1}) + fib(${n - 2})，先算左邊。`;
    steps.push({ desc, cur: me.id, visited: [...visited], calls, label: `fib(${n})` });
    if (n > 1 && kind !== "hit") {
      me.children.push(call(n - 1));
      me.children.push(call(n - 2));
    }
    seen.add(n);
    return me;
  };
  steps.push({
    desc: memo
      ? `同樣算 fib(${N})，但每個算完的 fib(n) 都存進快取。再被問到同一個 n 時直接回傳，不再展開。`
      : `純遞迴算 fib(${N})：fib(n) = fib(n−1) + fib(n−2)。每次呼叫都重新展開，沒有人記得算過什麼。`,
    cur: -1, visited: [], calls: 0, label: "開始",
  });
  const root = call(N);
  steps.push({
    desc: memo
      ? `結束。只有 ${calls} 次呼叫：每個 n 只真正算一次（${N + 1} 個），其餘 ${calls - N - 1} 次是快取命中。呼叫次數從指數變成 O(n)。`
      : `結束。總共 ${calls} 次呼叫，其中 ${wasted} 次（黃色）是在重算已經算過的子問題。n 每加 1，呼叫次數大約乘以 1.6，這就是指數時間。`,
    cur: -1, visited: [...visited], calls, label: "結束",
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
const TEXT: Record<Kind, string> = { compute: "var(--ink)", base: "var(--ink-2)", repeat: "var(--amber)", hit: "var(--green)" };

export function MemoDemo() {
  const naive = useMemo(() => build(false), []);
  const memo = useMemo(() => build(true), []);
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
                {m === "naive" ? "純遞迴" : "記憶化"}
              </button>
            ))}
            <span className="ml-1 font-mono text-[12.5px] text-ink">{s.label}</span>
          </div>
        }
        right={`fib(${N}) 的遞迴樹`}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-accent bg-accent">目前這次呼叫</Legend>
        <Legend cls="border-line-strong bg-surface-2">第一次碰到的 base case</Legend>
        {mode === "naive"
          ? <Legend cls="border-amber bg-amber-soft">重算已經算過的子問題</Legend>
          : <Legend cls="border-green bg-green-soft">快取命中</Legend>}
        <span className="whitespace-nowrap text-ink-3">淡色是還沒呼叫到的</span>
      </div>

      <svg viewBox={`0 0 ${W} ${height}`} className="block h-auto w-full" role="img" aria-label="fib 遞迴樹">
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
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fontFamily="var(--font-mono)" fill={cur ? "var(--accent-ink)" : TEXT[kind]}>
                f({p.node.n})
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-1 gap-3 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className={`rounded-lg border px-3 py-2 ${mode === "naive" ? "border-accent bg-accent-soft" : "border-line bg-surface-2"}`}>
          <div className="eyebrow mb-1">純遞迴</div>
          <div className="font-mono text-[15px] tabular-nums">
            {mode === "naive" ? s.calls : naive.total} <span className="text-[12px] text-ink-3">/ {naive.total} 次呼叫</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">
            其中 <span className="text-amber">{naive.wasted} 次</span>是重算已經算過的子問題
          </div>
        </div>
        <div className={`rounded-lg border px-3 py-2 ${mode === "memo" ? "border-accent bg-accent-soft" : "border-line bg-surface-2"}`}>
          <div className="eyebrow mb-1">記憶化</div>
          <div className="font-mono text-[15px] tabular-nums">
            {mode === "memo" ? s.calls : memo.total} <span className="text-[12px] text-ink-3">/ {memo.total} 次呼叫</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">
            {N + 1} 次真正計算 + <span className="text-green">{memo.total - N - 1} 次</span>快取命中
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="border-collapse font-mono text-[12px] tabular-nums">
            <thead>
              <tr className="text-ink-3"><th className="pr-3 text-left font-normal">n</th><th className="pr-3 text-right font-normal">純遞迴</th><th className="text-right font-normal">記憶化</th></tr>
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
