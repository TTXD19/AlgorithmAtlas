"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";

/** 樹的直徑：任兩節點間最長路徑的邊數。這棵樹的直徑不經過根，是故意的。 */
const TREE: BNode = {
  v: "A",
  l: {
    v: "B",
    l: { v: "D", l: { v: "F" }, r: { v: "G", r: { v: "H" } } },
    r: { v: "E", r: { v: "I", r: { v: "J" } } },
  },
  r: { v: "C" },
};

interface Step {
  desc: string;
  op: string;
  down: Record<string, number>;
  cur: string | null;
  kids: string[];
  best: number;
  bestPath: string[];
  through: number | null;
  updated: boolean;
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const down: Record<string, number> = {};
  let best = 0;
  let bestPath: string[] = [];
  const snap = (desc: string, op: string, cur: string | null, kids: string[] = [], through: number | null = null, updated = false) =>
    steps.push({ desc, op, down: { ...down }, cur, kids, best, bestPath: [...bestPath], through, updated });

  snap("目標：找樹的直徑，也就是任兩節點之間最長路徑的邊數。後序走訪，每個節點在兩個子樹都算完之後才處理。", "開始", null);

  // 回傳從此節點往下的最長鏈（節點序列，含自己）
  const dfs = (n: BNode): string[] => {
    const id = String(n.v);
    const chainL = n.l ? dfs(n.l) : [];
    const chainR = n.r ? dfs(n.r) : [];
    if (!n.l && !n.r) {
      down[id] = 0;
      snap(`${id} 是葉節點，往下最長鏈 down = 0。`, `visit(${id})`, id);
      return [id];
    }
    const dl = n.l ? down[String(n.l.v)] + 1 : 0;
    const dr = n.r ? down[String(n.r.v)] + 1 : 0;
    const kids = [n.l, n.r].filter((c): c is BNode => !!c).map((c) => String(c.v));
    snap(`回到 ${id}：${n.l ? `左子樹 ${n.l.v} 往下鏈 ${down[String(n.l.v)]}，加上這條邊是 ${dl}` : "沒有左子樹"}；${n.r ? `右子樹 ${n.r.v} 往下鏈 ${down[String(n.r.v)]}，加上這條邊是 ${dr}` : "沒有右子樹"}。`, `visit(${id})`, id, kids);
    down[id] = Math.max(dl, dr);
    const through = dl + dr;
    const path = [...chainL.slice().reverse(), id, ...chainR];
    const updated = through > best;
    if (updated) {
      best = through;
      bestPath = path;
    }
    const note = updated ? `超過目前答案，更新為 ${best}（綠色路徑）。` : `沒有超過目前答案 ${best}。`;
    snap(`${id} 的往下最長鏈 down = max(${dl}, ${dr}) = ${down[id]}，這是回傳給父節點用的。經過 ${id} 的最長路徑 = 左 ${dl} + 右 ${dr} = ${through}，${note}`, `visit(${id})`, id, kids, through, updated);
    const longer = dl >= dr ? chainL : chainR;
    return [id, ...longer];
  };
  dfs(TREE);
  snap(`走訪結束，直徑 = ${best}。注意這條路徑沒有經過根 A：答案在某個節點「左右兩邊拼起來」的時候出現，所以每個節點都要嘗試更新全域答案，而不是只看根。每個節點處理一次，O(n)。`, "結束", null, [], null, true);
  return steps;
}

export function TreeDpDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const pathSet = new Set(s.bestPath);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="樹的直徑 · 後序走訪，節點下方小字是 down" />
      <div className="grid grid-cols-1 gap-3 p-3.5 md:grid-cols-[minmax(0,1fr)_200px] md:items-start">
        <BinaryTreeSVG
          root={TREE}
          height={26 + 5 * 56}
          tone={(n) => {
            const id = String(n.v);
            if (id === s.cur) return "accent";
            if (s.kids.includes(id)) return "amber";
            if (pathSet.has(id)) return "green";
            return id in s.down ? "none" : "dim";
          }}
          sub={(n) => {
            const id = String(n.v);
            return id in s.down ? `down=${s.down[id]}` : "";
          }}
        />
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">狀態</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12.5px]">
            <span className="text-ink-3">目前節點</span><span>{s.cur ?? "無"}</span>
            <span className="text-ink-3">down</span><span>{s.cur && s.cur in s.down ? s.down[s.cur] : "尚未算"}</span>
            <span className="text-ink-3">經過此點</span><span>{s.through ?? "無"}</span>
            <span className="text-ink-3">全域答案</span><span className="text-ink">{s.best}</span>
          </div>
          <div className="eyebrow mt-3 mb-1.5">兩個量</div>
          <p className="m-0 text-[12.5px]"><span className="font-mono">down</span>：從此節點往下的最長鏈，回傳給父節點。</p>
          <p className="mt-1 mb-0 text-[12.5px]"><span className="font-mono">through</span>：左鏈 + 右鏈拼起來，只用來更新全域答案，不回傳。</p>
          <p className="mt-3 mb-0 text-[12px] text-ink-3">藍色是正在處理的節點，黃色是它的子節點，綠色是目前的直徑路徑。灰色還沒算。</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
