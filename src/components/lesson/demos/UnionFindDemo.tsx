"use client";

import { useMemo, useState } from "react";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const N = 8;
type Op = { kind: "union"; a: number; b: number } | { kind: "find"; a: number } | { kind: "same"; a: number; b: number };
const SCRIPT: Op[] = [
  { kind: "union", a: 0, b: 1 }, { kind: "union", a: 2, b: 3 }, { kind: "union", a: 1, b: 3 },
  { kind: "union", a: 4, b: 5 }, { kind: "union", a: 6, b: 7 }, { kind: "union", a: 5, b: 7 },
  { kind: "same", a: 0, b: 4 }, { kind: "union", a: 3, b: 7 }, { kind: "find", a: 0 }, { kind: "same", a: 0, b: 6 },
];

interface Step { desc: string; op: string; parent: number[]; hot: number[]; roots: number[] }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const parent = Array.from({ length: N }, (_, i) => i);
  const size = new Array(N).fill(1);
  const snap = (desc: string, op: string, hot: number[] = [], roots: number[] = []) => steps.push({ desc, op, parent: [...parent], hot, roots });

  snap("一開始每個節點自成一群，parent[i] = i，也就是 8 棵只有根的樹。", "開始");
  const find = (x: number, op: string): number => {
    const path: number[] = [];
    let r = x;
    while (parent[r] !== r) { path.push(r); r = parent[r]; }
    if (path.length) snap(`find(${x})：沿 parent 往上走 ${path.join(" → ")} → ${r}，根是 ${r}。`, op, [...path, r], [r]);
    else snap(`find(${x})：${x} 自己就是根。`, op, [x], [x]);
    if (path.length > 1) {
      path.forEach((p) => (parent[p] = r));
      snap(`路徑壓縮：把 ${path.join("、")} 的 parent 全部直接指向 ${r}。下次再問就只要一步。`, op, [...path, r], [r]);
    }
    return r;
  };
  for (const op of SCRIPT) {
    if (op.kind === "union") {
      const label = `union(${op.a}, ${op.b})`;
      const ra = find(op.a, label), rb = find(op.b, label);
      if (ra === rb) { snap(`${op.a} 和 ${op.b} 已經在同一群（根都是 ${ra}），不用動。`, label, [ra]); continue; }
      const [small, big] = size[ra] < size[rb] ? [ra, rb] : [rb, ra];
      parent[small] = big; size[big] += size[small];
      snap(`兩個根不同。按大小合併：小的那棵（根 ${small}，${size[big] - size[small]} 個）掛到大的（根 ${big}）底下，樹高才不會一直長。`, label, [small, big], [big]);
    } else if (op.kind === "find") {
      find(op.a, `find(${op.a})`);
    } else {
      const label = `same(${op.a}, ${op.b})`;
      const ra = find(op.a, label), rb = find(op.b, label);
      snap(ra === rb ? `根相同（${ra}），${op.a} 和 ${op.b} 連通。` : `根不同（${ra} 與 ${rb}），${op.a} 和 ${op.b} 不連通。`, label, [ra, rb], [ra, rb]);
    }
  }
  snap("有了路徑壓縮和按大小合併，每次操作攤銷後接近常數時間，記作 O(α(n))。", "結束");
  return steps;
}

function toForest(parent: number[]): GNode[] {
  const nodes: GNode[] = parent.map((_, i) => ({ id: String(i), label: String(i), children: [] }));
  const roots: GNode[] = [];
  parent.forEach((p, i) => (p === i ? roots.push(nodes[i]) : nodes[p].children.push(nodes[i])));
  return roots;
}

export function UnionFindDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="8 個節點 · 路徑壓縮 + 按大小合併" />
      <ForestSVG roots={toForest(s.parent)} height={24 + 4 * 52} tone={(n) => (s.roots.includes(+n.id) && s.hot.includes(+n.id) ? "accent" : s.hot.includes(+n.id) ? "amber" : "none")} />
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-1.5">parent 陣列</div>
        <div className="flex gap-3">
          <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">i</div><Cells items={s.parent.map((_, i) => i)} tone={(i) => (s.hot.includes(i) ? CELL.dim : "")} w="w-8" /></div>
          <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">parent[i]</div><Cells items={s.parent} tone={(i) => (s.roots.includes(i) && s.hot.includes(i) ? CELL.accent : s.hot.includes(i) ? CELL.amber : "")} w="w-8" /></div>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
