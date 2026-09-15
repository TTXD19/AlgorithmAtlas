"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";

/** 決策樹：內部節點是「a<b」這種比較，葉子是輸出的順序（例如 bac 代表 b ≤ a ≤ c） */
const TREE2: BNode = { v: "a<b", l: { v: "ab" }, r: { v: "ba" } };
const TREE3: BNode = {
  v: "a<b",
  l: { v: "b<c", l: { v: "abc" }, r: { v: "a<c", l: { v: "acb" }, r: { v: "cab" } } },
  r: { v: "a<c", l: { v: "bac" }, r: { v: "b<c", l: { v: "bca" }, r: { v: "cba" } } },
};
const TREES: Record<number, BNode | null> = { 2: TREE2, 3: TREE3, 4: null };

/** 共用陣列的前幾個值當輸入 */
const POOL = [5, 2, 9, 1];
const LETTERS = ["a", "b", "c", "d"];

function permutations(xs: number[]): number[][] {
  if (xs.length <= 1) return [xs];
  const out: number[][] = [];
  xs.forEach((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).forEach((p) => out.push([x, ...p])));
  return out;
}

function factorial(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function log2Factorial(n: number) {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log2(i);
  return s;
}

/** 依輸入值走一遍決策樹，回傳經過的節點（含葉子） */
function walk(root: BNode, values: number[]): BNode[] {
  const path: BNode[] = [];
  let cur: BNode | null | undefined = root;
  while (cur) {
    path.push(cur);
    if (!cur.l && !cur.r) break;
    const [x, y]: string[] = String(cur.v).split("<");
    const goLeft: boolean = values[LETTERS.indexOf(x)] < values[LETTERS.indexOf(y)];
    const next: BNode | null | undefined = goLeft ? cur.l : cur.r;
    cur = next;
  }
  return path;
}

/** 大 n 的對照表只算一次（n = 一百萬要加一百萬個 log），不要每次重繪都重算 */
const BIG_ROWS = [8, 16, 64, 1024, 1_000_000].map((m) => {
  const l = log2Factorial(m);
  const nl = m * Math.log2(m);
  return { m, bound: Math.ceil(l), nl: Math.round(nl), ratio: l / nl };
});
const NBTN = "h-[28px] cursor-pointer rounded-md border px-2.5 font-mono text-[12.5px]";

export function LowerBoundDemo() {
  const [n, setN] = useState(3);
  const [pick, setPick] = useState(0);
  const inputs = useMemo(() => permutations(POOL.slice(0, n)), [n]);
  const values = inputs[Math.min(pick, inputs.length - 1)];
  const tree = TREES[n];
  const path = tree ? walk(tree, values) : [];
  const leaf = path[path.length - 1];

  const leaves = factorial(n);
  const lg = log2Factorial(n);
  const minH = Math.ceil(lg);
  const nlogn = n * Math.log2(n);
  const powRow = Array.from({ length: minH + 2 }, (_, h) => h);

  const choose = (m: number) => { setN(m); setPick(0); };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>要排序的元素數 n =</span>
        <div className="flex gap-1.5">
          {[2, 3, 4].map((m) => (
            <button key={m} type="button" onClick={() => choose(m)} className={`${NBTN} ${n === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`}>{m}</button>
          ))}
        </div>
        <span className="ml-auto text-[12px] text-ink-3">每個內部節點問一次「誰比較小」，每片葉子是一種輸出順序</span>
      </div>

      <div className="grid grid-cols-2 gap-3 px-3.5 py-3 text-[13px] md:grid-cols-4">
        <div><div className="eyebrow mb-1">葉子數 n!</div><span className="font-mono text-[15px] tabular-nums">{leaves}</span></div>
        <div><div className="eyebrow mb-1">log₂(n!)</div><span className="font-mono text-[15px] tabular-nums">{lg.toFixed(2)}</span></div>
        <div><div className="eyebrow mb-1">最矮的高度 ⌈log₂ n!⌉</div><span className="font-mono text-[15px] tabular-nums text-accent">{minH}</span><span className="ml-1.5 text-[12px] text-ink-3">次比較起跳</span></div>
        <div><div className="eyebrow mb-1">n·log₂ n</div><span className="font-mono text-[15px] tabular-nums">{nlogn.toFixed(2)}</span></div>
      </div>

      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">高度 h 的二元樹最多 2ʰ 片葉子，要裝下 {leaves} 片</div>
        <div className="flex flex-wrap gap-1">
          {powRow.map((h) => {
            const cap = 2 ** h;
            const ok = cap >= leaves;
            const first = ok && 2 ** (h - 1) < leaves;
            return (
              <div key={h} className={`flex flex-col items-center rounded-md border px-2 py-1 font-mono text-[12px] tabular-nums ${first ? "border-accent bg-accent text-accent-ink" : ok ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink-3"}`}>
                <span className="text-[10.5px] opacity-80">h = {h}</span>
                <span>{cap}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[12px] text-ink-3">灰色裝不下，第一個裝得下的高度（藍色）就是最壞情況至少要比較的次數。</div>
      </div>

      {tree ? (
        <div className="border-t border-line">
          <div className="flex flex-wrap items-center gap-2 px-3.5 pt-3 text-[13px]">
            <span className="text-ink-2">輸入（a, b{n >= 3 ? ", c" : ""}）=</span>
            <div className="flex flex-wrap gap-1.5">
              {inputs.map((p, i) => (
                <button key={p.join("-")} type="button" onClick={() => setPick(i)} className={`${NBTN} ${i === pick ? "border-amber bg-amber-soft text-amber" : "border-line bg-surface hover:bg-surface-2"}`}>{p.join(" ")}</button>
              ))}
            </div>
          </div>
          <BinaryTreeSVG
            root={tree}
            height={26 + (n === 3 ? 4 : 2) * 56}
            tone={(nd) => (nd === leaf ? "accent" : path.includes(nd) ? "amber" : !nd.l && !nd.r ? "dim" : "none")}
          />
          <div className="px-3.5 pb-3 text-[13px] text-ink-2">
            這組輸入走黃色路徑，比較 <span className="font-mono font-medium text-ink">{path.length - 1}</span> 次，落在葉子 <span className="font-mono font-medium text-ink">{String(leaf.v)}</span>，
            輸出 <span className="font-mono font-medium text-ink">{String(leaf.v).split("").map((ch) => values[LETTERS.indexOf(ch)]).join(" ≤ ")}</span>。
            {n === 3 && " 六片葉子塞不進高度 2（只有 4 個位置），所以總有某些輸入要比 3 次。"}
          </div>
        </div>
      ) : (
        <div className="border-t border-line px-3.5 py-3 text-[13px] text-ink-2">
          n = 4 的決策樹有 24 片葉子、至少 23 個內部節點，這裡不畫。重點看上面的數字：2⁴ = 16 &lt; 24 ≤ 32 = 2⁵，所以高度至少 5，任何比較排序在最壞情況都至少比 5 次。事實上 5 次確實做得到（a、b 比一次，c、d 比一次，兩個較大者再比一次，得到三個有序的元素，最後一個用二分插入比兩次），所以 n = 4 時這個下界剛好是緊的；n 大一點就不一定，例如 n = 12 的下界是 29 次，但已證明最少要 30 次。
        </div>
      )}

      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">n 變大之後：log₂(n!) 和 n·log₂ n 越來越接近</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr className="text-left text-[11px] text-ink-3"><th className="py-1 pr-3 font-medium">n</th><th className="py-1 pr-3 font-medium">⌈log₂ n!⌉（下界）</th><th className="py-1 pr-3 font-medium">n·log₂ n</th><th className="py-1 font-medium">比值</th></tr>
            </thead>
            <tbody>
              {BIG_ROWS.map(({ m, bound, nl, ratio }) => (
                <tr key={m} className="border-t border-line"><td className="py-1 pr-3">{m.toLocaleString("en-US")}</td><td className="py-1 pr-3">{bound.toLocaleString("en-US")}</td><td className="py-1 pr-3">{nl.toLocaleString("en-US")}</td><td className="py-1">{ratio.toFixed(3)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-[12px] text-ink-3">比值趨近 1，所以 log₂(n!) = Θ(n log n)。合併排序與堆積排序的最壞情況 O(n log n) 已經貼到這條線。</div>
      </div>
    </div>
  );
}
